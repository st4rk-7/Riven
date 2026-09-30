# Riven documentation

**Updated:** 30 September 2026

**Current position:** Sprint 1 setup and task assignment. Jira Scrum project `RIV` is the team board; GitHub holds source and these blueprints.

Riven is a multi-tenant competitor tracking and analysis system for online retailers. The proposal is submitted, according to the team. The whole-product technical baseline is now drafted. Amazon is the first required source, TypeScript is confirmed, and only personal computers are currently available. Source feasibility, remaining client decisions and team acceptance of the recommended stack are not yet recorded. The four role owners are named; Jira account mapping and available time remain open.

## Immediate direction

1. Review the whole-product baseline and decision records together. The recommended stack is React/Vite + Fastify + PostgreSQL/Drizzle + pg-boss, with a separate worker and a replaceable source connector. These are proposed choices, not a completed implementation.
2. Resolve Amazon access before committing to its collection method. UK/wired USB mice is the recommended initial marketplace/category; exact samples, delivery context and offer meaning need verification. Existing open-source scrapers do not prove access or reliability.
3. Confirm each named owner's capacity, Jira account and the interface contracts. Each member implements/tests/documents their work and has a backup reviewer.
4. Refine the Sprint 1 issues into a full working journey. The four existing preparation issues are not the whole sprint. Build permanent foundations now and later features in their planned increments.
5. Keep local development and continuous hosted operation distinct. A sleeping personal computer does not provide a 24/7 monitoring service. Resolve the final deployment arrangement before release.

No live-source collection has been verified. The separate design prototype is a UI reference with demo data, not accepted production code.

## Reading order

| Document | Purpose | Status |
| --- | --- | --- |
| [Project overview](project-overview.md) | Problem, users, scope and initial planning status | Initial definition established; open decisions remain |
| [Requirements](requirements.md) | Functional requirements, quality requirements and decisions to resolve | Draft for client review |
| [System baseline](architecture/system-baseline.md) | Whole-product architecture, stack, data model, interfaces, SOLID and operation | Proposed version 0.1; review before implementation |
| [Collection strategy](architecture/collection-strategy.md) | Amazon feasibility gate, source-method alternatives and evidence required | First source fixed; access/method unproven |
| [Quality targets](architecture/quality-targets.md) | Measurable NFRs, capacity assumptions and failure/recovery tests | Targets proposed; no measurements claimed |
| [Decision records](architecture/decisions.md) | Why these technologies/methods, alternatives and revisit triggers | ADR-001–008 proposed, with confirmed constraints distinguished |
| [Team working guide](team-working-guide.md) | Four ownership areas, learning-first AI tutor workflow, Jira/GitHub and review process | Roles named; Jira task/account setup and capacity pending |
| [Product backlog](product-backlog.md) | Prioritised work and completion checks | Initial backlog; estimates and ownership pending |
| [Roadmap](roadmap.md) | Six-sprint forecast and module milestones | Proposed feature allocation |
| [Sprint 1 plan](sprints/sprint-01.md) | First working journey, selected backlog scope, tasks and acceptance checks | Proposed; finalise at Sprint Planning |
| [Sprint 1 Jira task pack](sprints/sprint-01-jira-tasks.md) | Ten reviewable work items, role owners, dependencies and evidence | Ready to create/assign in RIV |

## How to maintain these documents

- Keep requirements and their IDs in `requirements.md`, all product work in `product-backlog.md`, and sprint selections in `sprints/`. Do not create a second independent product backlog.
- Record client decisions, their date and any affected IDs. Until then, proposed limits, quality targets and feature allocations remain proposals.
- Update related documents together when scope changes. Describe the reason and impact in the pull request; preserve IDs rather than renumbering existing work.
- Link implementation issues to their parent backlog IDs. A completed sprint task does not automatically complete its parent backlog item.
- Keep credentials, private conversations and personal contact details out of the repository.
- Use `AGENTS.md` at the repository root for agent working rules. An agent must not infer client approval from a draft or fabricate live-source/test evidence.
- Keep a short ADR for significant technical changes and attach actual experiments/test evidence to the issue/PR. Routine code changes do not require separate lengthy reports.

## Document basis

These editable documents reconcile the supplied **Riven Project Roadmap**, **SDLC Stage 1 Summary**, **SDLC Stage 2 Requirements** and existing **Riven Sprint 1 Plan**. They retain FR-01–FR-11, NFR-01–NFR-08 and PB-01–PB-12 from the supplied Stage 2 document. Proposed NFR-09–11 were added on 28 September to capture scalability, adaptability and operability. Sprint 1 tenant isolation maps to PB-04 / NFR-01; it does not require a separate PB-13.

The old Stage 1 action to write requirements is updated to reflect that drafts now exist. The original proposal is not rewritten or treated as a newly approved specification. This directory contains the working documentation; outdated PDF copies are not duplicated alongside it.

The [roadmap](roadmap.md#schedule-basis) records the schedule source, its verification date and the unresolved module-code discrepancy.
