# Source access decision — RIV-2

**Recorded:** 2 October 2026 · **Updated:** 3 October 2026 · **Status:** active · **Owner:** Shewon

## Decision

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

**Decision date:** 3 October 2026 · **Accepted by:** mentor

[books.toscrape.com](https://books.toscrape.com) is a public practice site built explicitly for scraping. No ToS restrictions, no authentication, no ethical concerns. It provides product names, prices (GBP), availability and catalogue structure — enough to demonstrate Riven's full collection → backend → observation pipeline with real scraping code.

**What it proves:** the adapter pattern works, the scraping code is real, and the observation contract flows end-to-end. It is not a real marketplace — that comes later.

**What it does not claim:** live competitor monitoring. The `source` field will read `"books.toscrape.com (practice site)"` and `mode` stays `"synthetic"` until a permitted commercial source is connected.

## Later sprint candidates

| Option | Sprint | Action required |
| --- | --- | --- |
| **Kroger API** (free, 10K calls/day) | 2 | Register developer account; proves a real API adapter |
| **Shopify store with written permission** | 2–3 | Contact a store owner; one signed email = legal live e-commerce data |
| **Consenting shop owner** (any platform) | 3+ | Find a small retailer willing to grant academic permission |

## Impact on current work

- Dilsan (`RIV-3`) and Hirukshanan (`RIV-4`) keep the agreed `GET /api/v1/demo-observation` **synthetic** contract; Ilmam (`RIV-5`) verifies the connected flow. None is a live-source claim.
- Shewon (`RIV-2`) owns the access investigation and escalates any source substitution to the client. Do not open five adapter tasks or add a source-policy database now.
- Once a route passes the gate and the client agrees the source, select **one** small follow-up Jira task with an owner, sample/checks and reviewer. Keep price as a decimal string or `null`, currency explicit, availability distinct from unknown, and match uncertainty visible as described in [manual section 7](manual.md#7-shared-data-meanings-and-first-interface).
- A reviewed blocked verdict can complete an access investigation, **not** a live collector or the full Sprint 1 journey. Record actual approvals, checks and dates in Jira/PRs; this note is a decision record, not evidence of completed implementation.
