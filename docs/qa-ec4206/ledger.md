# EC4206 Role A Ledger

Owner: Ilmam
Updated: 23 November 2026 (Asia/Colombo)

| Task | Status | Artifacts | Real evidence / dependency | Next step |
|---|---|---|---|---|
| A1 Scope and system map | Complete for Role A | `strategy.md`, `traceability.md` | Stable scope/IDs and built/planned distinction merged; group approval is not claimed | Preserve IDs through submission. |
| A2 Plan and STLC | Complete for Role A | `test-plan-supplement.md`, `stlc.md` | Approved product-plan history preserved; final package links existing FR/NFR IDs | Submit as the EC4206 supplement. |
| A3 Black-box design | Complete | `black-box.md`, `manual-cases.md`, `traceability.md` | Partitions, boundaries, decision table and 20 detailed cases merged | Keep 15 unrun cases marked Not run. |
| A4 Execute and reconcile | Complete for received evidence | Evidence through 23 Nov; 4 Passed, 1 Partial, 15 Not run; B/C mapped and merged; D PR reviewed and merged | Frozen product/test main `57b8451` has successful CI; D PR #50 supplies the reviewed quality evidence and preserves its audit/JMeter/Sonar limits | Preserve unexecuted checks and evidence limits in the submission. |

## Repository state

- Final-review branch: `qa/ec4206-role-a-final-review`
- Frozen tested main: `57b84517d2cb7eab1fb08867affca5ca354fc492`
- Role A PRs [#41](https://github.com/st4rk-7/Riven/pull/41), [#44](https://github.com/st4rk-7/Riven/pull/44), [#46](https://github.com/st4rk-7/Riven/pull/46) and [#47](https://github.com/st4rk-7/Riven/pull/47) are merged
- Test execution: `TC-AUTH-001` has partial evidence; `TC-AUTH-002`, `003`, `005`, and `006` passed; all other cases remain Not run
- Remote freshness: fetched 23 November; `origin/main` was `57b84517d2cb7eab1fb08867affca5ca354fc492`
- Jira: omitted for this EC4206 workstream at Ilmam's direction
- Cross-role status: B merged in PR #43; C merged in PR #45 with accepted partial labels; D evidence reviewed and merged in PR [#50](https://github.com/st4rk-7/Riven/pull/50), with no separate matching-defect issue

## 23 November freeze and submission preparation

- Tested commit frozen at `57b84517d2cb7eab1fb08867affca5ca354fc492`.
- Main push CI [run 45018780656, job 137196839763](https://github.com/st4rk-7/Riven/actions/runs/45018780656/job/137196839763) passed.
- CI retained `role-c-browser-evidence` and `role-b-coverage-summary` artifacts.
- Final manual totals: 4 Passed, 1 Partial, 15 Not run.
- Final audit count remains 22: 1 low, 17 moderate, 2 high, 2 critical; no automatic fix applied.
- Final review, reproducibility commands, risks and upload checklist: `final-review.md`.
- Open submission dependency: the lecturer's exact cutoff time.

## 22 November milestone

- Cross-role integration: Role B evidence and Role A mapping are merged; Role C's updated push and pull-request CI runs passed, its partial labels were accepted, and PR #45's merge remains open.
- CI/local rerun: typecheck passed; unit suite passed 83 with 23 skipped when loopback fixture access was allowed; BDD passed 4 scenarios/17 steps; focused matching coverage was 100% statements and branches.
- Actual security metric: `npm audit --json` reported 22 findings (1 low, 17 moderate, 2 high, 2 critical); no automatic fix was applied.
- Defect links: none received from Role D. Existing GitHub issues #1-#4 are unrelated product issues and were not repurposed. No defect ID was invented.
- Evidence: `evidence/integration-2026-11-22.md`.
- Remaining dependencies: Hirukshanan must merge PR #45 after review; Dilsan must provide real defect/scan links and dispositions.

## 20 November milestone

- Real Role A check evidence exists for authentication success/partial, invalid inputs, signed-out rejection, logout revocation, and rate limiting.
- No product defect was observed in the executed set; no defect ID was invented.
- Branch verification: typecheck passed; default `npm test` timed out one fixture at 5 seconds; focused and full 15-second-timeout reruns passed. See `evidence/branch-check-2026-11-20.md`.
- First PR opened: [#41](https://github.com/st4rk-7/Riven/pull/41), `docs(qa): add EC4206 Role A strategy and evidence`.
- Cross-role dependencies are explicit: Sanjeew should return white-box/coverage references, Hirukshanan automation/run mappings, and Dilsan should review whether the default-timeout instability warrants a defect ID and return quality references when available.

## 17 November handoff package

- Scope IDs: `SCP-AUTH`, `SCP-PROD`, `SCP-OFFER`
- Canonical requirements: existing `FR-*` and `NFR-*`
- Reserved manual IDs: `TC-AUTH-001..006`, `TC-PROD-001..007`, `TC-OFFER-001..007`
- Role C should map future automation to `AT-*` plus the corresponding `TC-*` IDs.
- Role B should retain actual repository test names and may use `WB-*` only for analysis worksheets.
- Role D should use real issue/defect identifiers and link them to `TC-*` rows.
