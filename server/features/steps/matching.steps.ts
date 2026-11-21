import assert from "node:assert/strict";

import { Before, Given, Then, When } from "@cucumber/cucumber";

import { ExtensionOfferSchema, type CollectedObservation } from "../../../shared/collected-observation.js";
import { buildObservation, sourceOf, type LinkableProduct } from "../../save-observation.js";

// Scenario state; reset before each scenario.
let products: LinkableProduct[] = [];
let saved: CollectedObservation | undefined;

Before(() => {
  products = [];
  saved = undefined;
});

Given("I track {string} by {string} with ASIN {string}", (name: string, brand: string, asin: string) => {
  products.push({ id: `product-${products.length + 1}`, name, brand, asin });
});

Given("I track {string} by {string} without an ASIN", (name: string, brand: string) => {
  products.push({ id: `product-${products.length + 1}`, name, brand, asin: null });
});

When(
  "the extension sends the Amazon UK offer {string} with ASIN {string} priced {string} {string}",
  (productName: string, asin: string, price: string, currency: string) => {
    // Validate exactly as the API does at the trust boundary.
    const { pageUrl, ...offer } = ExtensionOfferSchema.parse({
      pageUrl: `https://www.amazon.co.uk/dp/${asin}`,
      asin,
      productName,
      price,
      currency,
      availability: "in_stock",
      seller: "Synthetic Seller",
    });
    const source = sourceOf(pageUrl);
    assert.ok(source, `no source for ${pageUrl}`);
    saved = buildObservation(offer, source, "extension", new Date("2026-11-21T09:00:00.000Z"), products);
  },
);

Then("the offer is linked to {string} with status {string}", (productName: string, status: string) => {
  assert.ok(saved, "no offer was saved");
  const linked = products.find((p) => p.id === saved?.productId);
  assert.equal(linked?.name ?? "none", productName);
  assert.equal(saved.matchStatus, status);
});

Then("the observation records {string} {string} from {string}", (price: string, currency: string, source: string) => {
  assert.ok(saved, "no offer was saved");
  assert.deepEqual([saved.price, saved.currency, saved.source], [price, currency, source]);
});
