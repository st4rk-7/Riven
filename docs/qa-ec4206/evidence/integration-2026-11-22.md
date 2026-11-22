# Cross-role integration evidence - 22 November 2026

Owner: Ilmam (Role A)
Time zone: Asia/Colombo
Integrated baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e` (`origin/main` after Role A PRs #41/#44 and Role B PR #43)
Local branch: `qa/ec4206-role-a-22nov`

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

### Role C - CI passed and partial labels accepted; merge pending

- PR [#45](https://github.com/st4rk-7/Riven/pull/45) is open at commit `dfa7c1da9837358e9fc94251a17c4540a84dc17f`.
- Branch-push CI job [137185253567](https://github.com/st4rk-7/Riven/actions/runs/45014972891/job/137185253567) passed.
- Pull-request CI job [137185264754](https://github.com/st4rk-7/Riven/actions/runs/45014976171/job/137185264754) passed.
- `AT-001` supports `TC-AUTH-001`; `AT-002` covers only the wrong-password subset of `TC-AUTH-002`; `AT-003` covers only product-read isolation within `TC-AUTH-004`; `AT-004` supports `TC-AUTH-005` and only the product-read subset of `TC-AUTH-003`.
- Commit `dfa7c1d` explicitly labels the `AT-003` and `AT-004` mappings as partial. Role A re-reviewed the correction and found no remaining mapping issue. Until PR #45 merges, these references remain pending supporting evidence rather than merged coverage.

### Role D - evidence not received

- No Role D branch or PR was observed among the remote EC4206 branches on 22 November.
- GitHub issues #1-#4 are existing product issues and are not EC4206 defect records.
- No real defect ID exists yet for Role B's fixed `packSize` dimension bug, the default-timeout instability, or the 22 dependency-audit findings. No `DEF-*` identifier is invented.
- Dilsan must return actual issue/defect links, severity/disposition, scan interpretation, and recommendations before Role A can close the Role D columns.

## Conclusion

The 22 November integration and metrics work is complete for the evidence currently available from Roles A and B, and CI evidence is reconciled for Role C. The Role C mapping correction is accepted, while PR #45's merge and all Role D defect links remain explicitly open. Manual Role A cases are not converted to Passed merely because supporting automated evidence passed.
