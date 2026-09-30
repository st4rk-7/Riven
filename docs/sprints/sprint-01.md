# Sprint 1 plan

**Theme:** First working retailer journey

**Development:** 28 September–11 October 2026

**Evaluation:** 12–18 October 2026

**Updated:** 30 September 2026

**Status:** Proposed scope. Estimates, ownership and capacity must be agreed at Sprint Planning.

## Whole-product basis

Use the [system baseline](../architecture/system-baseline.md), [quality targets](../architecture/quality-targets.md), [collection strategy](../architecture/collection-strategy.md) and [team guide](../team-working-guide.md). TypeScript and Amazon-first are confirmed. Other technology choices are recommendations to ratify with a clean setup; no Amazon live collection method has passed its feasibility gate.

The baseline specifies PostgreSQL, durable job handling, source contracts and tenant isolation from the foundation, so later history, scheduling, alerts and tiers build on the same model. Do not implement all later features in Sprint 1.

## Sprint goal

A retailer can sign in, add a supported competitor listing and view its collected price, availability and collection timestamp in their own workspace.

These development and evaluation windows form one three-week sprint in the [module schedule](../roadmap.md#schedule-basis).

## Selected product backlog scope

| Parent item | Proposed Sprint 1 scope |
| --- | --- |
| PB-01 (part) | Confirm first source, sample products, input method, required fields, matching rules, initial limits and collection trigger. |
| PB-02 (part) | Resolve the Amazon access/offer/retention gate and probe repeated collection with verified sample listings. Record second-platform investigation as unfinished if not selected; final PB-02 acceptance still covers both sources. |
| PB-03 | Establish a runnable application, database, team workflow and basic automated checks. |
| PB-04 | Implement sign-in/sign-out and server-side tenant access controls for this journey, under NFR-01. |
| PB-05 (part) | Add a tracked product and its competitor listing through a minimal form. |
| PB-06 (part) | Collect and store an observation from the first supported source. |
| PB-07 (part) | Display collected fields, collection status and last successful collection time. |
| PB-12 (part) | Verify the integrated journey, data accuracy and tenant isolation. |

See the [product backlog](../product-backlog.md) for full parent acceptance criteria. A successful one-source demonstration does not complete the two-source collection requirement.

## Scope boundary

Deliver one supported connector first, targeting Amazon. Amazon UK/wired USB mice, pasted listing URLs and manual collection are recommended starting choices. Source availability is not guaranteed: if the access gate fails, report the real-source milestone as blocked and obtain an explicit client decision. Begin the second-platform assessment early enough for Sprint 2. Perform collection as durable background work so it does not block the dashboard.

Full recurring scheduling, the second production connector, edit/remove workflows beyond the selected journey, historical charts, alerts, billing and advanced administration remain in the product backlog. Initial tenant isolation, input validation and agreed tracking limits belong in this sprint.

## Task plan

| Task | Work and evidence | Parent / dependency |
| --- | --- | --- |
| S1-01 | **Confirm the demonstration.** Record source, sample listings, product/variant rules, fields, initial limits, collection trigger and expected results with the client. | PB-01; informs the source probe and acceptance checks |
| S1-02 | **Check source feasibility.** Time-box repeated collection trials, compare with source listings and record failures/access constraints. Agree an alternative if a source is unreliable. | PB-02; before committing to a connector |
| S1-03 | **Establish the foundation.** Ratify the whole-product stack and versioned contracts; establish PostgreSQL/migrations, tenant enforcement, durable queue/API-worker setup and repeatable checks. Use the architecture baseline, not an independent Sprint 1 stack. | PB-03; may run alongside S1-02 |
| S1-04 | **Build secure workspace access.** Implement authentication and server-side tenant ownership checks; verify using two retailer accounts. | PB-04 / NFR-01; uses S1-03 |
| S1-05 | **Connect listing entry to results.** Implement form, first-source collection, observation storage and results screen, including visible failure handling. Integrate continuously. | Partial PB-05–07; uses S1-01–04 |
| S1-06 | **Validate and demonstrate.** Test success/failure cases, fix defects, update setup instructions and prepare the live journey. Record review feedback and retrospective actions. | Partial PB-12; uses the integrated journey |

The four role owners are named in the [team guide](../team-working-guide.md). Jira assignees and estimates must be recorded in the Riven Scrum project after the Jira accounts and team capacity are confirmed. Existing GitHub issues #1–#4 cover preparation only; closing them cannot complete S1-04–06 or the sprint goal.

## Acceptance checks

- A retailer can sign in and out; signed-out requests are rejected.
- A supported listing is saved against the correct product and tenant. Invalid or unsupported input produces a clear message, and agreed initial tracking limits are enforced.
- A successful collection stores and displays price, currency, availability, source and collection time. Values match manually checked sample listings.
- Uncertain product or variant correspondence is flagged for review instead of presented as a confirmed match.
- A failed collection is visible and is not presented as zero price or an out-of-stock result. Earlier successful data remains distinguishable.
- A second retailer cannot read or change the first retailer's data through screens or direct application requests; an unauthorised retailer cannot access administrator-only operations.
- The integrated application runs from documented setup steps and the full journey is demonstrated with real supported-source data.

Apply [NFR-01, NFR-02, NFR-04–07](../requirements.md#non-functional-requirements) to the functionality delivered. Run an initial backup/restore and worker-restart check in this sprint. The [quality matrix](../architecture/quality-targets.md) adds proposed NFR-09–11 and schedules broader load, alert-delay and recovery evidence as the dependent features arrive.

## Definition of Done

Acceptance checks pass; relevant automated tests pass; another teammate reviews the change; code is merged and integrated; affected documentation is updated; no known critical defect remains in the delivered journey. Retain evidence of checks and the working demonstration.

## Sprint Planning and review

Before committing: confirm client priorities, source-probe time limit, all four members' availability, estimates, task ownership and the demonstration. Reduce selected work if it exceeds capacity while preserving a useful goal. Record unresolved dependencies.

During the sprint: keep progress on the board, integrate frequently and adapt the delivery plan as evidence changes. Escalate a source failure early; do not silently substitute mock data for the agreed real-source demonstration.

At review: demonstrate the journey, collect client/evaluator feedback, hold a retrospective and update the backlog. Return unfinished work for reprioritisation. The [roadmap](../roadmap.md) is a forecast, so later allocations may change with evidence.
