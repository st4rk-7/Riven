import { buildApp } from "./app.js";
import pg from "pg";

if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  throw new Error("Set DATABASE_URL and BETTER_AUTH_SECRET in .env before starting the server.");
}
const database = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({ database, authentication: {
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3000",
  webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
  extensionOrigin: process.env.RIVEN_EXTENSION_ORIGIN || undefined,
} });
app.addHook("onClose", async () => { await database.end(); });

try {
  await app.listen({
    host: "127.0.0.1",
    port: 3000,
  });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
  await app.close();
}
