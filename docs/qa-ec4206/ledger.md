# EC4206 Role A Ledger

Owner: Ilmam
Updated: 20 November 2026 (Asia/Colombo)

| Task | Status | Artifacts | Real evidence / dependency | Next step |
|---|---|---|---|---|
| A1 Scope and system map | Draft ready for group review | `strategy.md`, `traceability.md` | Baseline `29af237`; remote freshness rechecked on 20 Nov and `origin/main` still matched; group approval not observed | Ilmam reviews and sends the scope/ID handoff. |
| A2 Plan and STLC | Structurally complete; review pending | `test-plan-supplement.md`, `stlc.md` | Approved product plan preserved; local environment responsibility and evidence location established | Ilmam reviews and freezes wording only after group feedback. |
| A3 Black-box design | Complete for planned scope; execution partial | `black-box.md`, `manual-cases.md`, updated `traceability.md` | Product name/URL/own-price partitions; name/brand/discovery/rate-limit boundaries; matching decision table; 20 detailed cases | Ilmam explains techniques and shares stable cases with B/C; record their actual references only when received. |
| A4 Execute and reconcile | Manual execution in progress; four passed outcomes | Seven evidence records dated 19-20 Nov; `TC-AUTH-001` partial; `TC-AUTH-002`, `003`, `005`, `006` passed; remaining cases and final matrix pending | Dependencies/typecheck ready; database checks passed; serial integration 26/26; environment restarted on 20 Nov. Branch typecheck passed. Default `npm test` had one 5-second extension-fixture timeout (75 passed/23 skipped); the unchanged test passed 6/6 with 15 seconds and the full rerun passed 76/23. No product defect observed. | Complete `TC-AUTH-001`/`004`, then selected product/offer cases; ask Dilsan whether the default-timeout instability needs a defect ID; obtain B/C references; never contact live marketplaces. |

## Repository state

- Branch: `qa/ec4206-role-a`
- Base: `29af23787b9de37d65f3ed00d30297e4f67185b3`
- Pull request: [#41](https://github.com/st4rk-7/Riven/pull/41) is open from `qa/ec4206-role-a` into `main`; it initially contained 9 commits and 14 changed files
- Test execution: `TC-AUTH-001` has partial evidence; `TC-AUTH-002`, `003`, `005`, and `006` passed; all other cases remain Not run
- Remote freshness: fetched 20 November; `origin/main` remained `29af23787b9de37d65f3ed00d30297e4f67185b3`
- Jira: omitted for this EC4206 workstream at Ilmam's direction
- B/C/D branch or baseline status: not observed; do not claim active

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
