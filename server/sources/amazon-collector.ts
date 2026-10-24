import { CheerioCrawler, Configuration } from "crawlee";

import { type AmazonOffer, parseAmazonProductPage } from "./amazon.js";

export type CollectResult =
  | { status: "ok"; offer: AmazonOffer; observedAt: string }
  | { status: "blocked"; reason: string; observedAt: string }
  | { status: "failed"; reason: string; observedAt: string };

const DEFAULT_ALLOWED_HOSTS = [
  "www.amazon.co.uk",
  "amazon.co.uk",
  "www.amazon.sg",
  "amazon.sg",
  "www.amazon.com",
  "amazon.com",
];
const BLOCK_STATUSES = new Set([403, 429, 503]);

export function isCaptchaPage(html: string): boolean {
  return /validateCaptcha|Type the characters you see|Robot Check/i.test(html);
}

// Collects one product page: one request, no retries, stop on any block.
export async function collectAmazonOffer(
  url: string,
  { allowedHosts = DEFAULT_ALLOWED_HOSTS, timeoutSecs = 15 } = {},
): Promise<CollectResult> {
  const observedAt = new Date().toISOString();
  const target = new URL(url);
  if (!allowedHosts.includes(target.hostname)) {
    return { status: "failed", reason: `Host not allowed: ${target.hostname}`, observedAt };
  }

  let result: CollectResult = { status: "failed", reason: "No response", observedAt };

  const crawler = new CheerioCrawler(
    {
      maxRequestsPerCrawl: 1,
      maxConcurrency: 1,
      maxRequestRetries: 0,
      useSessionPool: false,
      navigationTimeoutSecs: timeoutSecs,
      requestHandlerTimeoutSecs: timeoutSecs,
      additionalHttpErrorStatusCodes: [],
      ignoreHttpErrorStatusCodes: [...BLOCK_STATUSES],
      // Amazon may answer bots with a non-HTML body; let it through so it is recorded as blocked.
      additionalMimeTypes: ["text/html", "application/octet-stream"],
      preNavigationHooks: [
        (_ctx, gotOptions) => {
          gotOptions.followRedirect = true;
          gotOptions.headers = { ...gotOptions.headers, "User-Agent": "RivenBot/0.1 (EC5406 student project)" };
        },
      ],
      async requestHandler({ response, body, contentType }) {
        const html = body.toString();
        if (BLOCK_STATUSES.has(response.statusCode ?? 0) || isCaptchaPage(html)) {
          result = { status: "blocked", reason: `Blocked (HTTP ${response.statusCode})`, observedAt };
          return;
        }
        if (contentType.type !== "text/html") {
          result = { status: "blocked", reason: `Blocked (non-HTML response: ${contentType.type})`, observedAt };
          return;
        }
        try {
          result = { status: "ok", offer: parseAmazonProductPage(html), observedAt };
        } catch (error) {
          result = { status: "failed", reason: (error as Error).message, observedAt };
        }
      },
      failedRequestHandler({ request }) {
        const message = request.errorMessages.at(-1) ?? "Request failed";
        result = { status: "failed", reason: message.split("\n")[0], observedAt };
      },
    },
    new Configuration({ persistStorage: false }),
  );

  await crawler.run([url]);
  return result;
}
