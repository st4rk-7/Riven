import type { ApiObservation, ApiProduct } from "./riven-api";

export type Availability = ApiObservation["availability"];
export type MatchStatus = ApiObservation["matchStatus"];

export type PricePoint = { observedAt: string; price: number | null };

// One competitor listing: its newest observation plus every earlier one.
export type Offer = {
  id: string;
  seller: string;
  source: string;
  price: string | null;
  currency: string | null;
  availability: Availability;
  matchStatus: MatchStatus;
  observedAt: string;
  collectedVia: ApiObservation["collectedVia"];
  history: PricePoint[];
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  offers: Offer[];
};

export const UNLINKED_ID = "unlinked";

// Observations arrive newest first; the first one per listing is its current offer.
export function buildCatalog(products: ApiProduct[], observations: ApiObservation[]): Product[] {
  const offersByProduct = new Map<string, Map<string, Offer>>();
  for (const o of observations) {
    const productKey = o.productId ?? UNLINKED_ID;
    const listingKey = `${o.source}|${o.seller ?? ""}|${o.asin}`;
    const listings = offersByProduct.get(productKey) ?? new Map<string, Offer>();
    offersByProduct.set(productKey, listings);
    const point = { observedAt: o.observedAt, price: o.price === null ? null : Number(o.price) };
    const existing = listings.get(listingKey);
    if (existing) {
      existing.history.unshift(point);
      continue;
    }
    const seller = o.seller ?? "Unknown seller";
    listings.set(listingKey, {
      id: o.id,
      seller: o.productId === null ? `${seller} · ${o.productName}` : seller,
      source: o.source,
      price: o.price,
      currency: o.currency,
      availability: o.availability,
      matchStatus: o.matchStatus,
      observedAt: o.observedAt,
      collectedVia: o.collectedVia,
      history: [point],
    });
  }

  const catalog: Product[] = products.map((p) => ({
    id: p.id,
    brand: p.brand,
    name: p.name,
    offers: [...(offersByProduct.get(p.id)?.values() ?? [])],
  }));
  const unlinked = offersByProduct.get(UNLINKED_ID);
  if (unlinked) catalog.push({ id: UNLINKED_ID, brand: "", name: "Offers not linked to a product", offers: [...unlinked.values()] });
  return catalog;
}

export function formatPrice(price: string | null, currency: string | null): string {
  if (price === null) return "Price unavailable";
  return currency === "GBP" ? `£${price}` : `${price} ${currency ?? ""}`.trim();
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Only confirmed matches in one currency give a trustworthy comparison; null means mixed currencies.
function comparable(list: Offer[]): Offer[] | null {
  const priced = list.filter((o) => o.matchStatus === "confirmed" && o.price !== null);
  return new Set(priced.map((o) => o.currency)).size > 1 ? null : priced;
}

function summarise(list: Offer[], pick: (prices: number[]) => number): string {
  const offers = comparable(list);
  if (offers === null) return "Mixed currencies";
  if (offers.length === 0) return formatPrice(null, null);
  return formatPrice(pick(offers.map((o) => Number(o.price))).toFixed(2), offers[0].currency);
}

export const lowestPrice = (list: Offer[]) => summarise(list, (p) => Math.min(...p));
export const averagePrice = (list: Offer[]) => summarise(list, (p) => p.reduce((a, b) => a + b, 0) / p.length);
