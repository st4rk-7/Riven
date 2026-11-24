# Cross-role integration evidence - 22 November 2026

Owner: Ilmam (Role A)
Time zone: Asia/Colombo
Integrated baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e` (`origin/main` after Role A PRs #41/#44 and Role B PR #43)
Local branch: `qa/ec4206-role-a-22nov`
Status refreshed: 23 November 2026 after PRs #45, #47 and #50 merged

## Local rerun

The dependency tree was installed from `package-lock.json` with `npm ci`. The first attempt left an incomplete `node_modules` directory; that rebuildable directory was removed and a clean `npm ci` completed with 660 packages installed.

| Check | Actual result |
|---|---|
| `npm run typecheck` | Passed for web, server, and extension. |
| `npm test` inside the restricted network sandbox | 77 passed, 23 skipped, 6 failed: five local fixture-server fetches were blocked and one fixture exceeded 5 seconds. This is environment evidence, not a product verdict. |
| `npm test` with local loopback access | Passed: 83 tests passed, 23 skipped, 12 files passed, 3 skipped. |
| `npm run test:bdd` | Passed: 4 scenarios and 17 steps. |
| Focused matching coverage | Passed: 21 tests; statements 39/39, branches 35/35, functions 15/15, lines 29/29 (all 100%). |
| `npm audit --json` metadata | 22 findings: 1 low, 17 moderate, 2 high, 2 critical. No automatic fix was applied. |

Docker Desktop was not running during this rerun, so a new local database check was not claimed. Earlier Role A database evidence remains separate. The Role C GitHub CI runs below used PostgreSQL 18 and completed successfully.

## Cross-role reconciliation

### Role B - merged

- PR [#43](https://github.com/st4rk-7/Riven/pull/43) merged into `main` at `17307a5`.
- CI job [136808279841](https://github.com/st4rk-7/Riven/actions/runs/44891561292/job/136808279841) passed on Role B commit `6fb6849`.
- Role A mapping PR [#44](https://github.com/st4rk-7/Riven/pull/44) merged; CI job [136833976547](https://github.com/st4rk-7/Riven/actions/runs/44900093586/job/136833976547) passed.
- `WB-001..010` and the two BDD scenario groups remain mapped to `TC-OFFER-001..003` in `traceability.md`.

### Role C - merged; CI passed and partial labels accepted

- PR [#45](https://github.com/st4rk-7/Riven/pull/45) merged at commit `dfa7c1da9837358e9fc94251a17c4540a84dc17f`; main merge commit: `57b84517d2cb7eab1fb08867affca5ca354fc492`.
- Branch-push CI job [137185253567](https://github.com/st4rk-7/Riven/actions/runs/45014972891/job/137185253567) passed.
- Pull-request CI job [137185264754](https://github.com/st4rk-7/Riven/actions/runs/45014976171/job/137185264754) passed.
- `AT-001` supports `TC-AUTH-001`; `AT-002` covers only the wrong-password subset of `TC-AUTH-002`; `AT-003` covers only product-read isolation within `TC-AUTH-004`; `AT-004` supports `TC-AUTH-005` and only the product-read subset of `TC-AUTH-003`.
- Commit `dfa7c1d` explicitly labels the `AT-003` and `AT-004` mappings as partial. Role A re-reviewed and accepted the correction. Final main push CI [run 45018780656](https://github.com/st4rk-7/Riven/actions/runs/45018780656) passed and retained `role-c-browser-evidence` and `role-b-coverage-summary` artifacts.

### Role D - evidence reviewed and merged

- Dilsan linked the `packSize` dimension defect/fix to PR [#43](https://github.com/st4rk-7/Riven/pull/43), proposed Medium severity and reported 21 matching tests passing on commit `17307a5`; there is no separate defect issue.
- The five-second timeout is a non-reproduced test-reliability observation with no defect ID.
- The 22 audit findings require dependency/exposure review and are not 22 confirmed exploitable defects. SonarQube was not run.
- Role D PR [#50](https://github.com/st4rk-7/Riven/pull/50) records the local JMeter read test of 3,269 requests, 0 errors and 17 ms p95; it does not measure complete browser loading.
- Role A reviewed the committed reports and raw evidence, requested removal of personal workstation paths, and re-reviewed the corrected head `21e5ba0`. Updated CI [run 45169479586](https://github.com/st4rk-7/Riven/actions/runs/45169479586) passed before PR #50 merged at `e59fef7`.
- Manual browser security/usability checks and SonarQube remain unexecuted as explicitly recorded in PR #50. No `DEF-*` identifier is invented, and GitHub issues #1-#4 are not repurposed.

## Conclusion

The integration and metrics work is complete for evidence received from Roles A, B, C and D. Role D PR #50 is reviewed and merged with its stated limits. Manual Role A cases are not converted to Passed merely because supporting automated evidence passed.
