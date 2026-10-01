const fastify = require("fastify")({
  logger: true,
});

fastify.get("/api/v1/demo-observation", async () => {
  return {
    mode: "synthetic",
    productName: "Sample wired mouse",
    price: "19.99",
    currency: "GBP",
    availability: "in_stock",
    source: "Synthetic fixture (not Amazon)",
    observedAt: "2026-09-30T00:00:00Z",
    matchStatus: "unverified",
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

module.exports = fastify;

if (require.main === module) {
  start();
}