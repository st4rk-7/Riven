import { expect, test } from "vitest";
import { buildApp } from "./app.js";
import { toObservation } from "./observations.js";

const offer = { pageUrl: "https://www.amazon.co.uk/dp/1529922607", asin: "1529922607",
  productName: "Billion-Dollar Ransom", price: "18.01", currency: "GBP",
  availability: "in_stock" as const, seller: "Amazon" };

test("links an offer to the retailer product with the same ASIN", () => {
  expect(toObservation(offer, new Date(), [{ id: "p1", name: offer.productName, asin: offer.asin }]))
    .toMatchObject({ productId: "p1", matchStatus: "confirmed" });
});
test("leaves an offer unlinked when no product matches", () => {
  expect(toObservation(offer, new Date(), [{ id: "p1", name: "Something else", asin: "B004YAVF8I" }]))
    .toMatchObject({ productId: null, matchStatus: "unverified" });
});
test("does not expose real-data routes without database/auth configuration", async () => {
  const app = buildApp({ logger: false });
  try {
    for (const resource of ["products", "observations", "attempts"]) {
      expect((await app.inject(`/api/v1/${resource}`)).statusCode).toBe(404);
    }
  } finally { await app.close(); }
});
// Database-backed route cases formerly in this file now run in auth.integration.test.ts.
