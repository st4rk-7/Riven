import Fastify, { type FastifyInstance } from "fastify";

import type { DemoObservation } from "../shared/demo-observation.js";
import { collectBookObservation } from "./sources/books-toscrape.js";

type BuildAppOptions = {
  logger?: boolean;
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
  { logger = true }: BuildAppOptions = {},
): FastifyInstance {
  const app = Fastify({ logger });

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

  return app;
}
