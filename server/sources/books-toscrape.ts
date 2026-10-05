import * as cheerio from "cheerio";

import type { DemoObservation } from "../../shared/demo-observation.js";

export function parseBookPage(html: string, observedAt: Date): DemoObservation {
  const $ = cheerio.load(html);
  const main = $(".product_main").first();

  const productName = main.find("h1").first().text().trim();
  if (!productName) {
    throw new Error("Not a book page: no product title found.");
  }

  const priceText = main.find(".price_color").first().text().trim();
  const priceMatch = /^£(\d+\.\d{2})$/.exec(priceText);
  const price = priceMatch ? priceMatch[1] : null;

  const stockText = main.find(".availability").first().text().trim().toLowerCase();
  const availability = stockText.startsWith("in stock")
    ? "in_stock"
    : stockText.startsWith("out of stock")
      ? "out_of_stock"
      : "unknown";

  return {
    mode: "practice",
    productName,
    price,
    currency: "GBP",
    availability,
    source: "books.toscrape.com (practice site)",
    observedAt: observedAt.toISOString(),
    matchStatus: "unverified",
  };
}

const ALLOWED_HOST = "books.toscrape.com";

export async function collectBookObservation(url: string): Promise<DemoObservation> {
  const target = new URL(url);
  if (target.hostname !== ALLOWED_HOST) {
    throw new Error(`Collection is only permitted from ${ALLOWED_HOST}.`);
  }

  const response = await fetch(target, {
    headers: { "User-Agent": "Riven student project (EC5406)" },
    signal: AbortSignal.timeout(10_000),
    redirect: "manual",
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error("Redirects are not followed, so collection stays on the allowed host.");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return parseBookPage(await response.text(), new Date());
}
