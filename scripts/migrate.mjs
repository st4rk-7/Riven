import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import pg from "pg";

const directory = new URL("../server/data/migrations/", import.meta.url);

export async function migrate(connectionString) {
  if (!connectionString) throw new Error("Set DATABASE_URL in your local .env file.");
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("BEGIN");
    // Concurrent runs share one transaction lock; a failed run leaves no partial schema.
    await client.query("SELECT pg_advisory_xact_lock(148593, 15)");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const files = (await readdir(directory)).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
    for (const name of files) {
      const sql = (await readFile(new URL(name, directory), "utf8")).replace(/\r\n/g, "\n");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const { rows } = await client.query("SELECT checksum FROM schema_migrations WHERE name = $1", [name]);
      if (rows.length) {
        if (rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${name}`);
        continue;
      }
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
      console.log(`Applied ${name}`);
    }
    await client.query("COMMIT");
    console.log("Database migrations are up to date.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrate(process.env.DATABASE_URL).catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}
