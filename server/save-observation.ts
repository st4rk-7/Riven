import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import type { CollectedObservation, ExtensionOffer } from "../shared/collected-observation.js";
import { linkOffer, type RetailerProduct } from "./matching.js";

// The one save path for competitor offers, used by the extension (Channel A) and the
// scheduled crawler (Channel B), so a listing behaves the same whichever channel updates it.

export type LinkableProduct = RetailerProduct & { id: string };
export type ListingOffer = Omit<ExtensionOffer, "pageUrl">;

const SOURCES: Record<string, string> = {
  "www.amazon.co.uk": "Amazon UK",
  "amazon.co.uk": "Amazon UK",
  "www.amazon.sg": "Amazon SG",
  "amazon.sg": "Amazon SG",
  "www.amazon.com": "Amazon US",
  "amazon.com": "Amazon US",
};

const HOSTS: Record<string, string> = { "Amazon UK": "www.amazon.co.uk", "Amazon SG": "www.amazon.sg", "Amazon US": "www.amazon.com" };

export function sourceOf(pageUrl: unknown): string | null {
  if (typeof pageUrl !== "string" || !URL.canParse(pageUrl)) return null;
  return SOURCES[new URL(pageUrl).hostname] ?? null;
}

// The page a listing lives on, or null for a source Riven cannot fetch.
export function listingUrl(source: string, asin: string): string | null {
  return HOSTS[source] ? `https://${HOSTS[source]}/dp/${asin}` : null;
}

export function buildObservation(
  offer: ListingOffer,
  source: string,
  collectedVia: CollectedObservation["collectedVia"],
  now: Date,
  products: LinkableProduct[] = [],
): CollectedObservation {
  const link = linkOffer(products, offer);
  return {
    id: randomUUID(),
    productId: link?.product.id ?? null,
    asin: offer.asin,
    productName: offer.productName,
    price: offer.price,
    currency: offer.currency,
    availability: offer.availability,
    seller: offer.seller,
    source,
    observedAt: now.toISOString(),
    // An offer linked to no product stays unverified until the retailer decides.
    matchStatus: link?.status ?? "unverified",
    collectedVia,
  };
}

// Saves one observation inside the caller's transaction.
export async function saveObservation(
  connection: PoolClient,
  retailerId: string,
  offer: ListingOffer,
  source: string,
  collectedVia: CollectedObservation["collectedVia"],
  now = new Date(),
): Promise<CollectedObservation> {
  const { rows: products } = await connection.query<LinkableProduct>(
    "SELECT id, name, brand, asin FROM products WHERE retailer_id = $1 ORDER BY id", [retailerId]);
  const observation = buildObservation(offer, source, collectedVia, now, products);
  // A listing Riven already tracks keeps its product and the retailer's match decision.
  const { rows: [tracked] } = await connection.query<{ productId: string; matchStatus: CollectedObservation["matchStatus"] }>(
    `SELECT product_id AS "productId", match_status AS "matchStatus" FROM observations
      WHERE retailer_id = $1 AND source = $2 AND asin = $3 AND product_id IS NOT NULL
      ORDER BY observed_at DESC, id LIMIT 1`,
    [retailerId, source, observation.asin]);
  if (tracked) Object.assign(observation, tracked);
  await connection.query(`INSERT INTO observations
    (id, retailer_id, product_id, asin, product_name, price, currency, availability, seller, source, observed_at, match_status, collected_via)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
  [observation.id, retailerId, observation.productId, observation.asin, observation.productName,
    observation.price, observation.currency, observation.availability, observation.seller,
    observation.source, observation.observedAt, observation.matchStatus, observation.collectedVia]);
  return observation;
}
