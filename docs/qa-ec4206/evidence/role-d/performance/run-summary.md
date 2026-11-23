# Role D local JMeter result

Status: EXECUTED / PASS for the defined local API workload. This is not a browser-render or production-capacity result.

## Run identity and safety

- Run: 22 November 2026, 17:45:35 to 17:51:36 IST (UTC+05:30).
- Application baseline: `17307a5baaa43527ea993af9a2d36ae548372b5e`, branch `qa/ec4206-role-d`.
- Tool: Apache JMeter 5.6.3 on Java 21.0.12.1; official ZIP SHA-512 verified before use. JMeter stayed in `C:\tmp`; no project dependency changed.
- Target: `http://127.0.0.1:3100` only. The API process forced `DATABASE_URL=TEST_DATABASE_URL`, verified local `riven_test`, with crawler interval `0`.
- Data: repository-defined Alpha/Beta synthetic retailers, one product and one observation each. Seed result was 2 retailers/users/products/observations. Cleanup deleted exactly the two fixed retailers and left 0 of those IDs.
- Requests: read-only `GET /api/v1/products` and `GET /api/v1/observations`. No discovery, crawl, external site, production host or live data was used.
- Test asset: [riven-dashboard.jmx](riven-dashboard.jmx). Raw result: [final.jtl](final.jtl), 499,915 bytes, SHA-256 `d79fc94ccf07bc03b1a53357181e5e10accf15375530ce72a28b64b133122628`.
- Privacy check: the JTL header contains timing/status/thread/loopback URL fields only. Response headers, bodies, cookies and passwords are absent.

## Workload

- 10 virtual users.
- 60-second ramp and 360-second total duration; the last-starting user ran for about 300 seconds.
- One-second constant think time applied before requests.
- Two pre-authenticated synthetic sessions were shared evenly, five threads per tenant. This avoids measuring/rate-limiting login and is a stated limitation: the run has 10 concurrent virtual users but only two distinct sessions.
- Every response asserted HTTP 200, the expected tenant product/observation ID and absence of the other tenant's ID.

## Results

| Measure | Overall | Products | Observations |
| --- | ---: | ---: | ---: |
| Samples | 3,269 | 1,635 | 1,634 |
| Successful / failed | 3,269 / 0 | 1,635 / 0 | 1,634 / 0 |
| Unexpected error rate | 0.00% | 0.00% | 0.00% |
| Average | 10.24 ms | 10.34 ms | 10.15 ms |
| Minimum / maximum | 4 / 75 ms | 4 / 75 ms | 4 / 53 ms |
| p50 | 9 ms | 9 ms | 9 ms |
| p90 | 15 ms | 15 ms | 14 ms |
| p95 | 17 ms | 18 ms | 17 ms |
| p99 | 26 ms | 27 ms | 26 ms |
| Measured elapsed | 357.720 s | 357.719 s | 356.540 s |
| Throughput | 9.138 req/s | 4.571 req/s | 4.583 req/s |

Percentiles use nearest rank over the JTL `elapsed` values. Overall throughput is total samples divided by the interval from the first sample start to the last sample end. All 3,269 responses were HTTP 200.

## Setup corrections retained as evidence

The first login-based smoke produced two false assertion failures because the session response intentionally omits email; product/observation assertions passed. The JMX was corrected to assert retailer ID. A corrected login smoke passed 9/9.

Two attempted ten-user login-based runs were stopped during ramp-up. Better Auth returned 429 after five rolling-window sign-ins; unauthenticated reads then returned 401. These were workload-setup failures, not product performance failures. The final plan pre-authenticated two sessions outside measurement. Its one-user smoke passed 7/7 before the full run.

## Meaning and limitations

The defined local API workload passed with p95 17 ms and zero unexpected errors. This supports fast products/observations reads for a tiny synthetic dataset on this machine. It does not prove the React dashboard renders within the proposed three-second target, production behavior, ten independent accounts/sessions, large-history capacity, network latency or external collection performance. NFR-03 therefore has useful partial API evidence; NFR-09 remains unverified for an agreed pilot dataset. Browser timing must be reported separately.
