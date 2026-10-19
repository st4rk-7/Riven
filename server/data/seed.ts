import { hashPassword } from "better-auth/crypto";
import pg from "pg";

export type SeedRetailer = {
  retailerId: string;
  retailerName: string;
  userId: string;
  userName: string;
  email: string;
  accountRowId: string;
  productId: string;
  productName: string;
  brand: string;
  asin: string;
  observationId: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
};

export const seedRetailers = [
  {
    retailerId: "00000000-0000-4000-8000-000000000101",
    retailerName: "Riven Demo Retailer Alpha",
    userId: "00000000-0000-4000-8000-000000000102",
    userName: "Alpha demo owner",
    email: "alpha@example.test",
    accountRowId: "00000000-0000-4000-8000-000000000103",
    productId: "00000000-0000-4000-8000-000000000104",
    productName: "Synthetic Wired Mouse",
    brand: "Riven synthetic fixture",
    asin: "RIVENSEED1",
    observationId: "00000000-0000-4000-8000-000000000105",
    price: "19.99",
    currency: "GBP",
    availability: "in_stock",
  },
  {
    retailerId: "00000000-0000-4000-8000-000000000201",
    retailerName: "Riven Demo Retailer Beta",
    userId: "00000000-0000-4000-8000-000000000202",
    userName: "Beta demo owner",
    email: "beta@example.test",
    accountRowId: "00000000-0000-4000-8000-000000000203",
    productId: "00000000-0000-4000-8000-000000000204",
    productName: "Synthetic USB Keyboard",
    brand: "Riven synthetic fixture",
    asin: "RIVENSEED2",
    observationId: "00000000-0000-4000-8000-000000000205",
    price: null,
    currency: null,
    availability: "unknown",
  },
] as const satisfies readonly SeedRetailer[];

export function assertSeedConfiguration(
  connectionString: string | undefined,
  seedPassword: string | undefined,
  databaseName = "riven_dev",
) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  if (!seedPassword || seedPassword.length < 20) {
    throw new Error(
      "RIVEN_SEED_PASSWORD must contain at least 20 characters.",
    );
  }

  let databaseUrl: URL;

  try {
    databaseUrl = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  }

  const allowedHost =
    databaseUrl.hostname === "127.0.0.1" ||
    databaseUrl.hostname === "localhost";

  const allowedProtocol =
    databaseUrl.protocol === "postgresql:" ||
    databaseUrl.protocol === "postgres:";

  if (
    !allowedProtocol ||
    !allowedHost ||
    databaseUrl.port !== "5432" ||
    databaseUrl.pathname !== `/${databaseName}`
  ) {
    throw new Error(
      `The seed script only permits the local ${databaseName} database on port 5432.`,
    );
  }

  return {
    connectionString,
    seedPassword,
  };
}

export async function seedDatabase(
  connectionString: string | undefined,
  seedPassword: string | undefined,
  databaseName = "riven_dev",
) {
  const configuration = assertSeedConfiguration(
    connectionString,
    seedPassword,
    databaseName,
  );

  const passwordHash = await hashPassword(configuration.seedPassword);
  const database = new pg.Client({
    connectionString: configuration.connectionString,
  });

  await database.connect();

  try {
    await database.query("BEGIN");

    for (const retailer of seedRetailers) {
      await database.query(
        `
          INSERT INTO retailers (id, name)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name
        `,
        [retailer.retailerId, retailer.retailerName],
      );

      await database.query(
        `
          INSERT INTO "user" (
            id,
            name,
            email,
            "emailVerified",
            "retailerId"
          )
          VALUES ($1, $2, $3, true, $4)
          ON CONFLICT (id) DO UPDATE
          SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            "emailVerified" = EXCLUDED."emailVerified",
            "retailerId" = EXCLUDED."retailerId",
            "updatedAt" = now()
        `,
        [
          retailer.userId,
          retailer.userName,
          retailer.email,
          retailer.retailerId,
        ],
      );

      await database.query(
        `
          INSERT INTO "account" (
            id,
            "accountId",
            "providerId",
            "userId",
            password,
            "updatedAt"
          )
          VALUES ($1, $2, 'credential', $2, $3, now())
          ON CONFLICT (id) DO UPDATE
          SET
            "accountId" = EXCLUDED."accountId",
            "providerId" = EXCLUDED."providerId",
            "userId" = EXCLUDED."userId",
            password = EXCLUDED.password,
            "updatedAt" = now()
        `,
        [
          retailer.accountRowId,
          retailer.userId,
          passwordHash,
        ],
      );

      await database.query(
        `
          INSERT INTO products (
            id,
            retailer_id,
            name,
            brand,
            asin
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE
          SET
            retailer_id = EXCLUDED.retailer_id,
            name = EXCLUDED.name,
            brand = EXCLUDED.brand,
            asin = EXCLUDED.asin
        `,
        [
          retailer.productId,
          retailer.retailerId,
          retailer.productName,
          retailer.brand,
          retailer.asin,
        ],
      );

      await database.query(
        `
          INSERT INTO observations (
            id,
            retailer_id,
            product_id,
            asin,
            product_name,
            source,
            seller,
            price,
            currency,
            availability,
            match_status,
            observed_at,
            collected_via
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            'Synthetic seed fixture (not live collection)',
            NULL,
            $6,
            $7,
            $8,
            'unverified',
            now(),
            'crawler'
          )
          ON CONFLICT (id) DO UPDATE
          SET
            retailer_id = EXCLUDED.retailer_id,
            product_id = EXCLUDED.product_id,
            asin = EXCLUDED.asin,
            product_name = EXCLUDED.product_name,
            source = EXCLUDED.source,
            seller = EXCLUDED.seller,
            price = EXCLUDED.price,
            currency = EXCLUDED.currency,
            availability = EXCLUDED.availability,
            match_status = EXCLUDED.match_status,
            observed_at = EXCLUDED.observed_at,
            collected_via = EXCLUDED.collected_via
        `,
        [
          retailer.observationId,
          retailer.retailerId,
          retailer.productId,
          retailer.asin,
          retailer.productName,
          retailer.price,
          retailer.currency,
          retailer.availability,
        ],
      );
    }

    await database.query("COMMIT");

    return {
      retailers: seedRetailers.length,
      users: seedRetailers.length,
      products: seedRetailers.length,
      observations: seedRetailers.length,
    };
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  } finally {
    await database.end();
  }
}