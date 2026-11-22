# EC4206 Role A Ledger

Owner: Ilmam
Updated: 22 November 2026 (Asia/Colombo)

| Task | Status | Artifacts | Real evidence / dependency | Next step |
|---|---|---|---|---|
| A1 Scope and system map | Draft ready for group review | `strategy.md`, `traceability.md` | Baseline `29af237`; remote freshness rechecked on 20 Nov and `origin/main` still matched; group approval not observed | Ilmam reviews and sends the scope/ID handoff. |
| A2 Plan and STLC | Structurally complete; review pending | `test-plan-supplement.md`, `stlc.md` | Approved product plan preserved; local environment responsibility and evidence location established | Ilmam reviews and freezes wording only after group feedback. |
| A3 Black-box design | Complete for planned scope; execution partial | `black-box.md`, `manual-cases.md`, updated `traceability.md` | Product name/URL/own-price partitions; name/brand/discovery/rate-limit boundaries; matching decision table; 20 detailed cases | Ilmam explains techniques and shares stable cases with B/C; record their actual references only when received. |
| A4 Execute and reconcile | Cross-role evidence reconciled; dependent slices open | Evidence through 22 Nov; `TC-AUTH-001` partial; `TC-AUTH-002`, `003`, `005`, `006` passed; B mapped and merged; C CI passed but mapping correction/merge pending; D evidence absent | Integrated main: typecheck passed; unit 83 passed/23 skipped; BDD 4 scenarios/17 steps; matching coverage 100% statements/branches. Audit: 22 findings. | Obtain C's corrected/merged mapping and D's real defect/scan links; complete remaining selected manual cases; never contact live marketplaces. |

## Repository state

- Branch: `qa/ec4206-role-a-22nov`
- Integrated base: `17307a5baaa43527ea993af9a2d36ae548372b5e` (`origin/main` after PRs #41, #44 and #43 merged)
- Role A PR [#41](https://github.com/st4rk-7/Riven/pull/41) and mapping PR [#44](https://github.com/st4rk-7/Riven/pull/44) are merged
- Test execution: `TC-AUTH-001` has partial evidence; `TC-AUTH-002`, `003`, `005`, and `006` passed; all other cases remain Not run
- Remote freshness: fetched 22 November; `origin/main` was `17307a5baaa43527ea993af9a2d36ae548372b5e`
- Jira: omitted for this EC4206 workstream at Ilmam's direction
- Cross-role status: B merged in PR #43; C PR #45 is open with passing CI and a Role A mapping correction requested; no Role D EC4206 branch/PR/defect issue observed

## 22 November milestone

- Cross-role integration: Role B evidence and Role A mapping are merged; Role C's two CI runs passed but PR #45 and its partial-mapping correction remain open.
- CI/local rerun: typecheck passed; unit suite passed 83 with 23 skipped when loopback fixture access was allowed; BDD passed 4 scenarios/17 steps; focused matching coverage was 100% statements and branches.
- Actual security metric: `npm audit --json` reported 22 findings (1 low, 17 moderate, 2 high, 2 critical); no automatic fix was applied.
- Defect links: none received from Role D. Existing GitHub issues #1-#4 are unrelated product issues and were not repurposed. No defect ID was invented.
- Evidence: `evidence/integration-2026-11-22.md`.
- Remaining dependencies: Hirukshanan must correct or explicitly narrow the `AT-003/004` mappings and merge PR #45; Dilsan must provide real defect/scan links and dispositions.

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
