import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { listingUrl, saveObservation } from "./save-observation.js";
import { collectAmazonOffer } from "./sources/amazon-collector.js";

// One competitor page Riven re-checks: a listing linked to a product, or the product's own ASIN.
export type CrawlTarget = {
  retailerId: string;
  productId: string;
  source: string;
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

// Collects one listing's page and saves it through the same path as the extension.
// Success -> observation (collected_via = 'crawler') + attempt (status = 'ok').
// Blocked / Failed -> attempt (status = 'blocked'|'failed'), earlier observations kept intact.
export async function crawlListing(
  database: Pool,
  target: CrawlTarget,
  options?: CrawlOptions,
): Promise<{ status: "ok" | "blocked" | "failed"; reason?: string }> {
  const url = options?.baseUrl ? `${options.baseUrl}/${target.asin}` : listingUrl(target.source, target.asin);
  const result = url
    ? await collectAmazonOffer(url, options)
    : { status: "failed" as const, reason: `No collector for ${target.source}`, observedAt: new Date().toISOString() };

  const connection = await database.connect();
  try {
    await connection.query("BEGIN");
    if (result.status === "ok") {
      await saveObservation(connection, target.retailerId, { ...result.offer, asin: result.offer.asin || target.asin },
        target.source, "crawler", new Date(result.observedAt), result.rules);
    }
    await connection.query(
      `INSERT INTO attempts (id, retailer_id, product_id, source, status, reason, attempted_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), target.retailerId, target.productId, target.source, result.status,
        result.status === "ok" ? null : result.reason, result.observedAt],
    );
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }
  return result.status === "ok" ? { status: "ok" } : { status: result.status, reason: result.reason };
}

// Every listing linked to a product (unless the retailer rejected it), plus each product's own ASIN.
const TARGETS = `
  SELECT "retailerId", "productId", source, asin FROM (
    SELECT DISTINCT ON (product_id, source, asin)
      retailer_id AS "retailerId", product_id AS "productId", source, asin, match_status
    FROM observations WHERE product_id IS NOT NULL AND ($1::text IS NULL OR retailer_id = $1)
    ORDER BY product_id, source, asin, observed_at DESC, id
  ) latest WHERE match_status <> 'mismatch'
  UNION
  SELECT retailer_id, id, $2, asin FROM products WHERE asin IS NOT NULL AND ($1::text IS NULL OR retailer_id = $1)
  ORDER BY 1, 2, 3, 4`;

// Sweeps tracked listings. Optional retailerId restricts to one retailer.
export async function crawlRetailerProducts(
  database: Pool,
  retailerId?: string,
  options?: CrawlOptions,
): Promise<CrawlSummary> {
  const ownSource = sourceNameForHost(options?.host ?? defaultAmazonHost());
  const { rows: targets } = await database.query<CrawlTarget>(TARGETS, [retailerId ?? null, ownSource]);

  const summary: CrawlSummary = { total: targets.length, ok: 0, blocked: 0, failed: 0 };
  for (const target of targets) {
    try {
      const res = await crawlListing(database, target, options);
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
