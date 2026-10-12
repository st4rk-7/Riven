import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import {
  type CollectedObservation,
  type ExtensionOffer,
  ExtensionOfferSchema,
} from "../shared/collected-observation.js";

const SOURCES: Record<string, string> = {
  "www.amazon.co.uk": "Amazon UK",
  "amazon.co.uk": "Amazon UK",
};

export function toObservation(offer: ExtensionOffer, now: Date): CollectedObservation | null {
  const source = SOURCES[new URL(offer.pageUrl).hostname];
  if (!source) return null;
  return {
    id: randomUUID(),
    asin: offer.asin,
    productName: offer.productName,
    price: offer.price,
    currency: offer.currency,
    availability: offer.availability,
    seller: offer.seller,
    source,
    observedAt: now.toISOString(),
    // Not linked to a retailer's product yet, so the match is not confirmed.
    matchStatus: "unverified",
    collectedVia: "extension",
  };
}

// In-memory store until the database tables are agreed; same routes afterwards.
export function registerObservationRoutes(app: FastifyInstance, now: () => Date = () => new Date()) {
  const store: CollectedObservation[] = [];

  app.post("/api/v1/observations", async (request, reply) => {
    const parsed = ExtensionOfferSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        code: "INVALID_OFFER",
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
    const observation = toObservation(parsed.data, now());
    if (!observation) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    store.unshift(observation);
    return reply.code(201).send(observation);
  });

  app.get("/api/v1/observations", async () => store);
}
