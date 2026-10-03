import { expect, test } from "vitest";

import { buildApp } from "./app.js";

test("GET /api/v1/demo-observation returns the synthetic observation", async () => {
  const app = buildApp({ logger: false });

  try {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/demo-observation",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      mode: "synthetic",
      productName: "Sample wired mouse",
      price: "19.99",
      currency: "GBP",
      availability: "in_stock",
      source: "Synthetic fixture (not Amazon)",
      observedAt: "2026-09-30T00:00:00Z",
      matchStatus: "unverified",
    });
  } finally {
    await app.close();
  }
});
