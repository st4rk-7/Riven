# Product backlog

**Updated:** 27 September 2026

**Status:** Initial backlog for client and team review. Items are not yet estimated, assigned or marked complete.

**P0:** Resolve first. **P1:** Core delivery. **P2:** Complete after the basic workflow. These priorities describe proposed ordering, not optionality or sprint commitments. Historical charts remain in the initial scope.

## Backlog items

| ID | Priority / type | Work or user need | Completion check | Requirements |
| --- | --- | --- | --- | --- |
| PB-01 | P0 / Task | Confirm sources, limits, intervals, alert channels, subscriptions, budget and quality targets. | Record client decisions and remaining unknowns. Resolve decisions before dependent work is committed. | All |
| PB-02 | P0 / Investigation | Test repeated collection and correct product matching on both candidate sources. | Record sample results, failures and access constraints; agree alternatives for unreliable sources. | FR-03–05; NFR-05 |
| PB-03 | P1 / Technical task | Set up version control, application structure, database and automated checks. | The team can run the application and checks from documented steps. | NFR-07 |
| PB-04 | P1 / User story | As a retailer, I want to sign in so that I can access my own workspace. | Sign-in and sign-out work; role and cross-tenant access tests pass. | FR-01; NFR-01 |
| PB-05 | P1 / User story | As a retailer, I want to manage products and competitor listings so that I monitor relevant items. | Add, edit and remove entries; enforce agreed limits and flag uncertain matches. | FR-02–04 |
| PB-06 | P1 / Technical task | Build scheduled workers for the two agreed sources and save observations. | Repeated runs preserve timestamped history; failed jobs are logged and retried within limits. | FR-05–06, FR-11; NFR-02 |
| PB-07 | P1 / User story | As a retailer, I want a comparison table so that I can identify competitor changes. | Own-tenant data displays correctly with source, currency, collection time and stale status. | FR-07; NFR-04–05 |
| PB-08 | P1 / User story | As a retailer, I want alerts for configured conditions so that I can respond to changes. | A test condition triggers an alert through the agreed first channel within the agreed delay. | FR-08; NFR-04 |
| PB-09 | P1 / User story | As a retailer, I want to see my tier and limits so that I understand my allowance. | Agreed tiers, configuration permissions, limit enforcement and mock billing behaviour pass tests. | FR-09 |
| PB-10 | P1 / User story | As an administrator, I want an overview so that I can manage accounts and collection problems. | Agreed tenant controls, failure details and usage metrics are visible only to the administrator. | FR-10–11; NFR-01 |
| PB-11 | P2 / User story | As a retailer, I want trend charts so that I can review competitor changes over time. | Chart values and dates match stored observations. | FR-06–07 |
| PB-12 | P1 / Technical task | Test security, accuracy, failures, performance, usability and backup recovery. | Record results against agreed targets, resolve critical defects and document setup and recovery. | NFR-01–08 |

## Using the backlog

This is the single product backlog. Before selecting work, split broad items into small tasks with clear acceptance checks. Record estimates, dependencies and ownership on the team board during planning.

The [Sprint 1 plan](sprints/sprint-01.md) selects only the scope needed for the first working journey. Its partial PB-05–07 delivery does not finish those entire items. PB-01 decisions and PB-12 quality work continue as needed throughout delivery.

Use `PB-xx` in issue titles or issue fields and `S1-xx` for the proposed Sprint 1 tasks. Keep issue status and evidence on the board; update this document when scope, priority or completion criteria change. Unfinished sprint work returns for reprioritisation rather than being marked complete.

Requirements are maintained in [requirements.md](requirements.md); the feature forecast is in [roadmap.md](roadmap.md).
