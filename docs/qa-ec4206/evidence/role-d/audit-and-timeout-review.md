# Role D audit and timeout review

Baseline application commit: `17307a5baaa43527ea993af9a2d36ae548372b5e`.

## Dependency audit

Command: `npm.cmd audit --json`. The first sandbox run returned no advisory metadata because registry access failed; its [sanitized result](audit-current.json) is an environment failure, not a clean audit. A read-only network-enabled retry returned [22 current findings](audit-current-retry.json): 1 low, 17 moderate, 2 high and 2 critical. The command exited 1 because findings exist. No install, fix, lockfile change or dependency update was run.

The 22 count is the npm package/advisory-tree count, not 22 independently demonstrated Riven exploits. Current direct affected packages include `concurrently` (critical), `vite` (high), `fastify` (low), `@fastify/static` (moderate), `@tailwindcss/typography` (moderate), and `crawlee` (moderate). Transitive findings include `shell-quote` (critical), `undici` (high), `glob`, `minimatch`, and related Crawlee packages. The audit's `fixAvailable` value suggests a possible remediation but does not prove a safe upgrade. In particular, Crawlee and typography entries propose changes outside the stated current major ranges.

**Disposition:** record as an open dependency security review, with no product vulnerability ticket invented from a tool count. Ask the dependency/CI owner to group findings by root package, identify whether each path is used in the deployed app or only local tooling, review advisory conditions and available patched versions, then propose the smallest compatible updates. Run typecheck, unit/integration, builds and CI on an isolated branch before claiming closure. Do not use `npm audit fix --force` automatically. Proposed urgency: prioritize critical/high paths for prompt review; severity of a confirmed Riven defect remains unassigned until exploitability and exposure are established.

## Five-second fixture timeout

Role A's [20 November evidence](../branch-check-2026-11-20.md) records one default `npm test` failure: `extension/src/capture.test.ts` exceeded the 5-second timeout while reading the synthetic `amazon-uk-in-stock.html` fixture. Focused 15-second rerun passed 6/6 and the full 15-second rerun passed 76 with 23 database skips. Today's unchanged baseline unit run passed 83 with 23 skips at the default timeout. These observations establish a test-duration instability on that environment/commit, not a reproduced application behavior defect.

**Disposition:** track as a test reliability observation in this quality report. No new defect ID is justified from one failure that did not recur in the current default run. If it recurs, record host load, exact command, test duration and frequency; isolate slow fixture setup before proposing a timeout increase. A longer timeout may reduce false failures but does not address the cause. Proposed severity Low for the test pipeline if repeated; priority remains unagreed. The original default-run failure must remain visible in Role A's evidence.

## Confirmed matching defect

[PR #43](https://github.com/st4rk-7/Riven/pull/43) is the QA record for the `packSize()` dimension fix, related to FR-04; [fresh matching retest](matching-retest.txt) passed 21/21 on the baseline. [RIV-45](https://st4rk.atlassian.net/browse/RIV-45) is a historical Software Project cross-reference. Proposed severity Medium because a valid competitor candidate could be hidden. No QA severity decision or separate GitHub issue was found. The [RCA](defects-and-rca.md) distinguishes the actual code cause from unverified process assumptions.

These are three different statuses: the PR #43 matching defect is fixed and retested; the timeout is an unconfirmed test reliability issue; npm audit findings require exposure and fix review. SonarQube is still NOT RUN, so no Sonar findings or quality gate are claimed.
