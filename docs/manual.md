# Riven core manual

Version 0.1 · 30 September 2026 · Working draft for team review

**Purpose:** give four beginner developers one shared direction and clear boundaries. This manual explains the current approach, not a promise of a perfect system. No architecture choice, assignment, test result, or source permission becomes approved merely because it appears here.

## 1. Read only what you need

Everyone reads sections 2–5 once. Before a task, read its member guide and the relevant contract/quality sections. Return to the rest when needed; memorising the manual is not a prerequisite for coding.

| Information | Authoritative location |
| --- | --- |
| Proposed product behaviour and quality | [Working SRS](requirements.md) |
| Original proposal context and differences | [Proposal reference](proposal.md) |
| Technical direction, interfaces, decisions, workflow | This manual |
| Whole-product scope and priorities | [Product backlog](backlog.md) |
| Current sprint outcome and integration checkpoints | [Sprint 1](sprint-1.md) |
| Step-by-step member instructions | [LaTeX sources and PDF handouts](guides/README.md) |
| Actual task owner, status, blocker, evidence | Jira; create items after account matching and owner agreement |
| Implementation and review | Git branches and pull requests |

Guides link to this manual; they do not redefine architecture. PDFs are dated snapshots. If a PDF disagrees with newer source, use the reviewed repository source and rebuild the PDF. A ticket is not Done because its guide exists.

## 2. Product and success

Riven helps retailers monitor selected competitor listings, compare prices and availability, inspect history, and receive alerts. A tenant is a retailer's separate workspace. The administrator manages the service. This is not a public shopping search engine or an automatic repricing system.

**Intended journey:** sign in → create a tracked product → link a competitor listing → collect → see price, currency, availability, source, time, and any uncertainty or failure.

The proposed final product includes two source platforms, periodic collection, product management, comparisons, history, alerts, subscription limits/mock billing, and administration. Keeping those in scope does not mean building them all in Sprint 1.

Success means the agreed features are useful to the client, behave correctly under agreed conditions, and can be demonstrated, explained, tested, deployed, and maintained by the team. “Enterprise-level” is an ambition, not a measured result. Do not promise unrestricted scraping, perfect accuracy, instant updates, or 24/7 service on sleeping laptops.

## 3. Current facts and boundaries

| Status | What we know |
| --- | --- |
| User decisions | Four members; TypeScript; Amazon first; six sprints; currently personal computers and no funded services. MVP lists competitors automatically for a chosen product (client, 10 Oct 2026); no mobile app. |
| Reported, not independently certified | Proposal submitted by the team. The preserved reference copy has blank signature fields. |
| Draft | Detailed requirements, technical stack below, sprint scope, quality thresholds, and capacity. |
| Unproven dependency | A suitable Amazon collection route, including intended retailer use and history retention. |
| Local reference only | Earlier React/Fastify/SQLite prototype and separate simulated frontend demo. Neither is accepted implementation for this start. |
| Tracking | Named responsibility areas are not actual Jira assignments. Existing remote history/issues have not been reset by creating these local documents. |

Never silently remove a proposal feature to simplify delivery. Record a client-approved scope change. Conversely, never treat an assistant recommendation as a new client requirement.

## 4. Ownership without silos

| Member | Intended area | First reviewer |
| --- | --- | --- |
| Dilsan | Screens, user flow, accessibility, frontend integration | Hirukshanan |
| Hirukshanan | HTTP API, accounts, tenant checks, data model/storage | Ilmam; Shewon reviews observation meanings |
| Shewon | Source access, collection adapter, observation quality, coordination | Hirukshanan |
| Ilmam | Reproducible setup, checks, job execution/recovery, integration | Hirukshanan; Shewon reviews source limits |

Owners implement, test, and explain their work. Reviewers help, not take over. Shewon coordinates blockers and client decisions; he is not responsible for completing everyone's code. Roles can be rebalanced when someone is blocked or overloaded. All four must eventually trace and run the complete journey.

## 5. Architecture: one application with understandable parts

```text
Retailer's browser
       | HTTP requests/responses
       v
API: verified account + catalogue + stored results
       |                         |
       v                         v
Database                  Collection job
                                 |
                                 v
                         Worker -> source adapter -> permitted source
                                 |
                                 v
                      Attempt/result saved in database
```

The browser displays data; it does not fetch competitor pages or decide which tenant owns data. The API validates requests and ownership. The database stores records. The worker performs slow collection. The adapter knows one source's data format; it does not write the database or render the UI.

**First learning checkpoint:** browser → one backend endpoint → explicitly synthetic observation. No accounts, persistence, or live collection are claimed at this checkpoint. This is a short integration exercise inside the same project, not a second product.

**Collection pipeline:** Fastify only enqueues a job (returns 202) → pg-boss worker → crawler → parse → validate → one database transaction. Every try writes an attempt; an observation is written only when it validates. The UI always reads the database, never a live site.

**Full first journey:** add accounts and persistence; store a collection job; run it outside the dashboard request; save an observation or failed attempt; display the last result. No microservices, message-broker cluster, Kubernetes, or data warehouse is needed.

### Proposed working layout (create folders when used)

```text
web/                  React screens and API calls
server/               HTTP endpoints and application rules
server/collection/    Adapter contract, validation, worker entry point
server/data/          Database access and reviewed migrations
shared/               Only genuinely shared request/response definitions
tests/                Tests and clearly synthetic fixtures
docs/                 Manual, requirements, backlog, guides
```

## 6. Technology decisions: recommended starting baseline

These are **recommendations pending the first setup check and team agreement**, except TypeScript. Do not reopen the entire comparison for every task. Record acceptance or a concrete blocker in the short decision record below. Resolve a component before work depends on it.

| Choice | Recommendation and reason | Alternative/tradeoff | Needed when |
| --- | --- | --- | --- |
| Language | TypeScript, selected by user; shared vocabulary for page and server | Types still require runtime input checks | Now |
| Runtime/package tool | Node.js 24 LTS + npm; one lockfile and consistent commands | Earlier UI demo used Bun, not a whole-project commitment; do not mix lockfiles | First setup |
| Frontend | React + Vite; small client-side app | Next.js adds server/framework concepts not required by this dashboard checkpoint | First page |
| Backend | Fastify; small explicit HTTP endpoints and validation | Express is also viable; switching without a concrete reason creates churn | First endpoint |
| Persistence | PostgreSQL with reviewed SQL migrations and a small database-access module | SQLite is easier for experiments, but avoid adopting it only because old prototype code exists | Before persistence |
| Authentication | Evaluate Better Auth with the chosen database; use maintained sessions | Custom password/session code adds security maintenance; hosted auth adds service dependency | Before account work |
| Jobs | pg-boss on the same PostgreSQL; separate worker process runs one short-lived crawler per job | In-memory timers are not recovery; a custom durable queue has lease/retry complexity | Before persistent collection |
| Collection | Crawlee 3.x (pinned ^3.18): CheerioCrawler (HTTP + HTML) by default; PlaywrightCrawler only for sources whose data needs JavaScript; one shared parseOffer() per source | Plain Playwright lacks queue/retries/rate limits; Crawlee v4 still a release candidate | Before collection work |
| Source | Amazon product pages, test phase: low volume, team-seeded URLs, manual trigger, no retries. books.toscrape.com was the Sprint 1 checkpoint source only | After testing completes for all sites, the collection method moves to a production route | Now |
| Styling/testing | Plain CSS initially; Node tests for backend; add UI tests as behaviour exists | No new design-system framework or test stack just for completeness | As code appears |

No exact package-version compatibility has been verified for this fresh start. Ilmam verifies supported compatible releases, records the runtime, commits one lockfile, and reproduces setup on a second computer. Do not copy old dependency pins blindly. Drizzle, Tailwind, global state/query libraries, OpenAPI generation, and database row policies are not prerequisites for the first sample flow. Reconsider them for a demonstrated need; application tenant checks remain mandatory.

### Decision record format

For a consequential choice, append one short row here (or a small linked note if necessary):

`date | question | choice/status | why and tradeoff | evidence | affected members | revisit trigger`

Current baseline: **30 September 2026 | simplify earlier architecture | proposed above | preserve quality, stage learning and dependencies | setup/auth/queue trials still needed | all four | trial fails or requirement changes**.

Decisions since the baseline:

- **10 October 2026 | MVP competitor flow** | Retailer signs in, picks or searches a product; Riven lists competitor offers automatically. No manual competitor selection in the MVP | Client decision after proposal evaluation; retailers should not have to know every competitor | Client meeting reported by Shewon, 10 Oct 2026 | all four | client changes scope
- **10 October 2026 | Collection tool** | Crawlee with Cheerio default, Playwright where needed | Client approved Playwright/Crawlee; TypeScript fit; built-in queue, retries and politeness | reports/Scraping method for Riven (research, 10 Oct) | Shewon, Hirukshanan | a source needs a capability Crawlee lacks
- **10 October 2026 | Collection pipeline** | Fastify enqueues, pg-boss worker collects, PostgreSQL stores | Keeps slow scraping out of web requests; one store; retries and scheduling built in | Scraping method research, 10 Oct | Shewon, Hirukshanan, Ilmam | pg-boss trial fails
- **10 October 2026 | Primary source** | Amazon in a test phase; method changed for production after testing completes; books.toscrape retired after the Sprint 1 checkpoint | Client approved Playwright/Crawlee collection | Client meeting, 10 Oct 2026 | all four | testing completes or a source blocks
- **10 October 2026 | Product matching** | Identifier first, then conflict check, then title similarity as unverified, then retailer confirm/reject | Titles alone are unreliable; keeps the human in control of comparisons | Scraping method research, 10 Oct | Shewon, Hirukshanan, Dilsan | match accuracy is poor in testing

Routine CSS changes or function names need no architecture decision record. Shared interfaces require the affected owners' review. Source, paid-service, or product-scope changes require coordinator/client involvement.

## 7. Shared data meanings and first interface

A **product** is what the retailer wants to track. A **monitor/listing** links it to a specific competitor offer. An **attempt** records trying to collect. An **observation** records the values actually obtained. A failed attempt must not erase an earlier valid observation.

The first proposed endpoint is `GET /api/v1/demo-observation`. It returns synthetic data only; it must never become an unauthenticated endpoint for real retailer records. Agree this example before the UI and API diverge:

```json
{
  "mode": "synthetic",
  "productName": "Sample wired mouse",
  "price": "19.99",
  "currency": "GBP",
  "availability": "in_stock",
  "source": "Synthetic fixture (not Amazon)",
  "observedAt": "2026-09-30T00:00:00Z",
  "matchStatus": "unverified"
}
```

`mode` says where the values came from: `synthetic` means fixture values written by the team (never collected); `practice` means values actually fetched from the practice site (`books.toscrape.com`, see the [source access decision](source-access-decision.md)). Neither is a live competitor observation. A future live mode is added only when a permitted commercial source passes the access gate.

This timestamp is an example, not evidence of collection. `price` may be `null`; missing price is not zero. Use a decimal string plus currency; do not use binary floating-point for price calculations. Availability is `in_stock`, `out_of_stock`, or `unknown`; it is not stock quantity. Match status is `confirmed`, `unverified`, or `mismatch`. The UI must not imply comparison validity for unverified matches.

**Matching order:** (1) same product identifier (GTIN/EAN/UPC, ASIN, or brand + model number) → `confirmed`; a different identifier → `mismatch`. (2) Conflicting model or pack-size details → `mismatch`. (3) Similar title only → `unverified`. (4) The retailer confirms (→ `confirmed`) or rejects (→ `mismatch`). A title match alone never sets `confirmed`.

For the full journey, B/C/D extend the contract together with product/monitor IDs, source URL, attempt status, seller/variant/delivery context, last attempt and last successful observation. Dilsan reviews what the UI needs. Do not silently change field names or types. Define each real endpoint's request, response, error, and ownership check before wiring it.

Suggested error shape: `{ "code": "SOURCE_UNAVAILABLE", "message": "Collection failed; previous result retained." }`. User-facing errors are safe summaries, not raw upstream HTML or credentials. Use appropriate HTTP statuses and keep them consistent.

Source adapter boundary: validated listing/context in → candidate observation or classified failure out. The adapter must work with synthetic test inputs without network access. The worker owns persistence and job status, not the parser.

## 8. Quality rules applied at the relevant step

- **Accounts (NFR-01):** derive tenant identity from a verified session, never a browser-supplied tenant ID. Check ownership for every affected read, write, and job. Test two accounts and signed-out access. Secure cookies/HTTPS and production auth review precede remote deployment.
- **Persistence (FR-06, NFR-08):** tenant-owned records, migrations, correct money/currency storage, and separately recorded attempts. Check backup restoration in a separate test database when storage exists.
- **Collection (NFR-02/05):** allowed sources only, validated URLs/destinations, timeouts, bounded work, no bypass of controls. Preserve unknowns and validate variant/offer context. No blind automatic retries on access denial.
- **Jobs (NFR-02):** persisted work, controlled concurrency, no duplicate accepted observation for the same run, recovery after interruption. Result storage and job acknowledgement must tolerate retry; library selection alone does not prove this.
- **Display (NFR-04/06):** loading, empty, unknown, uncertain-match, pending, failed, and stale states are distinct. Display source/currency/time. Keyboard operation and clear labels are part of the delivered screens.
- **Maintainability (NFR-07/10):** separate changing source details from product rules and UI. Share only small contracts; avoid generic frameworks built for imagined future needs.
- **Performance/operation (NFR-03/09/11):** keep collection off dashboard requests, bound work, and record useful safe errors. Agree workload/targets and measure later; no enterprise-scale claim from a single local demo.

### Principles in plain language

SOLID is guidance, not a demand for classes everywhere. Give each module one clear job; add a source behind the same small adapter contract; make synthetic and live adapters honour the same meanings; avoid giant all-purpose interfaces; pass dependencies so tests can substitute a source or clock. Use ordinary functions where sufficient.

Do not solve tenant safety by hiding buttons. Do not solve uncertainty by guessing prices. Do not solve future scale by adding services before measurements.

## 9. Feasibility and escalation

Amazon is the first intended source, not a proven route. Earlier evidence and official links are in the SRS; the current access gate and first alternative candidate are in the [source access decision](source-access-decision.md). Recheck applicable access, permitted purpose, retention, sharing, quotas, and client credentials without putting secrets in chat, code, or public records.

Shewon time-boxes the initial investigation to two working days after starting. A supported verdict needs access/use evidence and field-level sample checks where permitted. If unresolved, report **blocked** and ask the client for access or an explicit source/scope decision. A scraper repository, an API key, or successful HTTP response does not establish product suitability.

Test phase (team decision, 10 Oct 2026): Amazon collection uses no sign-in and no retries; a blocked response is recorded as `blocked` and collection stops. The demo falls back to a dated snapshot of earlier results. After testing completes for all sites, the method is changed for production.

Independent page/API work proceeds with synthetic data. Never call it an Amazon connector demonstration. A short evidence note with references, observed results, limits, and reviewer is enough; no empty success report.

Other escalation triggers: another member cannot reproduce setup; a shared interface changes; a task is stuck after a focused attempt; full sprint scope is not credible before evaluation; hosting remains unavailable. Raise these early rather than silently switching tools or having the coordinator finish everyone's work.

## 10. Jira, GitHub, learning, and change

Documentation in repositories is normal professional practice: it keeps design and usage guidance beside the code it describes. Jira and repository documents have different jobs. Do not duplicate live status in PDFs.

1. Match member accounts; owner agrees a small deliverable. A guide label is not a Jira key.
2. Create one current Jira task per member. Include result, relevant requirement/backlog IDs, checks, reviewer, dependencies, and link to the guide. Use subtasks only if they help; the guide's steps need not each be tickets.
3. Branch with an actual key, e.g. `feature/RIV-12-result-card`. Write a simple accurate commit message. Never invent past dates or another member's authorship.
4. Owner explains the task, plans a small change, implements and runs checks. AI can teach and review; it must not autonomously complete the member's submission.
5. Integrate early with the dependent member. Open a focused PR with actual command/results, limitations, and material AI assistance.
6. Another member reviews and hears the explanation. Merge with human approval; verify integration; then mark the task Done. A review-pending task remains In Progress.

Daily update: result, next step, blocker. No separate daily essay. Each PR answers: what changed, why, how checked, what remains. Client reviews validate usefulness; tests verify behaviour. Both matter.

Changes to this manual should state the reason and impacted tasks. A new requirement is a backlog decision, not something a member or AI silently adds. The manual is a current agreement to improve, not a guarantee that no unforeseen problem will occur.

## 11. Final-product perspective without building it all now

Six sprints remain the supplied delivery structure. The high-level forecast is: S1 first journey; S2 repeat collection/second source; S3 comparisons/history; S4 alerts; S5 tiers/admin; S6 release and validation. This is a forecast, not six approved commitments. Refine at each sprint review.

Preserve tenant ownership, trustworthy observation meanings, replaceable source code, and testable boundaries now. Add later feature machinery when that feature is selected. Before release, verify agreed source accuracy, authorization, resource limits, recovery, real deployment, user instructions, and handover. Personal-computer testing alone does not prove hosted operation.

Module evidence includes requirements/design, real commits and checks, contribution explanations, feedback, retrospectives, and final demonstration/report. Confirm current instructor submission rules; the old schedule's module code differs from the EC5406 sheet.

## 12. Provenance and first action

This manual condenses the archived proposal, FR/NFR/PB documents, ADR-001–008, quality targets, source strategy, team guide, and sprint task pack. The full archive is private and retained by the coordinator; it is not required reading for each task. The simplification deliberately removes duplicated task-number systems and mandatory future infrastructure, not the final product scope.

**First action:** all four review the goal, sample response, intended responsibilities, and the minimum Node/React/Fastify setup recommendation. Record agreement or a specific blocker once. Then begin the first working slice in each guide. Database/auth/queue decisions are resolved before their dependent slices, not before drawing the first screen.
