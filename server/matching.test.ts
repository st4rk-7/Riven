import { describe, expect, test } from "vitest";

import { linkOffer, matchOffer, modelTokens, packSize } from "./matching.js";

const mouse = { name: "M185 Wireless Mouse, Grey", brand: "Logitech" };

describe("matchOffer", () => {
  test("confirms the same ASIN", () => {
    expect(matchOffer({ ...mouse, asin: "B004YAVF8I" }, { productName: "anything", asin: "B004YAVF8I" })).toBe(
      "confirmed",
    );
  });

  test("rules out a different ASIN", () => {
    expect(matchOffer({ ...mouse, asin: "B004YAVF8I" }, { productName: mouse.name, asin: "B07W6JN8V8" })).toBe(
      "mismatch",
    );
  });

  test("rules out a different model number", () => {
    expect(matchOffer(mouse, { productName: "Logitech M190 Full-Size Wireless Mouse, Grey" })).toBe("mismatch");
  });

  test("rules out a different pack size", () => {
    expect(matchOffer(mouse, { productName: "Logitech M185 Wireless Mouse, Grey, 2-Pack" })).toBe("mismatch");
  });

  test("keeps a similar title as unverified, never confirmed", () => {
    expect(matchOffer(mouse, { productName: "Logitech M185 Wireless Mouse - Swift Grey" })).toBe("unverified");
  });

  test("rules out an unrelated title", () => {
    expect(matchOffer(mouse, { productName: "PU Leather Coin Purse with Zipper" })).toBe("mismatch");
  });

  // EC4206 Role B (WB-007): an identifier on one side only decides nothing; the title rules apply.
  test("falls through to the title rules when only the product has an ASIN", () => {
    expect(matchOffer({ ...mouse, asin: "B004YAVF8I" }, { productName: "Logitech M185 Wireless Mouse - Swift Grey" })).toBe(
      "unverified",
    );
  });

  // EC4206 Role B (WB-009): the model rule needs a model number on both sides.
  test("skips the model rule when the product name has no model number", () => {
    expect(matchOffer({ name: "Wireless Mouse, Grey", brand: "Logitech" }, { productName: "Logitech M185 Wireless Mouse Grey" })).toBe(
      "unverified",
    );
  });

  // EC4206 Role B (WB-010): found by coverage; a title with no usable words is not similar to anything.
  test("rules out an offer whose title has no words", () => {
    expect(matchOffer(mouse, { productName: " - " })).toBe("mismatch");
  });

  // EC4206 Role B (WB-008): a screen resolution is not a pack size (FR-04).
  test("keeps the same monitor unverified when one title states its resolution", () => {
    const monitor = { name: "S2421H 24 Inch Monitor 1920 x 1080", brand: "Dell" };
    expect(matchOffer(monitor, { productName: "Dell S2421H 24 Inch Full HD Monitor" })).toBe("unverified");
  });
});

test("finds model numbers", () => {
  expect([...modelTokens("Logitech M185 Wireless Mouse 2.4GHz 1000DPI")]).toEqual(["m185"]);
});

test.each([
  ["Logitech M185 Mouse", 1],
  ["Logitech M185 Mouse 2-Pack", 2],
  ["Batteries, pack of 4", 4],
  ["Twin Pack Mouse", 2],
  ["AA Batteries x 4", 4],
  ["Dell Monitor 1920 x 1080", 1],
  ["Cotton Towel 70 x 140 cm", 1],
])("pack size of %s is %i", (title, size) => {
  expect(packSize(title)).toBe(size);
});

describe("linkOffer", () => {
  const products = [
    { id: "p1", name: "M185 Mouse, Black", brand: "Logitech" },
    { id: "p2", name: "M185 Wireless Mouse, Grey", brand: "Logitech" },
    { id: "p3", name: "Coin Purse", asin: "B07W6JN8V8" },
  ];

  test("prefers a confirmed ASIN over any title", () => {
    expect(linkOffer(products, { productName: "Logitech M185 Wireless Mouse, Grey", asin: "B07W6JN8V8" })).toEqual({
      product: products[2],
      status: "confirmed",
    });
  });

  test("picks the most similar unverified product", () => {
    expect(linkOffer(products, { productName: "Logitech M185 Wireless Mouse - Grey" })).toEqual({
      product: products[1],
      status: "unverified",
    });
  });

  test("links nothing when every product is ruled out", () => {
    expect(linkOffer(products, { productName: "Logitech M190 Full-Size Wireless Mouse" })).toBeNull();
  });
});
