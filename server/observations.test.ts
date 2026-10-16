import { expect, test } from "vitest";

import { buildApp } from "./app.js";
import { toObservation } from "./observations.js";

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

test("links an offer to the retailer product with the same ASIN", () => {
  const products = [{ id: "p1", name: "Billion-Dollar Ransom", asin: "1529922607" }];
  const observation = toObservation({ ...offer, availability: "in_stock" }, new Date(), products);
  expect(observation).toMatchObject({ productId: "p1", matchStatus: "confirmed" });
});

test("leaves an offer unlinked when no product matches", () => {
  const products = [{ id: "p1", name: "Something else", asin: "B004YAVF8I" }];
  const observation = toObservation({ ...offer, availability: "in_stock" }, new Date(), products);
  expect(observation).toMatchObject({ productId: null, matchStatus: "unverified" });
});

test("records an attempt for every send, including invalid offers", async () => {
  const app = buildApp({ logger: false });
  try {
    await app.inject({ method: "POST", url: "/api/v1/observations", payload: offer });
    await app.inject({ method: "POST", url: "/api/v1/observations", payload: { ...offer, price: "0" } });
    await app.inject({
      method: "POST",
      url: "/api/v1/observations",
      payload: { ...offer, pageUrl: "https://example.com/dp/1529922607" },
    });

    const attempts = (await app.inject({ method: "GET", url: "/api/v1/attempts" })).json();
    expect(attempts).toHaveLength(2);
    expect(attempts[0]).toMatchObject({ source: "Amazon UK", status: "failed" });
    expect(attempts[0].reason).toContain("price");
    expect(attempts[1]).toMatchObject({ source: "Amazon UK", status: "ok", reason: null });
  } finally {
    await app.close();
  }
});

test("records a page the extension could not read without touching observations", async () => {
  const app = buildApp({ logger: false });
  try {
    await app.inject({ method: "POST", url: "/api/v1/observations", payload: offer });
    const reported = await app.inject({
      method: "POST",
      url: "/api/v1/attempts",
      payload: { pageUrl: offer.pageUrl, status: "failed", reason: "No product title on the page." },
    });
    expect(reported.statusCode).toBe(201);
    expect(reported.json()).toMatchObject({ status: "failed", source: "Amazon UK" });

    const observations = (await app.inject({ method: "GET", url: "/api/v1/observations" })).json();
    expect(observations).toHaveLength(1);

    const bad = await app.inject({ method: "POST", url: "/api/v1/attempts", payload: { pageUrl: offer.pageUrl } });
    expect(bad.json()).toMatchObject({ code: "INVALID_ATTEMPT" });
  } finally {
    await app.close();
  }
});
