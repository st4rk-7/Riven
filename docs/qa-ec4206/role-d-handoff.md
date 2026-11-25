# Role D handoff

Prepared on 22 November 2026 and owner reviewed on 23 November 2026. The messages below remain copy-ready until they are actually sent. Unexecuted checks remain limitations.

## QA tracking

I confirmed that Quality Assurance uses GitHub only; Jira belongs to the separate Software Project subject. The local `qa/ec4206-role-d` branch, proposed PR and repository evidence carry this work. PR #43 carries the matching defect and fix evidence. No separate GitHub issue for that defect was found; no issue ID is invented. The Jira RIV-45 link is optional historical context only.

## Proposed PR

Title: docs(qa): draft Role D plan, baseline evidence and quality review

What changed: Adds the Role D nonfunctional plan, security/usability cases, metric dictionary, defect template, local evidence index, PR #43 matching RCA, quality review, reflection and handoff drafts. Existing role documents and product code are preserved.

Why: Make the current evidence and missing work reviewable against NFR-01/03/05/06/09 and supporting FR-01/04/06/11 without claiming assignment closure.

Checks executed: npm.cmd run typecheck; npm.cmd test (83 passed, 23 skipped); npm.cmd run test:integration (26 passed); npm.cmd run db:check (successful sandbox retry); npm.cmd run test:coverage (unit-only); npm.cmd run test:bdd (successful retry, four scenarios/17 steps); npm.cmd run build:web (passes with chunk warning); npm.cmd run build:extension; focused matching verbose retest (21 passed); JMeter 5.6.3 local ten-user read workload (3,269 passed, p95 17 ms, 0 errors). See role-d-quality-review.md for commands, denominators and evidence links.

Limitations: browser timing/manual security/usability/Sonar not run; JMeter used a tiny dataset and two shared sessions; lecturer task list/cutoff missing; historical CI applies to other-role heads. No product change or live-source testing was performed. PDF/JMeter tools were installed only in temporary directories outside the repository; no project dependency or lockfile changed.

QA record: GitHub branch/PR and repository evidence. Tested application SHA: `17307a5baaa43527ea993af9a2d36ae548372b5e`. The Role D PR URL will be the publication record.

## Copy-ready progress messages

D1: Role D D1 prepared: nonfunctional plan, security/usability cases, defect template and metric dictionary. GitHub is the QA record. I reviewed the scope and evidence. Tested application baseline: `17307a5`. Next: team review of the GitHub format and Role D PR.

D2: Role D D2 partial: local JMeter completed 3,269/3,269 API read samples for 10 virtual users, p95 17 ms and 0 errors; 83 unit and 26 integration tests also passed. Browser timing and manual security/usability have not run. Evidence: docs/qa-ec4206/evidence/role-d/. Next: local browser observations.

D3: Role D D3 partial: PR #43 contains the confirmed matching fix; 21 matching tests pass on 17307a5. Unit coverage is 32.25% statements and 41.88% branches, not system coverage. Sonar not run. Historical CI: https://github.com/st4rk-7/Riven/actions/runs/44891561292. Next: approved scan environment and final B/C evidence.

D4: Role D D4 review prepared with three recommendations, reflection and an honest limitations checklist. PRs #45-#48 are merged, but the final review still lacks the Role D evidence link. Next: team review of the Role D PR and final-matrix link update. Manual browser/security/usability and Sonar measurements remain not run.

## Dependency messages for Dilsan to send

@Ilmam PR #46 is merged, but its body records the Role D link as missing. After my Role D PR exists, please add its evidence link to the integration record and review the GitHub defect format. Dilsan confirmed GitHub-only QA tracking. Meanwhile the local baseline checks and report draft are ready.

@Sanjeew please review the Role D defect format and confirm your final coverage command, exact commit, denominator, report path and known gaps before the planned 23 November review. Today's unit rerun on 17307a5 reproduces 32.25% statements / 41.88% branches; it excludes UI and integration execution. Meanwhile I can review the historical matching RCA.

@Hirukshanan PR #45 at `dfa7c1d` has passing checks and now labels AT-003/AT-004 as partial. Please complete review/merge and confirm the final CI run links and mapping file. Please also review the proposed cross-tenant PATCH route tests. Meanwhile independent report reconciliation can continue.

These dates are proposed requests, not previously agreed deadlines or messages already delivered.

## Reply draft for Ilmam's 22 November request

@Ilmam I checked the three Role D items for the GitHub QA workstream. The confirmed matching defect and fix are documented in [PR #43](https://github.com/st4rk-7/Riven/pull/43); 21 matching tests passed on commit `17307a5`. I propose Medium severity because the old rule could hide a valid offer. No separate GitHub defect issue was found. The five-second fixture timeout has no QA defect ID: your 20 Nov default run failed once, the 15-second reruns passed, and my current default run passed 83/83 with 23 database skips. I classify it as a test reliability observation pending recurrence. A fresh `npm.cmd audit --json` reports 22 findings (1 low, 17 moderate, 2 high, 2 critical). These need root-package/exposure review and tested updates; no automatic fix or claim of 22 exploitable product bugs. SonarQube has not run because no approved scanner/project was found. PR #46 is already merged and says the Role D link is missing; please add my Role D PR/evidence link in a follow-up after it exists. Full evidence: `docs/qa-ec4206/evidence/role-d/audit-and-timeout-review.md` and `docs/qa-ec4206/role-d-quality-review.md`. This is a draft reply; it has not been sent.
