// Creates one retailer and its sign-in account. Accounts are created by the Riven team; there is no public sign-up.
// Usage: RIVEN_ACCOUNT_PASSWORD=... npm run account:create -- --retailer "Shop name" --email owner@example.com
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

export function accountInput(args: string[], password: string | undefined) {
  const { values } = parseArgs({ args, options: { retailer: { type: "string" }, email: { type: "string" }, name: { type: "string" } } });
  const retailer = values.retailer?.trim() ?? "";
  const email = values.email?.trim().toLowerCase() ?? "";
  if (retailer.length < 1 || retailer.length > 200) throw new Error("Give --retailer with 1 to 200 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Give a valid --email.");
  if (!password || password.length < 12) throw new Error("Set RIVEN_ACCOUNT_PASSWORD to at least 12 characters.");
  return { retailer, email, name: values.name?.trim() || retailer, password };
}

async function main() {
  const input = accountInput(process.argv.slice(2), process.env.RIVEN_ACCOUNT_PASSWORD);
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL.");
  const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await database.connect();
  try {
    await database.query("BEGIN");
    const existing = await database.query(`SELECT 1 FROM "user" WHERE email = $1`, [input.email]);
    if (existing.rowCount) throw new Error(`An account for ${input.email} already exists.`);
    const { rows } = await database.query("INSERT INTO retailers (name) VALUES ($1) RETURNING id", [input.retailer]);
    const userId = randomUUID();
    await database.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", "retailerId") VALUES ($1, $2, $3, true, $4)`,
      [userId, input.name, input.email, rows[0].id],
    );
    await database.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "updatedAt") VALUES ($1, $2, 'credential', $2, $3, now())`,
      [randomUUID(), userId, await hashPassword(input.password)],
    );
    await database.query("COMMIT");
    console.log(`Created ${input.email} for retailer "${input.retailer}".`);
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  } finally {
    await database.end();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(`Account not created: ${error instanceof Error ? error.message : "unknown error"}`);
    process.exitCode = 1;
  });
}
