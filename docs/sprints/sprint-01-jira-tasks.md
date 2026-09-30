# Sprint 1 Jira task pack

**Prepared:** 30 September 2026 · **Project:** RIV · **Development:** 28 September–11 October 2026 · **Evaluation:** 12–18 October 2026

**Sprint goal:** A retailer signs in, adds a supported competitor listing, requests collection and sees a real observed price, currency, availability, source and time in their own workspace. Amazon is the first required source; its available access route is still unproven. A fixture lets independent engineering proceed but cannot satisfy real-source acceptance.

Jira is the single task board. GitHub holds these blueprints, branches, code and pull requests. Use the Jira key in each branch, commit and PR title. Legacy [GitHub issues #1–#4](https://github.com/st4rk-7/Riven/issues) are references for the first four preparation tasks, not a second backlog. These are role allocations; fill in Jira assignees after confirming each member's account and capacity. Estimated effort is a discussion point at Sprint Planning, not a promise.

| ID | Suggested owner / reviewer | Work item and parent | Depends on | Acceptance evidence |
| --- | --- | --- | --- | --- |
| T01 | A / B | First retailer flow and UI states · PB-01, PB-05, PB-07; legacy #3 | Client's first journey, T02 contracts for final wiring | Reviewed desktop/mobile flow for sign-in, product/listing form, queued, success, failed, stale and uncertain match. The separate local Riven design prototype is design input only, with demo data and reference footage. |
| T02 | B / A,C,D | Versioned API/observation contract and first data model · PB-03; legacy #4 | Confirmed first fields and source semantics | Checked-in schemas and example success/error payloads. Tenant, product, monitor, attempt and observation IDs; decimal price plus currency; unknown stock; separate last attempt and last success. All four members review interface before parallel integration. |
| T03 | C / B | Amazon access and accuracy gate · PB-02; legacy #1–#2 | Client/retailer sample listings and intended offer meaning | Dated evidence for access/use/retention route, 3–5 exact URLs with variants and delivery context, repeated permitted observations where possible, field comparison, failures, supported/limited/blocked verdict. Escalate blocked access after the agreed two-day time box. |
| T04 | D / B | Reproducible project foundation · PB-03; legacy #4 | T02 baseline agreement for schema/queue choice | A second member starts the app and database from a clean clone; migrations and API/worker commands run; CI runs typecheck and core tests. Record setup and resource needs on the weakest team machine. |
| T05 | B / D | Sign-in and server-side tenant access · PB-04, FR-01, NFR-01 | T02, T04 | Signed-in and signed-out flow; every retailer request/job derives tenant from verified session; two-tenant and wrong-role request tests pass. |
| T06 | B / A | Product and competitor listing API · PB-05, FR-02–04 | T02, T04, T05; T03 host/variant decisions | Create and view own product/monitor; validate supported URL, duplicate, variant and agreed limit; cross-tenant requests rejected. Pending/unsupported/mismatch states are explicit. |
| T07 | C / B | First source adapter and observation validation · PB-02, PB-06, NFR-05 | T02; T03 supported access verdict for live route | Source-neutral connector contract, normalisation and fixtures for missing price, currency, stock, seller and variant mismatch. Only use a real Amazon route if T03 supports it; otherwise mark live connector blocked. Fixture tests never count as live source proof. |
| T08 | D / B,C | Durable collection job and recovery · PB-06, FR-05–06, FR-11, NFR-02 | T02, T04, T06, T07 interface | Authorised enqueue and worker status; job/restart/duplicate tests; observation and attempt persist with separate success/error states. Failure keeps earlier good data visible. |
| T09 | A / B,D | Wire first journey to real API · PB-05, PB-07, NFR-06 | T01, T02, T05, T06, T08 | Browser flow calls versioned API; shows loading, unsupported, pending, failed, stale and uncertain-match states; displays server price, currency, availability, source and timestamps; keyboard/mobile walkthrough. |
| T10 | D + coordinator, all reviewers | Integrated acceptance, setup and demo · PB-12 | T03–T09 | One clean setup, two-tenant isolation, worker restart and backup/restore checks, manually compared sample results where live access exists, documented limitations and client review. Do not mark the real-source goal done if Amazon access remains blocked. |

## Start today

1. Hold a 20-minute kickoff: each member states available hours and selects A, B, C or D; record the exact first source/offer questions for the client. The coordinator creates the Jira sprint and assigns T01–T04 immediately. Do not wait for all future requirements to be settled.
2. A maps the flow and audits the separate Riven design prototype; B writes T02 contract examples; C begins T03 access/sample evidence; D makes T04 clean setup work. Each posts a short end-of-day result or blocker on their Jira task.
3. Review T02 together before T05–T09 interfaces diverge. Decide the smallest working path. If T03 finds no suitable Amazon access, keep real collection blocked and ask the client for an access or scope decision while the other roles continue fixture-based work.
4. Integrate through short PRs. A task is Done only after its evidence, tests, another member's review and integrated behaviour are visible. Update FR/NFR/PB and decision records when the agreed scope or method changes.

## Branch and review convention

Use `codex/RIV-123-short-purpose` or another team-approved prefix with the **actual** Jira key. Include `RIV-123` in the commit and PR title. Jira shows development links when the GitHub for Atlassian app is connected to the repository. A Jira task description links the relevant documents and its legacy GitHub issue when applicable. The task is the owner's unit of work; all four members should still be able to explain and run the complete retailer journey.
