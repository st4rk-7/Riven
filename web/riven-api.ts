// Calls to Riven's API (docs/api.md). The session lives in an HttpOnly cookie.

export type Session = {
  user: { id: string; name: string };
  retailer: { id: string; name: string };
};

export type ApiProduct = { id: string; name: string; brand: string; asin: string | null };

export type ApiObservation = {
  id: string;
  productId: string | null;
  asin: string;
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
  source: string;
  observedAt: string;
  matchStatus: "confirmed" | "unverified" | "mismatch";
  collectedVia: "extension" | "crawler";
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method,
    credentials: "include",
    // Fastify rejects an empty body sent as JSON, so only label requests that carry one.
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.code ?? "INTERNAL_ERROR", data?.message ?? `Request failed (${response.status}).`);
  }
  return data as T;
}

export const api = {
  me: () => request<Session>("/auth/me"),
  signIn: (email: string, password: string) => request<Session>("/auth/sign-in", "POST", { email, password }),
  signOut: () => request<void>("/auth/sign-out", "POST"),
  products: () => request<{ products: ApiProduct[] }>("/products").then((r) => r.products),
  observations: () => request<ApiObservation[]>("/observations"),
};
