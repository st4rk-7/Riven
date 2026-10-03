import Fastify, { type FastifyInstance } from "fastify";

import type { DemoObservation } from "../shared/demo-observation.js";

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

  return app;
}