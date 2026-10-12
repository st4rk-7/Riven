import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { parseAmazonProductPage, parseAvailability, parsePrice } from "./amazon.js";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

describe("parseAmazonProductPage", () => {
  test("reads a product with a buy box price", () => {
    expect(parseAmazonProductPage(fixture("amazon-uk-in-stock.html"))).toEqual({
      asin: "1529922607",
      productName: "Billion-Dollar Ransom: The unmissable new thriller from the Sunday Times bestselling author",
      price: "18.01",
      currency: "GBP",
      availability: "in_stock",
      seller: "Amazon",
    });
  });

  test("reads the price when the buy box uses the apex price class", () => {
    expect(parseAmazonProductPage(fixture("amazon-uk-centre-price.html"))).toMatchObject({
      asin: "B0H5JXRYQ9",
      price: "67.79",
      currency: "SGD",
      availability: "in_stock",
      seller: "Deeneya",
    });
  });

  test("returns no price when the page has no featured offer", () => {
    const offer = parseAmazonProductPage(fixture("amazon-sg-no-offer.html"));

    expect(offer.asin).toBe("B004YAVF8I");
    expect(offer.productName).toContain("Logitech M185 Wireless Mouse");
    expect(offer.price).toBeNull();
    expect(offer.availability).toBe("unknown");
  });

  test("rejects a page that is not a product page", () => {
    expect(() => parseAmazonProductPage("<html><body></body></html>")).toThrow();
  });
});

describe("parsePrice", () => {
  test.each([
    ["£18.01", "18.01", "GBP"],
    ["S$20.12", "20.12", "SGD"],
    ["£1,299.00", "1299.00", "GBP"],
  ])("reads %s", (text, price, currency) => {
    expect(parsePrice(text)).toEqual({ price, currency });
  });

  test("never guesses an unreadable price", () => {
    expect(parsePrice("See All Buying Options").price).toBeNull();
    expect(parsePrice("").price).toBeNull();
  });
});

describe("parseAvailability", () => {
  test.each([
    ["In stock Only 1 left in stock.", "in_stock"],
    ["Currently unavailable.", "out_of_stock"],
    ["Usually dispatched within 2 to 3 weeks.", "unknown"],
  ])("maps %s", (text, expected) => {
    expect(parseAvailability(text)).toBe(expected);
  });
});
