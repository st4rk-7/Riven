import { readFileSync } from "node:fs";

import { afterEach, describe, expect, test, vi } from "vitest";

import { buildApp } from "./app.js";

const bookPage = readFileSync(
  new URL("./sources/fixtures/a-light-in-the-attic.html", import.meta.url),
  "utf8",
);

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

describe("GET /api/v1/practice-observation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns a practice observation from the fetched page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(bookPage, { status: 200 })));
    const app = buildApp({ logger: false });

    try {
      const response = await app.inject({ method: "GET", url: "/api/v1/practice-observation" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        mode: "practice",
        productName: "A Light in the Attic",
        price: "51.77",
        availability: "in_stock",
      });
    } finally {
      await app.close();
    }
  });

  test("returns 502 when the practice site fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    const app = buildApp({ logger: false });

    try {
      const response = await app.inject({ method: "GET", url: "/api/v1/practice-observation" });

      expect(response.statusCode).toBe(502);
      expect(response.json()).toEqual({ error: "Could not collect from the practice site." });
    } finally {
      await app.close();
    }
  });

  test("returns 502 instead of following a redirect", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(null, { status: 302, headers: { location: "https://example.com/" } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const app = buildApp({ logger: false });

    try {
      const response = await app.inject({ method: "GET", url: "/api/v1/practice-observation" });

      expect(response.statusCode).toBe(502);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
    } finally {
      await app.close();
    }
  });
});
