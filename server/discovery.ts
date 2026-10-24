import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import type { Pool } from "pg";
import { defaultAmazonHost, sourceNameForHost } from "./crawler.js";
import { linkOffer } from "./matching.js";
import { parsePrice } from "./sources/amazon.js";

export type SearchCandidate = {
  asin: string;
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
};

// Searches Amazon for competitor candidate products matching a query.
export async function searchAmazonCandidates(
  query: string,
  host: string = defaultAmazonHost(),
): Promise<SearchCandidate[]> {
  const url = `https://${host}/s?k=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "RivenBot/0.1 (EC5406 student project)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) return [];
  const html = await response.text();
  const $ = cheerio.load(html);
  const candidates: SearchCandidate[] = [];

  $("[data-asin]").each((_, el) => {
    const asin = $(el).attr("data-asin")?.trim();
    if (!asin || asin.length !== 10) return;
    const title = $(el).find("h2 span, h2 a span, .a-size-medium, .a-size-base-plus").first().text().trim();
    if (!title || title.length < 3) return;
    const priceText = $(el).find(".a-price .a-offscreen").first().text().trim();
    const { price, currency } = parsePrice(priceText);
    candidates.push({
      asin,
      productName: title,
      price,
      currency,
      availability: price !== null ? "in_stock" : "unknown",
      seller: "Amazon Competitor",
    });
  });

  // Unique by ASIN, up to top 5 candidates
  const seen = new Set<string>();
  return candidates
    .filter((c) => {
      if (seen.has(c.asin)) return false;
      seen.add(c.asin);
      return true;
    })
    .slice(0, 5);
}

// Discovers competitors for a retailer product and adds candidate observations.
export async function discoverProductCompetitors(
  database: Pool,
  retailerId: string,
  productId: string,
  host: string = defaultAmazonHost(),
): Promise<number> {
  const { rows: products } = await database.query<{ id: string; name: string; brand: string; asin: string | null }>(
    "SELECT id, name, brand, asin FROM products WHERE id = $1 AND retailer_id = $2",
    [productId, retailerId],
  );
  if (products.length === 0) return 0;

  const target = products[0];
  const searchQuery = target.brand ? `${target.brand} ${target.name}` : target.name;
  const candidates = await searchAmazonCandidates(searchQuery, host);
  if (candidates.length === 0) return 0;

  const source = sourceNameForHost(host);
  const now = new Date().toISOString();
  let added = 0;

  const connection = await database.connect();
  try {
    await connection.query("BEGIN");
    for (const candidate of candidates) {
      // Check if we already have an observation for this ASIN and product
      const { rows: existing } = await connection.query(
        "SELECT 1 FROM observations WHERE retailer_id = $1 AND product_id = $2 AND asin = $3",
        [retailerId, target.id, candidate.asin],
      );
      if (existing.length > 0) continue;

      const link = linkOffer([target], candidate);
      const matchStatus = link?.status ?? (target.asin === candidate.asin ? "confirmed" : "unverified");
      const id = randomUUID();

      await connection.query(
        `INSERT INTO observations
          (id, retailer_id, product_id, asin, product_name, price, currency, availability, seller, source, observed_at, match_status, collected_via)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'crawler')`,
        [
          id,
          retailerId,
          target.id,
          candidate.asin,
          candidate.productName,
          candidate.price,
          candidate.currency,
          candidate.availability,
          candidate.seller,
          source,
          now,
          matchStatus,
        ],
      );
      await connection.query(
        `INSERT INTO attempts (id, retailer_id, product_id, source, status, reason, attempted_at)
          VALUES ($1, $2, $3, $4, 'ok', null, $5)`,
        [randomUUID(), retailerId, target.id, source, now],
      );
      added++;
    }
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }

  return added;
}
