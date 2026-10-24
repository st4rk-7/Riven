import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { linkOffer } from "./matching.js";
import { collectAmazonOffer } from "./sources/amazon-collector.js";

export type CrawlTarget = {
  id: string;
  retailerId: string;
  name: string;
  brand: string;
  asin: string;
};

export type CrawlSummary = {
  total: number;
  ok: number;
  blocked: number;
  failed: number;
};

export type CrawlOptions = {
  allowedHosts?: string[];
  timeoutSecs?: number;
  baseUrl?: string;
  host?: string;
};

export function defaultAmazonHost(): string {
  return process.env.AMAZON_HOST || "amazon.sg";
}

export function sourceNameForHost(hostOrUrl: string): string {
  if (hostOrUrl.includes(".sg")) return "Amazon SG";
  if (hostOrUrl.includes(".co.uk")) return "Amazon UK";
  if (hostOrUrl.includes(".com")) return "Amazon US";
  return "Amazon";
}

// Collects one product's competitor offer from Amazon.
// Success -> observation (collected_via = 'crawler') + attempt (status = 'ok').
// Blocked / Failed -> attempt (status = 'blocked'|'failed'), earlier observations kept intact.
export async function crawlProduct(
  database: Pool,
  target: CrawlTarget,
  options?: CrawlOptions,
): Promise<{ status: "ok" | "blocked" | "failed"; reason?: string }> {
  const host = options?.host ?? defaultAmazonHost();
  const base = options?.baseUrl ?? `https://${host}/dp`;
  const url = `${base}/${target.asin}`;
  const source = sourceNameForHost(base);
  const result = await collectAmazonOffer(url, options);

  if (result.status === "ok") {
    const connection = await database.connect();
    try {
      await connection.query("BEGIN");
      const { rows: products } = await connection.query<{ id: string; name: string; brand: string; asin: string | null }>(
        "SELECT id, name, brand, asin FROM products WHERE retailer_id = $1 ORDER BY id",
        [target.retailerId],
      );
      const link = linkOffer(products, result.offer);
      const observationId = randomUUID();
      await connection.query(
        `INSERT INTO observations
          (id, retailer_id, product_id, asin, product_name, price, currency, availability, seller, source, observed_at, match_status, collected_via)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'crawler')`,
        [
          observationId,
          target.retailerId,
          link?.product.id ?? target.id,
          result.offer.asin || target.asin,
          result.offer.productName,
          result.offer.price,
          result.offer.currency,
          result.offer.availability,
          result.offer.seller,
          source,
          result.observedAt,
          link?.status ?? "confirmed",
        ],
      );
      await connection.query(
        `INSERT INTO attempts (id, retailer_id, product_id, source, status, reason, attempted_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [randomUUID(), target.retailerId, target.id, source, "ok", null, result.observedAt],
      );
      await connection.query("COMMIT");
      return { status: "ok" };
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  }

  // Blocked or failed: record attempt without modifying observations.
  await database.query(
    `INSERT INTO attempts (id, retailer_id, product_id, source, status, reason, attempted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [randomUUID(), target.retailerId, target.id, source, result.status, result.reason, result.observedAt],
  );
  return { status: result.status, reason: result.reason };
}

// Sweeps products with ASINs. Optional retailerId restricts to one retailer.
export async function crawlRetailerProducts(
  database: Pool,
  retailerId?: string,
  options?: CrawlOptions,
): Promise<CrawlSummary> {
  const query = retailerId
    ? `SELECT id, retailer_id AS "retailerId", name, brand, asin FROM products WHERE asin IS NOT NULL AND retailer_id = $1 ORDER BY id`
    : `SELECT id, retailer_id AS "retailerId", name, brand, asin FROM products WHERE asin IS NOT NULL ORDER BY id`;
  const params = retailerId ? [retailerId] : [];
  const { rows: targets } = await database.query<CrawlTarget>(query, params);

  const summary: CrawlSummary = { total: targets.length, ok: 0, blocked: 0, failed: 0 };
  for (const target of targets) {
    try {
      const res = await crawlProduct(database, target, options);
      if (res.status === "ok") summary.ok++;
      else if (res.status === "blocked") summary.blocked++;
      else summary.failed++;
    } catch {
      summary.failed++;
    }
  }
  return summary;
}

// Starts periodic background crawler outside the request loop.
export function startScheduledCrawler(
  database: Pool,
  intervalMs: number,
  options?: CrawlOptions,
): () => void {
  if (intervalMs <= 0) return () => {};
  const timer = setInterval(() => {
    crawlRetailerProducts(database, undefined, options).catch((err) => {
      console.error("Scheduled crawl failed:", err);
    });
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
