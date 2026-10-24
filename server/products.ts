import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { linkOffer } from "./matching.js";
import { collectAmazonOffer, type CollectResult } from "./sources/amazon-collector.js";

// Either a link to the product's Amazon page, or the name typed in by hand.
const NewProductSchema = z.union([
  z.object({ url: z.string().trim().url().max(2000) }).strict(),
  z.object({
    name: z.string().trim().min(1).max(500),
    brand: z.string().trim().max(200).default(""),
    asin: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{10}$/).optional(),
  }).strict(),
]);

export type NewProduct = { name: string; brand: string; asin: string | null };

// Turns the request body into a product, reading the page when given a link.
// The collector only fetches allowed Amazon hosts, so a link can't reach internal addresses.
export async function resolveNewProduct(
  body: unknown,
  collect: (url: string) => Promise<CollectResult> = collectAmazonOffer,
): Promise<{ product: NewProduct } | { error: string }> {
  const parsed = NewProductSchema.safeParse(body);
  if (!parsed.success) return { error: "Enter an Amazon product link, or a product name." };
  if ("name" in parsed.data) return { product: { ...parsed.data, asin: parsed.data.asin ?? null } };

  const result = await collect(parsed.data.url);
  if (result.status !== "ok") {
    return { error: "Could not read that page. Use an Amazon product link, or enter the name instead." };
  }
  return { product: { name: result.offer.productName.slice(0, 500), brand: "", asin: result.offer.asin || null } };
}

export function registerProductRoutes(app: FastifyInstance, database: Pool) {
  app.get("/api/v1/products", async (request) => {
    const { rows } = await database.query("SELECT id, name, brand, asin FROM products WHERE retailer_id = $1 ORDER BY created_at, id", [request.identity!.retailer.id]);
    return { products: rows };
  });

  app.post("/api/v1/products", async (request, reply) => {
    const resolved = await resolveNewProduct(request.body);
    if ("error" in resolved) return reply.code(400).send({ code: "INVALID_PRODUCT", message: resolved.error });
    const { name, brand, asin } = resolved.product;
    const retailerId = request.identity!.retailer.id;

    const connection = await database.connect();
    try {
      await connection.query("BEGIN");
      const { rows: [product] } = await connection.query(
        `INSERT INTO products (retailer_id, name, brand, asin) VALUES ($1, $2, $3, $4) RETURNING id, name, brand, asin`,
        [retailerId, name, brand, asin]);
      // Offers sent before this product existed: link the ones that match it.
      const { rows: unlinked } = await connection.query<{ id: string; productName: string; asin: string }>(
        `SELECT id, product_name AS "productName", asin FROM observations WHERE retailer_id = $1 AND product_id IS NULL`, [retailerId]);
      for (const offer of unlinked) {
        const link = linkOffer([product], offer);
        if (link) await connection.query("UPDATE observations SET product_id = $1, match_status = $2 WHERE id = $3",
          [product.id, link.status, offer.id]);
      }
      await connection.query("COMMIT");
      return reply.code(201).send(product);
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  });
}
