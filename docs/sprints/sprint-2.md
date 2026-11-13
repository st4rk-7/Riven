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
| Second platform | eBay. Collection method still open: extension or server crawler |

### Sub-tasks, in build order

Each step is finished, reviewed and merged before the next starts. Owners are set in Jira.

| # | Sub-task | Done when | Requirements | Owner |
| --- | --- | --- | --- | --- |
| 1 | Site rules registry and shared extractor (`server/sources/sites.ts`); Amazon moved into it | Amazon parses through the registry; existing Amazon tests pass unchanged; each observation records which rule matched | FR-03, FR-05, NFR-10 | |
| 2 | Extension sends the page HTML; the server parses it and discards the page | Extension and crawler produce the same observation from the same page; no raw page is stored | FR-05, NFR-12 | |
| 3 | Per-product check schedule: `check_every_hours` and `next_check_at` on products; background workers claim due products from PostgreSQL (`FOR UPDATE SKIP LOCKED`, small jitter) instead of one fixed interval | A product set to 6 h is checked about every 6 h; a paused product is not checked; two workers never check the same product at once | FR-05 | |
| 4 | eBay added as a site: generic item ID instead of the Amazon-only `asin` column, eBay rules, fixtures; shipping cost, condition (new or used) and seller stored per offer | An eBay item page parses to price, currency, stock, seller, shipping and condition; Amazon still works | FR-03, FR-05 | |
| 5 | Freshness: "last checked" time, "check failing" after repeated failures, stale after 12 h with no successful check; failed or stale values never feed charts or alerts | Test in the test plan passes | FR-11, NFR-04 | |
| 6 | Skip an observation identical to the previous one within 6 h; the attempt is still stored | Test shows one observation and two attempts | FR-06 | |
| 7 | Carried over: own price position on screen; `api.md` for the 5 new routes | Merged to `main` | FR-07 | |
| 8 | Public sign-up: a retailer creates their own account and workspace | Sign-up works on the live site; a new account sees only its own data | FR-01, NFR-01 | |

**Open before step 4:** how eBay pages are collected (extension or server crawler). eBay's User Agreement forbids automated collection without permission; the eBay Browse API account was rejected on 3 Oct. Record the decision in the [source access decision](../source-access-decision.md).

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
