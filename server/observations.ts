import { randomUUID } from "node:crypto";

import type { FastifyInstance } from "fastify";

import {
  type CollectedObservation,
  type ExtensionOffer,
  ExtensionOfferSchema,
} from "../shared/collected-observation.js";
import { linkOffer, type RetailerProduct } from "./matching.js";

export type LinkableProduct = RetailerProduct & { id: string };

const SOURCES: Record<string, string> = {
  "www.amazon.co.uk": "Amazon UK",
  "amazon.co.uk": "Amazon UK",
};

export function toObservation(
  offer: ExtensionOffer,
  now: Date,
  products: LinkableProduct[] = [],
): CollectedObservation | null {
  const source = SOURCES[new URL(offer.pageUrl).hostname];
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

// shortcut: in-memory store, replace with the agreed tables once the database lands.
export function registerObservationRoutes(
  app: FastifyInstance,
  { now = () => new Date(), products = () => [] }: ObservationRouteOptions = {},
) {
  const store: CollectedObservation[] = [];

  app.post("/api/v1/observations", async (request, reply) => {
    const parsed = ExtensionOfferSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        code: "INVALID_OFFER",
        message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      });
    }
    const observation = toObservation(parsed.data, now(), products());
    if (!observation) {
      return reply.code(400).send({ code: "UNSUPPORTED_SOURCE", message: "Only Amazon UK pages are accepted." });
    }
    store.unshift(observation);
    return reply.code(201).send(observation);
  });

  app.get("/api/v1/observations", async () => store);
}
