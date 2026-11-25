# Role D quality review

Owner: Dilsan. Prepared on 22 November 2026 and reviewed on 23 November 2026.
Last updated: 25 November 2026.
Status: I completed the evidence package for the [25 November follow-up](#follow-up--25-november-2026). The baseline evidence is merged in PR #50. PR #51 is open for team review.

The baseline sections below retain the results and open items recorded on 22–23 November 2026.

## Measured conclusion

The tested application passed the existing local type checks, 83 unit tests, 26 integration tests, four BDD scenarios and both builds. A ten-user local JMeter read workload also completed 3,269 samples with zero errors and p95 17 ms. Automated checks support only the assertions and small synthetic data they execute. They do not establish full security, accessibility, browser performance or production readiness. Manual browser security/usability and SonarQube have not run.

## Baseline and preflight

- The checks were run from branch `qa/ec4206-role-d` at application commit `17307a5baaa43527ea993af9a2d36ae548372b5e`, the merge of PR #43. At the initial preflight, this matched GitHub main and no remote Role D branch existed.
- Existing QA documents belong to earlier A/B/C work: strategy, supplement, STLC, black-box, white-box, traceability, manual cases and ledger. They were preserved. Dedicated Role D files were absent initially.
- Node 24.16.0, npm 11.13.0, Windows 11 Home Single Language 10.0.26300 64-bit, 16 logical processors, 16,794,746,880 bytes RAM. Docker 29.8.2, Compose 5.6.0, PostgreSQL 18.6, Java 21.0.12.1. Dependencies already installed; no clean dependency installation was run.
- TEST_DATABASE_URL was verified as loopback `riven_test`, separate from local development. Retailer count was zero before integration and zero afterward. Existing tests apply migrations and create/remove synthetic rows; `db:check` uses transactions and rolls its test rows back. No development/production database operations were performed.
- GitHub main and [PR #43](https://github.com/st4rk-7/Riven/pull/43) were verified.PR #43 and its committed red/green tests are the QA defect evidence.
- The supplied Role D guide was read in full privately.
- On 23 November 2026, GitHub main was fetched at `b4614f8191091e41fb9bd6f4f5280a4a11266694` after [PR #48](https://github.com/st4rk-7/Riven/pull/48) merged. The recorded local test results still apply to `17307a5...`; the later commits contain team QA workflow, tests and documents and are not silently included in those results.

## Task ledger

| Task | Local deliverable | Status | Evidence / remaining gate |
| --- | --- | --- | --- |
| D1 | [Plan](nonfunctional.md), [metrics](metrics.md), [defect template](defect-template.md), security/usability cases | Prepared and owner reviewed | Team use of the GitHub format and lecturer task list are not independently confirmed |
| D2 | Existing automated checks and local JMeter API workload executed; security mapping reviewed | Partial | [JMeter evidence](evidence/role-d/performance/run-summary.md); browser timing, manual OWASP/usability and screenshots NOT RUN |
| D3 | [Historical defect/RCA](evidence/role-d/defects-and-rca.md), measured unit coverage, inspected historical CI | Partial | Sonar BLOCKED; no comparable GitHub defect-issue lifecycle exists; PR history and handoff status recorded |
| D4 | Recommendations, [reflection](reflection.md), handoff/submission checklist | Prepared and owner reviewed | Missing manual/Sonar work remains explicit; team final integration still needs the Role D PR link |

Independent later work does not turn an unexecuted check into a pass. No GitHub defect issue was created because PR #43 already provides the available matching-defect evidence.

## D1 plan and scope

Primary scope: NFR-01, NFR-03, NFR-05, NFR-06 and NFR-09, with FR-01/04/06/11 and selected reliability, maintainability, extractor/privacy checks. I reviewed this scope on 23 November 2026. Requirements retain built/partial/planned distinctions; current site rules and product-page capture code are ahead of older SRS/test-plan status text.

QA record decision: GitHub is the record for this Quality Assurance workstream, following Role A strategy section 8. Jira belongs to the separate Software Project subject. Keep `qa/ec4206-role-d` as the QA branch and use GitHub PRs, evidence files and team review for this work. The matching fix is traceable through PR #43 and the red/green tests; RIV-45 is historical Software Project context only.

## D2 performance

EXECUTED for the defined local API workload. After approval, Apache JMeter 5.6.3 was downloaded outside the repository and its official SHA-512 matched. The test forced the API to loopback port 3100, local `riven_test`, crawler disabled, and used only repository-defined synthetic data. The final run used ten virtual users, a 60-second ramp, 360-second total duration, one-second think time and two pre-authenticated sessions shared five threads each. Products and observations responses asserted the expected tenant IDs.

Result: 3,269/3,269 successful HTTP 200 samples, zero unexpected errors, average 10.24 ms, p50 9 ms, p90 15 ms, p95 17 ms, p99 26 ms, maximum 75 ms and 9.138 requests/second. See the [plan, raw JTL and calculation](evidence/role-d/performance/run-summary.md). This is useful partial NFR-03 API evidence, not proof that the React dashboard renders within three seconds. The dataset has only two retailers, one product and one observation each, only two sessions, and no production/network latency. Browser timing remains NOT RUN and NFR-09 pilot capacity remains unverified.

Build observation: the app chunk was 729.43 kB minified (195.68 kB gzip) and the Detail chunk 355.66 kB (103.24 kB gzip). Vite emitted its >500 kB chunk warning. Build duration is not dashboard render time and this warning is not a failed NFR-03 measurement.

## D2 security and usability

The [security checklist](security-checklist.md) maps existing test names to SEC cases. The integration suite passed 26/26, including signed-out rejection, misleading tenant IDs, observation/attempt isolation, session expiry/tampering/revocation and Origin restrictions. These use real PostgreSQL/Better Auth with Fastify injection, not a manually observed browser or external deployed API. SEC-03 edit/decision routes lack dedicated coverage in this mapping; deletion checks are covered. No complete SEC-03 pass is asserted.

Manual OWASP cases are NOT RUN. All eight [usability cases](usability-checklist.md) and screenshot collection are NOT RUN; task, keyboard, label and viewport metrics are N/A. Clear JSX labels alone do not establish accessible names, focus, contrast or responsive behavior at runtime.

## Executed checks and metrics

| Command | Observed result | Evidence |
| --- | --- | --- |
| `npm.cmd run typecheck` | PASS, web/server/extension | [typecheck](evidence/role-d/typecheck.txt) |
| `npm.cmd test` | PASS, 83 passed, 23 skipped, 12 files passed/3 skipped | [unit](evidence/role-d/unit.txt) |
| `npm.cmd run test:integration` | PASS, 26 passed, four files | [integration](evidence/role-d/integration.txt) |
| `npm.cmd run db:check` | Sandbox setup failure, then PASS outside sandbox | [failed start](evidence/role-d/db-check.txt), [successful output transcript](evidence/role-d/retry-results.md) |
| `npm.cmd run test:coverage` | PASS, unit-only, 83 passed/23 skipped | [log](evidence/role-d/coverage-unit.txt), [sanitized JSON](evidence/role-d/coverage-unit-summary.json) |
| `npm.cmd run test:bdd` | Sandbox setup failure, then PASS: four scenarios, 17 steps | [failed start](evidence/role-d/bdd.txt), [successful output transcript](evidence/role-d/retry-results.md) |
| `npm.cmd run build:web` | PASS with chunk-size warning | [web build](evidence/role-d/build-web.txt) |
| `npm.cmd run build:extension` | PASS, local API target | [extension build](evidence/role-d/build-extension.txt) |
| `node node_modules/vitest/vitest.mjs run server/matching.test.ts --reporter=verbose` | PASS, 21 tests | [matching retest](evidence/role-d/matching-retest.txt) |
| Apache JMeter 5.6.3, `riven-dashboard.jmx` | PASS, 3,269/3,269 local read samples; p95 17 ms; 0 errors | [JMeter evidence](evidence/role-d/performance/run-summary.md) |

Unit pass rate = 83/(83+0) x 100 = 100%; failure rate = 0%; 23 skipped explicitly excluded. Integration pass rate = 26/(26+0) x 100 = 100%. Do not sum these runs as independent unique tests: discovery parser tests appear in both. Coverage/focused runs also repeat tests.

Unit coverage: statements 240/744 = 32.25%; branches 209/499 = 41.88%; functions 55/143 = 38.46%; lines 207/648 = 31.94% (tool percentages truncate). Matching alone: statements 39/39, branches 35/35, functions 15/15, lines 29/29, all 100%. Denominator: non-test server/shared/extension source, excluding BDD steps/fixtures and all web UI. The fresh result matches Role B's final historical summary; it does not include integration coverage.

Defect population: one historical matching defect documented through QA PR #43, with no new confirmed product defects. This is not a project-wide defect count. QA mean time to close is N/A because there is no defined comparable GitHub defect population; the earlier Jira elapsed time belongs to Software Project history and is excluded. Defect density, project severity distribution, reopened count, agreed requirement coverage and Sonar metrics are N/A because their defined populations/evidence are incomplete. JMeter metrics are reported only for the defined local read workload above. The [audit and timeout review](evidence/role-d/audit-and-timeout-review.md) records a fresh 22-finding npm audit and the test reliability disposition separately from confirmed product defects. See [metric dictionary](metrics.md).

## D3 static quality and cross-role evidence

SonarQube: BLOCKED / NOT RUN. No repository configuration, scanner on PATH or approved server/project was identified. No token was printed, no service created and no gate/bugs/hotspots/ratings inferred. Next: identify an approved scanner/server/project and agree the SHA, or accept this limitation for the submission.

Role B: [white-box report](white-box.md) and [original coverage log](evidence/b3-coverage.txt) were inspected. Original figures identify base `7a1eb88` plus working changes; today's rerun binds the same measured numbers to the current exact application SHA. B's final acceptance is not assumed.

Historical CI: [run 44891561292](https://github.com/st4rk-7/Riven/actions/runs/44891561292) completed successfully for Role B head `6fb684942bd335a5a71cb9505baa6aa8a59a95a2`. Job/steps show typecheck, database checks and tests succeeded. The wrapper returned no PR-triggered runs for merge baseline `17307a5...`; no new Role D CI exists.

Cross-role follow-up on 23 November 2026: [Role C PR #45](https://github.com/st4rk-7/Riven/pull/45), [Role A PR #46](https://github.com/st4rk-7/Riven/pull/46), [PR #47](https://github.com/st4rk-7/Riven/pull/47) and final-review [PR #48](https://github.com/st4rk-7/Riven/pull/48) are merged. PR #48 passed its GitHub check but records the Role D evidence as missing. A follow-up must add the Role D PR/evidence link after this package is published. This does not claim the local Role D documents have passed remote CI yet.

## D4 recommendations

All recommendations are PROPOSED. Component responsibilities below come from handbook section 2; QA work assignment and acceptance remain unconfirmed.

| Priority and finding | Requirement | Specific action | Responsible area / benefit | Effort and risk | Retest |
| --- | --- | --- | --- | --- | --- |
| High: local API reads were fast on tiny data, but browser evidence is missing and Vite reports a large app chunk | NFR-03/06/09 | Measure a populated browser dashboard and repeat JMeter with an agreed larger pilot dataset before selecting an optimization; inspect bundle imports only if browser timing identifies a problem | Dilsan frontend, Ilmam environment; separates render/data-size risk from fast small API reads | Medium: browser/data preparation; avoid external collection | Browser usable-state timings and USA cases at 320/375/768 px; repeat JMeter with stated pilot rows/sessions |
| High: existing security regression does not establish cross-tenant edit and match-decision route coverage | NFR-01, FR-02/04 | Hirukshanan reviews disposable A/B tests for PATCH product and PATCH observation ownership; assert B unchanged and safe 404, plus A success | Hirukshanan API area; guards private mutations | Small/medium: tests first, no API contract change assumed | Focused route tests that fail if ownership filter is removed, then integration suite |
| Medium: unit coverage omits database execution/UI; original B evidence used working changes and separate CI SHA | NFR-07 | Agree final A scope, import real integration coverage into approved static-analysis setup, retain exact SHA/report/run links and explicit exclusions | Role B/C evidence coordination with Ilmam CI area; auditable reproducibility | Medium: artifact/config agreement; no dependency or service change until approved | Recalculate statement/branch/function/line measures on agreed SHA; verify actual CI and Sonar report import |

## Baseline closure and handoff — 22–23 November 2026

- [x] Local preflight, source tracing and permitted automated baseline checks recorded.
- [x] Plan, template, dictionary, result index, historical RCA and proposed recommendations drafted.
- [x] I reviewed the task scope, important limitations and outputs before submission.
- [x] QA tracking choice confirmed by myself: GitHub only; separate Software Project Jira history is contextual.
- [x] JMeter local API workload executed with raw evidence and limitations.
- [x] Tested application commit is recorded as `17307a5...`; Dilsan reviewed and approved the Role D evidence package.
- [x] I authorized the Role D commit, push and pull request on 23 November 2026. Merge remains a team review action.

At the 22–23 November baseline, I had yet to collect the manual browser security and usability evidence or run SonarQube. The final matrix, Role B coverage acceptance, and Role C mapping and CI reconciliation were still team handoff items. The [handoff messages](role-d-handoff.md) were drafts at that point. See [reflection](reflection.md) for the contribution record.

## Follow-up — 25 November 2026

| Area | Follow-up result | Evidence |
| --- | --- | --- |
| D2 usability | I ran selected local Brave checks for keyboard sign-in, accessibility, product controls, responsive layout, and contrast. The report gives the result for each case. | [Usability report](evidence/role-d/manual-usability-report.md) |
| D2 browser timing | The populated Products screen was visible in about 1.4 s with cache enabled and 0.6 s with cache disabled in two local runs. Both observations were within the proposed 3 s target at 320 × 768 CSS px. | [Dashboard timing report](evidence/role-d/performance/browser-timing.md) |
| D2 security | The SEC-01 signed-out reads, SEC-02 retailer isolation checks, and SEC-07 two-tab sign-out check passed within their reported scope. The SEC-01 protected write, SEC-03 through SEC-06, and SEC-07 server-side revocation check remain outside this follow-up. | [Manual security report](evidence/role-d/manual-security-report.md) |
| D3 SonarQube | I scanned `57b8451` locally. The dashboard showed a passed Quality Gate and 486 issues overall, including one Low security finding in a saved fixture. The scan did not import coverage. | [Scan report](evidence/role-d/sonarqube-scan.md) and [scanner transcript](evidence/role-d/sonarqube-scanner-sanitized.txt) |

[PR #51](https://github.com/st4rk-7/Riven/pull/51) contains the follow-up evidence. The original application baseline and the Role A manual case verdicts keep their previously recorded scope.

### Follow-up checklist — 25 November 2026

- [x] Recorded the selected manual usability checks, their results, and links to supporting screenshots.
- [x] Recorded two local browser timing runs, one with cache enabled and one with cache disabled.
- [x] Recorded the selected security checks and listed the checks outside this follow-up.
- [x] Completed the local SonarQube scan on `57b8451` and linked the scanner transcript and dashboard evidence. The scan did not import coverage.
- [x] Opened PR #51 and linked the follow-up reports from the final review.

My follow-up evidence is complete for review.
