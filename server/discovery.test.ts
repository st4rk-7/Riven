import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { discoverProductCompetitors, parseSearchResults } from "./discovery.js";
import { matchOffer } from "./matching.js";
// @ts-expect-error The standalone migration runner is JavaScript.
import { migrate } from "../scripts/migrate.mjs";

const html = readFileSync(new URL("./sources/fixtures/amazon-uk-search.html", import.meta.url), "utf8");

describe("parseSearchResults", () => {
  const candidates = parseSearchResults(html);

  it("reads one candidate per ASIN with the full title, not just the brand line", () => {
    expect(candidates.map((c) => c.asin)).toEqual(["B00FQJGRX4", "B09QT61DMD", "B00K8S89YI", "B07F8HZVFS"]);
    expect(candidates[0].productName).toMatch(/^Russell Hobbs Brushed Stainless Steel & Black Electric 1\.7L Cordless Kettle/);
  });

  it("does not invent a seller or a price the page does not show", () => {
    expect(candidates[0]).toMatchObject({ seller: null, price: null, currency: null, availability: "unknown" });
  });

  it("keeps stock unknown when a search card shows a price but no stock evidence", () => {
    const [candidate] = parseSearchResults(`
      <div data-asin="B000000001">
        <h2>Example wired mouse</h2>
        <span class="a-price"><span class="a-offscreen">£19.99</span></span>
      </div>
    `);
    expect(candidate).toMatchObject({ price: "19.99", currency: "GBP", availability: "unknown" });
  });

  it("gives the matcher real titles, so unrelated results can be dropped", () => {
    const relevant = (product: { brand: string; name: string }) =>
      candidates.filter((c) => matchOffer(product, { productName: c.productName }) !== "mismatch").length;
    expect(relevant({ brand: "Russell Hobbs", name: "Brushed Stainless Steel Electric Kettle 1.7L" })).toBeGreaterThan(0);
    expect(relevant({ brand: "Logitech", name: "M185 Wireless Mouse" })).toBe(0);
  });
});

describe.skipIf(!process.env.TEST_DATABASE_URL)("discoverProductCompetitors", () => {
  const database = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const retailer = randomUUID();
  const kettle = randomUUID();
  const mouse = randomUUID();

  beforeAll(async () => {
    const { rows } = await database.query("SELECT current_database() AS name");
    if (!rows[0].name.endsWith("_test")) throw new Error("Integration tests require a database name ending in _test.");
    await migrate(process.env.TEST_DATABASE_URL);
    await database.query("INSERT INTO retailers (id, name) VALUES ($1, 'Kettle Shop')", [retailer]);
    await database.query(
      `INSERT INTO products (id, retailer_id, name, brand, asin) VALUES
        ($1, $3, 'Brushed Stainless Steel Electric Kettle 1.7L', 'Russell Hobbs', 'B00FQJGRX4'),
        ($2, $3, 'M185 Wireless Mouse', 'Logitech', NULL)`,
      [kettle, mouse, retailer],
    );
    vi.stubGlobal("fetch", async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } }));
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    await database.query("DELETE FROM retailers WHERE id = $1", [retailer]);
    await database.end();
  });

  const listings = async (productId: string) =>
    (await database.query("SELECT asin, seller, match_status FROM observations WHERE product_id = $1 ORDER BY asin", [productId])).rows;

  it("adds relevant results once, confirms the same ASIN and leaves the seller empty", async () => {
    const added = await discoverProductCompetitors(database, retailer, kettle, "www.amazon.co.uk");
    expect(added).toBeGreaterThan(0);
    expect(await discoverProductCompetitors(database, retailer, kettle, "www.amazon.co.uk")).toBe(0);
    const rows = await listings(kettle);
    expect(rows).toHaveLength(added);
    expect(rows.find((r) => r.asin === "B00FQJGRX4")).toMatchObject({ seller: null, match_status: "confirmed" });
    expect(rows.filter((r) => r.asin !== "B00FQJGRX4").every((r) => r.match_status === "unverified")).toBe(true);
  });

  it("stops adding once a product has five listings", async () => {
    const full = randomUUID();
    await database.query("INSERT INTO products (id, retailer_id, name, brand) VALUES ($1, $2, 'Stainless Steel Electric Kettle 1.7L', 'Russell Hobbs')", [full, retailer]);
    for (const asin of ["A000000001", "A000000002", "A000000003", "A000000004", "A000000005"]) {
      await database.query(
        `INSERT INTO observations (id, retailer_id, product_id, asin, product_name, source, availability, collected_via)
          VALUES ($1, $2, $3, $4, 'Russell Hobbs Kettle', 'Amazon UK', 'unknown', 'extension')`,
        [randomUUID(), retailer, full, asin],
      );
    }
    expect(await discoverProductCompetitors(database, retailer, full, "www.amazon.co.uk")).toBe(0);
    expect(await listings(full)).toHaveLength(5);
  });

  it("adds nothing for a product the results do not match", async () => {
    expect(await discoverProductCompetitors(database, retailer, mouse, "www.amazon.co.uk")).toBe(0);
    expect(await listings(mouse)).toHaveLength(0);
  });
});
