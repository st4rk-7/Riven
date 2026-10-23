# Local development setup

## Current scope

This guide starts the shared Riven frontend, backend and local PostgreSQL
database from one repository.

The database contains synthetic development records only. The seed data is not
Amazon output, customer information or evidence that a live source is working.

For schema and authentication details, see `docs/database.md`.

## Required software

The verified baseline is:

- Git 2.55 or later
- Node.js 24.x
- npm 11.x
- Docker Engine with Docker Compose
- A code editor such as Visual Studio Code
- Windows 11 64-bit for the recorded local verification

The repository uses:

- One root `package.json`
- One root `package-lock.json`
- TypeScript
- React and Vite in `web/`
- Fastify in `server/`
- PostgreSQL 18 through Docker Compose
- Vitest for unit and integration tests

Do not create separate package or lockfiles inside `web/` or `server/`.

## Fresh-clone setup

Run the following commands from the repository root.

### 1. Install locked dependencies

```powershell
npm.cmd ci
```

This installs the exact dependency versions recorded in `package-lock.json`.
It does not update the lockfile.

### 2. Create the private environment file

```powershell
Copy-Item .env.example .env
code .env
```

The `.env` file is ignored by Git and must never be committed.

Replace the placeholders with:

- A local PostgreSQL password.
- The same PostgreSQL password in `DATABASE_URL`.
- The same PostgreSQL password in `TEST_DATABASE_URL`.
- A separate seed password containing at least 20 characters.

Using only letters and numbers for the PostgreSQL password avoids URL-encoding
mistakes. If special characters are used, they must be percent-encoded inside
the database URLs.

The seed password must be different from the PostgreSQL password. It is used
only by the two local synthetic accounts.

Leave `BETTER_AUTH_SECRET` blank, save `.env`, and run:

```powershell
npm.cmd run auth:setup
```

This generates a local `BETTER_AUTH_SECRET` without printing the value.

Never put real passwords or secrets in `.env.example`, documentation, GitHub,
Jira or terminal evidence.

### 3. Validate and start PostgreSQL

Confirm that local port 5432 is available:

```powershell
Get-NetTCPConnection `
    -LocalPort 5432 `
    -State Listen `
    -ErrorAction SilentlyContinue
```

Validate the Compose configuration:

```powershell
docker compose --env-file .env config --quiet
```

Start PostgreSQL:

```powershell
docker compose up -d --wait postgres
docker compose ps
```

The Compose configuration:

- Uses `postgres:18.6-alpine`.
- Creates the `riven_dev` database.
- Creates the `riven_test` database during first-time initialization.
- Stores data in the `riven-postgres-data` Docker volume.
- Binds PostgreSQL only to `127.0.0.1:5432`.
- Waits for the PostgreSQL health check.

Do not expose this local database publicly.

Keep the PostgreSQL password stable after the Docker volume has been created.
Changing only `.env` does not automatically change the password stored inside
an existing PostgreSQL volume.

### 4. Apply and verify migrations

```powershell
npm.cmd run db:migrate
npm.cmd run db:check
```

`db:migrate` uses `DATABASE_URL` and applies numbered migrations to
`riven_dev`.

`db:check` uses `TEST_DATABASE_URL`. It verifies:

- Safe migration reruns.
- The Better Auth schema.
- Required retailer ownership.
- Cross-retailer foreign-key protection.
- Unmatched observation records.
- Money and currency constraints.
- Session foreign keys.

Applied migration files must not be edited. Add a later numbered migration for
future schema changes.

### 5. Add synthetic seed records

```powershell
npm.cmd run db:seed
```

The command applies migrations first and creates or updates:

- Two synthetic retailers.
- Two synthetic login users.
- One sample product per retailer.
- One sample observation per retailer.

Synthetic account emails:

- `alpha@example.test`
- `beta@example.test`

Both accounts use the private `RIVEN_SEED_PASSWORD` from `.env`. The password
is hashed through Better Auth and is never printed.

The sample records are explicitly labelled:

```text
Synthetic seed fixture (not live collection)
```

The Alpha record contains:

- Product: Synthetic Wired Mouse
- Price: GBP 19.99
- Availability: in stock

The Beta record contains:

- Product: Synthetic USB Keyboard
- Price: unknown
- Currency: unknown
- Availability: unknown

Unknown price and currency are stored as null values rather than invented
values.

The seed command accepts only:

- PostgreSQL or Postgres URLs.
- Host `127.0.0.1` or `localhost`.
- Port 5432.
- Database `riven_dev` for the normal seed command.

Running the seed command again updates the same fixed synthetic records instead
of creating duplicates.

### 6. Run checks

Run all TypeScript checks:

```powershell
npm.cmd run typecheck
```

This checks:

- The React/Vite frontend.
- The Fastify backend.
- The browser extension.

Run the normal Vitest suite:

```powershell
npm.cmd test
```

The normal suite runs tests that do not require a loaded local database
environment. Database integration cases are reported as skipped in this
command.

Run the real PostgreSQL integration suite separately:

```powershell
npm.cmd run test:integration
```

The integration command loads `.env` and uses `riven_test`. It:

- Applies migrations to the test database.
- Creates isolated synthetic test records.
- Uses real Better Auth cookies.
- Tests sign-in and sign-out.
- Tests invalid, expired and tampered sessions.
- Tests origin restrictions and sign-in throttling.
- Tests observation persistence and transaction rollback.
- Proves that one retailer cannot read another retailer's records.
- Cleans up only the records it created.

The RIV-18 seed integration test:

- Runs the seed twice.
- Confirms that no duplicate seed records are created.
- Confirms one product and one observation per retailer.
- Signs in as both synthetic retailers.
- Sends misleading client-supplied retailer IDs.
- Confirms Alpha still sees only Alpha's data.
- Confirms Beta still sees only Beta's data.

### 7. Start the application

```powershell
npm.cmd run dev
```

This starts:

- Fastify at `http://127.0.0.1:3000`
- Vite at `http://127.0.0.1:5173`

Open:

```text
http://127.0.0.1:5173
```

Stop both development processes with `Ctrl+C`.

Individual development commands are also available:

```powershell
npm.cmd run dev:server
npm.cmd run dev:web
```

Use `npm.cmd run dev` for the normal connected application.

The current visible sign-in inputs are intentionally disabled. Authentication
and retailer isolation are verified through PostgreSQL integration tests, not
through a completed browser sign-in flow.

## Development request path

```text
Browser on 127.0.0.1:5173
  -> Vite /api proxy
  -> Fastify on 127.0.0.1:3000
  -> verified session
  -> authenticated retailer identity
  -> retailer-scoped PostgreSQL query
```

The frontend must not select the active retailer by supplying a retailer ID.
Protected backend routes derive the retailer from the verified session.

The current demo observation endpoint remains explicitly synthetic and does not
require a signed-in browser session.

## Docker lifecycle

Show the current container state:

```powershell
docker compose ps
```

Stop PostgreSQL without deleting its data:

```powershell
docker compose stop
```

Start PostgreSQL again:

```powershell
docker compose up -d --wait postgres
```

Do not use the following as a normal setup command:

```text
docker compose down --volumes
```

Removing volumes deletes the local PostgreSQL data and requires explicit
intent.

## Production-style check with Docker

The `Dockerfile` builds one image that serves the website and the API on one
address. On start it applies pending migrations, then starts the server.

Run the whole stack locally (PostgreSQL plus the app):

```powershell
docker compose --env-file .env --profile app up -d --build --wait
```

Open `http://127.0.0.1:8080`. Create the synthetic accounts in this database
with `npm run db:seed`.

Stop it:

```powershell
docker compose --profile app stop
```

The app reads its settings from the environment: `DATABASE_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`,
`RIVEN_EXTENSION_ORIGIN`, and optionally `HOST` and `PORT`. A hosting
service sets these instead of a `.env` file.

## Create a retailer account

There is no public sign-up. Create a real retailer and its sign-in account on
any database, including the deployed one, with:

```powershell
$env:RIVEN_ACCOUNT_PASSWORD = "<at least 12 characters>"
npm run account:create -- --retailer "Shop name" --email owner@example.com
```

The script uses `DATABASE_URL`, refuses an email that already exists, and
creates nothing if any step fails. The seed command stays local-only.

## Vitest decision

Vitest is used because it supports the repository's TypeScript, ES modules,
Node.js 24 and Vite configuration without a separate CommonJS transformation
configuration.

Fastify route tests use `app.inject()`, which exercises requests in memory
without opening port 3000. Database integration tests separately use the real
local PostgreSQL test database.

## Verification recorded for RIV-18

Date: 19 October 2026

Environment:

- Windows 11 Home Single Language, 64-bit
- Git 2.55.0.windows.2
- Node.js 24.20.0
- npm 11.19.0
- Docker Engine 29.8.2
- Docker Compose 5.5.1
- PostgreSQL image `postgres:18.6-alpine`

### Working repository

Observed results:

- Docker Compose configuration validation passed.
- PostgreSQL started healthy on `127.0.0.1:5432`.
- `riven_dev` and `riven_test` were created.
- Migrations `001_retailers_auth.sql` and `002_retailer_data.sql` applied.
- `npm.cmd run db:check` passed.
- `npm.cmd run typecheck` passed for web, server and extension.
- Six seed configuration tests passed.
- The seed command ran twice successfully.
- Two retailers, users, products and observations were reported.
- A database query showed one product and one observation per retailer.
- The normal suite passed 49 tests.
- Eleven database tests were skipped by the normal suite as expected.
- Two PostgreSQL integration test files passed.
- All 11 PostgreSQL integration tests passed.
- Alpha and Beta could not read one another's seeded records.
- Misleading client-supplied retailer IDs did not bypass tenant isolation.
- The committed environment example contains placeholders only.
- The real `.env` remained ignored by Git.

### Fresh-clone reproduction

A separate clean clone of commit `790bb3f` was verified on 19 October 2026.

Observed results:

- `npm.cmd ci` installed 548 packages from the lockfile.
- The clean working tree remained unchanged after installation.
- A separate Docker network and PostgreSQL volume were created.
- PostgreSQL became healthy on `127.0.0.1:5432`.
- Both migrations applied from scratch.
- `npm.cmd run db:check` passed.
- `npm.cmd run db:seed` created two retailers, users, products and observations.
- All frontend, backend and extension TypeScript checks passed.
- The normal suite passed 49 tests.
- Eleven database tests were skipped by the normal suite as expected.
- Both integration files passed all 11 PostgreSQL tests.
- `npm.cmd run dev` started the frontend and backend.
- The frontend returned HTTP 200.
- The demo endpoint returned the expected explicitly synthetic observation.
- The clean working tree remained unchanged.

The visible sign-in inputs are currently intentionally disabled. Authentication
and retailer isolation were verified through the real PostgreSQL integration
tests, not through a completed browser sign-in flow.

During dependency installation, npm reported four dependency vulnerabilities:
two moderate and two critical. No automatic or forced audit fix was applied
because dependency changes require separate review and testing.

## Remaining verification

Before RIV-18 is complete:

- Open a pull request and obtain the required review.
- Merge only after acceptance and review.

These checks do not prove production readiness, public deployment, a completed
browser sign-in flow or live Amazon collection.

## AI assistance

AI assistance was used to explain the Docker Compose, migration, authentication
and seed workflow; propose code for Ilmam to enter and inspect; help diagnose
configuration and command-line quoting errors; and guide the verification
commands.

Ilmam selected and approved the synthetic dataset, created and rotated the
local secrets, entered and reviewed the changes, ran the verification commands
and remains responsible for explaining and demonstrating the submitted work.