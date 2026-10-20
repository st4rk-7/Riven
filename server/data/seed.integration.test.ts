import pg from "pg";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";

import { buildApp } from "../app.js";
import { seedDatabase, seedRetailers } from "./seed.js";

// @ts-expect-error The migration runner is a JavaScript module.
import { migrate } from "../../scripts/migrate.mjs";

const testConnectionString = process.env.TEST_DATABASE_URL;
const seedPassword = process.env.RIVEN_SEED_PASSWORD;

const authentication = {
  secret: "Riven-seed-integration-secret-12345678901234567890",
  baseURL: "http://127.0.0.1:3000",
  webOrigin: "http://127.0.0.1:5173",
};

describe.skipIf(!testConnectionString || !seedPassword)(
  "RIV-18 seeded retailer isolation",
  () => {
    const database = new pg.Pool({
      connectionString: testConnectionString,
    });

    let app: ReturnType<typeof buildApp>;
    let verifiedTestDatabase = false;
    let loginNumber = 0;

    const retailerIds = seedRetailers.map(
      (retailer) => retailer.retailerId,
    );

    function requestHeaders(cookie?: string) {
      return {
        origin: authentication.webOrigin,
        ...(cookie ? { cookie } : {}),
      };
    }

    async function login(email: string) {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/sign-in",
        headers: requestHeaders(),
        remoteAddress: `127.0.5.${++loginNumber}`,
        payload: {
          email,
          password: seedPassword,
        },
      });

      expect(response.statusCode).toBe(200);

      const setCookie = response.headers["set-cookie"];
      const cookies = Array.isArray(setCookie)
        ? setCookie
        : [String(setCookie)];

      return cookies
        .map((cookie) => cookie.split(";")[0])
        .join("; ");
    }

    beforeAll(async () => {
      const { rows } = await database.query(
        "SELECT current_database() AS name",
      );

      if (!rows[0].name.endsWith("_test")) {
        throw new Error(
          "Seed integration tests require a database ending in _test.",
        );
      }

      verifiedTestDatabase = true;

      await migrate(testConnectionString);

      await database.query(
        "DELETE FROM retailers WHERE id = ANY($1::text[])",
        [retailerIds],
      );

      await seedDatabase(
        testConnectionString,
        seedPassword,
        "riven_test",
      );

      await seedDatabase(
        testConnectionString,
        seedPassword,
        "riven_test",
      );

      app = buildApp({
        logger: false,
        database,
        authentication,
      });

      await app.ready();
    }, 30_000);

    afterAll(async () => {
      try {
        await app?.close();

        if (verifiedTestDatabase) {
          await database.query(
            "DELETE FROM retailers WHERE id = ANY($1::text[])",
            [retailerIds],
          );
        }
      } finally {
        await database.end();
      }
    });

    test("seeding twice keeps one product and observation per retailer", async () => {
      const { rows } = await database.query(
        `
          SELECT
            r.id,
            COUNT(DISTINCT p.id)::int AS products,
            COUNT(DISTINCT o.id)::int AS observations
          FROM retailers AS r
          LEFT JOIN products AS p
            ON p.retailer_id = r.id
          LEFT JOIN observations AS o
            ON o.retailer_id = r.id
          WHERE r.id = ANY($1::text[])
          GROUP BY r.id
          ORDER BY r.id
        `,
        [retailerIds],
      );

      expect(rows).toEqual([
        {
          id: seedRetailers[0].retailerId,
          products: 1,
          observations: 1,
        },
        {
          id: seedRetailers[1].retailerId,
          products: 1,
          observations: 1,
        },
      ]);
    });

    test("each seeded retailer sees only its own data", async () => {
      const alphaCookie = await login(seedRetailers[0].email);
      const betaCookie = await login(seedRetailers[1].email);

      const alphaProducts = await app.inject({
        url:
          "/api/v1/products?retailerId=" +
          seedRetailers[1].retailerId,
        headers: {
          ...requestHeaders(alphaCookie),
          "x-retailer-id": seedRetailers[1].retailerId,
        },
      });

      const betaProducts = await app.inject({
        url:
          "/api/v1/products?retailerId=" +
          seedRetailers[0].retailerId,
        headers: {
          ...requestHeaders(betaCookie),
          "x-retailer-id": seedRetailers[0].retailerId,
        },
      });

      expect(
        alphaProducts.json().products.map(
          (product: { id: string }) => product.id,
        ),
      ).toEqual([seedRetailers[0].productId]);

      expect(
        betaProducts.json().products.map(
          (product: { id: string }) => product.id,
        ),
      ).toEqual([seedRetailers[1].productId]);

      const alphaObservations = await app.inject({
        url:
          "/api/v1/observations?retailerId=" +
          seedRetailers[1].retailerId,
        headers: requestHeaders(alphaCookie),
      });

      const betaObservations = await app.inject({
        url:
          "/api/v1/observations?retailerId=" +
          seedRetailers[0].retailerId,
        headers: requestHeaders(betaCookie),
      });

      expect(
        alphaObservations.json().map(
          (observation: { id: string }) => observation.id,
        ),
      ).toEqual([seedRetailers[0].observationId]);

      expect(
        betaObservations.json().map(
          (observation: { id: string }) => observation.id,
        ),
      ).toEqual([seedRetailers[1].observationId]);
    });
  },
);