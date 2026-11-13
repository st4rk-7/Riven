import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";
import type { Pool, PoolClient } from "pg";

import {
  AttemptReportSchema,
  CapturedPageSchema,
  type CollectionAttempt,
  type ExtensionOffer,
  ExtensionOfferSchema,
} from "../shared/collected-observation.js";
import { saveObservation, sourceOf } from "./save-observation.js";
import { extractOffer, type MatchedRules } from "./sources/extract.js";
import { siteForHost } from "./sources/sites.js";
import { crawlRetailerProducts } from "./crawler.js";
import { discoverProductCompetitors } from "./discovery.js";

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
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon pages are accepted." });
    }
    return reply.code(201).send(await saveExtensionOffer(retailerId, parsed.data, null));
  });

  // Saves an offer from the extension with its ok attempt, in one transaction.
  async function saveExtensionOffer(retailerId: string, { pageUrl, ...offer }: ExtensionOffer, rules: MatchedRules | null) {
    const connection = await database.connect();
    try {
      await connection.query("BEGIN");
      const observation = await saveObservation(connection, retailerId, offer, sourceOf(pageUrl)!, "extension", new Date(), rules);
      await recordAttempt(retailerId, { productId: observation.productId, source: observation.source, status: "ok", reason: null }, connection);
      await connection.query("COMMIT");
      return observation;
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    } finally {
      connection.release();
    }
  }

  // The extension sends the product part of a page; the server reads it with the site's rules and keeps only the offer.
  app.post("/api/v1/pages", { bodyLimit: 3 * 1024 * 1024 }, async (request, reply) => {
    const retailerId = request.identity!.retailer.id;
    const parsed = CapturedPageSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_PAGE", message: "pageUrl and html are required." });
    const { pageUrl, html } = parsed.data;
    const source = sourceOf(pageUrl);
    const site = siteForHost(new URL(pageUrl).hostname);
    if (!source || !site) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon pages are accepted." });
    }
    let offer: ExtensionOffer;
    let rules: MatchedRules;
    try {
      const extracted = extractOffer(html, site);
      rules = extracted.rules;
      const checked = ExtensionOfferSchema.safeParse({ pageUrl, ...extracted.offer });
      if (!checked.success) throw new Error(checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
      offer = checked.data;
    } catch (error) {
      const reason = (error as Error).message.slice(0, 300);
      await recordAttempt(retailerId, { productId: null, source, status: "failed", reason });
      return reply.code(422).send({ code: "UNREADABLE_PAGE", message: reason });
    }
    return reply.code(201).send(await saveExtensionOffer(retailerId, offer, rules));
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
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon pages are accepted." });
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

  app.post("/api/v1/crawl", async (request, reply) => {
    const retailerId = request.identity!.retailer.id;
    queueMicrotask(() => {
      crawlRetailerProducts(database, retailerId).catch((error) => {
        app.log.error(error, "Background crawl failed");
      });
    });
    return reply.code(202).send({ message: "Collection started." });
  });

  app.post("/api/v1/products/:id/discover", async (request, reply) => {
    const { id } = request.params as { id: string };
    const retailerId = request.identity!.retailer.id;
    const discovered = await discoverProductCompetitors(database, retailerId, id);
    return reply.code(200).send({ discovered });
  });

  app.patch("/api/v1/observations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const retailerId = request.identity!.retailer.id;
    const { matchStatus } = (request.body as { matchStatus?: unknown }) ?? {};
    if (matchStatus !== "confirmed" && matchStatus !== "mismatch") {
      return reply.code(400).send({ code: "INVALID_STATUS", message: "matchStatus must be 'confirmed' or 'mismatch'." });
    }
    const { rows } = await database.query(
      `UPDATE observations SET match_status = $1 WHERE id = $2 AND retailer_id = $3
       RETURNING id, product_id AS "productId", asin, product_name AS "productName", price, currency, availability, seller, source, observed_at AS "observedAt", match_status AS "matchStatus", collected_via AS "collectedVia"`,
      [matchStatus, id, retailerId],
    );
    if (rows.length === 0) {
      return reply.code(404).send({ code: "NOT_FOUND", message: "Observation not found." });
    }
    return rows[0];
  });
}
