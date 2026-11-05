import type { AmazonOffer } from "../../server/sources/amazon.js";

// Shared by the popup and the background worker, so both send offers the same way.
export const ALLOWED_HOSTS = [
  "www.amazon.co.uk",
  "amazon.co.uk",
  "www.amazon.sg",
  "amazon.sg",
  "www.amazon.com",
  "amazon.com",
];
// Set at build time: npm run build:extension (local) or build:extension:live (https://riven.sbs).
declare const __RIVEN_API__: string;
const RIVEN_API = __RIVEN_API__;

export function isAllowedPage(url: string | undefined): url is string {
  return Boolean(url && URL.canParse(url) && ALLOWED_HOSTS.includes(new URL(url).hostname));
}

// Saves the offer in Riven; resolves to the time Riven recorded it.
export async function sendOffer(offer: AmazonOffer, pageUrl: string): Promise<string> {
  const response = await fetch(`${RIVEN_API}/observations`, {
    credentials: "include",
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pageUrl, ...offer }),
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error("Sign in to Riven in this Chrome profile first");
  if (!response.ok) throw new Error(body.message ?? `HTTP ${response.status}`);
  return body.observedAt;
}

// Records a page Riven could not read; resolves to a short status for the user.
export async function recordFailedAttempt(pageUrl: string, reason: string): Promise<string> {
  try {
    const response = await fetch(`${RIVEN_API}/attempts`, {
      credentials: "include",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pageUrl, status: "failed", reason: reason.slice(0, 300) }),
    });
    return response.status === 401 ? "Sign in to Riven in this Chrome profile first; attempt not recorded."
      : response.ok ? "Failed attempt recorded in Riven." : "Riven did not record the attempt.";
  } catch {
    return "Riven server not reachable; attempt not recorded.";
  }
}
