# Successful sandbox retry transcripts

Date: 22 November 2026 session, Asia/Calcutta UTC+05:30. Baseline `17307a5baaa43527ea993af9a2d36ae548372b5e`, branch `qa/ec4206-role-d`, Node 24.16.0 / npm 11.13.0 / Windows. These are transcriptions of returned exec tool output, not independently saved stdout files. Exact retry start timestamps were not captured; do not invent them.

## BDD

Command: `npm.cmd run test:bdd`, rerun outside sandbox after [initial startup failure](bdd.txt). Expected: scenarios execute and pass. Observed exit code 0:

```text
> riven@0.1.0 test:bdd
> node --import tsx node_modules/@cucumber/cucumber/bin/cucumber.js

4 scenarios (4 passed)
17 steps (17 passed)
0m 0.019s (0m 0.004s executing your code)
```

## Database check

Command: `npm.cmd run db:check`, rerun outside sandbox after [initial startup failure](db-check.txt). Target independently verified as loopback riven_test; PostgreSQL 18.6. Expected migration/schema/constraints checks pass. Observed exit code 0:

```text
> riven@0.1.0 db:check
> node --env-file-if-exists=.env --import tsx scripts/check-database.ts

Database migrations are up to date.
Database migrations are up to date.
Passed: migration reruns, Better Auth schema, required ownership, cross-retailer links, unmatched records, money constraints and session foreign keys.
Run npm run test:integration separately for HTTP sign-in, sign-out and authorization checks.
```

PowerShell also emitted an unrelated profile prediction warning under redirected output. It is not a failed test. The original sandbox errors occurred before these checks executed and remain in their original log files.
