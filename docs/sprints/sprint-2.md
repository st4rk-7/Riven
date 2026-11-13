# Sprint 2 record

**Riven** · Jira sprint "RIV Sprint 2" · dates set in Jira · Status: plan agreed by the client, 12 Nov 2026

Same headings as [Sprint 1](sprint-1.md): plan, what was delivered, review, retrospective. Jira holds live status; this file is the record.

## 1. Plan

**Sprint goal:** Riven re-checks each product on its own schedule from two platforms, Amazon and eBay, and clearly marks data that is old or failing.

**Design:** the target collection pipeline in [SDD section 3.2](../design.md#32-target-planned-decided-4-nov-2026): site rules as data, one shared extractor (JSON-LD first, then selectors), two fetchers into one save path, a check interval per product.

### Decisions this sprint builds on (agreed 12 Nov 2026)

| Decision | Value |
| --- | --- |
| Default check interval | 6 h (client, 12 Nov 2026; was 24 h); each product can use 6 h, 12 h, 24 h or be paused |
| Stale threshold | 12 h with no successful check (two missed 6 h checks; client, 12 Nov 2026; was 48 h) |
| Alerts (Sprint 4) | Competitor price below mine; price change of 5% or more; stock change. In-app first, then email. One alert per event |
| Tiers (Sprint 5, mock billing) | Free: 10 products, 6 h minimum · Pro: $19/month, 100 products, 6 h · Business: $49/month, 500 products, 3 h |
| Second platform | eBay, collected by the extension in the retailer's Chrome, on request and on schedule in the background; server crawler as a per-site fallback (13 Nov, RIV-43) |
| Shared listings | Public listing readings are stored once and shared by every retailer tracking that listing; what each retailer tracks and decides stays private (13 Nov) |

### Sub-tasks, in build order

Owners work in parallel, 9 points each; Jira holds live status. Order that matters: RIV-43 and RIV-36 first (RIV-37 and RIV-21 build on them); database changes merge as RIV-38, then RIV-21, then RIV-44, then RIV-40.

| # | Sub-task | Done when | Requirements | Owner |
| --- | --- | --- | --- | --- |
| 1 | Site rules registry and shared extractor (`server/sources/sites.ts`); Amazon moved into it | Amazon parses through the registry; existing Amazon tests pass unchanged; each observation records which rule matched | FR-03, FR-05, NFR-10 | Shewon, RIV-36 |
| 2 | Extension sends the product part of the page (JSON-LD blocks, the product section chosen by the site rule, the URL; never the header or account area); the server parses it and discards it. While Chrome is open, the extension also asks Riven for due shared listings, whoever tracks them, and checks them in hidden tabs, one at a time; background checks are disclosed at install and can be turned off | Extension and crawler produce the same observation from the same page; no raw page is stored; due offers are checked with Chrome open and no clicks; a `blocked` page pauses checks for that site | FR-05, NFR-12 | Shewon, RIV-37 |
| 3 | Per-product check schedule: `check_every_hours` and `next_check_at` on products; background workers claim due products from PostgreSQL (`FOR UPDATE SKIP LOCKED`, small jitter) instead of one fixed interval; due checks for sites that block servers are handed to the extension through an API route | A product set to 6 h is checked about every 6 h; a paused product is not checked; two workers never check the same product at once; the extension receives due listing URLs only, never which retailer tracks them | FR-05 | Hirukshanan, RIV-38 |
| 4 | eBay added as a site: generic item ID instead of the Amazon-only `asin` column, eBay rules, fixtures; shipping cost, condition (new or used) and seller stored per offer | An eBay item page parses to price, currency, stock, seller, shipping and condition; Amazon still works | FR-03, FR-05 | Ilmam, RIV-21 |
| 5 | Freshness: "last checked" time, "check failing" after repeated failures, stale after 12 h with no successful check; failed or stale values never feed charts or alerts | Test in the test plan passes | FR-11, NFR-04 | Dilsan, RIV-39 |
| 6 | Skip an observation identical to the previous one within 6 h; the attempt is still stored | Test shows one observation and two attempts | FR-06 | Dilsan, RIV-40 |
| 7 | Carried over: own price position on screen (own price per product is already on `main`, PR #33); `api.md` for the 5 new routes | Each product shows whether the retailer is cheapest, in the middle or most expensive among its confirmed offers; `api.md` lists the 5 routes | FR-07 | Dilsan, RIV-41 (position); Ilmam, RIV-42 (`api.md`) |
| 8 | Public sign-up: a retailer creates their own account and workspace | Sign-up works on the live site; a new account sees only its own data | FR-01, NFR-01 | Ilmam, RIV-25 |
| 9 | Shared listings: public readings stored once per listing (source + item ID) and shown to every retailer tracking it | One reading appears for every retailer tracking the listing; a retailer never sees who else tracks it; two-account test passes; history migrated | FR-05, FR-06, NFR-01 | Hirukshanan, RIV-44 |
| — | eBay route decision | Recorded in the source access decision | — | Shewon, RIV-43 |

**Collection route (decided 13 Nov, RIV-43):** the server cannot collect from Amazon or eBay, so the extension is the collector. While Chrome is open it asks Riven for due shared listings, whoever tracks them, and checks them in hidden tabs, one at a time; the server crawler stays as a per-site fallback. Details in the [source access decision](../source-access-decision.md).

## 2. Delivered

To be filled in at the end of the sprint.

## 3. Sprint review

| Item | Record |
| --- | --- |
| Client demo date | |
| What was shown | |
| Client feedback | |
| Evidence of the client presentation | |
| Evaluation date and feedback | |

## 4. Retrospective

| Question | Answers |
| --- | --- |
| What went well | |
| What did not go well | |
| One change for the next sprint | |
