# EC4206 Role C browser automation

## Scope

These tests drive the real Riven UI in Chromium. Fastify serves the built web app and uses PostgreSQL for account, product and session data. The existing Vitest suite still covers lower-level validation, routing and database behavior.

| Automation | Role A case | Requirements | Pass condition |
| --- | --- | --- | --- |
| AT-001 | TC-AUTH-001 | FR-01, NFR-01 | Sign-in returns 200 and sets an HttpOnly cookie. The expected product is visible, and refresh preserves the verified retailer and product. |
| AT-002 | TC-AUTH-002 (wrong password) | FR-01 | Sign-in returns 401, the UI shows the generic validation message, and protected products are still inaccessible. |
| AT-003 | TC-AUTH-004 (product reads) | NFR-01 | Two browser contexts sign in separately. Each sees only its own product in both the UI and the API response. |
| AT-004 | TC-AUTH-003, TC-AUTH-005 (product reads and sign-out) | FR-01, NFR-01 | Products return 401 before sign-in, 200 when signed in, and 401 after sign-out returns 204. Refresh shows sign-in and no product. |

The browser suite targets Chromium desktop. Other browsers, malformed inputs, protected writes and marketplace requests are outside this suite. Playwright uses a separate browser context for each test. The database fixture generates synthetic accounts and products and deletes its own retailer records during teardown. The launcher only accepts a loopback PostgreSQL URL for a database ending in `_test`. The app runs on port 4310 with scheduled collection turned off.

## Run locally

Use Node.js 24, npm 11 and PostgreSQL 18. From the repository root, install the locked packages with `npm ci` and Chromium with `npx playwright install chromium`. Use the same setup with `npm.cmd` and `npx.cmd` in Windows PowerShell.

Set `TEST_DATABASE_URL` privately in the shell or ignored `.env` file. Point it at a dedicated local test database. Start PostgreSQL and run:

```powershell
npm.cmd run db:check
npm.cmd run test:e2e
```

The browser command builds the web app, applies migrations, starts Fastify and runs the suite. To run one case, use `npm.cmd run test:e2e -- --grep AT-001`. To observe it in a browser window, add `--headed`. Run each repeat as a separate command so the sign-in limiter starts fresh.

## Local verification

On 21 November 2026 (Asia/Colombo), the Role C working changes based on `7a1eb88636930157cd6c8a78692e94380e81e4e0` were tested on Windows with Node 24.19.0, npm 11.20.0, Playwright 1.65.1, Chromium 159.0.8154.6 and an isolated PostgreSQL 18.6 database.

| Check | Actual result |
| --- | --- |
| `npm.cmd run db:check` | Passed migrations, auth schema and database constraints. |
| `npm.cmd run test:e2e` | AT-001 through AT-004 passed. |
| `node scripts/run-e2e.mjs` after the build | A second run passed all four tests against the same test database. |
| `npm.cmd test -- --maxWorkers=1 --no-cache` | 97 passed, 2 seed integration tests skipped because the optional seed password was unset. |
| Workflow lint with actionlint 1.7.12 | Passed. |

The local screenshot is the `signed-in.png` generated under `test-results/`. The temporary database was removed after the checks.

## CI and submission evidence

CI still runs on pull requests and also runs on pushes to `main` and `qa/ec4206-role-c`. It retains the existing typecheck, database checks and Vitest steps. The browser test step runs after those checks against the job’s PostgreSQL 18 service. The signed-in screenshot uses synthetic data and is saved under `test-results/` locally and as the `role-c-browser-evidence` artifact on GitHub. Automatic traces, videos and screenshots are disabled.

After pushing, record the GitHub Actions run URL, event, tested commit and pass/fail counts. Capture the Actions page showing the passing job for the group assignment. Share the AT-to-TC mapping above with Role A and the verified run result with Role D.
