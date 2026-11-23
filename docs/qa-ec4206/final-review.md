# EC4206 Role A Final Review and Submission Checklist

Owner: Ilmam (Role A)
Prepared: 23 November 2026 (Asia/Colombo)
Status: Role A package prepared; Role D evidence and the lecturer's exact cutoff remain external dependencies

## 1. Frozen tested state

| Item | Frozen value |
|---|---|
| Repository | [st4rk-7/Riven](https://github.com/st4rk-7/Riven) |
| Tested `main` commit | `57b84517d2cb7eab1fb08867affca5ca354fc492` |
| Commit meaning | Merge of Role C PR #45 after Role A, Role B, mapping and integration documentation were merged |
| CI event | `push` to `main` |
| CI result | Successful |
| CI run/job | [Run 45018780656, job 137196839763](https://github.com/st4rk-7/Riven/actions/runs/45018780656/job/137196839763) |
| CI artifacts | `role-c-browser-evidence`; `role-b-coverage-summary` (both present and unexpired when checked on 23 November) |

This commit is the product/test freeze for the report. Later documentation-only commits must not be described as a different tested product build unless CI is rerun and the freeze is deliberately updated.

## 2. Role A deliverables

| Task | Deliverable | Final disposition |
|---|---|---|
| A1 | Scope, roster, component/data-flow map, stable requirement/test IDs and risks | Complete for Role A; built and planned behavior remain separated. |
| A2 | EC4206 test-plan supplement and STLC map | Complete for Role A; it supplements rather than overwrites the approved plan. |
| A3 | Equivalence partitions, boundary analysis, matching decision table and 20 runnable manual cases | Complete and traced. |
| A4 | Selected manual execution, evidence, cross-role reconciliation and final matrix | Complete for evidence received; Role D columns remain Pending. |

Primary files: `strategy.md`, `test-plan-supplement.md`, `stlc.md`, `black-box.md`, `manual-cases.md`, `traceability.md`, `ledger.md`, and the records under `evidence/`.

## 3. Manual execution summary

There are 20 Role A manual cases: 6 authentication, 7 product, and 7 offer/history cases.

| Verdict | Count | Cases |
|---|---:|---|
| Passed | 4 | `TC-AUTH-002`, `TC-AUTH-003`, `TC-AUTH-005`, `TC-AUTH-006` |
| Partial; verdict pending | 1 | `TC-AUTH-001` |
| Not run | 15 | `TC-AUTH-004`, all `TC-PROD-*`, all `TC-OFFER-*` |

Automated supporting evidence does not change a manual case's verdict. No live marketplace was contacted, and fixtures do not prove live collection.

## 4. Cross-role evidence

### Role B - merged

- PR [#43](https://github.com/st4rk-7/Riven/pull/43) supplied `WB-001..010`, the `packSize` TDD fix, focused matching coverage and BDD.
- Role A mapping PR [#44](https://github.com/st4rk-7/Riven/pull/44) maps that evidence to `TC-OFFER-001..003`.
- Observed metrics retained in the repository: 83 unit tests passed with 23 skipped in the Role A integrated local rerun; 4 BDD scenarios/17 steps passed; focused `server/matching.ts` coverage was 100% statements and 100% branches.

### Role C - merged

- PR [#45](https://github.com/st4rk-7/Riven/pull/45) merged at `dfa7c1d` through main merge `57b8451`.
- `AT-001..004` are implemented. `AT-003` is explicitly partial for `TC-AUTH-004`; the `TC-AUTH-003` portion of `AT-004` is explicitly partial. Role A accepted those labels.
- Final main CI passed and retained the browser screenshot and coverage-summary artifacts named in section 1.

### Role D - not received

- No Role D EC4206 branch, PR, or defect issue was observed by the 23 November freeze.
- No real defect ID was received for the fixed pack-size dimension bug, the earlier Windows timeout instability, or dependency-audit findings.
- Existing GitHub issues #1-#4 are unrelated product issues and are not reused as EC4206 defect records.

## 5. Metrics, defects and risks

| Item | Actual evidence/disposition |
|---|---|
| Final main CI | Passed at `57b8451`; run/job linked in section 1. |
| Matching coverage | 100% statements (39/39), branches (35/35), functions (15/15), lines (29/29) in the focused run. |
| BDD | 4 scenarios and 17 steps passed. |
| Role C browser checks | `AT-001..004` passed in Role C evidence and final CI completed successfully. |
| Dependency audit | 22 findings on 23 November: 1 low, 17 moderate, 2 high, 2 critical. No automatic fix applied. |
| Fixed matching defect | Dimension text could be misread as pack size; fixed through Role B TDD, but no Role D issue ID was supplied. |
| Earlier timeout instability | Recorded in Role A evidence; final main CI passed. No defect ID or Role D disposition was supplied. |

## 6. Reproducibility

Use Node 24, npm 11 and PostgreSQL 18. Keep secrets in the environment or ignored `.env` file.

```powershell
npm ci
npm run typecheck
npm run db:check
npm test
npm run test:bdd
npm run test:coverage -- --maxWorkers=1 --testTimeout=15000
npx playwright install chromium
npm run test:e2e
```

`test:e2e` requires a loopback PostgreSQL `TEST_DATABASE_URL` whose database name ends in `_test`. Do not run source/load/security checks against a live marketplace merely for submission evidence.

## 7. Submission checklist

- [x] Poll roster and Role A ownership recorded.
- [x] Common scope and stable requirement/test IDs recorded.
- [x] Test-plan supplement and STLC map prepared.
- [x] Black-box techniques and 20 manual cases prepared.
- [x] Manual outcomes include commit, environment, data, expected/actual and evidence limits.
- [x] Role B evidence mapped and merged.
- [x] Role C evidence mapped, reviewed and merged with partial coverage labelled.
- [x] Final `main` commit and successful CI run frozen.
- [x] CI artifact names and run link recorded.
- [x] Traceability and evidence limitations reconciled.
- [ ] Role D defect IDs, severity/disposition, scan interpretation and recommendations received.
- [ ] Lecturer's exact 24 November cutoff confirmed.
- [ ] Final files uploaded with buffer before the confirmed cutoff.

## 8. Final handoff

Role A is ready for submission review. Do not convert Pending Role D cells into completed evidence, and do not report the 15 unrun manual cases as passed. If Role D evidence arrives before submission, add only the real links/dispositions, rerun any affected checks, update `traceability.md`, and move the freeze only if product/test code changes.

## 9. AI assistance

AI assistance was used to inspect repository state, reconcile evidence, run authorized local checks, draft documentation and review mappings. Ilmam remains responsible for understanding, reviewing and submitting the work.
