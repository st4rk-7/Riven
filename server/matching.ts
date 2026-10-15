// Decides whether a competitor offer is the same product the retailer sells.
// Order (manual section 7): identifier, then conflicting details, then title.
// A title match alone never confirms; the retailer confirms or rejects later.

export type MatchStatus = "confirmed" | "unverified" | "mismatch";

export type RetailerProduct = { name: string; brand?: string | null; asin?: string | null };
export type OfferForMatching = { productName: string; asin?: string | null };

const SIMILAR_TITLE = 0.5;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 1);
}

// Measurements like "4ghz", "240v", "25m" are specs, not model numbers.
const UNIT = /^\d+(ghz|mhz|hz|v|a|w|m|mm|cm|kg|g|mah|gb|tb|dpi|in|inch|ft)$/;

// Model numbers mix letters and digits, e.g. "m185", "mx3", "g502".
export function modelTokens(text: string): Set<string> {
  return new Set(words(text).filter((w) => /[a-z]/.test(w) && /\d/.test(w) && !UNIT.test(w)));
}

// "2-pack", "pack of 3", "twin pack" -> 2, 3, 2. A single item is 1.
export function packSize(text: string): number {
  const t = text.toLowerCase();
  const n =
    /(\d+)\s*-?\s*pack\b/.exec(t)?.[1] ??
    /pack\s+of\s+(\d+)/.exec(t)?.[1] ??
    /\bx\s?(\d+)\b/.exec(t)?.[1];
  if (n) return Number(n);
  return /\btwin\s*pack\b/.test(t) ? 2 : 1;
}

export function titleSimilarity(a: string, b: string): number {
  const x = new Set(words(a));
  const y = new Set(words(b));
  if (x.size === 0 || y.size === 0) return 0;
  const shared = [...x].filter((w) => y.has(w)).length;
  return shared / Math.min(x.size, y.size);
}

export function matchOffer(product: RetailerProduct, offer: OfferForMatching): MatchStatus {
  // 1. Same identifier confirms; a different identifier rules it out.
  if (product.asin && offer.asin) {
    return product.asin === offer.asin ? "confirmed" : "mismatch";
  }

  // 2. Conflicting model number or pack size rules it out.
  const productModels = modelTokens(product.name);
  const offerModels = modelTokens(offer.productName);
  if (productModels.size > 0 && offerModels.size > 0 && ![...productModels].some((m) => offerModels.has(m))) {
    return "mismatch";
  }
  if (packSize(product.name) !== packSize(offer.productName)) {
    return "mismatch";
  }

  // 3. A similar title is only a candidate.
  const name = product.brand ? `${product.brand} ${product.name}` : product.name;
  return titleSimilarity(name, offer.productName) >= SIMILAR_TITLE ? "unverified" : "mismatch";
}

// Links an offer to the retailer product it matches best: a confirmed match wins,
// otherwise the most similar unverified one. Null when every product is ruled out.
export function linkOffer<P extends RetailerProduct>(
  products: P[],
  offer: OfferForMatching,
): { product: P; status: MatchStatus } | null {
  const confirmed = products.find((p) => matchOffer(p, offer) === "confirmed");
  if (confirmed) return { product: confirmed, status: "confirmed" };
  const score = (p: P) => titleSimilarity(p.brand ? `${p.brand} ${p.name}` : p.name, offer.productName);
  const best = products.filter((p) => matchOffer(p, offer) === "unverified").sort((a, b) => score(b) - score(a))[0];
  return best ? { product: best, status: "unverified" } : null;
}
