// Each site Riven reads is described as data: an ordered list of rules per field (SDD 3.2, NFR-10).
// Adding a site means adding an entry here and its fixtures, with no change to the extractor.

// A JSON-LD rule reads a path in the page's schema.org Product, e.g. "offers.price".
// A CSS rule reads the first matching element with text, or its attribute when `attr` is set.
export type Rule = { jsonld: string } | { css: string; attr?: string };

// A price rule also says where the currency is; a CSS price carries its symbol in the text.
export type PriceRule = { jsonld: string; currency: string } | { css: string };

export type Site = {
  name: string;
  hosts: string[];
  itemId: Rule[];
  productName: Rule[];
  price: PriceRule[];
  availability: Rule[];
  seller: Rule[];
};

export const AMAZON: Site = {
  name: "Amazon",
  hosts: ["www.amazon.co.uk", "amazon.co.uk", "www.amazon.sg", "amazon.sg", "www.amazon.com", "amazon.com"],
  itemId: [{ css: "input[name=ASIN]", attr: "value" }],
  productName: [{ css: "#productTitle" }],
  // Only the buy box price counts; other prices on the page belong to other products.
  // Amazon marks it with either class depending on the page layout.
  price: [{ css: "#buybox .priceToPay .a-offscreen, #buybox .apex-pricetopay-value .a-offscreen" }],
  availability: [{ css: "#availability" }],
  seller: [{ css: "#merchantInfoFeature_feature_div .offer-display-feature-text-message" }],
};

export const SITES: Site[] = [AMAZON];

export function siteForHost(hostname: string): Site | null {
  return SITES.find((site) => site.hosts.includes(hostname)) ?? null;
}
