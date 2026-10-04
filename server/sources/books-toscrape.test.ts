import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

import { parseBookPage } from "./books-toscrape.js";

const page = readFileSync(
  new URL("./fixtures/a-light-in-the-attic.html", import.meta.url),
  "utf8",
);
const observedAt = new Date("2026-10-04T12:00:00Z");

test("parses a saved book page into an observation", () => {
  expect(parseBookPage(page, observedAt)).toEqual({
    mode: "synthetic",
    productName: "A Light in the Attic",
    price: "51.77",
    currency: "GBP",
    availability: "in_stock",
    source: "books.toscrape.com (practice site)",
    observedAt: "2026-10-04T12:00:00.000Z",
    matchStatus: "unverified",
  });
});

test("reports out of stock", () => {
  const outOfStock = page.replace("In stock (22 available)", "Out of stock");
  expect(parseBookPage(outOfStock, observedAt).availability).toBe("out_of_stock");
});

test("reports unknown availability when the stock text is missing", () => {
  const noStock = page.replace("In stock (22 available)", "");
  expect(parseBookPage(noStock, observedAt).availability).toBe("unknown");
});

test("returns null price when the price is not in the expected format", () => {
  const badPrice = page.replace("£51.77", "Price on request");
  expect(parseBookPage(badPrice, observedAt).price).toBeNull();
});

test("rejects a page that is not a book page", () => {
  expect(() => parseBookPage("<html><body></body></html>", observedAt)).toThrow();
});
