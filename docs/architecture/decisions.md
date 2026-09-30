# Architecture decision records

**Updated:** 28 September 2026. **Status:** Proposed decisions, except user constraints explicitly marked confirmed. Record team reviewer/date and compatibility evidence when accepting an ADR. Do not confuse research with measured project results.

## Decision method

This is a small-team data-integration and workflow product with an unreliable external dependency. The established pattern is a modular application, durable asynchronous work, replaceable source adapters and measurable quality checks. A naive “scrape inside the page request, then add features” approach hides source failures, loses context and couples every screen to a website parser.

Compare alternatives by whole-product fit, cost/access, team learning burden, resource use, failure recovery, ability to test and replacement cost. An open-source repository's popularity is not proof of Amazon access or correct offer semantics.

## ADR-001 — Modular application with separate worker

**Proposed:** one repository/domain model, API plus separately started worker. Alternatives: one synchronous process (simpler initially, but requests depend on source delays), or microservices/Kubernetes (independent deployment but excessive operational burden for four students without hosting).

**Why:** source failures are isolated from stored-data reads; moving the worker later is straightforward. Cost: module discipline is still required and API/worker share database capacity. **Revisit:** measured resource contention or independently operated teams, not anticipated enterprise growth. **Validate:** stop/restart the worker while the API keeps serving stored data.

## ADR-002 — TypeScript web/API stack

**Confirmed:** TypeScript was selected by the user. **Proposed:** React/Vite plus Fastify, contracts in JSON Schema/TypeBox/OpenAPI. Alternatives: Next.js full stack (SSR benefits if marketing SEO becomes important; does not remove worker needs), NestJS (strong conventions/DI, additional framework ceremony), Python backend (good collection ecosystem but another language/runtime).

**Why:** one language and explicit contracts across a small team; Fastify's encapsulated plugins suit module separation. The local prototype is supporting context, not a reason to retain all its choices. **Cost:** the team must define module/service conventions itself. **Validate:** one authenticated, schema-validated endpoint consumed by the web app on every teammate's setup. [Fastify encapsulation](https://fastify.dev/docs/latest/Reference/Encapsulation/), [Node release policy](https://nodejs.org/en/about/previous-releases).

## ADR-003 — PostgreSQL from the foundation

**Proposed:** PostgreSQL 17 and Drizzle/node-postgres; checked-in, reviewed SQL migrations. Alternatives: SQLite (simpler single-process experiments but different concurrency/deployment characteristics), MongoDB (viable but less direct for relational ownership, quotas and historical queries), Prisma instead of Drizzle (valid alternative with different generated-client/tooling tradeoffs).

**Why:** use one relational model for tenant ownership, immutable observations and jobs; avoid an unnecessary later SQLite-to-PostgreSQL migration. Drizzle keeps generated SQL reviewable for coursework. **Cost:** teammates need PostgreSQL setup and basic SQL knowledge. **Validate:** create/upgrade/restore a test database and demonstrate tenant isolation with the intended non-owner application role. RLS is additional enforcement, not a replacement for application checks. [Drizzle migrations](https://orm.drizzle.team/docs/migrations), [PostgreSQL row policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## ADR-004 — PostgreSQL-backed durable jobs

**Proposed:** pg-boss for work scheduling/retries, with API and worker sharing its database infrastructure. Alternatives: in-memory timers (no durable history/recovery), BullMQ plus Redis (capable, but another service), a custom SQL queue (control at the cost of implementing leases/retries correctly).

**Why:** reuse PostgreSQL and a tested queue implementation. **Costs:** extra database load and a dependency with a small maintainer base; pin/audit versions and isolate access behind the collection service. **Validate:** transactional enqueue, crash after result commit, safe replay and source-wide concurrency cap. If ORM transaction integration fails, use a durable outbox rather than leaving a silent enqueue gap. [pg-boss features and requirements](https://github.com/timgit/pg-boss).

## ADR-005 — Source adapter; Amazon method gated by evidence

**Confirmed:** Amazon first; no funded provider available. **Proposed:** Amazon UK and wired USB mice; manual URLs; selected transport hidden behind `SourceConnector`. Official seller-authorised access is the strongest candidate if accessible and suitable. Permitted direct page collection is an alternative requiring evidence, not a confirmed Amazon solution.

**Alternatives and findings:** [collection strategy](collection-strategy.md). Do not rely on deprecated PA-API tutorials. Do not assume Temu/AliExpress access is easier. **Cost:** this requirement may block despite good application architecture. **Validate:** two-day access/accuracy investigation; obtain client decision if inaccessible. A fixture adapter proves the interface only. **Revisit:** access obtained/lost, marketplace changed, sustained accuracy failures, or a budget change.

## ADR-006 — Maintainable identity and explicit tenancy

**Proposed:** Better Auth backed by PostgreSQL, plus application-owned workspace membership/roles. Alternatives: custom password/session code (unnecessary security maintenance), hosted identity (operating/service dependency).

**Why:** maintained authentication with documented Fastify integration; tenancy remains a Riven responsibility. **Costs:** library schema/migrations and configuration must be understood. **Validate:** cookies, logout/revocation, allowed origins, CSRF protections, session expiry, two-tenant API/worker tests. Start pilot account provisioning with a documented admin/dev process; public signup, verification email and password recovery need explicit implementation before public release. Local accounts do not imply a production-ready auth workflow. [Better Auth Fastify integration](https://better-auth.com/docs/integrations/fastify).

## ADR-007 — Local operation with deployment portability

**Confirmed:** only personal computers are currently available. **Proposed:** local API/worker/PostgreSQL first; environment-based configuration, repeatable migrations and eventual container deployment. Alternatives: mandatory free cloud tiers (quotas/sleep/availability uncertain), paid VPS (unfunded), Kubernetes (unnecessary).

**Why:** no subscription required for development; interfaces remain portable. **Costs:** offline machines cannot monitor sources; no uptime promise. **Validate:** second teammate clean setup and backup restore, then agree a real hosting/demo arrangement before claiming deployed-service completion. Do not defer discovering hosting feasibility to the final sprint.

## ADR-008 — Incremental features, permanent quality foundations

**Proposed:** tenant isolation, source-neutral observations, durable work, explicit errors, migrations, contracts and basic logs begin in S1. Later charts, alerts, tier UI and admin features use those foundations. **Alternative:** disposable S1 stack then a rewrite; rejected because it hides integration cost.

Do not implement every later feature now. Keep seams where change is real: source transport, alert delivery, persistence and clock-dependent logic. Add scheduling and alert behaviour in their planned increments. **Validate:** one full retailer journey in S1 and continued regression checks throughout the six sprints.

## How to document later choices

Use a short entry with:

`ID / date / status / owner / problem / 2–3 alternatives / chosen option / evidence links / disadvantages / affected FR-NFR-PB IDs / compatibility or migration impact / revisit trigger / reviewer / linked PR`.

Create an ADR for database, authentication, queue, source/API/provider, matching semantics, deployment or a significant dependency. Routine selector repairs and ordinary component changes usually need an issue/PR explanation, not a new ADR. Never overwrite the reason an old decision existed; mark it superseded and link its replacement.

## Evidence still required

- Amazon access route, allowed storage/use and live sample results.
- Framework/auth/queue/database compatibility on actual team machines.
- Measured performance and resource consumption.
- Final deployment resources, budget and module acceptance of the tracking/demo approach.
- Client decisions on offer semantics, numerical targets, source count changes and tier configuration permissions.

Documentation research supports the recommended capabilities above. It does not prove Riven's implementation, permissions or performance.
