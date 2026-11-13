# Software requirements specification (SRS)

**Riven** · Version 1.1 · 13 November 2026 · Owner: Shewon · Status: approved by the client, 4 Nov 2026; values in 1.1 agreed by the client, 12 Nov 2026

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 30 Sep 2026 | Working draft from the proposal. |
| 1.0 | 4 Nov 2026 | Rewritten for the current product: client decisions of 10 Oct, extension route of 12 Oct, one collection pipeline and competitor-practice review of 4 Nov. Requirement IDs kept from 0.1. Approved by the client at the 4 Nov demo. |
| 1.1 | 13 Nov 2026 | Open decisions settled (section 7): check interval, stale threshold, alerts, tiers, eBay as second platform. Public sign-up added to FR-01. Agreed by the client with the Sprint 2 plan, 12 Nov. |

## 1. Introduction

### 1.1 Purpose

This SRS states what Riven must do and how well. How it is built is in the [design document](design.md). Live task status is in Jira, not here.

### 1.2 Product scope

Riven helps small online retailers watch competitor prices and availability for their own products. The retailer adds a product, Riven finds competitor offers, checks them again over time, and shows every value with its source and collection time. The retailer decides prices; Riven never reprices automatically.

**Out of scope:** automatic repricing, a public shopping-comparison site, a mobile app (client, 10 Oct 2026), coupons or affiliate links, paid data providers.

### 1.3 Definitions

| Term | Meaning |
| --- | --- |
| Retailer | A shop owner with a private workspace (tenant). |
| Product | An item the retailer sells and wants to track. |
| Offer | One competitor's listing of a product on a platform. |
| Platform | A marketplace Riven can collect from, such as Amazon. |
| Attempt | One try at collecting an offer, successful or not: `ok`, `blocked` or `failed`. |
| Observation | Values actually collected in a successful attempt: price, currency, availability, seller, time. |
| Match status | Whether an offer is the same product: `confirmed`, `unverified` or `mismatch`. |
| Fetcher | How a page reaches Riven: the **server crawler** fetches it, or the **Riven extension** sends a page the retailer opened. |

### 1.4 References

[Proposal](proposal.md) · [Product brief](../PRODUCT.md) · [Product backlog](backlog.md) · [Core manual](manual.md) · [Source access decision](source-access-decision.md) · [API](api.md) · [Database](database.md)

## 2. Overall description

### 2.1 Users

| User | Needs | Status |
| --- | --- | --- |
| Retailer | Track own products against competitors without visiting each site. | Built |
| Administrator | Manage retailer accounts and see collection health. | Planned |

### 2.2 Product workflow

1. The retailer signs in to their own workspace.
2. The retailer adds a product (name, brand, and an identifier such as an ASIN if known).
3. Riven searches the supported platforms and lists candidate competitor offers.
4. Riven matches each offer: identifier first, then conflicting details, then title. A title-only match stays `unverified`. The retailer confirms or rejects.
5. Riven checks confirmed offers again: the server crawler on a schedule for sites that allow it, and the extension when the retailer views a page on a site that blocks servers.
6. Every check saves an attempt. A valid result also saves an observation. A failed check never erases earlier observations.
7. The dashboard shows offers, price history and the retailer's own price position, with source and time, and marks unknown, unverified, stale and failed values.
8. The retailer is alerted when an agreed condition is met (planned).

### 2.3 Operating environment

A web app in current desktop and mobile browsers, a Chrome extension, and a server with PostgreSQL. It runs at https://riven.sbs (public landing page) and https://riven.sbs/app (the app).

### 2.4 Constraints

- TypeScript throughout; Node.js 24, PostgreSQL. No paid services without client agreement.
- When a page needs it, collection may use AI-assisted page reading or a proxy for a specific region. Both are optional and off by default.
- Delivered in six three-week sprints.

### 2.5 Assumptions and dependencies

- **Amazon:** Amazon's Conditions of Use forbid automated collection. The team decided on 10 Oct 2026 to collect from Amazon for testing only during the academic project, as a risk it accepts, not a permitted use. Server requests to Amazon were refused in the 12 Oct live check, so Amazon pages come through the extension. Production use needs a legal route. Details: [source access decision](source-access-decision.md).
- **Second platform: eBay** (chosen 11 Nov 2026). eBay's User Agreement forbids automated collection without permission, and the eBay Browse API account was rejected on 3 Oct 2026, so the Riven extension collects them in the retailer's own Chrome: when the retailer clicks Fetch, and on schedule in the background while Chrome is open (decided 13 Nov 2026; [source access decision](source-access-decision.md)).

## 3. Functional requirements

Priority uses MoSCoW (Must, Should, Could), approved by the client on 4 Nov 2026. Status describes code on `main` at commit `05d6100`; **Built** means the code exists, not that it passed acceptance.

### FR-01 Accounts · Must · Built (retailer), Planned (administrator)

As a retailer, I want to sign in and out of my own workspace, so that my data stays private.

- A signed-out user cannot read or change any retailer data.
- Signing out ends the session.
- A retailer can sign up without help from the team. *(Planned, Sprint 2; today accounts are created by the team)*
- An administrator role exists, separate from retailers. *(Planned)*

### FR-02 Products · Must · Partial

As a retailer, I want to add, view, edit and remove my products, so that Riven tracks what I sell.

- Add needs a name; brand and identifier are optional. *(Built)*
- Removing a product removes its offers from the workspace. *(Built)*
- Editing a product's name, brand or identifier. *(Planned)*
- The number of products is limited by the retailer's tier (FR-09). *(Planned)*

### FR-03 Competitor discovery · Must · Built (Amazon)

As a retailer, I want Riven to find competitor offers for my product, so that I do not search each site myself.

- Riven searches each supported platform and lists up to 5 candidate offers per product.
- Repeated discovery does not add duplicate offers.
- Adding a competitor manually is future scope (section 6).

### FR-04 Matching · Must · Built

As a retailer, I want to know whether an offer is really my product, so that I compare like with like.

- Same identifier → `confirmed`; a different identifier, or a conflicting model number or pack size → `mismatch`; similar title only → `unverified`.
- A title match alone never sets `confirmed`.
- The retailer can confirm, reject or remove an offer.
- An offer priced more than 40% away from the product's other confirmed offers cannot be confirmed automatically. *(Planned)*

### FR-05 Collection · Must · Partial

As a retailer, I want competitor offers checked again over time, so that I see current prices.

- One collection pipeline with two fetchers, the server crawler and the extension, using the same parsing and saving rules. *(Built: one save path; the extension still parses pages itself)*
- The server crawler checks offers on sites that allow server requests, at a set interval. *(Built: one interval for all products, off by default)*
- Each product is checked every 6 hours by default and can be set to 6 h, 12 h or 24 h, or paused. *(Planned; per-product intervals approved 4 Nov, 6 h default agreed 12 Nov 2026)*
- On sites that block servers (Amazon, eBay), the extension collects: it sends the page the retailer is viewing or fetches, and, while Chrome is open, checks that retailer's due offers in the background. The server parses every page. *(Planned; today the extension parses, and Fetch is manual)*
- The screen says how each platform is updated, for example "Amazon: updated when you view it". *(Planned)*

### FR-06 History · Must · Built

As a retailer, I want past observations kept, so that I can see how prices changed.

- Every attempt is stored with time, platform, status and reason.
- An observation is stored only when it passes validation (NFR-05).
- A failed attempt never deletes or overwrites an earlier observation.
- An observation identical to the previous one within 6 hours is not stored again; the attempt still is. *(Planned)*

### FR-07 Comparison and charts · Must · Partial

As a retailer, I want to compare offers and see price history, so that I can decide my own price.

- Each value shows source, currency and collection time. *(Built)*
- The product detail screen shows price history. *(Built)*
- The retailer's own price per product. *(Built, PR #33)*
- The retailer's position against competitors: cheapest, in the middle or most expensive. *(Planned, Sprint 2)*

### FR-08 Alerts · Should · Planned

As a retailer, I want to be told when a competitor's price or stock changes in a way I care about, so that I do not have to keep checking.

- Conditions: a competitor price falls below my price; a competitor price changes by 5% or more; stock changes (in or out of stock).
- Channel: in-app first, then email.
- The same event does not alert twice.

### FR-09 Tiers and limits · Should · Planned

As a retailer, I want a plan that fits my shop, so that I pay for what I use.

- Tiers set product limits and the shortest check interval. Billing is mocked.
- Free: 10 products, 6 h. Pro: $19/month, 100 products, 6 h. Business: $49/month, 500 products, 3 h.

### FR-10 Administration · Should · Planned

As an administrator, I want to manage retailers and see collection health, so that I keep the service working.

- Account list, and collection success and failure rates per platform.
- Only the administrator role can open these views.

### FR-11 Honest states · Must · Partial

As a retailer, I want failures and old data marked clearly, so that I never act on a wrong value.

- Missing price, unknown stock, unverified match, failed attempt and stale data each look different. *(Partly built)*
- An offer with no successful check for 12 hours is marked stale. *(Planned; agreed 12 Nov 2026)*

## 4. Non-functional requirements

| ID | Requirement | Status |
| --- | --- | --- |
| NFR-01 | **Security:** one retailer can never read or change another's data. Tenant identity comes from the verified session, never from the browser. Public listing readings (price, stock, seller) are shared between retailers; which listings a retailer tracks, their decisions and their own prices are never shared. Checked with two accounts. | Built; integration test in `server/auth.integration.test.ts` |
| NFR-02 | **Reliability:** a failed collection never stops the dashboard or other collection. No retry after `blocked`; at most 3 tries after network errors; at least 10 seconds between requests to the same site. | Partial |
| NFR-03 | **Performance:** collection never runs inside a dashboard request. Proposed target: dashboard loads within 3 seconds for 10 concurrent users, measured on synthetic data. | Partial; target not measured |
| NFR-04 | **Freshness:** every value shows when it was collected; stale values are marked (FR-11). | Partial |
| NFR-05 | **Data accuracy:** price is a decimal string with a currency, or `null`. Missing price is not zero; unknown stock is not out of stock. A price of 0, or under 10% of the last good price, is recorded as a failed attempt with reason "suspect price", not as an observation. | Partial; suspect-price rule planned |
| NFR-06 | **Usability:** main tasks work with the keyboard, have clear labels and readable contrast, and work on narrow screens. | Partial |
| NFR-07 | **Maintainability:** UI, business rules, storage and site-specific collection stay in separate parts, each with tests. | Built |
| NFR-08 | **Recoverability:** a database backup is restored into a separate test database and checked. | Planned |
| NFR-09 | **Capacity:** bounded queries and collection concurrency for an agreed pilot workload, measured on synthetic data. External sites are never load-tested. | Planned |
| NFR-10 | **Extensibility:** adding a platform means adding its site rules and tests, with no change to accounts, matching or dashboard code. | Planned |
| NFR-11 | **Diagnosability:** each failed attempt records a safe reason. A page that could not be parsed is kept as a test fixture, with personal data removed. | Partial |
| NFR-12 | **Privacy:** pages sent by the extension are parsed and then discarded. Only offer fields are stored. Personal data on a page (name, address) is never stored. | Planned |

## 5. Acceptance and evidence

Each delivered feature is checked against its FR acceptance criteria and relevant NFRs. Results are recorded in the pull request, and later in the test plan. A check that was not run is never reported as passed.

## 6. Future scope (not requirements yet)

| Idea | Source | Needed before it becomes a requirement |
| --- | --- | --- |
| Shoppers track favourite products' prices | Client mentioned "B2C" later phases (10 Oct) | Client decision; separate account type and tiers |
| Retailer adds a competitor manually from the extension | Proposal evaluation feedback (9 Oct) | Client decision; fits FR-03 |

## 7. Open decisions

Settled on 12 Nov 2026 (team proposal of 11 Nov, agreed by the client): default check interval 6 h (FR-05), alert conditions and channel (FR-08), tier limits and prices (FR-09), stale threshold 12 h (FR-11), eBay as second platform (FR-03). eBay route, 13 Nov: collected by the extension in the retailer's browser, on request and on schedule (FR-05).

| Decision | Needed for | Decides |
| --- | --- | --- |
| Whether the extension sends the whole page or only the offer fields | FR-05, NFR-12 | Team |

## 8. Traceability

| FR / NFR | Backlog item |
| --- | --- |
| FR-01, NFR-01 | PB-04 |
| FR-02, FR-03, FR-04 | PB-05 |
| FR-05, FR-06, FR-11, NFR-02, NFR-05, NFR-10–12 | PB-06 |
| FR-07, NFR-04 | PB-07, PB-11 |
| FR-08 | PB-08 |
| FR-09 | PB-09 |
| FR-10 | PB-10 |
| NFR-03, NFR-06–09 | PB-12 |
