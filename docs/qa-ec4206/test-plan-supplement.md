# EC4206 Test Plan Supplement

Status: Draft for Ilmam and group review
Owner: Ilmam (Role A)
Date: 17 November 2026 (Asia/Colombo)
Planning baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`

## 1. Relationship to the approved plan

This document supplements, but does not replace or rewrite, `docs/test-plan.md` version 1.0, approved on 4 November 2026. The approved plan remains the product-level testing authority. This supplement narrows the EC4206 assignment to the flows in `docs/qa-ec4206/strategy.md`, adds assignment-specific planning and evidence rules, and records differences observed at the newer baseline commit.

No execution result is stored in this planning document. Results belong with the tested commit and evidence, then link into the EC4206 traceability matrix.

## 2. Objectives

1. Verify the selected retailer journey against the existing `FR-*` and `NFR-*` requirements without inventing new product scope.
2. Demonstrate equivalence partitioning, boundary value analysis, and a decision table using actual Riven rules.
3. Exercise both successful and unsuccessful observable behavior across the screen, API, verified session, and retailer-scoped database path.
4. Keep Built, Partial, and Planned behavior distinct and identify document/code differences explicitly.
5. Give every planned and executed case a stable test ID, requirement mapping, tested commit, environment, expected/actual result, status, and evidence reference.
6. Provide stable manual expectations that Sanjeew can use for white-box selection, Hirukshanan can use for automation, and Dilsan can use for defect/quality analysis.

## 3. Scope

The detailed scope and rationale are in `strategy.md`.

| Scope ID | Flow | Requirements |
|---|---|---|
| `SCP-AUTH` | Sign-in and tenant isolation | `FR-01`, `NFR-01` |
| `SCP-PROD` | Product creation and competitor discovery | `FR-02`, `FR-03` |
| `SCP-OFFER` | Offer matching and price history | `FR-04`, `FR-06`, `FR-07`, `FR-11`, `NFR-05` |

Planned-only rules, live marketplace claims, destructive production checks, automatic repricing, alerts, tiers, administration, and exhaustive compatibility remain out of scope.

## 4. ISO/IEC 25010-aligned quality focus

| Characteristic | Application to the EC4206 scope | Planned evidence |
|---|---|---|
| Functional suitability | Sign-in, product, discovery, matching, and history outcomes satisfy their existing requirements. | Requirement-linked manual and automated case results. |
| Security | The verified session identifies the retailer; signed-out and cross-retailer access is rejected. | Signed-out and two-account isolation cases using synthetic data. |
| Reliability | Failed collection attempts remain visible and do not remove earlier valid observations. | Attempt/history cases and database/API evidence. |
| Usability | Main states and validation feedback are understandable, keyboard-usable, and distinct. | Focused manual UI observations; broader usability ownership remains with Role D. |
| Performance efficiency | Normal functional checks avoid blocking collection inside dashboard requests. | Architecture/code verification; measured load remains with Role D. |
| Maintainability | Tests and evidence follow stable IDs and keep UI, business rules, storage, and source-specific behavior separated. | Traceability, focused diffs, and reproducible commands. |

## 5. Roles and resources

| Role/member | EC4206 responsibility | Role A input/output interface |
|---|---|---|
| Ilmam / A | Strategy, supplement, STLC, black-box design, manual cases, traceability | Maintains `SCP-*`, `TC-*`, expected results, manual status, and final matrix. |
| Sanjeew / B | White-box, unit tests, TDD/BDD, coverage | Receives requirement/test IDs; returns code-path IDs, commands, measured coverage, and gaps. |
| Hirukshanan / C | Automation and CI/CD | Receives stable manual cases; returns `AT-*` mapping, run URL/commit, and pass/fail evidence. |
| Dilsan / D | Nonfunctional, defects, metrics, closure | Receives scope/quality focus; returns defect IDs, RCA, metrics, and retest/closure evidence. |

Resources: the existing Riven repository and documentation, Git/GitHub, Node 24, npm 11, Docker Compose, PostgreSQL 18, Vitest, current desktop Chrome, saved fixtures, synthetic accounts, and sanitized evidence files.

## 6. Test environment and data

- Use an isolated local Riven instance, never the production database.
- Use PostgreSQL `riven_test` through `TEST_DATABASE_URL`; do not reuse `riven_dev` for destructive/integration cases.
- Use only synthetic Alpha/Beta retailers and test-created products/observations.
- Keep `.env`, passwords, cookies, and private data out of source, screenshots, logs, and messages.
- Automated tests use saved fixtures or controlled local test doubles and never contact live marketplaces.
- Record Windows/browser versions, full tested commit, Node/npm/Docker versions, database state, seed/reset procedure, and any skipped dependency before execution.

Current readiness: tools are installed, but dependencies, `.env`, PostgreSQL, accounts, and application processes are not yet prepared. Environment tests are therefore Not run.

## 7. Schedule and milestones

| Date | Role A target |
|---|---|
| 15 Nov | Establish roster, proposed scope, component map, separate environment, and initial risks. |
| 17 Nov | Share stable scope/test ID convention; draft plan supplement, STLC, traceability, and cross-role handoff. |
| 18-19 Nov | Complete equivalence partitions, boundaries, decision table, detailed manual cases, and synthetic data. |
| 20 Nov | Prepare environment and execute the first approved manual cases; capture real evidence and defects. |
| 21 Nov | Complete/retest manual scope and collect initial B/C/D references. |
| 22 Nov | Reconcile cross-role evidence against one tested integration commit. |
| 23 Nov | Freeze results, limitations, traceability, and report inputs; perform final review. |
| 24 Nov | Submit before the lecturer's confirmed cutoff with an upload buffer. |

## 8. Entry criteria

### 8.1 Test design entry

- The selected flows, existing requirement IDs, and `TC-*` convention have been reviewed.
- Built/planned differences are documented rather than silently resolved.
- Each planned expected result is externally observable and pass/fail capable.

### 8.2 Execution entry

- The full tested commit is recorded and remote freshness has been checked.
- Dependencies are installed from the lockfile and the working tree impact is understood.
- Private environment values exist without entering Git.
- Isolated PostgreSQL is healthy, migrations/checks complete, and synthetic accounts/data are available.
- Relevant cases have preconditions, steps, expected results, cleanup, and evidence locations.
- Any live/manual target is explicitly authorized; no external marketplace is load-tested.

## 9. Suspension and resumption

Suspend the affected cases if the commit changes without impact review, the database is unavailable or contaminated, session/test-account setup is invalid, a test would reach an unauthorized/live external source, or a critical defect makes later results misleading. Mark cases Blocked with the reason and owner. Resume only after rechecking the commit, environment, data setup, and affected preconditions.

## 10. Exit criteria

- Every in-scope Must requirement has at least one designed `TC-*` case.
- All planned priority cases are Passed, Failed with a linked defect, Blocked with an owner/reason, or explicitly Not run.
- Equivalence, boundary, and decision-table derivations are visible and map to final cases.
- Every executed result identifies tester, date/time, commit, environment, data, expected/actual result, status, and evidence.
- Available Role B/C/D outputs are linked without renaming their IDs or fabricating missing evidence.
- No unresolved critical failure is omitted; accepted limitations are explicit.
- Ilmam can explain the scope, techniques, selected cases, actual results, and limitations.

## 11. Verification and validation

Verification asks whether specifications, designs, code, cases, and configuration conform to their defined rules. Validation asks whether the running Riven journey satisfies the retailer's real need.

| Type | Riven example | Evidence |
|---|---|---|
| Verification | Review `FR-01`/`NFR-01`, `server/auth.ts`, and retailer-scoped queries to check that tenant identity comes from the verified session. | Requirement/code review with commit and path references. |
| Verification | Review `TC-*` cases for stable IDs, correct boundaries, observable expected results, and requirement traceability. | Document diff/review record. |
| Verification | Check that PostgreSQL test configuration and fixtures are isolated and synthetic. | Sanitized configuration checklist and database smoke output. |
| Validation | Sign in as a synthetic retailer and confirm only that retailer's products and offers appear. | Executed UI/API case and evidence. |
| Validation | Add a product, discover offers, and confirm the retailer can interpret uncertain matches and history honestly. | Executed end-to-end cases with screenshots/logs. |
| Validation | Enter invalid/boundary data and confirm feedback supports recovery without exposing another retailer's information. | Negative/boundary case results. |

## 12. Evidence record

Every executed result must include:

- `TC-*` and requirement IDs;
- full commit and branch;
- date/time and tester;
- environment/tool/database/browser versions;
- sanitized preconditions and test data;
- exact action/steps;
- expected and actual result;
- Passed, Failed, Blocked, or Not run status;
- evidence path/URL;
- defect/retest reference where applicable;
- cleanup or residual-data note.

## 13. Review status

This supplement is structurally complete as a planning draft. It is not group-approved, no execution has occurred, and no B/C/D result has been received. Ilmam must review the language and circulate the scope/ID handoff before this document can be frozen.
