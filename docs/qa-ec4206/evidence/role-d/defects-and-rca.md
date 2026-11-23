# Role D defect register and RCA

Baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e`. Review date: 22 November 2026, UTC+05:30. No new product defect was confirmed in today's executed checks. Setup errors below are environment observations, not invented product defects.

## Matching defect documented in QA PR #43

`packSize()` incorrectly interpreted dimensions as package quantities; FR-04. The QA evidence is [PR #43](https://github.com/st4rk-7/Riven/pull/43) and its red/green test logs. A search found no separate GitHub issue for this defect. [RIV-45](https://st4rk.atlassian.net/browse/RIV-45) is a Software Project Jira cross-reference, not the QA record. Suggested severity Medium because a legitimate competitor may be hidden while manual investigation remains possible; team severity/priority agreement is not recorded. Product component responsibility is Shewon's matching/data-quality area, not a new QA assignment.

The separate Software Project [Jira history](remote-state.json) shows creation at 21 Nov 2026 21:20:22.797 +05:30 and To Do -> Done at 22 Nov 03:38:51.664. It is not used to calculate a QA lifecycle metric. The QA fix/retest history is evidenced by the GitHub PR, committed logs and fresh local retest. Do not invent a New -> In Progress -> Fixed -> Closed sequence.

## Reproduction and code path

Synthetic input: Dell Monitor 1920 x 1080 and Cotton Towel 70 x 140 cm. Expected package size 1, because these are measurements, not packs. Role B's original [red log](../b3-tdd-red.txt) records 1080 and 140 and a monitor mismatch; it ran on base `7a1eb88` plus test-only changes on 21 November. This is historical execution, not a new pre-fix run by Role D.

Path: discovery or validated collected offer -> matchOffer -> packSize -> differing count -> mismatch -> discovery drops candidate / save path leaves it unlinked -> retailer misses a useful comparison. The SRS matching criterion distinguishes actual variant conflicts and retains title-only candidates as unverified.

## Cause and correction

The merge-parent diff shows the old `\bx\s?(\d+)\b` rule accepted any x followed by a number. It lacked context that x preceded by a number denotes dimensions. The fix adds a negative lookbehind `(?<!\d\s*)` before x. Current tests keep x 4 as a four-pack but treat 1920 x 1080 and 70 x 140 cm as single items. This immediate technical cause is supported by code and red/green logs. Why the author chose that original rule and why review missed it are unconfirmed; the plausible detection gap is a missing measurement example, not a verified account of the team's reasoning.

Corrective action already present in the baseline: guarded dimension parsing plus regression tests. Preventive proposal: keep semantic edge cases for dimensions, explicit pack phrases and model numbers; review assumptions when adding another platform/channel. No new fix or dependency was introduced by Role D.

Fresh retest: [matching-retest.txt](matching-retest.txt), `node node_modules/vitest/vitest.mjs run server/matching.test.ts --reporter=verbose`, 22 Nov at 14:21:04 +05:30, Vitest 5.0.3 / Node 24.16.0 / Windows, all 21 tests passed. Full unit coverage also reports matching branches 35/35. This supports the repaired examples, not live marketplace success or all possible titles. Remaining limitation from Role B: ambiguous titles such as Batteries 10 x 4 are not proven valid pack notation.

## Other observations

| Observation | Classification | Disposition |
| --- | --- | --- |
| BDD and db:check failed at uv_os_get_passwd under sandbox, succeeded outside | Environment setup, not a product assertion failure | Preserve failed logs and successful transcripts separately |
| Web build warns about >500 kB chunk | Measured static build warning, not measured slow dashboard | Measure local browser performance before optimization |
| Existing tests omit dedicated cross-tenant PATCH product/match-decision route evidence | Coverage gap, not confirmed unauthorized access | Proposed owner tests in main report |
| Role B historical npm audit reported 22 findings | Dependency observation; a fresh read-only audit also returned 22 findings | See [audit review](audit-and-timeout-review.md); group by cause and exposure before any fix |
| Planned suspect-price, stale, skip-unchanged and shared-listing behavior | Product roadmap/gaps, not newly discovered regressions | Preserve approved scope; coordinate with existing owners |
