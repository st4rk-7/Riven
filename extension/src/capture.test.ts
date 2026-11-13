import { readFileSync } from "node:fs";

import { JSDOM } from "jsdom";
import { describe, expect, test } from "vitest";

import { extractOffer } from "../../server/sources/extract.js";
import { AMAZON } from "../../server/sources/sites.js";
import { capturePage } from "./capture.js";

const fixture = (name: string) => readFileSync(new URL(`../../server/sources/fixtures/${name}`, import.meta.url), "utf8");

// capturePage runs inside a page, so each test gives it one.
async function inPage(html: string) {
  const { window } = new JSDOM(html);
  if (window.document.readyState === "loading") await new Promise((done) => window.addEventListener("DOMContentLoaded", done));
  globalThis.document = window.document;
  return capturePage(AMAZON.capture, AMAZON.strip, AMAZON.blocked.source);
}

describe("capturePage", () => {
  test.each(["amazon-uk-in-stock.html", "amazon-uk-centre-price.html", "amazon-sg-no-offer.html"])(
    "sends a small part of %s that reads the same as the whole page",
    async (name) => {
      const page = fixture(name);
      const captured = await inPage(page);

      expect(captured).toHaveProperty("html");
      const html = (captured as { html: string }).html;
      expect(html.length).toBeLessThan(page.length / 4);
      expect(extractOffer(html, AMAZON)).toEqual(extractOffer(page, AMAZON));
    },
  );

  test("leaves out the header, account and delivery address", async () => {
    const html = ((await inPage(fixture("amazon-uk-in-stock.html"))) as { html: string }).html;

    for (const selector of ["nav-link-accountList", "nav-belt", ...AMAZON.strip.map((s) => s.slice(1))]) {
      expect(html).not.toContain(`id="${selector}"`);
    }
  });

  test("keeps only Product JSON-LD", async () => {
    const page = `<html><head>
      <script type="application/ld+json">{"@type":"Organization","name":"Shop"}</script>
      <script type="application/ld+json">{"@type":"Product","name":"Mouse"}</script>
      </head><body><div id="centerCol"><h1 id="productTitle">Mouse</h1></div></body></html>`;

    const html = ((await inPage(page)) as { html: string }).html;

    expect(html).toContain('"Product"');
    expect(html).not.toContain("Organization");
  });

  test("reports a challenge page and waits for a page with no product yet", async () => {
    expect(await inPage("<html><head><title>Robot Check</title></head><body></body></html>")).toEqual({ blocked: true });
    expect(await inPage("<html><body><p>Loading</p></body></html>")).toBeNull();
  });
});
