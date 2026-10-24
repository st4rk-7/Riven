import { describe, expect, test } from "vitest";

import { resolveNewProduct } from "./products.js";
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
