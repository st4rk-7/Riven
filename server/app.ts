import Fastify, { type FastifyInstance, type FastifyError } from "fastify";
import cors from "@fastify/cors";
import type { Pool } from "pg";

import type { DemoObservation } from "../shared/demo-observation.js";
import { registerObservationRoutes } from "./observations.js";
import { collectBookObservation } from "./sources/books-toscrape.js";
import { createAuth, registerAuthRoutes, type AuthConfiguration } from "./auth.js";

type BuildAppOptions = {
  logger?: boolean;
  database?: Pool;
  authentication?: AuthConfiguration;
};

const demoObservation = {
  mode: "synthetic",
  productName: "Sample wired mouse",
  price: "19.99",
  currency: "GBP",
  availability: "in_stock",
  source: "Synthetic fixture (not Amazon)",
  observedAt: "2026-09-30T00:00:00Z",
  matchStatus: "unverified",
} satisfies DemoObservation;

export function buildApp(
  { logger = true, database, authentication }: BuildAppOptions = {},
): FastifyInstance {
  const app = Fastify({ logger });
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500;
    request.log.error({ status }, "Request failed");
    return reply.code(status).send({ code: status === 500 ? "INTERNAL_ERROR" : "INVALID_REQUEST",
      message: status === 500 ? "The request could not be completed." : "Invalid request." });
  });

  app.get("/api/v1/demo-observation", async () => {
    return demoObservation;
  });

  app.get("/api/v1/practice-observation", async (_request, reply) => {
    try {
      return await collectBookObservation(
        "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
      );
    } catch (error) {
      app.log.error(error);
      return reply.code(502).send({ error: "Could not collect from the practice site." });
    }
  });

  if (database && authentication) {
    const services = createAuth(database, authentication);
    app.register(cors, { origin: services.origins, credentials: true,
      methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "X-Riven-Client"] });
    app.addHook("onRequest", async (request, reply) => {
      if (!request.url.startsWith("/api/v1/")) return;
      const origin = request.headers.origin;
      if ((origin && !services.origins.includes(origin)) ||
          (request.method === "POST" && !origin && request.headers["x-riven-client"] !== "riven")) {
        return reply.code(403).send({ code: "FORBIDDEN_ORIGIN", message: "Request origin is not allowed." });
      }
      reply.header("cache-control", "no-store");
    });
    registerAuthRoutes(app, services, database);
    app.register(async (secured) => {
      secured.decorateRequest("identity", null);
      secured.addHook("preHandler", async (request, reply) => {
        request.identity = await services.identityOf(request);
        if (!request.identity) return reply.code(401).send({ code: "UNAUTHENTICATED", message: "Please sign in." });
      });
      secured.get("/api/v1/products", async (request) => {
        const { rows } = await database.query("SELECT id, name, brand, asin FROM products WHERE retailer_id = $1 ORDER BY created_at, id", [request.identity!.retailer.id]);
        return { products: rows };
      });
      registerObservationRoutes(secured, database);
    });
  } else if (database || authentication) {
    throw new Error("Configure both the database and authentication.");
  }

  return app;
}
