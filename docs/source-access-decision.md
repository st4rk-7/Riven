# Source access decision — RIV-2

**Recorded:** 2 October 2026 · **Updated:** 13 November 2026 · **Status:** active · **Owner:** Shewon

## Current state (13 November 2026)

| Platform | Route | Status |
| --- | --- | --- |
| Amazon | Riven extension sends pages the retailer views; server discovery searches Amazon for candidates | Active, for testing during the project. Amazon's Conditions of Use forbid automated collection; the team accepted this risk on 10 Oct. Production needs a legal route |
| eBay (second platform, chosen 11 Nov) | Riven extension in the retailer's Chrome: on request (Fetch) and on schedule in the background while Chrome is open. The server crawler stays as a per-site fallback | Decided 13 Nov (RIV-43). eBay's User Agreement forbids automated collection without permission; the eBay Browse API account was rejected on 3 Oct |
| books.toscrape.com | Server fetch | Retired after the Sprint 1 checkpoint |

- **12 Oct 2026:** server requests to Amazon were refused in the live check, so Amazon product pages come through the extension.
- **4 Nov 2026:** one collection pipeline with two fetchers, the server crawler and the extension. Design: [SDD section 3](design.md#3-collection-pipeline).
- **11 Nov 2026:** eBay chosen as the second platform; the route is decided before Sprint 2 step 4.
- **13 Nov 2026 (RIV-43):** the server cannot collect from Amazon or eBay itself: in the team's test, a plain server fetch from a cloud server got HTTP 403 on 4 of 4 eBay item pages, and an open-source tracker's users report the same. So the extension is the collector. Whoever has it installed and Chrome open runs the checks: every few minutes the extension asks Riven which of its own retailer's offers are due, opens each in a hidden tab one at a time, a few seconds apart, sends the page to Riven and closes the tab, the same path as the Fetch button. With shared listings (RIV-44) one reading refreshes the listing for every retailer tracking it. An extension only checks its own retailer's offers, so no retailer learns what another tracks. When no tracking retailer has Chrome open, offers go stale after 12 h. Also considered: a paid residential proxy service (paid, needs client agreement), a home worker (depends on one machine), and re-applying for the eBay Browse API (approval time unknown). The eBay site rule reads JSON-LD first, then CSS selectors, and records block pages (403, eBay error or challenge page) as `blocked`: never retried, never solved; the extension pauses checks for that site. Item key: the 12-digit item ID plus any `var` value. Prices are stored in the seller's original currency, not the converted estimate.

The sections below are the earlier decisions, kept as history.

## Decision of 10 October 2026: Amazon test phase

After the proposal evaluation, the client and the team agreed a new direction:

- **Amazon product pages are now the primary source, in a test phase.** Collection uses Crawlee/Playwright (client-approved): low volume, team-seeded product URLs, manual trigger, no sign-in, no retries. A blocked response is recorded as `blocked` and collection stops. The demo falls back to a dated snapshot of earlier results.
- **The source is locked once the collection tests pass.** After testing completes for all sites, the collection method moves to a production route.
- **books.toscrape.com is retired** after serving as the Sprint 1 checkpoint source (RIV-6).
- **MVP flow:** the retailer picks or searches a product and Riven lists competitor offers automatically; no manual competitor selection.

See [SDD decision log](design.md#9-decision-log) for later collection decisions.

## Original decision (2 October 2026)

Keep Amazon as the client's **first intended source**, but do not enable live Amazon collection: no route suitable for Riven's users, purpose and budget has been established. Build the first connected checkpoint with clearly labelled synthetic data. Evaluate live-source candidates through the gate below, without silently replacing Amazon or claiming that a sandbox or trial proves live collection.

For any marketplace, approve the **specific acquisition route and downstream use**, not just the site name:

```text
Candidate route → access + monitoring purpose + fields + retention +
customer display + cost confirmed?
   No / unknown → no live collection
   Yes          → one small permitted sample → validate → source adapter
```

An official API, licensed feed, client-authorized data or expressly permitted HTTP/browser collection may qualify. A public page, robots.txt allowance, HTTP 200, scraper package, free trial, API key or provider marketing page does **not** establish those rights. Crawlee/Playwright are optional implementation tools **only where that exact method and use are permitted**. Never use them to get around denied access, quotas or CAPTCHAs. Do not collect first and seek approval later.

## Source status (3 October 2026)

| Route | Status | Detail |
| --- | --- | --- |
| Amazon UK pages | **Blocked** | Conditions of Use prohibit automated collection and reuse of prices without written consent. |
| Amazon Associates / PA-API | **Blocked** | Licence is for advertising Amazon; restricts aggregation/analysis/repurposing without prior written approval. |
| Amazon SP-API Pricing | **Blocked** | Sellers only; Riven's intended users cannot provide seller authorization. |
| eBay Browse API | **Rejected** | Developer account rejected by eBay review (3 Oct 2026). No appeal path given. |
| Walmart Marketplace API | **Blocked** | Requires seller/solution-provider credentials we don't have. |
| Temu Partner API | **Blocked** | Requires registered partner access; not available for academic competitor monitoring. |
| AliExpress Open Platform | **Blocked** | Site terms prohibit systematic retrieval into a database without written permission. |
| Paid data vendors (Bright Data, Oxylabs, Keepa) | **No budget** | Bright Data inaccessible; Keepa €49+/month minimum; no purchase authority. |
| Best Buy API | **Terms conflict** | Free access exists but terms forbid use "on behalf of another retailer" for pricing analysis and limit caching to 72 hours — directly conflicts with Riven's purpose. |

## Confirmed Sprint 1 source: books.toscrape.com

**Decision date:** 3 October 2026 · **Approved by:** mentor (3 Oct 2026)

[books.toscrape.com](https://books.toscrape.com) is a public practice site built explicitly for scraping. No ToS restrictions, no authentication, no ethical concerns. It provides product names, prices (GBP), availability and catalogue structure — enough to demonstrate Riven's full collection → backend → observation pipeline with real scraping code.

**What it proves:** the adapter pattern works, the scraping code is real, and the observation contract flows end-to-end. It is not a real marketplace — that comes later.

**What it does not claim:** live competitor monitoring. Observations use `mode: "practice"` and `source: "books.toscrape.com (practice site)"`, served from `GET /api/v1/practice-observation`. `"synthetic"` stays reserved for fixture values from `GET /api/v1/demo-observation`, so a practice observation never implies fabricated values and never claims live monitoring. See [SDD section 7](design.md#7-design-rules).

### Sprint 1 collection limits

| Limit | Value |
| --- | --- |
| Scope | One fixed book page per request; no crawling, no pagination, no other hosts |
| Requests | 1 per endpoint call; manual demo use only (expected under 50 requests in Sprint 1) |
| Concurrency | 1; no scheduler or background job |
| Timeout | 10 seconds |
| Redirects | Not followed; a 3xx response is a failure, so collection cannot leave the allowed host |
| Retries | None. Failures (4xx including 403/429, 5xx, timeout, redirect, unexpected HTML) return HTTP 502 and stop |
| Unexpected HTML | Missing title → failure; missing/unparseable price → `null`; missing stock text → `unknown` |
| Runtime | Not yet measured. Proposed target: under 1 second per request when the site is reachable; to be measured and recorded in RIV-6 |
| Storage | None; observations are not persisted in Sprint 1 |
| Identification | `User-Agent: Riven student project (EC5406)` |

The 1,000-product catalogue is **not** collected; one page is enough to prove the pipeline.

## Later sprint candidates

**Status: unverified candidates — not part of Sprint 1.** None has passed the gate above. Quotas, terms and permissions below are unconfirmed until an official source and the gate checks (access, purpose, fields, retention, display, cost) are recorded for the specific route.

| Option | Earliest sprint | Must be established before any collection |
| --- | --- | --- |
| **Kroger API** | 2 | Official documentation for quota, authentication, location context, permitted use, retention and display terms. Registration alone does not prove suitability. |
| **Shopify store with written permission** | 2–3 | Written permission covering retention and display; the exact route (Storefront/Admin API or pages), token scopes and request limits; secrets kept out of Git. |
| **Consenting shop owner** (any platform) | 3+ | Same gate checks as above for that owner's platform. |

## Impact on current work

- Dilsan (`RIV-3`) and Hirukshanan (`RIV-4`) keep the agreed `GET /api/v1/demo-observation` **synthetic** contract; Ilmam (`RIV-5`) verifies the connected flow. None is a live-source claim.
- Shewon (`RIV-2`) owns the access investigation and escalates any source substitution to the client. Do not open five adapter tasks or add a source-policy database now.
- Once a route passes the gate and the client agrees the source, select **one** small follow-up Jira task with an owner, sample/checks and reviewer. Keep price as a decimal string or `null`, currency explicit, availability distinct from unknown, and match uncertainty visible as described in [SDD section 7](design.md#7-design-rules).
- A reviewed blocked verdict can complete an access investigation, **not** a live collector or the full Sprint 1 journey. Record actual approvals, checks and dates in Jira/PRs; this note is a decision record, not evidence of completed implementation.
