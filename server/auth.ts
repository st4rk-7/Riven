import { betterAuth } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";
import { authOptions } from "./auth-options.js";

export type Identity = {
  user: { id: string; name: string };
  retailer: { id: string; name: string };
};
declare module "fastify" {
  interface FastifyRequest { identity: Identity | null }
}

export type AuthConfiguration = {
  secret: string;
  baseURL: string;
  webOrigin: string;
  extensionOrigin?: string;
};

export function createAuth(database: Pool, config: AuthConfiguration) {
  if (config.secret.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  const base = new URL(config.baseURL);
  const web = new URL(config.webOrigin);
  if (!["http:", "https:"].includes(base.protocol) || !["http:", "https:"].includes(web.protocol)) {
    throw new Error("Configure HTTP(S) API and web origins.");
  }
  if (process.env.NODE_ENV === "production" && (base.protocol !== "https:" || web.protocol !== "https:")) {
    throw new Error("Production authentication requires HTTPS.");
  }
  if (config.extensionOrigin && !/^chrome-extension:\/\/[a-p]{32}$/.test(config.extensionOrigin)) {
    throw new Error("RIVEN_EXTENSION_ORIGIN must name one exact Chrome extension ID.");
  }
  const origins = [base.origin, web.origin, ...(config.extensionOrigin ? [config.extensionOrigin] : [])];
  const auth = betterAuth({
    ...authOptions,
    database,
    secret: config.secret,
    baseURL: base.origin,
    basePath: "/api/v1/auth",
    trustedOrigins: origins,
    session: { expiresIn: 60 * 60 * 24, disableSessionRefresh: true, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, window: 60, max: 60, customRules: { "/sign-in/email": { window: 60, max: 5 } } },
    advanced: {
      useSecureCookies: base.protocol === "https:",
      ipAddress: { ipAddressHeaders: ["x-riven-ip"] },
    },
    logger: { disabled: true },
  });

  function headersOf(request: FastifyRequest) {
    const headers = fromNodeHeaders(request.headers);
    // Never trust a browser-supplied forwarding header for login rate limits.
    headers.set("x-riven-ip", request.ip);
    return headers;
  }
  async function identityOfUser(userId: string): Promise<Identity | null> {
    const { rows } = await database.query(`SELECT u.id, u.name, r.id AS "retailerId", r.name AS "retailerName"
      FROM "user" u JOIN retailers r ON r.id = u."retailerId" WHERE u.id = $1`, [userId]);
    const row = rows[0];
    return row ? { user: { id: row.id, name: row.name }, retailer: { id: row.retailerId, name: row.retailerName } } : null;
  }
  async function sessionOf(request: FastifyRequest) {
    return auth.api.getSession({ headers: headersOf(request), query: { disableCookieCache: true } });
  }
  async function identityOf(request: FastifyRequest) {
    const session = await sessionOf(request);
    return session ? identityOfUser(session.user.id) : null;
  }
  async function call(request: FastifyRequest, path: string, body?: unknown) {
    const headers = headersOf(request);
    // CLI writes are admitted only by the explicit non-simple-header check below.
    if (!headers.has("origin")) headers.set("origin", base.origin);
    if (body !== undefined) headers.set("content-type", "application/json");
    return auth.handler(new Request(`${base.origin}/api/v1/auth${path}`, {
      method: "POST", headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }));
  }
  function cookies(response: Response, reply: FastifyReply) {
    const values = response.headers.getSetCookie();
    if (values.length) reply.header("set-cookie", values);
  }

  return { auth, origins, identityOf, sessionOf, identityOfUser, call, cookies };
}

export type AuthServices = ReturnType<typeof createAuth>;

export function registerAuthRoutes(app: FastifyInstance, services: AuthServices, database: Pool) {
  const credentials = z.object({ email: z.email().max(254), password: z.string().min(1).max(128) }).strict();
  app.post("/api/v1/auth/sign-in", async (request, reply) => {
    const parsed = credentials.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ code: "INVALID_REQUEST", message: "Provide a valid email and password." });
    const response = await services.call(request, "/sign-in/email", parsed.data);
    if (response.status === 429) {
      reply.header("retry-after", response.headers.get("retry-after") ?? "60");
      return reply.code(429).send({ code: "RATE_LIMITED", message: "Too many sign-in attempts. Try again later." });
    }
    if (!response.ok) {
      if (response.status >= 500) throw new Error("Authentication service failed.");
      return reply.code(401).send({ code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." });
    }
    const result = await response.json() as { user: { id: string } };
    const identity = await services.identityOfUser(result.user.id);
    if (!identity) throw new Error("User has no retailer.");
    services.cookies(response, reply);
    return identity;
  });
  app.get("/api/v1/auth/me", async (request, reply) => {
    const identity = await services.identityOf(request);
    return identity ?? reply.code(401).send({ code: "UNAUTHENTICATED", message: "Please sign in." });
  });
  app.post("/api/v1/auth/sign-out", async (request, reply) => {
    const session = await services.sessionOf(request);
    const response = await services.call(request, "/sign-out");
    if (!response.ok) throw new Error("Sign-out failed.");
    // Better Auth clears the cookie even if its database delete fails. Verify revocation.
    if (session) {
      const { rowCount } = await database.query('SELECT id FROM "session" WHERE id = $1', [session.session.id]);
      if (rowCount) throw new Error("Session was not revoked.");
    }
    services.cookies(response, reply);
    return reply.code(204).send();
  });
}
