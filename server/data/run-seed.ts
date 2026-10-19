// @ts-expect-error The migration runner is a JavaScript module.
import { migrate } from "../../scripts/migrate.mjs";
import { seedDatabase } from "./seed.js";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  await migrate(connectionString);

  const result = await seedDatabase(
    connectionString,
    process.env.RIVEN_SEED_PASSWORD,
  );

  console.log(
    `Seed completed: ${result.retailers} retailers, ` +
      `${result.users} users, ` +
      `${result.products} products and ` +
      `${result.observations} observations.`,
  );

  console.log(
    "Synthetic accounts: alpha@example.test and beta@example.test.",
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown seed error";

  console.error(`Seed failed: ${message}`);
  process.exitCode = 1;
});