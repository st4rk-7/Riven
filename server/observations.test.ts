import { expect, test } from "vitest";

import { buildApp } from "./app.js";

const offer = {
  pageUrl: "https://www.amazon.co.uk/dp/1529922607",
  asin: "1529922607",
  productName: "Billion-Dollar Ransom",
  price: "18.01",
  currency: "GBP",
  availability: "in_stock",
  seller: "Amazon",
};

test("stores an offer sent by the extension and lists it", async () => {
  const app = buildApp({ logger: false });
  try {
    const created = await app.inject({ method: "POST", url: "/api/v1/observations", payload: offer });

    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({
      asin: "1529922607",
      price: "18.01",
      currency: "GBP",
      source: "Amazon UK",
      matchStatus: "unverified",
      collectedVia: "extension",
    });

    const list = await app.inject({ method: "GET", url: "/api/v1/observations" });
    expect(list.json()).toHaveLength(1);
  } finally {
    await app.close();
  }
});

test("accepts a missing price but never a price without currency", async () => {
  const app = buildApp({ logger: false });
  try {
    const noPrice = await app.inject({
      method: "POST",
      url: "/api/v1/observations",
      payload: { ...offer, price: null, currency: null, availability: "unknown" },
    });
    expect(noPrice.statusCode).toBe(201);

    const noCurrency = await app.inject({
      method: "POST",
      url: "/api/v1/observations",
      payload: { ...offer, currency: null },
    });
    expect(noCurrency.statusCode).toBe(400);
    expect(noCurrency.json().code).toBe("INVALID_OFFER");
  } finally {
    await app.close();
  }
});

test("rejects invalid values and unsupported sites", async () => {
  const app = buildApp({ logger: false });
  try {
    const badPrice = await app.inject({ method: "POST", url: "/api/v1/observations", payload: { ...offer, price: "0" } });
    expect(badPrice.statusCode).toBe(400);

    const otherSite = await app.inject({
      method: "POST",
      url: "/api/v1/observations",
      payload: { ...offer, pageUrl: "https://example.com/dp/1529922607" },
    });
    expect(otherSite.json()).toMatchObject({ code: "UNSUPPORTED_SOURCE" });
  } finally {
    await app.close();
  }
});
