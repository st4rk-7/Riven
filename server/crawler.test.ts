import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { log } from "crawlee";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { crawlProduct, crawlRetailerProducts, startScheduledCrawler } from "./crawler.js";
import { searchAmazonCandidates } from "./discovery.js";
// @ts-expect-error The standalone migration runner is JavaScript.
import { migrate } from "../scripts/migrate.mjs";

const pageHtml = readFileSync(new URL("./sources/fixtures/amazon-uk-in-stock.html", import.meta.url), "utf8");

describe.skipIf(!process.env.TEST_DATABASE_URL)("scheduled crawler (Channel B)", () => {
  const database = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  let server: Server;
  let mockPort: number;
  const retailerA = randomUUID();
  const retailerB = randomUUID();
  const productA = randomUUID();
  const productB = randomUUID();

  beforeAll(async () => {
    log.setLevel(log.LEVELS.OFF);
    const { rows } = await database.query("SELECT current_database() AS name");
    if (!rows[0].name.endsWith("_test")) throw new Error("Integration tests require a database name ending in _test.");
    await migrate(process.env.TEST_DATABASE_URL);

    // Seed test retailers and products
    await database.query("INSERT INTO retailers (id, name) VALUES ($1, 'Store A'), ($2, 'Store B')", [retailerA, retailerB]);
    await database.query(
      "INSERT INTO products (id, retailer_id, name, asin) VALUES ($1, $2, 'Billion-Dollar Ransom', '1529922607')",
      [productA, retailerA],
    );
    await database.query(
      "INSERT INTO products (id, retailer_id, name, asin) VALUES ($1, $2, 'Blocked Book', 'B000000002')",
      [productB, retailerB],
    );

    // Mock HTTP server standing in for Amazon
    server = createServer((req, res) => {
      if (req.url?.includes("1529922607")) {
        res.writeHead(200, { "content-type": "text/html" }).end(pageHtml);
      } else if (req.url?.includes("B000000002")) {
        res.writeHead(503, { "content-type": "text/html" }).end("<html>Service Unavailable</html>");
      } else {
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    mockPort = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await database.query("DELETE FROM attempts WHERE retailer_id IN ($1, $2)", [retailerA, retailerB]);
    await database.query("DELETE FROM observations WHERE retailer_id IN ($1, $2)", [retailerA, retailerB]);
    await database.query("DELETE FROM products WHERE id IN ($1, $2)", [productA, productB]);
    await database.query("DELETE FROM retailers WHERE id IN ($1, $2)", [retailerA, retailerB]);
    await database.end();
  });

  it("crawls an Amazon offer, stores observation as crawler-sourced, and records ok attempt", async () => {
    const res = await crawlProduct(
      database,
      {
        id: productA,
        retailerId: retailerA,
        name: "Billion-Dollar Ransom",
        brand: "",
        asin: "1529922607",
      },
      {
        baseUrl: `http://127.0.0.1:${mockPort}/dp`,
        allowedHosts: ["127.0.0.1"],
        timeoutSecs: 5,
      },
    );

    expect(res.status).toBe("ok");

    // Check observation in DB
    const { rows: obs } = await database.query(
      "SELECT * FROM observations WHERE retailer_id = $1 AND product_id = $2",
      [retailerA, productA],
    );
    expect(obs.length).toBe(1);
    expect(obs[0].collected_via).toBe("crawler");
    expect(obs[0].match_status).toBe("confirmed");
    expect(obs[0].price).toBe("18.01");

    // Check attempt in DB
    const { rows: attempts } = await database.query(
      "SELECT * FROM attempts WHERE retailer_id = $1 AND product_id = $2",
      [retailerA, productA],
    );
    expect(attempts.length).toBe(1);
    expect(attempts[0].status).toBe("ok");
    expect(attempts[0].reason).toBeNull();
  });

  it("stops on blocked response (503), records attempt, and does NOT erase observations", async () => {
    // 1. Manually add an existing observation for productB
    const obsId = randomUUID();
    await database.query(
      `INSERT INTO observations (id, retailer_id, product_id, asin, product_name, source, price, currency, availability, match_status, collected_via)
       VALUES ($1, $2, $3, 'B000000002', 'Blocked Book', 'Amazon UK', '19.99', 'GBP', 'in_stock', 'confirmed', 'extension')`,
      [obsId, retailerB, productB],
    );

    // 2. Run crawler against the product that returns 503
    const res = await crawlProduct(
      database,
      {
        id: productB,
        retailerId: retailerB,
        name: "Blocked Book",
        brand: "",
        asin: "B000000002",
      },
      {
        baseUrl: `http://127.0.0.1:${mockPort}/dp`,
        allowedHosts: ["127.0.0.1"],
        timeoutSecs: 5,
      },
    );

    expect(res.status).toBe("blocked");

    // 3. Existing observation is STILL intact (not overwritten or erased)
    const { rows: obs } = await database.query(
      "SELECT * FROM observations WHERE retailer_id = $1 AND product_id = $2",
      [retailerB, productB],
    );
    expect(obs.length).toBe(1);
    expect(obs[0].id).toBe(obsId);
    expect(obs[0].price).toBe("19.99");

    // 4. Blocked attempt was recorded
    const { rows: attempts } = await database.query(
      "SELECT * FROM attempts WHERE retailer_id = $1 AND product_id = $2 ORDER BY attempted_at DESC",
      [retailerB, productB],
    );
    expect(attempts.length).toBe(1);
    expect(attempts[0].status).toBe("blocked");
    expect(attempts[0].reason).toContain("503");
  });

  it("crawlRetailerProducts isolates crawls to the target retailer", async () => {
    const summary = await crawlRetailerProducts(database, retailerA, {
      baseUrl: `http://127.0.0.1:${mockPort}/dp`,
      allowedHosts: ["127.0.0.1"],
      timeoutSecs: 5,
    });
    // Store A has 1 product
    expect(summary.total).toBe(1);
    expect(summary.ok).toBe(1);
  });

  it("can start and stop scheduled crawler without throwing", () => {
    const stop = startScheduledCrawler(database, 100000);
    expect(typeof stop).toBe("function");
    stop();
  });

  it("updates an unverified observation match status on retailer decision", async () => {
    const obsId = randomUUID();
    await database.query(
      `INSERT INTO observations (id, retailer_id, product_id, asin, product_name, source, price, currency, availability, match_status, collected_via)
       VALUES ($1, $2, $3, 'B099999999', 'Candidate Mouse', 'Amazon SG', '29.99', 'SGD', 'in_stock', 'unverified', 'crawler')`,
      [obsId, retailerA, productA],
    );

    await database.query(
      "UPDATE observations SET match_status = $1 WHERE id = $2 AND retailer_id = $3",
      ["confirmed", obsId, retailerA],
    );

    const { rows } = await database.query("SELECT match_status FROM observations WHERE id = $1", [obsId]);
    expect(rows[0].match_status).toBe("confirmed");

    await database.query("DELETE FROM observations WHERE id = $1", [obsId]);
  });
});
