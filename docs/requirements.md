# Working software requirements specification (SRS)

Draft for team and client review. Simplified from the earlier proposal and requirements; not a new claim of client approval.

## Problem and users

Retailers repeatedly check competitor listings by hand. Riven should help them see prices, availability, and changes in one place. Each retailer has a separate workspace. An administrator oversees the service. Retailers make their own pricing decisions.

## Proposed final product

These retain the earlier requirement IDs. The [product backlog](backlog.md) maps them to deliverables; the [core manual](manual.md) defines the proposed implementation approach. This is a working SRS, not a claim of a formally approved or submission-ready specification.

| ID | Requirement |
| --- | --- |
| FR-01 | Retailers sign in and out; administrators have a separate role. |
| FR-02 | Retailers add, view, edit, and remove their tracked products within agreed limits. |
| FR-03 | Products link to competitor listings on two agreed platforms. Amazon is intended first; the second is undecided. |
| FR-04 | Check product and variant correspondence; show uncertainty rather than claiming a match. |
| FR-05 | Collect price, availability, and available offers periodically at agreed intervals. |
| FR-06 | Keep timestamped observations and history where the source permits retention. |
| FR-07 | Show comparisons and historical charts with source, currency, and collection time. |
| FR-08 | Notify retailers when agreed monitoring conditions are met. |
| FR-09 | Support subscription tiers and tracking limits; mock billing is acceptable. |
| FR-10 | Give administrators agreed account and collection-management views. |
| FR-11 | Show collection failures, unavailable data, and outdated observations clearly. |

Two platforms, charts, alerts, tiers, and administration remain proposed final scope. They are not all needed for the first learning checkpoint. Scope changes need a recorded client decision, not a silent deletion from the plan.

## Quality requirements

| ID | Meaning |
| --- | --- |
| NFR-01 | Keep accounts secure; one retailer must not access another's data. Test this when account/data features are built. |
| NFR-02 | A collection failure must not stop the dashboard or unrelated work; record failures and control retries. |
| NFR-03 | Keep the application responsive; slow collection must not block dashboard requests. Agree and measure performance targets later. |
| NFR-04 | Show when data was collected and mark it stale using an agreed rule. |
| NFR-05 | Verify price, currency, product/variant, and availability. Missing price is not zero; unknown stock is not out of stock. |
| NFR-06 | Make the main retailer tasks clear and check them with the client. |
| NFR-07 | Keep UI, business logic, storage, and source-specific collection understandable and separate. Test relevant changes. |
| NFR-08 | Document and test backup/restore as persistent storage is introduced. |

The following retain the earlier additional proposals. Their numerical targets have not been agreed or measured.

| ID | Proposed quality expectation |
| --- | --- |
| NFR-09 | Handle an agreed pilot workload with bounded queries and collection concurrency; measure on synthetic data, never load-test external sources. |
| NFR-10 | Add/replace a source without rewriting accounts or dashboard rules; review schema and contract changes. |
| NFR-11 | Record safe, traceable failures so a teammate can diagnose and recover the affected component. |

## Acceptance and verification

Check each delivered feature against its FRs and relevant NFRs; retain actual results in the task/PR.

| Requirement group | Evidence to obtain |
| --- | --- |
| FR-01; NFR-01 | Signed-in/signed-out, logout, two-tenant and wrong-role checks on delivered operations. |
| FR-02–04 | Valid and invalid product/listing operations, agreed limits, variant/match uncertainty, duplicate handling. |
| FR-05–06/11; NFR-02/04/05 | Permitted samples compared manually; controlled fixtures for missing data/failure; job restart/replay; preserved earlier success and visible freshness. |
| FR-07; NFR-06 | Client walkthrough; keyboard/mobile checks; displayed values trace to the correct stored observations. |
| FR-08–10 | Later rule-trigger/deduplication, tier enforcement, and admin-authorization checks when those features exist. |
| NFR-03/09 | Proposed original target: dashboard within three seconds for ten concurrent users. Agree dataset, environment and measurement method before calling it an acceptance commitment. |
| NFR-07/10/11 | A teammate runs setup/tests, reviews a source change and traces a failed attempt; compatible migrations where applicable. |
| NFR-08 | Restore a test backup separately and verify relevant accounts/observations/jobs; timing/data-loss targets still open. |

The full sample sizes, accuracy thresholds, freshness limits, alert delay and recovery targets remain open. Client review validates usefulness; tests verify implementation. No results are asserted here.

## Decisions still needed

**Before live collection:** permitted access, intended use and history retention; exact marketplace, listings, variants, seller/offer meaning, currency, and delivery context.

**Before the corresponding feature:** tracking limits; collection interval and stale threshold; alert conditions/channel; tier-management permissions; admin needs; hosting and budget.

TypeScript is selected. The rest of the stack needs a small team setup trial, not another large architecture exercise. Personal computers are the current resources; an offline computer cannot provide continuous monitoring.

## Amazon is an unresolved dependency

The earlier review found restrictions in [Amazon UK conditions](https://digprjsurvey.amazon.co.uk/csad/help/node/GLSBYFE9MGKKQXXM) and [Associates policies](https://affiliate-program.amazon.co.uk/help/operating/policies/). Public pages, an API key, or an open-source scraper do not establish permission for Riven's retailer analytics and history retention.

Shewon should review a suitable access route and record supported, limited, or blocked with evidence. Do not bypass CAPTCHA, access controls, or blocks. If no suitable route exists, ask the client about access or a source/scope change. Synthetic samples can support learning and tests, but never count as live collection proof.

## Boundaries and module evidence

No automatic repricing, predictive AI, public shopping-comparison service, affiliate-marketing product, or custom local-store integration is established in the initial core. Do not add paid services without agreement.

EC5406 expects requirements, design, implementation, testing, documentation, reflection, and the ability to defend decisions and demonstrate work. Keep brief, genuine evidence in tasks and PRs. The original module sheet and proposal remain in the local archive. Confirm current submission instructions with the instructor; older schedule material has an EC5404/EC5406 label discrepancy.
