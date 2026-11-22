import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { migrate } from "./migrate.mjs";

async function run() {
  let database;
  try {
    database = new URL(process.env.TEST_DATABASE_URL ?? "");
  } catch {
    throw new Error("Set TEST_DATABASE_URL to a dedicated local PostgreSQL test database.");
  }
  if (!["postgres:", "postgresql:"].includes(database.protocol)
    || !["127.0.0.1", "localhost"].includes(database.hostname)
    || !/^\/[a-z0-9_]+_test$/i.test(database.pathname)
    || database.search || database.hash) {
    throw new Error("Browser tests require a loopback PostgreSQL URL for a database ending in _test.");
  }

  try {
    await migrate(database.href);
  } catch {
    throw new Error("Could not migrate the test database. Check TEST_DATABASE_URL and PostgreSQL availability.");
  }

  const result = spawnSync(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: { ...process.env, RIVEN_E2E_AUTH_SECRET: randomBytes(32).toString("hex") },
    },
  );
  if (result.error) throw new Error("Could not start Playwright.");
  process.exitCode = result.status ?? 1;
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
