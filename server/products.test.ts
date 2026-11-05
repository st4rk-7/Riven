import { describe, expect, test } from "vitest";

import { parseProductEdit, resolveNewProduct } from "./products.js";
import type { CollectResult } from "./sources/amazon-collector.js";

const observedAt = "2026-10-24T00:00:00Z";
const page: CollectResult = { status: "ok", observedAt, offer: {
  asin: "B0TEST1234", productName: "Logitech M185 Wireless Mouse", price: "9.99", currency: "GBP", availability: "in_stock", seller: null } };

describe("resolveNewProduct", () => {
  test("reads the name and ASIN from an Amazon link", async () => {
    const urls: string[] = [];
    const result = await resolveNewProduct({ url: " https://www.amazon.co.uk/dp/B0TEST1234 " }, async (url) => { urls.push(url); return page; });
    expect(urls).toEqual(["https://www.amazon.co.uk/dp/B0TEST1234"]);
    expect(result).toEqual({ product: { name: "Logitech M185 Wireless Mouse", brand: "", asin: "B0TEST1234" } });
  });

  test("asks for the name when the page can't be read", async () => {
    const result = await resolveNewProduct({ url: "https://example.com/item" }, async () => ({ status: "failed", reason: "Host not allowed", observedAt }));
    expect(result).toHaveProperty("error");
  });

  test("accepts a typed name and brand without fetching anything", async () => {
    const result = await resolveNewProduct({ name: " Desk lamp ", brand: "Acme", asin: "b0lamp0001" }, async () => { throw new Error("no fetch"); });
    expect(result).toEqual({ product: { name: "Desk lamp", brand: "Acme", asin: "B0LAMP0001" } });
  });

  test("rejects an empty body, a blank name and unknown fields", async () => {
    for (const body of [undefined, {}, { name: "  " }, { name: "Lamp", retailerId: "other" }]) {
      expect(await resolveNewProduct(body)).toHaveProperty("error");
    }
  });
});

describe("parseProductEdit", () => {
  test("trims the new name and brand", () => {
    expect(parseProductEdit({ name: " iPhone 16 Pro Max ", brand: " Apple " })).toEqual({ name: "iPhone 16 Pro Max", brand: "Apple", ownPrice: null, ownCurrency: null });
    expect(parseProductEdit({ name: "Desk lamp" })).toEqual({ name: "Desk lamp", brand: "", ownPrice: null, ownCurrency: null });
  });

  test("stores the own price with two decimals, and blank clears it", () => {
    expect(parseProductEdit({ name: "Lamp", ownPrice: "1,049", ownCurrency: "gbp" })).toMatchObject({ ownPrice: "1049.00", ownCurrency: "GBP" });
    expect(parseProductEdit({ name: "Lamp", ownPrice: "302539.9", ownCurrency: "LKR" })).toMatchObject({ ownPrice: "302539.90", ownCurrency: "LKR" });
    expect(parseProductEdit({ name: "Lamp", ownPrice: "", ownCurrency: "GBP" })).toMatchObject({ ownPrice: null, ownCurrency: null });
  });

  test("rejects a blank name, a bad price, a price without currency and fields that must not change here", () => {
    for (const body of [undefined, {}, { name: "  " }, { name: "Lamp", asin: "B0LAMP0001" }, { name: "Lamp", retailerId: "other" },
      { name: "Lamp", ownPrice: "-5", ownCurrency: "GBP" }, { name: "Lamp", ownPrice: "12.345", ownCurrency: "GBP" },
      { name: "Lamp", ownPrice: "abc", ownCurrency: "GBP" }, { name: "Lamp", ownPrice: "10.00" }]) {
      expect(parseProductEdit(body)).toBeNull();
    }
  });
});
