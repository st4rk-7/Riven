import { randomUUID } from "node:crypto";
import * as cheerio from "cheerio";
import type { Pool } from "pg";
import { defaultAmazonHost, sourceNameForHost } from "./crawler.js";
import { matchOffer } from "./matching.js";
import { parsePrice } from "./sources/amazon.js";

// Competitor listings kept per product, so repeated discovery cannot flood the offer list.
const MAX_LISTINGS_PER_PRODUCT = 5;

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
  return parseSearchResults(await response.text());
}

// Reads search result cards in page order, one per ASIN.
export function parseSearchResults(html: string): SearchCandidate[] {
  const $ = cheerio.load(html);
  const candidates = new Map<string, SearchCandidate>();

  $("[data-asin]").each((_, el) => {
    const asin = $(el).attr("data-asin")?.trim();
    if (!asin || asin.length !== 10 || candidates.has(asin)) return;
    const headings = $(el).find("h2");
    // Amazon UK cards put the brand in one heading and the full title in another's aria-label.
    const title = (headings.filter("[aria-label]").first().attr("aria-label") ?? headings.last().text()).trim();
    if (title.length < 3) return;
    const brand = headings.length > 1 ? headings.first().text().trim() : "";
    const productName = brand && !title.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${title}` : title;
    const { price, currency } = parsePrice($(el).find(".a-price .a-offscreen").first().text().trim());
    candidates.set(asin, {
      asin,
      productName,
      price,
      currency,
      availability: "unknown", // Search-card prices do not establish stock.
      // Result cards do not name the seller; the product page or extension does.
      seller: null,
    });
  });

  return [...candidates.values()];
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
    // Locking the product serialises concurrent discovery so the cap holds.
    await connection.query("SELECT 1 FROM products WHERE id = $1 FOR UPDATE", [target.id]);
    const { rows: listed } = await connection.query<{ asin: string }>(
      "SELECT DISTINCT asin FROM observations WHERE retailer_id = $1 AND product_id = $2",
      [retailerId, target.id],
    );
    const known = new Set(listed.map((row) => row.asin));
    for (const candidate of candidates) {
      if (known.size >= MAX_LISTINGS_PER_PRODUCT) break;
      if (known.has(candidate.asin)) continue;

      // A different ASIN can still be the same product, so judge it by title, model and pack size.
      const sameAsin = target.asin === candidate.asin;
      if (!sameAsin && matchOffer(target, { productName: candidate.productName }) === "mismatch") continue;
      const matchStatus = sameAsin ? "confirmed" : "unverified";
      known.add(candidate.asin);
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
