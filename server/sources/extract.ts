import * as cheerio from "cheerio";

import type { PriceRule, Rule, Site } from "./sites.js";

export type Offer = {
  asin: string;
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
};

// Which rule read each field, e.g. { price: "css:#buybox ..." }; null when no rule matched.
export type MatchedRules = Record<"itemId" | "productName" | "price" | "availability" | "seller", string | null>;

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
  // Amazon shows other countries' visitors a converted price led by an ISO code, e.g. "LKR143,394.48".
  const currency = CURRENCY_SYMBOLS.find(([s]) => trimmed.startsWith(s))?.[1] ?? /^([A-Z]{3})\d/.exec(trimmed)?.[1] ?? null;
  const amount = /^\D*(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})$/.exec(trimmed);
  if (!currency || !amount) {
    return { price: null, currency };
  }
  return { price: `${amount[1].replace(/,/g, "")}.${amount[2]}`, currency };
}

export function parseAvailability(text: string): Offer["availability"] {
  const t = text.toLowerCase();
  // schema.org values, e.g. "https://schema.org/InStock".
  if (/schema\.org\/(instock|limitedavailability|onlineonly)$/.test(t)) return "in_stock";
  if (/schema\.org\/(outofstock|soldout|discontinued)$/.test(t)) return "out_of_stock";
  if (t.startsWith("in stock") || /only \d+ left in stock/.test(t)) return "in_stock";
  if (t.includes("currently unavailable") || t.includes("out of stock")) return "out_of_stock";
  return "unknown";
}

// A JSON-LD amount as a decimal string; more than two decimals is never rounded.
function jsonLdAmount(value: unknown): string | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value ?? "").trim());
  return match ? `${match[1]}.${(match[2] ?? "").padEnd(2, "0")}` : null;
}

// The page's first schema.org Product, looking inside arrays and @graph.
function findProduct($: cheerio.CheerioAPI): Record<string, unknown> | null {
  const nodes: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      nodes.push(JSON.parse($(el).text()));
    } catch {
      // A broken block is skipped; the CSS rules still apply.
    }
  });
  while (nodes.length) {
    const node = nodes.shift();
    if (Array.isArray(node)) nodes.push(...node);
    else if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      const type = record["@type"];
      if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) return record;
      if (record["@graph"]) nodes.push(record["@graph"]);
    }
  }
  return null;
}

// Reads "offers.price"; an array step takes its first non-null item.
function readPath(node: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    const item = Array.isArray(value) ? value.find((v) => v != null) : value;
    return item && typeof item === "object" ? (item as Record<string, unknown>)[key] : undefined;
  }, node);
}

const label = (rule: Rule | PriceRule) => ("jsonld" in rule ? `jsonld:${rule.jsonld}` : `css:${rule.css}`);

// Reads any page with any site's rules: each field takes its first rule that yields a value.
export function extractOffer(html: string, site: Site): { offer: Offer; rules: MatchedRules } {
  const $ = cheerio.load(html);
  const product = findProduct($);
  // Scripts and styles would otherwise leak into element text.
  $("script, style").remove();

  function readText(rules: Rule[]): { value: string; rule: string | null } {
    for (const rule of rules) {
      const value =
        "jsonld" in rule
          ? String(readPath(product, rule.jsonld) ?? "")
          : ($(rule.css)
              .toArray()
              .map((el) => (rule.attr ? String($(el).attr(rule.attr) ?? "") : $(el).text()))
              .map((text) => text.replace(/\s+/g, " ").trim())
              .find((text) => text.length > 0) ?? "");
      if (value.trim()) return { value: value.trim(), rule: label(rule) };
    }
    return { value: "", rule: null };
  }

  function readPrice(): { price: string | null; currency: string | null; rule: string | null } {
    for (const rule of site.price) {
      const parsed =
        "jsonld" in rule
          ? { price: jsonLdAmount(readPath(product, rule.jsonld)), currency: String(readPath(product, rule.currency) ?? "") }
          : parsePrice(readText([rule]).value);
      const currency = parsed.currency && /^[A-Z]{3}$/.test(parsed.currency) ? parsed.currency : null;
      if (parsed.price && currency) return { price: parsed.price, currency, rule: label(rule) };
    }
    return { price: null, currency: null, rule: null };
  }

  const productName = readText(site.productName);
  if (!productName.value) {
    throw new Error(`Not a ${site.name} product page: no product title found.`);
  }
  const itemId = readText(site.itemId);
  const price = readPrice();
  const availability = readText(site.availability);
  const seller = readText(site.seller);

  return {
    offer: {
      asin: itemId.value,
      productName: productName.value,
      price: price.price,
      currency: price.currency,
      // Without a price the stock text describes no offer Riven can show.
      availability: price.price === null ? "unknown" : parseAvailability(availability.value),
      seller: seller.value || null,
    },
    rules: {
      itemId: itemId.rule,
      productName: productName.rule,
      price: price.rule,
      availability: price.price === null ? null : availability.rule,
      seller: seller.rule,
    },
  };
}
