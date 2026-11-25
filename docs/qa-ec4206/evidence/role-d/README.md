# Role D evidence index

For the later checks, see the [manual usability report](manual-usability-report.md), [dashboard reload evidence](performance/browser-timing.md), [manual security report](manual-security-report.md), and [SonarQube scan](sonarqube-scan.md). I ran the manual checks and the scanner. AI assistance was used to set up local SonarQube, verify local security API results, and edit the follow-up notes and reports.

Session: 22 November 2026, Asia/Calcutta (UTC+05:30). Baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e`; branch `qa/ec4206-role-d`. Role D documentation is separate from the tested application baseline. Automated tooling and AI assistance were used to organize evidence. I reviewed and approved the evidence package on 23 November 2026.

Initial preflight: clean tree; no upstream; local main and cached origin/main equal baseline. Connector startup initially timed out, then recovered. Live GitHub main was verified equal to baseline; a remote Role D branch search returned no match. I confirmed GitHub-only tracking for Quality Assurance. The earlier Software Project Jira search and RIV-45 history are preserved as background in [sanitized remote evidence](remote-state.json), not as QA status.

Node v24.16.0; npm 11.13.0; Docker 29.8.2; Compose 5.6.0; Java 21.0.12.1. Dependencies present. JMeter was initially absent, then Apache JMeter 5.6.3 was downloaded to a temporary directory after approval and its official SHA-512 matched. No project dependency changed. `sonar-scanner` and an approved Sonar project/server were not found. Docker read-only inspection needed sandbox escalation and reported postgres:18.6-alpine healthy, bound to loopback port 5432. TEST_DATABASE_URL safety inspection returned local=true, testDatabase=true, port=5432; development URL is local but not a test database. Secret values were not printed or changed.

The master instruction file was read completely. The five-page Role D PDF in the private QA directory was read with `pypdf`, installed only in a temporary directory outside the repository after approval. No project dependency or lockfile changed, and no PDF was copied into Git. No separate lecturer task list was found in the repository, local-reference (absent), or the immediate QA directory. Exact cutoff unverified.

## Evidence rules

Each log must state run/time/zone, command, SHA/branch, expected/actual result and exit code. Sanitize secrets before saving; no cookies, real account data or raw private documents. Existing other-role evidence is linked, never overwritten. Unit, integration, manual, JMeter and Sonar results are separate. Unavailable metrics are N/A. See [main report](../../role-d-quality-review.md) for the ledger and limitations.

## Executed evidence

| File | Result and scope |
| --- | --- |
| [typecheck.txt](typecheck.txt) | Three TypeScript checks passed |
| [unit.txt](unit.txt) | 83 passed, 23 skipped; no database environment |
| [integration.txt](integration.txt) | 26 passed using verified local test database |
| [coverage-unit.txt](coverage-unit.txt), [summary JSON](coverage-unit-summary.json) | Unit-only V8 results; web UI excluded; database tests skipped |
| [matching-retest.txt](matching-retest.txt) | Fresh 21-test historical-fix retest |
| [bdd.txt](bdd.txt), [db-check.txt](db-check.txt) | Initial sandbox startup failures; not product failures |
| [retry-results.md](retry-results.md) | Successful BDD/database retry output transcriptions, with timestamp limitation |
| [build-web.txt](build-web.txt), [build-extension.txt](build-extension.txt) | Builds passed; web chunk warning retained |
| [remote-state.json](remote-state.json), [CI evidence](ci-state.json) | Historical Software Project cross-reference and GitHub CI observations |
| [defects-and-rca.md](defects-and-rca.md) | PR #43 matching defect and RCA, no new invented defect |
| [audit-and-timeout-review.md](audit-and-timeout-review.md), [audit retry data](audit-current-retry.json) | Fresh dependency audit and timeout disposition |
| [performance/run-summary.md](performance/run-summary.md), [JMX](performance/riven-dashboard.jmx), [raw JTL](performance/final.jtl) | Ten-user local read workload: 3,269/3,269 successful, p95 17 ms, two-session limitation |

Unit/coverage runs overlap with integration's discovery parser tests and focused retests; do not add totals into a unique system-test count. The 22–23 November baseline included a sanitized JTL. The browser captures and SonarQube scan were added in the [25 November follow-up](../../role-d-quality-review.md#follow-up--25-november-2026). Baseline integration, database, and JMeter checks used local `riven_test`. The JMeter seed created two fixed retailers and cleanup removed both, leaving zero of those IDs. Full Windows specs are recorded in the main report. The review SHA identifies the baseline runs.
