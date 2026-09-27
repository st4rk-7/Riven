# Project overview

**Product:** Riven

**Formal title:** Multi-Tenant Automated Competitor Tracking and Analysis System for Online Retailers

**Module:** EC5406 Software Group Project, subject to the [schedule-label clarification](roadmap.md#schedule-basis)

**Updated:** 27 September 2026

## Problem and intended value

Retailers manually revisit competitor listings to check prices, availability and offers. This makes changes difficult to track consistently and leaves little historical evidence for pricing decisions.

Riven will collect observations from selected supported sources, retain history and present comparisons and alerts in one workspace. The objective is an affordable alternative to expensive enterprise market-data APIs without depending on those APIs. Affordability and reliable collection are objectives to validate, not established results or a promise to replace every enterprise service.

## Users

| User | Intended outcome |
| --- | --- |
| Retailer / tenant | Monitor selected competitors, compare observations and receive useful alerts within agreed service limits |
| Administrator | Manage the service, oversee tenants and investigate collection failures and usage |

Each retailer's workspace and data must be isolated from other tenants. The client reviews usefulness, priorities and acceptance; the four-student team delivers the software across six sprints.

## Core workflow

1. A retailer signs in to their workspace.
2. They add a tracked product and associate competitor listings from supported sources.
3. The system checks product and variant correspondence and flags uncertain matches.
4. Background collection records price, currency, availability, available offers and collection time.
5. The retailer sees comparisons, history and collection freshness or failure status.
6. Agreed monitoring conditions trigger notifications. The retailer decides how to respond.
7. Subscription limits govern tracking allowances; the administrator oversees operation.

## Initial scope

- Two agreed source platforms and a small, agreed set of products and competitor listings.
- Retailer accounts, product/listing management and tenant isolation.
- Periodic collection, timestamped history, comparison tables, historical charts and alerts.
- Configurable subscription tiers, enforced limits and agreed administration views. Mock billing is acceptable; exact behaviour and the tier-management actor remain to be confirmed.
- A deployed, tested application with setup, user and operating documentation.

Source platforms, listing input, matching rules, intervals, quantities, alert channels, stack, hosting and operating budget remain open. The [requirements](requirements.md) define these decisions in detail.

## Outside the initial core

Custom local-store integrations, affiliate marketing, public shopper comparison and predictive AI are outside the initial scope. Automated changes to retailers' selling prices are not an established requirement. New requests enter the backlog and require an explicit scope decision.

## Stage 1 status: definition and initial planning

| Established | Still needed |
| --- | --- |
| Project selected, title decided and proposal submitted, according to the team | Recorded client review of the detailed requirements |
| Problem, users and initial scope documented | Evidence that candidate sources support reliable repeated collection |
| Functional requirements, non-functional requirements and initial backlog drafted | Confirmed operating limits, quality targets and technical choices |
| Six-sprint delivery forecast prepared | Sprint 1 estimates, task ownership and capacity agreement |

The initial definition is sufficient to begin requirements review and Sprint 1 preparation. It does not mean planning is permanently closed or every assumption is proven. Requirements, design, implementation and validation continue within each sprint.

## Success and next action

Success means the agreed workflow operates on the selected sources, meets agreed quality targets, is accepted by the client, and can be deployed and handed over with the module evidence. It does not guarantee increased retailer profit.

Next: resolve the decisions needed for the first journey, then finalise the [Sprint 1 plan](sprints/sprint-01.md). Test source feasibility early enough to change a source or reduce scope before building around an unreliable dependency.
