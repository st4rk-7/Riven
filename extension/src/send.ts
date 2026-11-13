import { type Site, siteForHost } from "../../server/sources/sites.js";

// Shared by the popup and the background worker, so both talk to Riven the same way.
// Set at build time: npm run build:extension (local) or build:extension:live (https://riven.sbs).
declare const __RIVEN_API__: string;
const RIVEN_API = __RIVEN_API__;

export type SavedOffer = {
  productName: string;
  price: string | null;
  currency: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  seller: string | null;
  asin: string;
  observedAt: string;
};

// The site whose rules read this page, or null for a page Riven does not support.
export function siteForPage(url: string | undefined): Site | null {
  return url && URL.canParse(url) ? siteForHost(new URL(url).hostname) : null;
}

async function call(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${RIVEN_API}${path}`, { credentials: "include", ...init, headers: { "content-type": "application/json" } });
}

// Sends the product part of a page; Riven reads it, keeps only the offer and returns it.
export async function sendPage(pageUrl: string, html: string): Promise<SavedOffer> {
  const response = await call("/pages", { method: "POST", body: JSON.stringify({ pageUrl, html }) });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error("Sign in to Riven in this Chrome profile first");
  if (!response.ok) throw new Error(body.message ?? `HTTP ${response.status}`);
  return body;
}

// Records a page Riven could not read; resolves to a short status for the user.
export async function recordAttempt(pageUrl: string, status: "failed" | "blocked", reason: string): Promise<string> {
  try {
    const response = await call("/attempts", { method: "POST", body: JSON.stringify({ pageUrl, status, reason: reason.slice(0, 300) }) });
    return response.status === 401 ? "Sign in to Riven in this Chrome profile first; attempt not recorded."
      : response.ok ? "Attempt recorded in Riven." : "Riven did not record the attempt.";
  } catch {
    return "Riven server not reachable; attempt not recorded.";
  }
}

// Shared listings due for a check, whichever retailers track them; null when Riven has no list to give.
export async function dueListings(): Promise<string[] | null> {
  try {
    const response = await call("/listings/due");
    if (!response.ok) return null;
    const body = (await response.json()) as { listings?: { url?: unknown }[] };
    return (body.listings ?? []).map((listing) => listing.url).filter((url): url is string => typeof url === "string");
  } catch {
    return null;
  }
}
