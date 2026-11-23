# Role D metric dictionary

D1 proposal. Current measurements belong in [Role D evidence](evidence/role-d/README.md) with run/time/zone/SHA. N/A means unavailable, not zero. Report separate measures; no combined quality score.

| Metric / requirement | Formula and unit | Source / collection | Interpretation and limitation |
| --- | --- | --- | --- |
| Test execution, NFR-07 | passed + failed, count | Exact Vitest run summary | Exclude skipped/blocked; do not add focused retests to full-suite unique totals |
| Test pass/failure rate, NFR-07 | passed or failed / (passed + failed) x 100, % | Same run | N/A if denominator 0; separate product assertions from setup errors |
| Requirement coverage, agreed FR/NFR | IDs with executed mapped tests / agreed in-scope IDs x 100, % | Frozen traceability matrix plus execution | Partial test execution does not mean full requirement acceptance; N/A until scope agreed |
| API average/min/max, NFR-03 | sum durations / n; smallest/largest, ms | Actual JMeter JTL | API only; exclude setup, record failures and sample population |
| API p50/p90/p95/p99, NFR-03 | Ordered duration at ceil(p x n), ms (nearest rank) | JTL calculator or actual tool report | Record tool convention if different; small n weakens tail estimates |
| Throughput, NFR-03/09 | completed measured requests / elapsed measurement seconds, req/s | JTL timestamps and run window | Define ramp inclusion; transaction parents not counted again as HTTP samples |
| Unexpected error rate, NFR-03 | unexpected failures / measured requests x 100, % | JTL assertions/status | Deliberate security 401/403/404 are separate expected outcomes |
| Concurrency and total samples, NFR-03/09 | configured users and completed HTTP samples, counts | JMX and JTL | Configured users do not prove observed active concurrency; record actual ramp/duration |
| Dashboard render time, NFR-03 | usable populated dashboard marker minus navigation start, ms | Local browser trace | Record cache/view/data; separate from JMeter response times |
| Task completion, NFR-06 | completed tasks / attempted tasks x 100, % | USA cases with tester count | No attempted tasks => N/A; no population inference from one tester |
| Keyboard completion, NFR-06 | pass/fail for each task; optional passed / executed x 100 | USA-01/03/04/05 | Record actual route and controls |
| Label coverage, NFR-06 | fields with clear accessible names / fields inspected x 100, % | Browser accessibility tree | Define screen/field population, not just JSX labels |
| Responsive pass rate, NFR-06 | passed viewport cases / executed viewport cases x 100, % | USA-07 | Record exact viewport dimensions and tasks |
| Confirmed defect count, relevant FR/NFR | reproducible unique confirmed defects, count | GitHub issues/PRs and defect register | Exclude duplicate, planned feature, suspicion and static warning |
| Defect density, relevant FR/NFR | confirmed in-scope defects / (defined source LOC / 1000), defects/KLOC | GitHub record plus exact code scope/counting tool | Define physical vs logical LOC and blank/comment policy; N/A until population verified |
| Severity distribution | confirmed defects per agreed severity, count | GitHub QA record | Severity agreement pending; count alone says little about impact |
| Mean time to close | mean(actual closed - actual created timestamps), hours | GitHub issue/PR timeline | N/A without a defined comparable population; do not use unrelated Jira status dates |
| Reopened count | confirmed defects reopened after closure, count | GitHub issue/PR timeline | N/A without history |
| Sonar findings, NFR-07 | bugs, vulnerabilities, hotspots/review, smells, duplication and ratings as produced | Actual scan on agreed SHA | Scanner/server absent or inaccessible => N/A, no quality gate inferred |
| Code coverage, NFR-07 | covered / total statements, branches, functions, lines x 100 separately | V8 JSON summary and exact config/SHA | Denominator excludes web UI; database-skipped unit coverage is not system coverage; Sonar coverage needs actual import |

For every reported value retain purpose/requirement, formula, units, source, run ID, actual date/time, collection command, interpretation and limitations. Rerun results must not silently replace historical evidence.
