# Quality and acceptance targets

**Updated:** 28 September 2026. **Status:** Proposed targets to agree with the team/client. No benchmark, uptime or recovery result is claimed here.

These targets apply to the whole product. Each sprint tests the relevant subset; quality is not deferred to Sprint 6. [System baseline](system-baseline.md) describes the mechanisms; [requirements](../requirements.md) owns the stable IDs.

## Pilot scale and test conditions

Proposed final pilot: **5 tenant workspaces, 10 products each, up to 5 competitor monitors per product: 250 monitors total; 10 concurrent active users**. These are capacity assumptions, not approved subscription plans or permission to collect 250 Amazon listings. Start live source validation with 3–5 supported listings only.

For database sizing, 250 monitors observed four times a day for 180 days produce about **180,000 observations**, before attempts/events/indexes. This is a synthetic sizing calculation, not a storage guarantee. Proposed retention is up to 180 days only if source rights permit it; earlier expiry must be enforced per source. No raw HTML retention is assumed.

Use a documented local production build, a real PostgreSQL test database, seeded synthetic history and a fixture connector for load/recovery tests. Record CPU/RAM, OS, versions, commit, seed size, test duration and results. Never load-test Amazon or another third-party source. One ten-minute run at 10 concurrent application users is the initial performance check; do not generalise it to enterprise scale.

## Acceptance matrix

| ID | Proposed measurable acceptance | Build/check when | Accountable roles |
| --- | --- | --- | --- |
| NFR-01 Security | Automated signed-out, wrong-role and two-tenant tests reject access for every delivered route/job; no secrets in repo/logs; secure session configuration and HTTPS before remote use | Every sprint; foundation in S1 | Application/data + platform reviewer |
| NFR-02 Reliability | Worker restart does not lose a persisted job or duplicate its accepted observation; one source failure does not prevent another queued fixture source or stored dashboard reads | S1 manual jobs; extend for scheduler/alerts in S2/S4 | Collection + platform |
| NFR-03 Performance | At pilot seed size: dashboard API p95 ≤1 second and end-to-end visible dashboard p95 ≤3 seconds, over a documented sample; collection enqueue p95 ≤500 ms independent of source duration; no unhandled application failures | Baseline S1; full pilot S3; recheck after material changes/S6 | Platform + all owners |
| NFR-04 Freshness | Every view distinguishes last attempt, last success and stale data. Proposed scheduling default 6 hours, stale after 12 hours; obey stricter source limits. Under healthy local operation, start due work within 5 minutes at pilot capacity; generate in-app alert within 60 seconds after a validated observation commit | Manual-state tests S1; scheduling S2; alerts S4 | Collection + application + UX |
| NFR-05 Accuracy | All accepted sample price/currency/model/variant/offer fields match contemporaneous ground truth; missing and uncertain values are not guessed. Publish accepted/failed/mismatched counts separately; expand samples for each supported source | Gate in S1, second source S2, every parser change | Collection + independent reviewer |
| NFR-06 Usability | Client can add a product/monitor, interpret stale/failure state, compare equivalent prices and configure an alert without developer intervention after a brief introduction; record problems. Keyboard navigation, visible focus, labelled fields and reduced-motion behaviour tested for delivered screens | S1 first journey; S3/S4 complete workflow | Product/UX + reviewer |
| NFR-07 Maintainability | Strict TypeScript, reviewed migrations/contracts, automated critical-path checks; a second connector passes the common contract without editing account/dashboard logic | S1 foundations; second connector S2 | All owners |
| NFR-08 Recovery | First backup/restore rehearsal in S1; restore into a separate database and verify tenant ownership, observations and jobs. Proposed final target: restore within 30 minutes, lose ≤24 hours of data with daily verified backups while service operates | S1 rehearsal, S5 operating procedure, S6 timed test | Platform + application |
| NFR-09 Scalability (new proposal) | Meet the pilot workload; bound query result sizes and worker concurrency. Prove two fixture workers process jobs without duplicates, after the single-worker baseline works. Scaling workers must preserve aggregate source limits | Design S1; measured S2/S3/S6 | Platform + collection |
| NFR-10 Adaptability (new proposal) | Replace a connector implementation without changing business semantics; add a source through the documented contract. Test migrations on an old schema with seeded data, and demonstrate compatible configuration changes | Contract S1; adapter S2; migrations each sprint | Application + collection |
| NFR-11 Operability (new proposal) | Given a failed run ID, a teammate can identify its source/version/error and follow the pause/fix/retest/resume procedure. Logs have correlation IDs and redact credentials; admin metrics reflect recorded attempts | Logs S1; service views S5; final walkthrough S6 | Platform + all owners |

No 24/7 uptime target is credible on a personal computer that sleeps. Measure freshness from the actual last successful collection, including downtime. If no always-on deployment is available, record that limitation and obtain module/client agreement rather than declaring the deployed-service requirement complete.

## Failure cases that must be designed from S1

- Unsupported URL, internal-network URL or redirect, and invalid input: reject safely before fetching.
- Source denial/timeout/changed structure: classified failure, preserved old observation and visible stale state; bounded retries only where appropriate.
- Variant, currency or seller changes: no misleading comparison or same-seller price alert.
- Duplicate manual requests and scheduler overlap: one active logical run; replay safe persistence.
- Tenant/product deleted or monitor paused while a job waits: cancel or skip after revalidation; never restore deleted records through a late job.
- Database unavailable: no success response for uncommitted work; do not acknowledge a job before results are durable.
- Computer resumes after downtime: coalesce missed schedules; do not fabricate historical prices or trigger a request burst.
- Tier downgraded below usage: preserve data and show over-limit state; block new monitors and apply an agreed pause policy without silent deletion.
- Notification provider unavailable: durable delivery status and bounded retries; in-app event remains visible. External delivery can be at-least-once unless the provider supports an idempotency key; do not claim guaranteed exactly-once email.

## Definition of Done and evidence

For every issue: acceptance criteria met, relevant NFR tests pass, another member reviews, changes integrate, docs/ADR updated where affected, no known critical defect remains. Record command, environment, actual result, commit and reviewer. An AI-generated “passed” statement without execution output is not evidence.

For every sprint: demonstrate a working integrated increment, retain test/failure evidence, record client feedback and revise the backlog. S1 cannot finish solely by closing the four preparation issues. The full source-dependent acceptance remains open if Amazon is blocked.

## Operational budget

Development assumes **no funded recurring services**. Use local databases, a fixture source and in-app alerts. External email, paid collection, cloud databases, domains and hosting require a recorded budget decision before adoption. Free trials are not a sustainable operating plan. Local execution still consumes electricity, internet and computer resources.

Measure memory with one worker and browser rendering disabled first; enable a single browser only if required and feasible. Set process/resource limits after this measurement. No global concurrency increase is permitted merely because a crawler library can autoscale.
