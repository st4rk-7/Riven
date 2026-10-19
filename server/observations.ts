import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";
import type { Pool, PoolClient } from "pg";

import {
  AttemptReportSchema,
  type CollectedObservation,
  type CollectionAttempt,
  type ExtensionOffer,
  ExtensionOfferSchema,
} from "../shared/collected-observation.js";
import { linkOffer, type RetailerProduct } from "./matching.js";

export type LinkableProduct = RetailerProduct & { id: string };

const SOURCES: Record<string, string> = {
  "www.amazon.co.uk": "Amazon UK",
  "amazon.co.uk": "Amazon UK",
};

function sourceOf(pageUrl: unknown): string | null {
  if (typeof pageUrl !== "string" || !URL.canParse(pageUrl)) return null;
  return SOURCES[new URL(pageUrl).hostname] ?? null;
}

export function toObservation(
  offer: ExtensionOffer,
  now: Date,
  products: LinkableProduct[] = [],
): CollectedObservation | null {
  const source = sourceOf(offer.pageUrl);
  if (!source) return null;
  const link = linkOffer(products, offer);
  return {
    id: randomUUID(),
    productId: link?.product.id ?? null,
    asin: offer.asin,
    productName: offer.productName,
    price: offer.price,
    currency: offer.currency,
    availability: offer.availability,
    seller: offer.seller,
    source,
    observedAt: now.toISOString(),
    // An offer linked to no product stays unverified until the retailer decides.
    matchStatus: link?.status ?? "unverified",
    collectedVia: "extension",
  };
}

export function registerObservationRoutes(app: FastifyInstance, database: Pool) {
  async function recordAttempt(
    retailerId: string,
    attempt: Omit<CollectionAttempt, "id" | "attemptedAt">,
    connection: Pool | PoolClient = database,
  ): Promise<CollectionAttempt> {
    const result = { id: randomUUID(), attemptedAt: new Date().toISOString(), ...attempt };
    await connection.query(`INSERT INTO attempts (id, retailer_id, product_id, source, status, reason, attempted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [result.id, retailerId, result.productId, result.source, result.status, result.reason, result.attemptedAt]);
    return result;
  }

  app.post("/api/v1/observations", async (request, reply) => {
    const retailerId = request.identity!.retailer.id;
    const parsed = ExtensionOfferSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ").slice(0, 300);
      const source = sourceOf((request.body as { pageUrl?: unknown } | null)?.pageUrl);
      if (source) await recordAttempt(retailerId, { productId: null, source, status: "failed", reason: message });
      return reply.code(400).send({ code: "INVALID_OFFER", message });
    }
    if (!sourceOf(parsed.data.pageUrl)) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    const connection = await database.connect();
    try {
      await connection.query("BEGIN");
      const { rows: products } = await connection.query<LinkableProduct>(
        "SELECT id, name, brand, asin FROM products WHERE retailer_id = $1 ORDER BY id", [retailerId]);
      const observation = toObservation(parsed.data, new Date(), products)!;
      await connection.query(`INSERT INTO observations
        (id, retailer_id, product_id, asin, product_name, price, currency, availability, seller, source, observed_at, match_status, collected_via)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [observation.id, retailerId, observation.productId, observation.asin, observation.productName,
        observation.price, observation.currency, observation.availability, observation.seller,
        observation.source, observation.observedAt, observation.matchStatus, observation.collectedVia]);
      await recordAttempt(retailerId, { productId: observation.productId, source: observation.source, status: "ok", reason: null }, connection);
      await connection.query("COMMIT");
      return reply.code(201).send(observation);
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  });

  app.get("/api/v1/observations", async (request) => {
    const { rows } = await database.query(`SELECT id, product_id AS "productId", asin,
      product_name AS "productName", price, currency, availability, seller, source,
      observed_at AS "observedAt", match_status AS "matchStatus", collected_via AS "collectedVia"
      FROM observations WHERE retailer_id = $1 ORDER BY observed_at DESC, id`, [request.identity!.retailer.id]);
    return rows;
  });

  app.post("/api/v1/attempts", async (request, reply) => {
    const parsed = AttemptReportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ code: "INVALID_ATTEMPT", message: "pageUrl, status and reason are required." });
    }
    const source = sourceOf(parsed.data.pageUrl);
    if (!source) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    const attempt = await recordAttempt(request.identity!.retailer.id,
      { productId: null, source, status: parsed.data.status, reason: parsed.data.reason });
    return reply.code(201).send(attempt);
  });

  app.get("/api/v1/attempts", async (request) => {
    const { rows } = await database.query(`SELECT id, product_id AS "productId", source, status, reason,
      attempted_at AS "attemptedAt" FROM attempts WHERE retailer_id = $1 ORDER BY attempted_at DESC, id`,
    [request.identity!.retailer.id]);
    return rows;
  });
}
