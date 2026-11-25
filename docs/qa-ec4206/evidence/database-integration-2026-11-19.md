# Database and Integration Evidence - 19 November 2026

Status: Observed local evidence
Execution: authorized local command run
Date/time: 19 November 2026, approximately 21:14-21:17 (Asia/Colombo)
Branch: `qa/ec4206-role-a`
Tested commit: `d381178`

## Scope

This record covers the isolated PostgreSQL container, migrations, schema/tenant checks, synthetic seed data, and database integration tests. It does not claim manual browser execution, live marketplace behavior, performance, security penetration testing, or production readiness.

## Authorized local volume reset

The existing local volume `riven_riven-postgres-data` had been initialized with a different PostgreSQL password, so the new private `.env` could not authenticate. Ilmam explicitly authorized deletion on 19 November.

Observed actions:

- Verified that `riven-postgres-1` mounted exactly `riven_riven-postgres-data` at `/var/lib/postgresql`.
- Stopped and removed the local Compose container/network.
- Permanently deleted only `riven_riven-postgres-data`; its previous local contents are not recoverable.
- Recreated the volume/container from the new private `.env`.
- PostgreSQL `18.6-alpine` became healthy on `127.0.0.1:5432`.

No source file, production database, or unrelated Docker volume was deleted.

## Migrations

Command:

```powershell
npm.cmd run db:migrate
```

Observed result: exit code `0`.

- Applied `001_retailers_auth.sql`.
- Applied `002_retailer_data.sql`.
- Applied `003_own_price.sql`.
- Applied `004_parse_rules.sql`.
- Reported database migrations up to date.

## Database checks

Command:

```powershell
npm.cmd run db:check
```

Observed result: exit code `0`.

Passed checks reported by the repository command:

- migration reruns;
- Better Auth schema;
- required retailer ownership;
- cross-retailer links;
- unmatched observation rules;
- money/currency constraints;
- session foreign keys.

## Synthetic seed

Command:

```powershell
npm.cmd run db:seed
```

Observed result: exit code `0`.

```text
Seed completed: 2 retailers, 2 users, 2 products and 2 observations.
Synthetic accounts: alpha@example.test and beta@example.test.
```

The private seed password was not printed or recorded.

## Integration tests

### Repository command - parallel worker failure

Command:

```powershell
npm.cmd run test:integration
```

Observed result: exit code `1` before assertion results.

- Four Vitest worker processes exhausted JavaScript heap memory while running the four integration files concurrently.
- Vitest reported four unhandled worker errors.
- Classification: execution-capacity failure, not a product assertion failure.

### Bounded-concurrency rerun

The same four repository test files were rerun serially with one worker:

```powershell
node --env-file-if-exists=.env node_modules/vitest/vitest.mjs run `
  server/auth.integration.test.ts `
  server/data/seed.integration.test.ts `
  server/crawler.test.ts `
  server/discovery.test.ts `
  --maxWorkers=1 --no-file-parallelism
```

Observed result: exit code `0`.

```text
Test Files  4 passed (4)
Tests       26 passed (26)
Duration    10.61s
```

Interpretation:

- The database integration assertions passed on the tested commit when run within available memory.
- The repository's default parallel integration command is not reliable in this execution environment because its workers exceeded memory.
- This is a reproducibility limitation to report, not a reason to alter test logic or claim the default command passed.
- The parallel memory event also terminated the local PostgreSQL container with exit code 255. PostgreSQL was restarted, returned healthy, and the signed-out auth endpoint returned its expected HTTP 401 afterward. See `smoke-2026-11-19.md`.

## Remaining work

1. Record browser/version and perform manual sign-in/sign-out.
2. Execute selected manual `TC-*` cases with actual evidence.
3. Link relevant automated integration evidence to traceability without relabeling it as manual execution.
