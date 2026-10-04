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
    mode: "synthetic",
    productName,
    price,
    currency: "GBP",
    availability,
    source: "books.toscrape.com (practice site)",
    observedAt: observedAt.toISOString(),
    matchStatus: "unverified",
  };
}
