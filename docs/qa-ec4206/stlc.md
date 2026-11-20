# EC4206 Software Testing Life Cycle

Status: Execution in progress; group review pending
Owner: Ilmam (Role A)
Updated: 20 November 2026 (Asia/Colombo)
Planning baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`

## Purpose

This STLC map applies the existing Riven requirements, design, approved test plan, and team rules to the bounded EC4206 scope. The phases can loop: a requirement or commit change returns to analysis/design, an environment failure returns to setup, and a defect returns to execution for retest.

## Phase map

| Phase | Inputs | Riven EC4206 activities | Owner(s) | Outputs | Exit gate | Status on 20 Nov |
|---|---|---|---|---|---|---|
| 1. Requirement analysis | SRS, SDD, approved test plan, current code, Role A guide | Separate Built/Partial/Planned behavior; select `SCP-AUTH`, `SCP-PROD`, `SCP-OFFER`; retain existing `FR-*`/`NFR-*`; record risks and document/code differences. | Ilmam; group reviews | `strategy.md`, scope IDs, requirement set, component map, risks | Scope/IDs are accepted or amendments are recorded. | Draft ready; group approval not observed. |
| 2. Test planning | Scope, quality focus, assignment deadline, environment constraints | Define objectives, roles, ISO 25010 focus, resources, schedule, environment/data rules, entry/exit, suspension, verification/validation, and evidence fields. | Ilmam with group inputs | `test-plan-supplement.md`, schedule, gates | Plan is reviewable and environment responsibility is known. | Draft ready; local environment responsibility/evidence location established; group review not observed. |
| 3. Test design and development | Stable requirements, component rules, plan | Create equivalence partitions, real boundaries, one decision table, detailed `TC-*` cases, synthetic data, expected results, cleanup, and traceability; give stable cases to B/C. | Ilmam; B/C may review feasibility | `black-box.md`, manual cases, test data, updated matrix | All in-scope Must requirements have observable cases and technique derivations. | 20 cases and technique derivations complete; B/C handoff/review not observed. |
| 4. Environment setup | Setup guide, lockfile, private configuration, Docker, test data | Install dependencies, configure private `.env`, start isolated PostgreSQL, migrate/check schema, prepare synthetic accounts, start API/UI, record versions, and run smoke checks. | Ilmam or agreed environment operator | Environment record, seed/reset steps, smoke evidence | Isolated environment is healthy and reproducible without secrets. | Exit gate met locally; dependency, database, integration, seed and smoke evidence recorded; runtime restarted successfully on 20 Nov. |
| 5. Test execution and defect handling | Approved cases, frozen commit, ready environment | Execute cases, record actual outcomes/evidence, distinguish product/test/environment failures, link D's defect IDs, retest fixes, and add B/C run mappings. | Ilmam for manual cases; each role for owned evidence | Results, evidence, defects, retests, matrix updates | Every planned case has an honest status and evidence/owner where required. | In progress: four authentication cases passed, one has partial evidence, no defect observed; remaining cases Not run. |
| 6. Test closure | Final results, defects, coverage/CI/quality evidence, exit criteria | Reconcile IDs and commits, evaluate exit criteria, summarize limitations, archive reproducible evidence, cross-review, and prepare final handoff. | Ilmam coordinates; all roles confirm their evidence | Final matrix, closure summary, unresolved limits, handoff | Group agrees the evidence is consistent and submission-ready. | Not started. |

## State transitions

```text
Requirement analysis -> Planning -> Design -> Environment -> Execution -> Closure
          ^                ^          ^           ^             |
          |                |          |           |             |
          +------ scope/commit change +-----------+-- defect/retest
```

- A changed requirement or material new commit triggers impact analysis and may invalidate cases.
- A case-design ambiguity returns to requirement analysis rather than guessing an expected result.
- Environment or data failures remain Blocked and do not become product failures.
- A failed case enters defect handling and returns to execution only after a verifiable fix or disposition.

## Phase evidence rules

Planning artifacts may say Draft, Proposed, Pending, or Not run. They must not say Approved, Passed, Fixed, or Closed without observed evidence. Execution evidence must name the full commit and environment; screenshots alone do not prove database state or authorization behavior.

## Immediate transition required

Role A has moved through design and local environment setup into execution. The next independent work is to complete `TC-AUTH-001`/`004` and safe product/offer cases. Group review and B/C/D evidence references remain dependencies and must not be invented.
