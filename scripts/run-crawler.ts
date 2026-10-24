// Scheduled crawler worker: sweeps stored retailer products with ASINs and collects competitor offers.
// Usage: npm run crawl
import pg from "pg";
import { crawlRetailerProducts } from "../server/crawler.js";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL.");
  const database = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log("Starting scheduled collection for stored retailer products...");
    const summary = await crawlRetailerProducts(database);
    console.log(
      `Crawl completed: ${summary.ok} ok, ${summary.blocked} blocked, ${summary.failed} failed of ${summary.total} products.`,
    );
  } finally {
    await database.end();
  }
}

main().catch((err: unknown) => {
  console.error("Crawl script failed:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
