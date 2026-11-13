import type { AmazonOffer } from "./amazon.js";
import { extractOffer, type MatchedRules } from "./extract.js";
import { AMAZON } from "./sites.js";

export type CollectResult =
  | { status: "ok"; offer: AmazonOffer; rules: MatchedRules; observedAt: string }
  | { status: "blocked"; reason: string; observedAt: string }
  | { status: "failed"; reason: string; observedAt: string };

const BLOCK_STATUSES = new Set([403, 429, 503]);

export function isCaptchaPage(html: string): boolean {
  return /validateCaptcha|Type the characters you see|Robot Check/i.test(html);
}

// Collects one product page: one request, no retries, stop on any block.
// Plain fetch: crawlee's browser-imitating headers made Amazon answer with a non-HTML body.
export async function collectAmazonOffer(
  url: string,
  { allowedHosts = AMAZON.hosts, timeoutSecs = 15 } = {},
): Promise<CollectResult> {
  const observedAt = new Date().toISOString();
  let target = new URL(url);
  try {
    // Follow redirects by hand so every hop stays on an allowed host.
    for (let hop = 0; hop < 5; hop++) {
      if (!allowedHosts.includes(target.hostname)) {
        return { status: "failed", reason: `Host not allowed: ${target.hostname}`, observedAt };
      }
      const response = await fetch(target, {
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutSecs * 1000),
        headers: {
          "User-Agent": "RivenBot/0.1 (EC5406 student project)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-GB,en;q=0.9",
        },
      });
      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        target = new URL(location, target);
        continue;
      }
      const html = await response.text();
      if (BLOCK_STATUSES.has(response.status) || isCaptchaPage(html)) {
        return { status: "blocked", reason: `Blocked (HTTP ${response.status})`, observedAt };
      }
      if (!response.ok) return { status: "failed", reason: `HTTP ${response.status}`, observedAt };
      const type = response.headers.get("content-type")?.split(";")[0].trim() || "none";
      if (type !== "text/html") {
        return { status: "blocked", reason: `Blocked (non-HTML response: ${type})`, observedAt };
      }
      try {
        const { offer, rules } = extractOffer(html, AMAZON);
        // Amazon leaves the buy box out for unrecognised visitors; such a page is not an observation.
        if (offer.price === null) return { status: "failed", reason: "Page showed no price", observedAt };
        return { status: "ok", offer, rules, observedAt };
      } catch (error) {
        return { status: "failed", reason: (error as Error).message, observedAt };
      }
    }
    return { status: "failed", reason: "Too many redirects", observedAt };
  } catch (error) {
    return { status: "failed", reason: (error as Error).message.split("\n")[0], observedAt };
  }
}
