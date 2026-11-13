import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { extractOffer } from "./extract.js";
import { AMAZON, type Site, siteForHost } from "./sites.js";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

// A test site that prefers JSON-LD and falls back to CSS, as real sites will.
const SHOP: Site = {
  name: "Test shop",
  hosts: ["shop.test"],
  itemId: [{ jsonld: "sku" }, { css: "[data-item-id]", attr: "data-item-id" }],
  productName: [{ jsonld: "name" }, { css: "h1" }],
  price: [{ jsonld: "offers.price", currency: "offers.priceCurrency" }, { css: ".price" }],
  availability: [{ jsonld: "offers.availability" }, { css: ".stock" }],
  seller: [{ jsonld: "offers.seller.name" }, { css: ".seller" }],
  capture: ["main"],
  strip: [],
  blocked: /challenge/i,
};

const page = (jsonLd: unknown, body = "") =>
  `<html><head><script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head><body>${body}</body></html>`;

describe("extractOffer", () => {
  test("reads JSON-LD first and records the rule for each field", () => {
    const html = page(
      { "@context": "https://schema.org", "@graph": [{ "@type": "BreadcrumbList" }, {
        "@type": "Product", name: "Mouse", sku: "123456789012",
        offers: [null, { "@type": "Offer", price: 18.5, priceCurrency: "GBP", availability: "https://schema.org/InStock", seller: { name: "Shop A" } }],
      }] },
      '<h1>Other title</h1><span class="price">£99.99</span>',
    );

    expect(extractOffer(html, SHOP)).toEqual({
      offer: { asin: "123456789012", productName: "Mouse", price: "18.50", currency: "GBP", availability: "in_stock", seller: "Shop A" },
      rules: {
        itemId: "jsonld:sku",
        productName: "jsonld:name",
        price: "jsonld:offers.price",
        availability: "jsonld:offers.availability",
        seller: "jsonld:offers.seller.name",
      },
    });
  });

  test("falls back to CSS when JSON-LD has no usable value", () => {
    const html = page(
      { "@type": "Product", name: "Mouse", offers: { price: "18.505", priceCurrency: "GBP" } },
      '<div data-item-id="B0TEST1234"></div><span class="price">£18.51</span><p class="stock">Out of stock</p><p class="seller"> Shop B </p>',
    );

    const { offer, rules } = extractOffer(html, SHOP);

    // Three decimals are never rounded, so the CSS price is used instead.
    expect(offer).toMatchObject({ asin: "B0TEST1234", price: "18.51", currency: "GBP", availability: "out_of_stock", seller: "Shop B" });
    expect(rules).toMatchObject({ itemId: "css:[data-item-id]", price: "css:.price", availability: "css:.stock", seller: "css:.seller" });
  });

  test("skips broken JSON-LD blocks", () => {
    const html = '<script type="application/ld+json">{ not json</script><h1>Mouse</h1><span class="price">£5.00</span>';

    expect(extractOffer(html, SHOP).offer).toMatchObject({ productName: "Mouse", price: "5.00" });
  });

  test("records no rule for fields no rule could read", () => {
    const { offer, rules } = extractOffer("<h1>Mouse</h1>", SHOP);

    expect(offer).toMatchObject({ price: null, availability: "unknown", seller: null });
    expect(rules).toMatchObject({ price: null, availability: null, seller: null });
  });

  test("reads Amazon through the registry and records its CSS rules", () => {
    const { rules } = extractOffer(fixture("amazon-uk-in-stock.html"), AMAZON);

    expect(rules.price).toMatch(/^css:#buybox /);
    expect(rules.productName).toBe("css:#productTitle");
  });
});

describe("siteForHost", () => {
  test("finds a site by host", () => {
    expect(siteForHost("www.amazon.co.uk")).toBe(AMAZON);
    expect(siteForHost("example.com")).toBeNull();
  });
});
