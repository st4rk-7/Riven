# Local development setup

## Status

RIV-5 has an integrated frontend/backend setup that was verified in the working repository and from a separate clean clone.

Human review and second-member reproduction are still pending. The ticket remains In Progress.

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

Do not create a second package or lockfile inside `web/` or `server/`.

## Install dependencies

From the repository root:

```powershell
npm ci
