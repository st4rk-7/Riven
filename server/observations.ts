import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

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

type ObservationRouteOptions = {
  now?: () => Date;
  // The signed-in retailer's products; empty until sign-in and the database land.
  products?: () => LinkableProduct[];
};

// shortcut: in-memory stores, replace with the agreed tables once the database lands.
export function registerObservationRoutes(
  app: FastifyInstance,
  { now = () => new Date(), products = () => [] }: ObservationRouteOptions = {},
) {
  const store: CollectedObservation[] = [];
  const attempts: CollectionAttempt[] = [];

  // Every try is recorded, so a failure never hides or erases an earlier observation.
  function recordAttempt(attempt: Omit<CollectionAttempt, "id" | "attemptedAt">) {
    attempts.unshift({ id: randomUUID(), attemptedAt: now().toISOString(), ...attempt });
  }

  app.post("/api/v1/observations", async (request, reply) => {
    const parsed = ExtensionOfferSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      const source = sourceOf((request.body as { pageUrl?: unknown } | null)?.pageUrl);
      if (source) recordAttempt({ productId: null, source, status: "failed", reason: message });
      return reply.code(400).send({ code: "INVALID_OFFER", message });
    }
    const observation = toObservation(parsed.data, now(), products());
    if (!observation) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    store.unshift(observation);
    recordAttempt({ productId: observation.productId, source: observation.source, status: "ok", reason: null });
    return reply.code(201).send(observation);
  });

  app.get("/api/v1/observations", async () => store);

  app.post("/api/v1/attempts", async (request, reply) => {
    const parsed = AttemptReportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ code: "INVALID_ATTEMPT", message: "pageUrl, status and reason are required." });
    }
    const source = sourceOf(parsed.data.pageUrl);
    if (!source) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    recordAttempt({ productId: null, source, status: parsed.data.status, reason: parsed.data.reason });
    return reply.code(201).send(attempts[0]);
  });

  app.get("/api/v1/attempts", async () => attempts);
}
