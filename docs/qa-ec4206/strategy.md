# EC4206 Role A - Scope and System Map

Status: Draft for Ilmam and group review
Owner: Ilmam (Role A)
Prepared: 15 November 2026 (Asia/Colombo)
Last updated: 20 November 2026 (Asia/Colombo)
Repository baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`
Branch: `qa/ec4206-role-a`

## 1. Purpose

This note defines the proposed EC4206 testing scope for Riven without changing the approved product scope. It establishes the Role A baseline for the later test-plan supplement, STLC map, black-box technique evidence, manual cases, and traceability matrix.

Built behavior, partially built behavior, and Sprint 2 plans are kept separate. A requirement marked Built in an older document is not treated as verified until it is checked against the current commit and executed evidence.

## 2. EC4206 role roster

| Role | Member / group label | EC4206 ownership |
|---|---|---|
| A | Ilmam | Scope, test planning, STLC, black-box design, manual cases, and traceability |
| B | Sanjeew Shewon UoR FoE | White-box testing, unit tests, TDD/BDD, and measured coverage |
| C | Hirukshanan UoR Eng(Ampara)2 | Test automation and CI/CD evidence |
| D | Dilsan UoR FoE | Nonfunctional testing, defects, metrics, RCA, and quality closure |

The EC4206 poll roles do not replace the product ownership recorded in `docs/manual.md`.

## 3. Proposed common scope

### 3.1 Scope rationale in Ilmam's words

A1 should produce the poll/name-to-role roster, a common EC4206 scope, and a separate test environment. The three selected flows cover Riven's end-to-end retailer journey: secure account access, creating and discovering products, and evaluating competitor offers over time. Together they provide high-risk and observable behavior suitable for equivalence partitioning, boundary analysis, decision tables, manual testing, automation, and traceability while remaining small enough for the assignment deadline.

### 3.2 Selected flows

| Scope ID | Flow | Existing requirement IDs | Why selected |
|---|---|---|---|
| `SCP-AUTH` | Sign-in and tenant isolation | `FR-01`, `NFR-01` | Authentication is the entry to every retailer function, and tenant isolation protects one retailer's data from another. It supports positive, negative, session, origin, rate-limit, and two-account cases. |
| `SCP-PROD` | Product creation and competitor discovery | `FR-02`, `FR-03` | This is the central retailer workflow. It contains required/optional inputs, URL versus manual-name alternatives, length/format rules, ownership checks, duplicate prevention, and the five-offer cap. |
| `SCP-OFFER` | Offer matching and price history | `FR-04`, `FR-06`, `FR-07`, `FR-11`, `NFR-05` | Matching has clear multi-condition outcomes (`confirmed`, `unverified`, `mismatch`), while history tests attempts, observations, unknown values, failed checks, source, currency, and time. |

### 3.3 In scope

- Current built behavior for the three selected flows at the recorded baseline commit.
- Relevant UI, API, session, PostgreSQL, matching, attempt, and observation behavior.
- Functional suitability, tenant security, data accuracy, reliability, and user-visible honest states.
- Black-box equivalence partitions for two or three real inputs.
- Boundary values drawn from implemented limits or approved requirements.
- One decision table for matching or authenticated access behavior.
- Manual cases, traceability, and evidence fields that Roles B, C, and D can extend.
- Synthetic local data and saved marketplace fixtures only.

### 3.4 Out of scope

- Product tiers, alerts, administrator features, public sign-up, and other requirements still planned for later sprints.
- Full second-platform/eBay validation until the behavior exists on the tested commit.
- Live marketplace load testing, access-control bypass, CAPTCHA bypass, or claims based on synthetic fixtures about live collection.
- Product implementation work owned by the Riven team; this workstream tests and documents the selected behavior.
- Exhaustive device/browser compatibility, full production validation, or automatic repricing.

## 4. Built versus planned baseline

The repository documents describe different historical commits, so current code observations must be recorded as explicit differences rather than silently rewriting approved documents.

| Area | Approved/historical document statement | Current commit observation | EC4206 treatment |
|---|---|---|---|
| Product editing | SRS `FR-02` describes editing as Planned. | `PATCH /api/v1/products/:id`, `ProductEditSchema`, `api.updateProduct`, and an Edit product UI exist. | Treat as current implemented code that needs verification; record the document difference. |
| Retailer's own price | Test plan coverage says own price is not built; SRS v1.1 says it is Built in PR #33. | Product edit accepts `ownPrice`/`ownCurrency`, and the competitors screen displays the retailer's price. | Use the current code/SRS status for testing and flag the older test-plan gap statement for review. |
| Sign-in UI | Setup verification for an older commit says visible sign-in inputs were intentionally disabled. | Current `SignIn.tsx` contains enabled required email/password inputs and submit handling. | Verify actual current runtime behavior before claiming the browser flow passes. |
| Matching price-gap guard | SRS/test plan mark the 40% automatic-confirmation guard as Planned. | `matching.ts` implements identifier, model, pack-size, and title rules but no price-gap rule. | Exclude the guard from current execution or mark it Not Implemented; do not test it as built. |
| History skip-unchanged rule | SRS/test plan mark identical values within six hours as Planned. | The current save path inserts observations without that guard. | Exclude from current expected behavior; retain as a planned-gap traceability row if useful. |
| Stale threshold | SRS says 12 hours is agreed but Planned. | Current selected code does not establish the complete stale rule. | Do not claim current stale behavior without further code/runtime evidence. |

## 5. Component and data-flow map

### 5.1 Account and tenant isolation

```text
SignIn.tsx
  -> web/riven-api.ts POST /api/v1/auth/sign-in
  -> server/auth.ts / Better Auth
  -> PostgreSQL user + session + retailer
  -> HttpOnly session cookie
  -> protected Fastify preHandler derives retailer identity
  -> retailer-scoped product/observation queries
```

The browser never chooses the active retailer. Protected routes derive it from the verified session.

### 5.2 Product creation and discovery

```text
AddProduct.tsx
  -> riven-api createProduct
  -> server/products.ts validation
  -> products table for the session retailer
  -> optional discovery route
  -> server/discovery.ts search/match/cap logic
  -> observations + attempts
  -> Search/Competitors screens
```

Manual entry and Amazon-link entry are alternative input paths. Automated tests must use fixtures or controlled test doubles rather than contacting a live marketplace.

### 5.3 Matching and history

```text
extension/crawler input
  -> server observations/page route
  -> parse + validate
  -> server/matching.ts
  -> server/save-observation.ts
  -> attempts always; observation only for valid data
  -> Competitors.tsx / Detail.tsx
```

Important data meanings: money is a decimal string plus currency; missing price is `null`, not zero; unknown stock is distinct from out of stock; matching remains cautious.

## 6. Separate test environment

| Item | Proposed EC4206 environment | Current readiness |
|---|---|---|
| Host | Local Windows 11 64-bit development machine | Tool versions observed; exact Windows edition/build still to record. |
| Source | Riven commit `29af23787b9de37d65f3ed00d30297e4f67185b3` | Verified against GitHub `main` on 15 Nov. |
| Runtime | Node `v24.20.0`, npm `11.19.0` | Observed and compatible with repository requirements. |
| Containers | Docker `29.8.2`, Compose `5.5.1` | Observed. |
| Database | PostgreSQL 18 `riven_test`, separate from development and production | Planned; `.env` is not configured and the service is not running. |
| Accounts/data | Synthetic Alpha/Beta retailers and test-created records | Seed design exists; local private seed password is still required. |
| API/UI | Fastify `127.0.0.1:3000`, Vite `127.0.0.1:5173` | Not started. |
| External sources | Saved HTML fixtures or a controlled local test server | Required; automated tests must not contact live marketplaces. |
| Browser | Current desktop Chrome for manual UI/extension checks | Version and extension setup still to record. |
| Evidence | Sanitized command logs, screenshots, commit, date, expected/actual result | Final repository path/convention still to confirm. |

Environment execution is not yet complete: `node_modules` and `.env` are absent, and Docker Compose correctly refuses to start without the required private values.

Remote freshness note: the baseline matched GitHub `main` on 15 November. A 17 November check failed because `github.com` could not be resolved. A successful `git fetch origin --prune` on 20 November confirmed that `origin/main` still pointed to `29af23787b9de37d65f3ed00d30297e4f67185b3` before the 20 November execution evidence was reconciled.

## 7. Initial risks

| Risk ID | Risk | Response |
|---|---|---|
| `RA-01` | Group members use different scope or requirement IDs. | Circulate this draft and freeze IDs after explicit group review. |
| `RA-02` | Historical documents are mistaken for current implementation status. | Cite the tested commit and record built/planned differences explicitly. |
| `RA-03` | Tests accidentally contact Amazon/eBay or overstate fixture evidence. | Use saved fixtures/local doubles; state that fixtures do not prove live collection. |
| `RA-04` | Test data crosses retailer boundaries or reaches production. | Use isolated `riven_test`, synthetic accounts, and session-derived tenant checks. |
| `RA-05` | Environment setup is incomplete or unreproducible. | Record versions, private configuration steps, seed/reset procedure, and actual smoke results. |
| `RA-06` | The assignment deadline leaves insufficient integration time. | Freeze A1 on 15 Nov, share IDs immediately, and reserve 23 Nov for reconciliation/review. |

## 8. Coordination and status tracking

For this EC4206 workstream, Ilmam directed on 15 November that Jira will not be used. Work will be tracked through the Role A branch, commits, pull request, this document, the traceability matrix, and group messages. This is a workstream-specific coordination choice and does not rewrite Riven's main team handbook.

## 9. A1 completion gate

A1 remains Draft until the following are observed:

- Ilmam reviews and can explain the scope, rationale, built/planned distinctions, and component paths.
- Sanjeew, Hirukshanan, and Dilsan approve or amend the common scope and ID convention.
- The separate environment owner and configuration are confirmed.
- The environment records real smoke-check results or is honestly marked not ready.
- The intended evidence location is agreed.

No test execution, group approval, push, PR, or environment readiness is claimed by this draft. A local planning commit records the review copy only.
