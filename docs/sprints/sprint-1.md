# Sprint 1 record

**Riven** · Jira sprint "RIV Sprint 1" · 30 Sep – 21 Oct 2026 (planned end) · Status: still open in Jira on 4 Nov 2026

Each sprint gets one file in this folder: plan, what was delivered, review, retrospective. Jira holds live status; this file is the record.

## 1. Plan

**Sprint goal (Jira):** deliver the first retailer monitoring journey: sign in, add a supported listing, request collection, and view a trustworthy observation in the retailer's own workspace.

**First checkpoint:** one page shows one clearly labelled sample observation from the backend, so all four members understand one connected request.

The development window was first 28 Sep – 11 Oct and was extended to 21 Oct.

## 2. Delivered

Merged pull requests, grouped by owner (from GitHub).

| Owner | Ticket | Pull request | Merged |
| --- | --- | --- | --- |
| Ilmam | RIV-5 Shared frontend and backend setup | #6 | 4 Oct |
| Dilsan | RIV-3 Show a sample backend observation with loading and retry | #7 | 7 Oct |
| Shewon | RIV-2 Source access decision | #8 | 7 Oct |
| Shewon | RIV-6 Collect one observation from books.toscrape.com | #9 | 7 Oct |
| Shewon | RIV-17 Collect competitor offers through the Riven extension | #11 | 16 Oct |
| Ilmam | RIV-22 Automated checks on every pull request | #12 | 17 Oct |
| Dilsan | RIV-16 Four MVP screens, responsive, with demo states | #13 | 17 Oct |
| Hirukshanan | RIV-15 PostgreSQL migrations and retailer-safe sign-in | #14 | 19 Oct |
| Shewon | RIV-23 Connect the four screens to the real API | #15 | 19 Oct |
| Ilmam | RIV-18 Seed retailer accounts and check data isolation | #16 | 20 Oct |

**After the planned end** (sprint still open in Jira):

| Owner | Ticket | Pull request | Merged |
| --- | --- | --- | --- |
| Shewon | RIV-28 Public deployment, then VPS behind Caddy | #17, #19 | 23–24 Oct |
| Shewon | RIV-20 Scheduled collection, competitor discovery, match review | #18 | 24 Oct |
| Shewon | RIV-17 Add own products; show listing title and Amazon link | #20, #21 | 24 Oct |
| Shewon | RIV-27 Public landing page | #22 | 25 Oct |
| Shewon | Product brief and docs update | #23 | 25 Oct |
| Dilsan | RIV-16 Restyle app screens to match the landing page | #24 | 3 Nov |
| Shewon | Fix discovered offers; both fetchers update one offer | #25 | 3 Nov |
| Shewon | Record a page with no price as a failed check | #26 | 3 Nov |
| Shewon | Remove the Sprint 1 demo link | #27 | 3 Nov |
| Shewon | Remove products and competitor offers | #28, #30 | 3–4 Nov |
| Ilmam | Fix browser Back and Forward in the app | #29 | 4 Nov |

**Sprint goal result:** reached in code on `main`; client acceptance is recorded in section 3. A retailer signs in, adds a product, gets competitor offers from Amazon (discovery or extension), and sees price, currency, stock, source and time in their own workspace. Requirement status: [SRS](../requirements.md).

**Not finished, carried forward:** per-product check schedule, extension sending pages to the server, own price position, stale rule, `api.md` update for 5 new routes (Hirukshanan).

## 3. Sprint review

To be filled in by the team after the client demo and the sprint evaluation.

| Item | Record |
| --- | --- |
| Client demo date | |
| What was shown | |
| Client feedback | |
| Evidence of the client presentation | |
| Evaluation date and feedback | |

## 4. Retrospective

To be filled in by the team together.

| Question | Answers |
| --- | --- |
| What went well | |
| What did not go well | |
| One change for the next sprint | |

## 5. Actions before Sprint 2

- Close "RIV Sprint 1" in Jira and move unfinished tickets to Sprint 2.
- Fill in sections 3 and 4.
- Start `sprint-2.md` in this folder from the same headings.
