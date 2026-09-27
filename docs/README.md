# Riven documentation

**Updated:** 27 September 2026

**Current position:** Requirements review and Sprint 1 preparation.

Riven is a multi-tenant competitor tracking and analysis system for online retailers. The team reports that the proposal has been submitted. Requirements and delivery plans are drafted; client approval, source feasibility and Sprint 1 commitments have not yet been recorded here.

## Reading order

| Document | Purpose | Status |
| --- | --- | --- |
| [Project overview](project-overview.md) | Problem, users, scope and initial planning status | Initial definition established; open decisions remain |
| [Requirements](requirements.md) | Functional requirements, quality requirements and decisions to resolve | Draft for client review |
| [Product backlog](product-backlog.md) | Prioritised work and completion checks | Initial backlog; estimates and ownership pending |
| [Roadmap](roadmap.md) | Six-sprint forecast and module milestones | Proposed feature allocation |
| [Sprint 1 plan](sprints/sprint-01.md) | First working journey, selected backlog scope, tasks and acceptance checks | Proposed; finalise at Sprint Planning |

## How to maintain these documents

- Keep requirements and their IDs in `requirements.md`, all product work in `product-backlog.md`, and sprint selections in `sprints/`. Do not create a second independent product backlog.
- Record client decisions, their date and any affected IDs. Until then, proposed limits, quality targets and feature allocations remain proposals.
- Update related documents together when scope changes. Describe the reason and impact in the pull request; preserve IDs rather than renumbering existing work.
- Link implementation issues to their parent backlog IDs. A completed sprint task does not automatically complete its parent backlog item.
- Keep credentials, private conversations and personal contact details out of the repository.

## Document basis

These editable documents reconcile the supplied **Riven Project Roadmap**, **SDLC Stage 1 Summary**, **SDLC Stage 2 Requirements** and existing **Riven Sprint 1 Plan**. They retain FR-01–FR-11, NFR-01–NFR-08 and PB-01–PB-12 from the supplied Stage 2 document. Sprint 1 tenant isolation maps to PB-04 / NFR-01; it does not require a separate PB-13.

The old Stage 1 action to write requirements is updated to reflect that drafts now exist. The original proposal is not rewritten or treated as a newly approved specification. This directory contains the working documentation; outdated PDF copies are not duplicated alongside it.

The [roadmap](roadmap.md#schedule-basis) records the schedule source, its verification date and the unresolved module-code discrepancy.
