# Riven

Riven helps small online retailers watch competitor prices and stock for the products they sell. A retailer adds a product, Riven finds competitor offers, and every price shows where it came from and when it was collected.

**Live:** https://riven.sbs (public page) · https://riven.sbs/app (the app)

## What it does today

- Retailer sign-in, with each retailer's data kept private
- Add and remove products; Riven finds up to 5 competitor offers on Amazon
- Matching marks each offer `confirmed`, `unverified` or `mismatch`; the retailer decides unverified ones
- A Chrome extension sends Amazon pages the retailer views; a server crawler can re-check offers on a timer
- Price history per offer; every attempt is recorded, including failures

Planned work is listed in the [SRS](docs/requirements.md).

## Documents

| Need | Document |
| --- | --- |
| What Riven must do | [Software requirements specification](docs/requirements.md) |
| How Riven is built | [Software design document](docs/design.md) |
| How Riven is tested | [Test plan](docs/test-plan.md) |
| How to use Riven | [User guide](docs/user-guide.md) |
| Run, test and deploy | [Setup](docs/setup.md) · [Database](docs/database.md) · [API](docs/api.md) |
| Product brief and visual direction | [PRODUCT.md](PRODUCT.md) |
| Team workflow | [Team handbook](docs/manual.md) · [Product backlog](docs/backlog.md) |
| Sprints | [Sprint 1](docs/sprints/sprint-1.md) |
| Where data comes from | [Source access decision](docs/source-access-decision.md) |
| Original intent | [Proposal reference](docs/proposal.md) |

Jira holds live tasks and status; this repository holds code, documents and review.

## Quick start

Requires Node.js 24, npm 11 and Docker. Full steps, including the database: [setup](docs/setup.md).

```bash
npm ci
```

```bash
npm run dev
```

```bash
npm test
```

## Tech stack

TypeScript · React + Vite · Fastify · PostgreSQL · Better Auth · Vitest · Chrome extension (Manifest V3) · Docker + Caddy on a VPS

No software licence has been chosen yet.
