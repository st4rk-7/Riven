# Local development setup

## Status

RIV-5 is in progress.

The frontend and backend setups from the two unmerged branches have been reproduced independently on one additional Windows machine.

A structural conflict remains: the frontend uses the root package and lockfile, while the backend uses a separate package and lockfile with JavaScript/CommonJS.

The combined frontend-to-backend flow has not been verified.

## Proposed baseline awaiting team agreement

- Node.js 24 LTS
- npm 11.x
- TypeScript
- React and Vite for the frontend
- Fastify for the backend
- One root `package.json`
- One root `package-lock.json`

Exact combined scripts, backend structure, ports, and the frontend proxy must be agreed and tested before being documented as working.

## First environment checked

- Operating system: Windows 11 Home Single Language, 64-bit
- Git: 2.55.0.windows.2
- Node.js: 24.20.0
- npm: 11.19.0
- Editor: Visual Studio Code 1.139.1
- Reported environment blockers: none

This records one machine only. It does not prove that the project setup is reproducible across the team.

## Published branch inputs

### Frontend

- Owner: Dilsan
- Branch: `feature/RIV-3-observation-card`
- Reviewed commit: `2eba478`
- Root package and lockfile
- Node engine: `24.x`
- Frontend: React, TypeScript, and Vite
- Start command: `npm run dev:web`
- Type-check command: `npm run typecheck:web`
- Local address: `http://127.0.0.1:5173`
- Port `5173` uses Vite `strictPort`
- No backend proxy is configured
- The page currently uses a local synthetic observation

### Backend

- Owner: Hirukshanan
- Branch: `RIV-4-demo-observation-endpoint`
- Reviewed commit: `6380790`
- Fastify endpoint: `GET /api/v1/demo-observation`
- Configured port: `3000`
- A Jest endpoint test is present
- The branch currently has a separate `server/package.json` and `server/package-lock.json`
- The backend currently uses JavaScript and CommonJS
- No backend start script is defined

The backend branch has been independently installed, tested, started, and requested as recorded below.

## Preliminary frontend reproduction

Date: 2 October 2026

Source: unmerged branch `feature/RIV-3-observation-card`, commit `2eba478`.

Environment:

- Windows 11, 64-bit
- Node.js 24.20.0
- npm 11.19.0

Checks performed from a separate clean clone:

1. `npm ci` installed 26 packages and reported 0 vulnerabilities among 27 audited packages.
2. `npm run typecheck:web` completed without TypeScript errors.
3. `npm run dev:web` started Vite 8.3.2 at `http://127.0.0.1:5173`.
4. AI-assisted browser inspection confirmed that the synthetic observation fields rendered and reported no browser console warnings or errors.
5. The Vite process stopped successfully with `Ctrl+C`.

Observed page content included:

- A Riven heading
- An explicit synthetic-mode label
- A notice that the backend was not connected
- Product name
- Price and currency
- Availability
- Synthetic source
- Observation time
- Unverified product-match status

## Preliminary backend reproduction

Date: 2 October 2026

Source: unmerged branch `RIV-4-demo-observation-endpoint`, commit `6380790`.

Environment:

- Windows 11, 64-bit
- Node.js 24.20.0
- npm 11.19.0

Checks performed from a separate clean clone:

1. `npm ci` installed 325 packages and reported 0 vulnerabilities among 326 audited packages.
2. npm warned about a deprecated transitive `glob` dependency.
3. npm reported two package install scripts that were not covered by its `allowScripts` configuration.
4. `npm test -- --runInBand` ran one Jest test successfully.
5. The test requested `GET /api/v1/demo-observation` and received HTTP 200.
6. Because no backend start script exists, `node server/index.js` was started through a temporary PowerShell process.
7. A request to `http://127.0.0.1:3000/api/v1/demo-observation` returned the expected synthetic observation.
8. The temporary backend process was stopped after the request.

Returned fields included:

- `mode: "synthetic"`
- `productName: "Sample wired mouse"`
- `price: "19.99"`
- `currency: "GBP"`
- `availability: "in_stock"`
- `source: "Synthetic fixture (not Amazon)"`
- `observedAt: "2026-09-30T00:00:00Z"`
- `matchStatus: "unverified"`

Limitations:

- This checked an unmerged backend branch, not integrated `main`.
- The backend uses a separate package and lockfile.
- The backend currently uses JavaScript/CommonJS rather than TypeScript.
- No documented backend start script exists.
- The frontend did not request this running endpoint.

## Current integration dependency

The frontend uses the root `package.json` and `package-lock.json`. The backend currently uses a separate `server/package.json` and `server/package-lock.json`.

This conflicts with the proposed single-lockfile setup. The backend’s JavaScript/CommonJS implementation also differs from the agreed TypeScript baseline.

These differences must be coordinated with Dilsan and Hirukshanan before integration. Neither lockfile should be removed or replaced without agreement and review.

No combined frontend/backend setup has been verified.

## Remaining checks

Before the setup can be described as reproducible:

1. Agree one root package workflow with Dilsan and Hirukshanan.
2. Agree the TypeScript backend structure and start/check scripts.
3. Agree and implement the local frontend-to-backend request or proxy path.
4. Start the frontend and backend together.
5. Verify that the page requests `GET /api/v1/demo-observation`.
6. Repeat the integrated setup from a clean working copy.
7. Ask a second team member to follow the final instructions and record their environment and actual result.
8. Distinguish local checks from CI; no CI success has been claimed.

## Limitations

- The frontend and backend checks used separate unmerged feature branches, not integrated `main`.
- The displayed frontend observation came from a local synthetic value.
- No backend response reached the frontend during these checks.
- No production build or CI run was verified.
- The npm audit results describe individual runs only and are not permanent security guarantees.
- No live Amazon access or collection was tested.

## AI assistance

AI assistance was used to explain the task, review the published branch structures, guide the clean frontend and backend reproductions, and inspect the rendered frontend page and browser console.

Ilmam ran the Git, npm, type-check, test, start, HTTP request, and stop commands. No combined setup, merge, approval, or completed ticket is claimed.
