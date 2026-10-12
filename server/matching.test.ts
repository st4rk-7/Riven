import { describe, expect, test } from "vitest";

import { matchOffer, modelTokens, packSize } from "./matching.js";

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
});

test("finds model numbers", () => {
  expect([...modelTokens("Logitech M185 Wireless Mouse 2.4GHz 1000DPI")]).toEqual(["m185"]);
});

test.each([
  ["Logitech M185 Mouse", 1],
  ["Logitech M185 Mouse 2-Pack", 2],
  ["Batteries, pack of 4", 4],
  ["Twin Pack Mouse", 2],
])("pack size of %s is %i", (title, size) => {
  expect(packSize(title)).toBe(size);
});
