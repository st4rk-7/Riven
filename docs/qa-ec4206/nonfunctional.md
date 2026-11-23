# Role D nonfunctional test plan

Status: D1 draft for Dilsan and team review, 22 November 2026 (Asia/Calcutta, UTC+05:30).
Baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e`, branch `qa/ec4206-role-d`, no upstream.


## Purpose and scope

Evaluate current retailer privacy, honest data, dashboard performance and usability using synthetic local data. Requirements remain defined by the [SRS](../requirements.md); the [approved test plan](../test-plan.md) defines baseline checks. [Role A scope](strategy.md) provides SCP-AUTH, SCP-PROD and SCP-OFFER. Do not extend product scope or treat planned features as built.

| Requirement | Current scope and method | Initial status |
| --- | --- | --- |
| FR-01, NFR-01 | SEC-01..07: signed-out access, two-account isolation, identity spoofing, session revocation and Origin rules | READY for existing automated tests; manual checks NOT RUN |
| NFR-03 | PERF-01: JMeter authenticated dashboard API reads; PERF-02: separate browser render timing | PERF-01 EXECUTED/PASS for defined local API workload; PERF-02 NOT RUN |
| NFR-05, FR-06, FR-11 | Existing parser/save-path tests for decimal money, nulls, failed attempts and preserved history | READY; suspect-price and stale guards remain planned |
| NFR-06 | USA-01..08 in [usability checklist](usability-checklist.md) | NOT RUN |
| NFR-09 | Inspect query/concurrency bounds; measure only an agreed pilot dataset | PLANNED; pilot capacity not agreed |
| NFR-02 | Existing local-server blocked/no-retry checks; inspect failure preservation | READY; retry/spacing rules remain partial |
| NFR-07 | Typecheck, fixture tests, build and coverage; separate components | READY; coverage is not a maintainability rating |
| NFR-10, NFR-12 | Site extractor and product-only extension capture tests exist at this commit | READY for focused automated evidence; full platform/privacy acceptance unverified |
| NFR-04, 08, 11 | Freshness, restore and sanitized diagnostic fixtures | NOT RUN; no restore or live capture in this slice |

## Traced paths

SignIn.tsx -> riven-api.ts -> auth.ts/Better Auth -> PostgreSQL session -> app.ts identity preHandler -> retailer-filtered products/observations queries -> Search/Competitors/Detail.

The initial app calls auth/me, then products and observations concurrently (`web/riven-main.tsx`). Attempts is a real endpoint but is not part of that initial dashboard request mix. GET routes read the database; discovery and crawl have separate POST routes and must be excluded from load tests. Collection tests use fixtures, stubbed fetch or loopback servers, then parse -> validate -> match -> save attempt and valid observation.

## Environment and data

See [run evidence](evidence/role-d/README.md) for observed versions/results. Node 24.16.0, npm 11.13.0; Docker 29.8.2, Compose 5.6.0, Java 21.0.12.1. Apache JMeter 5.6.3 was approved, installed temporarily outside the repository and checksum-verified; no project dependency changed. Docker reports PostgreSQL 18.6 Alpine healthy on 127.0.0.1:5432. Configuration inspection confirms TEST_DATABASE_URL is local and ends in `_test`; never print its credentials.

Automated tests create disposable synthetic retailers. The seed integration suite deletes and recreates its fixed Alpha/Beta IDs, so check that those IDs are absent before running it; preserve any existing rows. No real accounts or retailer data may be used. Do not seed or migrate the development database for this work.

## Performance procedure

PERF-01 planned ten independently authenticated synthetic sessions, a 60-second ramp and 300-second steady interval. The executed run used ten virtual users but two pre-authenticated synthetic sessions shared evenly because login has a rolling five-attempt limit. It ran for 360 seconds with one-second think time and asserted tenant IDs in every response. The dataset was smaller than proposed: two retailers with one product and observation each. These deviations limit capacity conclusions but do not invalidate the measured local read timings. See the [JMeter result](evidence/role-d/performance/run-summary.md).

Entry used for execution: an isolated loopback app forced the verified test database, scheduled crawler disabled; synthetic sessions and dataset counts were verified. No redirects to external hosts, no practice-observation route, no discovery/crawl and no external marketplace requests. A one-user smoke validated the corrected pre-authentication and tenant assertions before the final run.

The final JTL contains 3,269 successful samples, zero errors, p95 17 ms and 9.138 requests/second overall. It excludes response bodies, headers and cookies. Setup attempts that hit the login limiter were stopped and kept separate from the final run; they are workload-design evidence, not product failures. Metrics and limitations are in the [run summary](evidence/role-d/performance/run-summary.md).

PERF-02: independently time local browser navigation/reload to a populated, usable dashboard using DevTools; record browser, viewport, cache state and end marker. API latency does not prove NFR-03's proposed 3-second browser target. Ten users/3 seconds is a proposed SRS target, not an approved production SLA.

## Security and usability procedures

Use the [security cases](security-checklist.md) and [usability cases](usability-checklist.md). Automated security regression and manual OWASP evaluation have separate statuses. A01/A07 are the guide's category labels; no current OWASP-edition compliance claim is made. Browser work must use a local synthetic test instance; avoid Add product actions that automatically invoke discovery until outbound collection is safely disabled.

## Evidence, entry and exit

Every result needs SHA, time/zone, environment, command/input, expected and actual outcome, raw evidence link and limitation. Use PLANNED, READY, EXECUTED, PASS, FAIL, BLOCKED, NOT RUN or NOT APPLICABLE explicitly. No skipped test counts as passed.

D1 exit: plan, metric dictionary and defect template reviewed by Dilsan; GitHub QA format shared with A/B/C; scope and unresolved decisions recorded. D2 exit: real local JMeter output or exact blocker, separate render timing, executed manual security/usability evidence and safe evidence index. D3/D4 exit requires real scan/lifecycle/CI where available, reconciled A/B/C handoffs and owner review. Drafting later sections while an independent slice is blocked does not complete an earlier task.

## Dependencies and exclusions

Role A: final scope/matrix and GitHub defect-format review. Role B: measured coverage, exact SHA/command/denominator and report. Role C: CI run URL/SHA and automated mapping. Dilsan: own explanation, first step/check, severity/workload decisions and browser observations. Installation or Sonar server setup requires separate approval; no new services here.

No production/external testing, brute force, CAPTCHA bypass, destructive resets, paid services, dependency fixes, remote writes or product-code changes. The separate lecturer task list and exact cutoff were not found. Full rubric compliance cannot be claimed.
