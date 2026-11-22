import { randomUUID } from "node:crypto";
import { test as base } from "@playwright/test";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

export type Retailer = {
  email: string;
  password: string;
  retailerId: string;
  productId: string;
  productName: string;
};

export const test = base.extend<{
  createRetailer: (label: "Alpha" | "Beta") => Promise<Retailer>;
}>({
  createRetailer: async ({}, use) => {
    const db = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
    await db.connect();
    const retailerIds: string[] = [];

    try {
      await use(async (label) => {
        const retailer = {
          email: randomUUID() + "@example.test",
          password: randomUUID(),
          retailerId: randomUUID(),
          productId: randomUUID(),
          productName: "Synthetic " + label + " product",
        };
        const userId = randomUUID();
        const passwordHash = await hashPassword(retailer.password);
        await db.query("BEGIN");
        try {
          await db.query("INSERT INTO retailers (id, name) VALUES ($1, $2)",
            [retailer.retailerId, "Synthetic " + label]);
          await db.query(`INSERT INTO "user" (id, name, email, "emailVerified", "retailerId")
            VALUES ($1, $2, $3, true, $4)`, [userId, label, retailer.email, retailer.retailerId]);
          await db.query(`INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "updatedAt")
            VALUES ($1, $2, 'credential', $2, $3, now())`, [randomUUID(), userId, passwordHash]);
          await db.query("INSERT INTO products (id, retailer_id, name) VALUES ($1, $2, $3)",
            [retailer.productId, retailer.retailerId, retailer.productName]);
          await db.query("COMMIT");
          retailerIds.push(retailer.retailerId);
          return retailer;
        } catch (error) {
          await db.query("ROLLBACK");
          throw error;
        }
      });
    } finally {
      try {
        await db.query("DELETE FROM retailers WHERE id = ANY($1::text[])", [retailerIds]);
      } finally {
        await db.end();
      }
    }
  },
});
