import { extractOffer, type Offer } from "./extract.js";
import { AMAZON } from "./sites.js";

export { parseAvailability, parsePrice } from "./extract.js";

export type AmazonOffer = Offer;

// Amazon's rules live in sites.ts; this reads a page with them through the shared extractor.
export function parseAmazonProductPage(html: string): AmazonOffer {
  return extractOffer(html, AMAZON).offer;
}
