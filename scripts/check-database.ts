import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getMigrations } from "better-auth/db/migration";
import pg from "pg";
import { authOptions } from "../server/auth-options.js";
// @ts-expect-error The migration runner is plain JavaScript, shared with the npm command.
import { migrate } from "./migrate.mjs";

const connectionString = process.env.TEST_DATABASE_URL;
if (!connectionString) throw new Error("Set TEST_DATABASE_URL to a separate database whose name ends in _test.");
const client = new pg.Client({ connectionString });
await client.connect();
let pool: pg.Pool | undefined;
try {
  const { rows } = await client.query("SELECT current_database() AS name");
  assert.match(rows[0].name, /_test$/, "Database checks require a separate database ending in _test.");
  await migrate(connectionString);
  await migrate(connectionString);

  pool = new pg.Pool({ connectionString });
  const plan = await getMigrations({ ...authOptions, database: pool });
  assert.deepEqual(plan.toBeCreated, [], "Better Auth needs missing tables.");
  assert.deepEqual(plan.toBeAdded, [], "Better Auth needs missing fields.");
  assert.deepEqual(plan.toBeAddedIndexes, [], "Better Auth needs missing indexes.");
  assert.deepEqual(plan.schemaProblems, [], "Better Auth found incompatible fields.");
  assert.deepEqual(plan.unsafeChanges, []);

  await client.query("BEGIN");
  const retailerA = randomUUID();
  const retailerB = randomUUID();
  const product = randomUUID();
  const user = randomUUID();
  await client.query("INSERT INTO retailers (id, name) VALUES ($1, 'Test retailer A'), ($2, 'Test retailer B')", [retailerA, retailerB]);
  await client.query("INSERT INTO products (id, retailer_id, name) VALUES ($1, $2, 'Test mouse')", [product, retailerA]);
  await client.query(`INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", "retailerId")
    VALUES ($1, 'Test user', $2, false, now(), now(), $3)`, [user, `${user}@example.test`, retailerA]);

  async function rejects(sql: string, values: unknown[], code: string) {
    await client.query("SAVEPOINT constraint_check");
    try {
      await assert.rejects(client.query(sql, values), (error: unknown) =>
        error instanceof Error && "code" in error && error.code === code);
    } finally {
      await client.query("ROLLBACK TO SAVEPOINT constraint_check");
      await client.query("RELEASE SAVEPOINT constraint_check");
    }
  }

  const observation = `INSERT INTO observations (retailer_id, product_id, asin, product_name, source, price, currency, availability, collected_via)
    VALUES ($1, $2, 'B000000001', 'Test mouse', 'Amazon UK', $3, $4, 'unknown', 'extension')`;
  await client.query(observation, [retailerA, product, "19.99", "GBP"]);
  await client.query(observation, [retailerB, null, null, null]);
  await rejects(observation, [retailerB, product, "19.99", "GBP"], "23503");
  await rejects(observation, [null, null, null, null], "23502");
  await rejects(observation, [retailerA, product, "19.99", null], "23514");
  await rejects(observation, [retailerA, product, "19.9", "GBP"], "23514");

  const attempt = "INSERT INTO attempts (retailer_id, product_id, source, status) VALUES ($1, $2, 'Amazon UK', 'failed')";
  await client.query(attempt, [retailerB, null]);
  await rejects(attempt, [retailerB, product], "23503");
  await rejects(attempt, [null, null], "23502");
  await rejects(`INSERT INTO "session" (id, "userId", token, "expiresAt", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, now() + interval '1 day', now(), now())`, [randomUUID(), randomUUID(), randomUUID()], "23503");

  const a = await client.query("SELECT product_id FROM observations WHERE retailer_id = $1", [retailerA]);
  assert.deepEqual(a.rows, [{ product_id: product }]);
  const b = await client.query("SELECT product_id FROM observations WHERE retailer_id = $1", [retailerB]);
  assert.deepEqual(b.rows, [{ product_id: null }]);
  await client.query("ROLLBACK");
  console.log("Passed: migration reruns, Better Auth schema, required ownership, cross-retailer links, unmatched records, money constraints and session foreign keys.");
  console.log("Run npm run test:integration separately for HTTP sign-in, sign-out and authorization checks.");
} finally {
  await client.query("ROLLBACK").catch(() => {});
  await client.end();
  await pool?.end();
}
