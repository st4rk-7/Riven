import type { FastifyInstance } from "fastify";
import type { Pool, PoolClient } from "pg";
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

// Runs statements in one transaction so a removal never leaves half its rows behind.
async function inTransaction<T>(database: Pool, work: (connection: PoolClient) => Promise<T>): Promise<T> {
  const connection = await database.connect();
  try {
    await connection.query("BEGIN");
    const result = await work(connection);
    await connection.query("COMMIT");
    return result;
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }
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

    const product = await inTransaction(database, async (connection) => {
      const { rows: [created] } = await connection.query(
        `INSERT INTO products (retailer_id, name, brand, asin) VALUES ($1, $2, $3, $4) RETURNING id, name, brand, asin`,
        [retailerId, name, brand, asin]);
      // Offers sent before this product existed: link the ones that match it.
      const { rows: unlinked } = await connection.query<{ id: string; productName: string; asin: string }>(
        `SELECT id, product_name AS "productName", asin FROM observations WHERE retailer_id = $1 AND product_id IS NULL`, [retailerId]);
      for (const offer of unlinked) {
        const link = linkOffer([created], offer);
        if (link) await connection.query("UPDATE observations SET product_id = $1, match_status = $2 WHERE id = $3",
          [created.id, link.status, offer.id]);
      }
      return created;
    });
    return reply.code(201).send(product);
  });

  // Removes a product with its offer history and collection attempts.
  app.delete("/api/v1/products/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const retailerId = request.identity!.retailer.id;
    const removed = await inTransaction(database, async (connection) => {
      await connection.query("DELETE FROM observations WHERE retailer_id = $1 AND product_id = $2", [retailerId, id]);
      await connection.query("DELETE FROM attempts WHERE retailer_id = $1 AND product_id = $2", [retailerId, id]);
      return (await connection.query("DELETE FROM products WHERE retailer_id = $1 AND id = $2", [retailerId, id])).rowCount;
    });
    if (!removed) return reply.code(404).send({ code: "NOT_FOUND", message: "Product not found." });
    return reply.code(204).send();
  });

  // Removes one competitor listing (every observation of its page) from a product.
  app.delete("/api/v1/observations/:id/listing", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { rowCount } = await database.query(
      `DELETE FROM observations o USING observations picked
        WHERE picked.id = $1 AND picked.retailer_id = $2
          AND o.retailer_id = picked.retailer_id AND o.source = picked.source AND o.asin = picked.asin
          AND o.product_id IS NOT DISTINCT FROM picked.product_id`,
      [id, request.identity!.retailer.id]);
    if (!rowCount) return reply.code(404).send({ code: "NOT_FOUND", message: "Offer not found." });
    return reply.code(204).send();
  });
}
