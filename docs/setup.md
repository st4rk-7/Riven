# Local development setup

## Status

RIV-5 has an integrated frontend/backend setup verified in the working repository and from a separate clean clone.

Human review and second-member reproduction remain pending. The ticket stays In Progress.

This setup supports the synthetic Sprint 1 checkpoint only. It is not a production service or live Amazon integration.

## Agreed baseline

- Node.js 24.x
- npm 11.x
- TypeScript
- React and Vite in `web/`
- Fastify in `server/`
- Vitest for tests
- One root `package.json`
- One root `package-lock.json`

Do not create another package or lockfile inside `web/` or `server/`.

## Install

From the repository root:

```powershell
npm ci
```

This installs the exact dependency versions recorded in `package-lock.json`.

## Start the connected application

```powershell
npm run dev
```

This starts:

- Fastify: `http://127.0.0.1:3000`
- Vite: `http://127.0.0.1:5173`

Open `http://127.0.0.1:5173` in a browser. Stop both processes with `Ctrl+C`.

Individual development commands are also available:

```powershell
npm run dev:server
npm run dev:web
```

Use `npm run dev` for the normal connected-flow check.

## Request path

```text
Browser
  -> Vite on port 5173
  -> /api proxy
  -> Fastify on port 3000
  -> GET /api/v1/demo-observation
  -> synthetic observation response
```

The frontend requests the relative path `/api/v1/demo-observation`. Neither development server is configured for public exposure.

## Checks

Run both TypeScript checks:

```powershell
npm run typecheck
```

Run the endpoint test:

```powershell
npm test
```

Individual type-check commands:

```powershell
npm run typecheck:web
npm run typecheck:server
```

## Test-tool decision

Vitest was selected instead of Jest because it supports the project’s TypeScript, ES module, Node.js 24, and Vite 8 setup without a separate CommonJS transformation configuration.

The Fastify test uses `app.inject()`, so it can test the endpoint without opening a network port.

## Verification performed

Date: 3 October 2026

Environment:

- Windows 11 Home Single Language, 64-bit
- Git 2.55.0.windows.2
- Node.js 24.20.0
- npm 11.19.0
- Visual Studio Code 1.139.1

### Working repository

The following passed:

- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run dev`
- Frontend request through the Vite proxy to Fastify
- Rendering the returned synthetic observation
- Stopping the combined command with `Ctrl+C`

Vitest reported one passing test file and one passing test.

AI-assisted browser inspection confirmed that the page displayed the backend response, clearly labelled it as synthetic and not Amazon, and showed price, currency, availability, source, observation time, and match uncertainty. No browser console warnings or errors were reported.

### Failure state

The frontend was started without the backend.

Observed result:

- Vite recorded a local `ECONNREFUSED` proxy error.
- The browser displayed `Could not load the synthetic observation.`
- A Retry button was available.
- The raw connection error was not displayed to the user.
- Retrying while the backend remained unavailable preserved the safe failure state.

### Clean clone

Source:

- Branch: `RIV-5-reproducible-setup`
- Integrated code commit: `710b4d9`
- Separate clean directory

Observed results:

1. The published branch cloned successfully.
2. `npm ci` installed 117 packages and audited 118 packages.
3. npm reported 0 known vulnerabilities for that run.
4. `npm run typecheck` passed for the frontend and backend.
5. `npm test` passed one Vitest endpoint test.
6. `npm run dev` started Fastify on port 3000 and Vite on port 5173.
7. AI-assisted browser inspection confirmed the connected synthetic observation rendered.
8. No browser console warnings or errors were reported.
9. The clean clone remained unchanged after installation and checks.

## Known limitations

- A second team member has not yet followed the final integrated instructions.
- Reviewer approval is pending.
- The branch has not been merged.
- CI has not been configured or run.
- A production build was not verified.
- npm audit results describe individual runs only.
- npm warned that the esbuild install script was not covered by `allowScripts`; no script was approved blindly.
- Authentication, persistence, queues, deployment, and live Amazon collection were not tested.

## AI assistance

AI assistance was used to explain and plan RIV-5, review teammate branches, guide clean reproductions, propose the shared structure, supply code for Ilmam to enter and inspect, guide checks, and inspect the rendered pages and browser console.

Ilmam ran the Git, npm, type-check, test, development-server, HTTP, commit, and push commands and reviewed the observed results.

No reviewer approval, second-member reproduction, CI success, merge, live-source acceptance, or completed ticket is claimed.