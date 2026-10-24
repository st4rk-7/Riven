import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { buildApp } from "./app.js";
import { startScheduledCrawler } from "./crawler.js";
import pg from "pg";

if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  throw new Error("Set DATABASE_URL and BETTER_AUTH_SECRET in .env before starting the server.");
}
const database = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({ database, trustProxy: process.env.TRUST_PROXY === "true", authentication: {
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000",
  webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
  extensionOrigin: process.env.RIVEN_EXTENSION_ORIGIN || undefined,
} });
app.addHook("onClose", async () => { await database.end(); });

const crawlerInterval = Number(process.env.CRAWLER_INTERVAL_MS ?? 0);
if (crawlerInterval > 0) {
  const stopCrawler = startScheduledCrawler(database, crawlerInterval);
  app.addHook("onClose", async () => { stopCrawler(); });
}

// Production: serve the built website from the same address as the API.
const webDist = fileURLToPath(new URL("../web/dist", import.meta.url));
if (existsSync(webDist)) {
  await app.register(fastifyStatic, { root: webDist });
  app.setNotFoundHandler((request, reply) =>
    request.url.startsWith("/api/")
      ? reply.code(404).send({ code: "NOT_FOUND", message: "Not found." })
      : reply.sendFile("index.html"));
}

try {
  await app.listen({
    host: process.env.HOST ?? "127.0.0.1",
    port: Number(process.env.PORT ?? 3000),
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
  await app.close();
}
