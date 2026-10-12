import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { log } from "crawlee";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { collectAmazonOffer, isCaptchaPage } from "./amazon-collector.js";

const page = readFileSync(new URL("./fixtures/amazon-uk-in-stock.html", import.meta.url), "utf8");

// Local server standing in for Amazon, so no test touches the network.
let server: Server;
let base: string;
const options = { allowedHosts: ["127.0.0.1"], timeoutSecs: 5 };

beforeAll(async () => {
  log.setLevel(log.LEVELS.OFF);
  server = createServer((req, res) => {
    if (req.url === "/product") {
      res.writeHead(200, { "content-type": "text/html" }).end(page);
    } else if (req.url === "/busy") {
      res.writeHead(503, { "content-type": "text/html" }).end("<html>Service Unavailable</html>");
    } else if (req.url === "/binary") {
      res.writeHead(200, { "content-type": "application/octet-stream" }).end("\u0000\u0001");
    } else if (req.url === "/captcha") {
      res.writeHead(200, { "content-type": "text/html" }).end('<form action="/errors/validateCaptcha"></form>');
    } else {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

describe("collectAmazonOffer", () => {
  test("collects and parses a product page", async () => {
    const result = await collectAmazonOffer(`${base}/product`, options);

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.offer).toMatchObject({ price: "18.01", currency: "GBP", availability: "in_stock" });
    }
  });

  test("records a 503 as blocked and does not retry", async () => {
    expect((await collectAmazonOffer(`${base}/busy`, options)).status).toBe("blocked");
  });

  test("records a non-HTML answer as blocked", async () => {
    expect(await collectAmazonOffer(`${base}/binary`, options)).toMatchObject({
      status: "blocked",
      reason: "Blocked (non-HTML response: application/octet-stream)",
    });
  });

  test("records a CAPTCHA page as blocked", async () => {
    expect((await collectAmazonOffer(`${base}/captcha`, options)).status).toBe("blocked");
  });

  test("refuses hosts that are not allowed", async () => {
    const result = await collectAmazonOffer("https://example.com/product");

    expect(result).toMatchObject({ status: "failed", reason: "Host not allowed: example.com" });
  });
});

test("detects a CAPTCHA page", () => {
  expect(isCaptchaPage(page)).toBe(false);
  expect(isCaptchaPage("<title>Robot Check</title>")).toBe(true);
});
