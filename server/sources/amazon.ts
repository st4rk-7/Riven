import * as cheerio from "cheerio";

export type AmazonOffer = {
  asin: string;
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
};

// Longest symbols first so "S$" is not read as "$".
const CURRENCY_SYMBOLS: [string, string][] = [
  ["S$", "SGD"],
  ["US$", "USD"],
  ["£", "GBP"],
  ["€", "EUR"],
  ["$", "USD"],
];

export function parsePrice(text: string): { price: string | null; currency: string | null } {
  const trimmed = text.replace(/\s+/g, "").trim();
  const symbol = CURRENCY_SYMBOLS.find(([s]) => trimmed.startsWith(s));
  const amount = /^\D*(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})$/.exec(trimmed);
  if (!symbol || !amount) {
    return { price: null, currency: symbol ? symbol[1] : null };
  }
  return { price: `${amount[1].replace(/,/g, "")}.${amount[2]}`, currency: symbol[1] };
}

export function parseAvailability(text: string): AmazonOffer["availability"] {
  const t = text.toLowerCase();
  if (t.startsWith("in stock") || /only \d+ left in stock/.test(t)) return "in_stock";
  if (t.includes("currently unavailable") || t.includes("out of stock")) return "out_of_stock";
  return "unknown";
}

export function parseAmazonProductPage(html: string): AmazonOffer {
  const $ = cheerio.load(html);
  $("script, style").remove();

  const productName = $("#productTitle").first().text().replace(/\s+/g, " ").trim();
  if (!productName) {
    throw new Error("Not an Amazon product page: no product title found.");
  }

  const asin = String($("input[name=ASIN]").first().val() ?? "").trim();

  // Only the buy box price counts; other prices on the page belong to other products.
  const priceText = $("#buybox .priceToPay .a-offscreen").first().text();
  const { price, currency } = parsePrice(priceText);

  const availabilityText = $("#availability").first().text().replace(/\s+/g, " ").trim();
  const seller =
    $("#merchantInfoFeature_feature_div .offer-display-feature-text-message").first().text().trim() || null;

  return {
    asin,
    productName,
    price,
    currency,
    availability: price === null ? "unknown" : parseAvailability(availabilityText),
    seller,
  };
}
