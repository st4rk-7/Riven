import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { buildApp } from "./app.js";
// @ts-expect-error The standalone migration runner is JavaScript.
import { migrate } from "../scripts/migrate.mjs";

const config = { secret: "Riven-integration-only-secret-12345678901234567890",
  baseURL: "http://127.0.0.1:3000", webOrigin: "http://127.0.0.1:5173",
  extensionOrigin: `chrome-extension://${"a".repeat(32)}` };
const offer = { pageUrl: "https://www.amazon.co.uk/dp/1529922607", asin: "1529922607",
  productName: "Billion-Dollar Ransom", price: "18.01", currency: "GBP", availability: "in_stock", seller: "Amazon" };
const a = { retailer: randomUUID(), user: randomUUID(), product: randomUUID(), email: `${randomUUID()}@example.test` };
const b = { retailer: randomUUID(), user: randomUUID(), product: randomUUID(), email: `${randomUUID()}@example.test` };
const password = `Integration-only-${randomUUID()}`;

describe.skipIf(!process.env.TEST_DATABASE_URL)("real PostgreSQL authentication and retailer isolation", () => {
  const database = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  let app: ReturnType<typeof buildApp>;
  let verifiedTestDatabase = false;
  let loginNumber = 0;
  function headers(cookie?: string) { return { origin: config.webOrigin, ...(cookie ? { cookie } : {}) }; }
  async function login(account = a) {
    const response = await app.inject({ method: "POST", url: "/api/v1/auth/sign-in", headers: headers(),
      remoteAddress: `127.0.2.${++loginNumber}`, payload: { email: account.email, password } });
    expect(response.statusCode).toBe(200);
    const values = response.headers["set-cookie"];
    const cookies = Array.isArray(values) ? values : [String(values)];
    expect(cookies.join(";")).toContain("HttpOnly");
    expect(cookies.join(";")).toContain("SameSite=Lax");
    expect(response.json()).toEqual({ user: { id: account.user, name: "Test user" },
      retailer: { id: account.retailer, name: "Test store" } });
    return cookies.map((value) => value.split(";")[0]).join("; ");
  }
  beforeAll(async () => {
    const { rows } = await database.query("SELECT current_database() AS name");
    if (!rows[0].name.endsWith("_test")) throw new Error("Integration tests require a database name ending in _test.");
    verifiedTestDatabase = true;
    await migrate(process.env.TEST_DATABASE_URL);
    const hash = await hashPassword(password);
    for (const account of [a, b]) {
      await database.query("INSERT INTO retailers (id, name) VALUES ($1, 'Test store')", [account.retailer]);
      await database.query(`INSERT INTO "user" (id, name, email, "emailVerified", "retailerId")
        VALUES ($1, 'Test user', $2, true, $3)`, [account.user, account.email, account.retailer]);
      await database.query(`INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "updatedAt")
        VALUES ($1, $2, 'credential', $2, $3, now())`, [randomUUID(), account.user, hash]);
      await database.query("INSERT INTO products (id, retailer_id, name, asin) VALUES ($1, $2, $3, $4)",
        [account.product, account.retailer, account === a ? offer.productName : "Other product", account === a ? offer.asin : "B000000001"]);
    }
    app = buildApp({ logger: false, database, authentication: config });
    await app.ready();
  }, 30000);
  afterAll(async () => {
    try {
      await app?.close();
      if (verifiedTestDatabase) await database.query("DELETE FROM retailers WHERE id = ANY($1::text[])", [[a.retailer, b.retailer]]);
    } finally { await database.end(); }
  });

  test("rejects signed-out reads and writes", async () => {
    for (const resource of ["products", "observations", "attempts", "auth/me"]) {
      expect((await app.inject(`/api/v1/${resource}`)).statusCode).toBe(401);
    }
    for (const resource of ["observations", "attempts"]) {
      expect((await app.inject({ method: "POST", url: `/api/v1/${resource}`, headers: headers(), payload: offer })).statusCode).toBe(401);
    }
  });
  test("rejects wrong passwords, unknown users and malformed credentials", async () => {
    for (const email of [a.email, "missing@example.test"]) {
      const response = await app.inject({ method: "POST", url: "/api/v1/auth/sign-in", headers: headers(),
        remoteAddress: "127.0.3.1", payload: { email, password: "wrong-password" } });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
      expect(response.headers["set-cookie"]).toBeUndefined();
    }
    expect((await app.inject({ method: "POST", url: "/api/v1/auth/sign-in", headers: headers(), payload: {} })).statusCode).toBe(400);
  });
  test("isolates products and ignores a client-supplied retailer identity", async () => {
    const cookie = await login();
    const response = await app.inject({ url: `/api/v1/products?retailerId=${b.retailer}`, headers: { ...headers(cookie), "x-retailer-id": b.retailer } });
    expect(response.json().products.map((p: { id: string }) => p.id)).toEqual([a.product]);
    expect((await app.inject({ url: "/api/v1/auth/me", headers: headers(cookie) })).json().retailer.id).toBe(a.retailer);
  });
  test("persists observations, scopes matching and records supported-source sends", async () => {
    const cookie = await login();
    const other = await login(b);
    const created = await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie),
      payload: { ...offer, retailerId: b.retailer, productId: b.product } });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ productId: a.product, matchStatus: "confirmed", price: "18.01", collectedVia: "extension" });
    const unlinked = await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(other), payload: offer });
    expect(unlinked.statusCode).toBe(201);
    expect(unlinked.json()).toMatchObject({ productId: null, matchStatus: "unverified" });
    const bad = await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie), payload: { ...offer, price: "0" } });
    expect(bad.json().code).toBe("INVALID_OFFER");
    const unsupported = await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie), payload: { ...offer, pageUrl: "https://example.com/item" } });
    expect(unsupported.json().code).toBe("UNSUPPORTED_SOURCE");
    const list = (await app.inject({ url: `/api/v1/observations?retailer_id=${b.retailer}`, headers: headers(cookie) })).json();
    expect(list.map((o: { id: string }) => o.id)).toEqual([created.json().id]);
    const attempts = (await app.inject({ url: "/api/v1/attempts", headers: headers(cookie) })).json();
    expect(attempts).toHaveLength(2);
    expect(attempts[0]).toMatchObject({ status: "failed" });
    expect(attempts[0].reason).toContain("price");
    expect(attempts[1]).toMatchObject({ status: "ok", productId: a.product, reason: null });
    await app.close();
    app = buildApp({ logger: false, database, authentication: config });
    expect((await app.inject({ url: "/api/v1/observations", headers: headers(cookie) })).json()[0].id).toBe(created.json().id);
    const otherList = (await app.inject({ url: "/api/v1/observations", headers: headers(other) })).json();
    expect(otherList.map((o: { id: string }) => o.id)).toEqual([unlinked.json().id]);
  });
  test("accepts unknown prices, rejects missing currency and preserves observations after failed attempts", async () => {
    const cookie = await login();
    expect((await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie),
      payload: { ...offer, price: null, currency: null, availability: "unknown" } })).statusCode).toBe(201);
    expect((await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie), payload: { ...offer, currency: null } })).statusCode).toBe(400);
    const before = (await app.inject({ url: "/api/v1/observations", headers: headers(cookie) })).json();
    const reported = await app.inject({ method: "POST", url: "/api/v1/attempts", headers: headers(cookie),
      payload: { pageUrl: offer.pageUrl, status: "blocked", reason: "Test access refused", retailerId: b.retailer } });
    expect(reported.statusCode).toBe(201);
    expect(reported.json()).toMatchObject({ productId: null, status: "blocked", source: "Amazon UK" });
    expect((await app.inject({ url: "/api/v1/observations", headers: headers(cookie) })).json()).toEqual(before);
    expect((await app.inject({ method: "POST", url: "/api/v1/attempts", headers: headers(cookie), payload: { pageUrl: offer.pageUrl } })).json().code).toBe("INVALID_ATTEMPT");
    const other = await login(b);
    const otherAttempts = (await app.inject({ url: "/api/v1/attempts", headers: headers(other) })).json();
    expect(otherAttempts.some((v: { id: string }) => v.id === reported.json().id)).toBe(false);
  });
  test("rolls back the observation when its success-attempt write fails", async () => {
    const cookie = await login();
    const before = (await app.inject({ url: "/api/v1/observations", headers: headers(cookie) })).json();
    const name = `test_failure_${randomUUID().replaceAll("-", "")}`;
    await database.query(`CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN IF NEW.retailer_id = TG_ARGV[0] THEN RAISE EXCEPTION 'Synthetic write failure'; END IF; RETURN NEW; END $$;
      CREATE TRIGGER ${name} BEFORE INSERT ON attempts FOR EACH ROW EXECUTE FUNCTION ${name}('${a.retailer}');`);
    try {
      const failed = await app.inject({ method: "POST", url: "/api/v1/observations", headers: headers(cookie), payload: offer });
      expect(failed.statusCode).toBe(500);
      expect(failed.json()).toEqual({ code: "INTERNAL_ERROR", message: "The request could not be completed." });
      expect((await app.inject({ url: "/api/v1/observations", headers: headers(cookie) })).json()).toEqual(before);
    } finally { await database.query(`DROP TRIGGER ${name} ON attempts; DROP FUNCTION ${name}();`); }
  });
  test("invalidates sessions on sign-out and rejects expired or tampered cookies", async () => {
    const cookie = await login();
    const out = await app.inject({ method: "POST", url: "/api/v1/auth/sign-out", headers: headers(cookie) });
    expect(out.statusCode).toBe(204);
    expect(String(out.headers["set-cookie"])).toContain("Max-Age=0");
    expect((await app.inject({ url: "/api/v1/products", headers: headers(cookie) })).statusCode).toBe(401);
    expect((await app.inject({ method: "POST", url: "/api/v1/auth/sign-out", headers: headers() })).statusCode).toBe(204);
    const expired = await login();
    await database.query('UPDATE "session" SET "expiresAt" = now() - interval \'1 hour\' WHERE "userId" = $1', [a.user]);
    expect((await app.inject({ url: "/api/v1/auth/me", headers: headers(expired) })).statusCode).toBe(401);
    expect((await app.inject({ url: "/api/v1/products", headers: headers(`${expired}tampered`) })).statusCode).toBe(401);
  });
  test("rejects cross-site writes and permits only the configured extension origin", async () => {
    const cookie = await login();
    for (const origin of ["https://untrusted.example", "null", `chrome-extension://${"b".repeat(32)}`]) {
      expect((await app.inject({ method: "POST", url: "/api/v1/observations", headers: { origin, cookie }, payload: offer })).statusCode).toBe(403);
    }
    expect((await app.inject({ method: "POST", url: "/api/v1/observations", headers: { cookie }, payload: offer })).statusCode).toBe(403);
    const allowed = await app.inject({ method: "POST", url: "/api/v1/observations", headers: { origin: config.extensionOrigin, cookie }, payload: offer });
    expect(allowed.statusCode).toBe(201);
    expect(allowed.headers["access-control-allow-origin"]).toBe(config.extensionOrigin);
    expect(allowed.headers["access-control-allow-credentials"]).toBe("true");
  });
  test("rate-limits sign-ins even when a client spoofs forwarding headers", async () => {
    const responses = [];
    for (let i = 0; i < 6; i++) responses.push(await app.inject({ method: "POST", url: "/api/v1/auth/sign-in",
      remoteAddress: "127.0.4.1", headers: { ...headers(), "x-riven-ip": `198.51.100.${i}` },
      payload: { email: a.email, password: "wrong-password" } }));
    expect(responses.at(-1)!.statusCode).toBe(429);
    expect(responses.at(-1)!.json().code).toBe("RATE_LIMITED");
  });
});
