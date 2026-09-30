# Product backlog

Version 0.1 · Draft scope ordering, not Jira assignments or completed work.

These PB IDs preserve the earlier backlog. Requirements live in the [SRS](requirements.md); actual selected tasks and progress live in Jira. P0 means resolve first; P1 means core delivery; P2 means after the first working flow, not optional scope.

| ID | Priority | Deliverable and completion check | Requirements |
| --- | --- | --- | --- |
| PB-01 | P0 | Scope decisions: client questions resolved before dependent implementation; remaining unknowns recorded. | All |
| PB-02 | P0 | Source feasibility: access/use/retention and accuracy evidence for both final platforms; blocked routes stay visible. | FR-03–05, NFR-05 |
| PB-03 | P1 | Project foundation: second member reproduces setup and checks; agreed stack and relevant contracts recorded. | NFR-07 |
| PB-04 | P1 | Accounts: sign-in/out and account separation demonstrated and tested. | FR-01, NFR-01 |
| PB-05 | P1 | Product/listing management: add/view/edit/remove; limits and matching uncertainty handled. | FR-02–04 |
| PB-06 | P1 | Collection/storage: two supported sources, periodic jobs, timestamped history, controlled failure/retry handling. | FR-05–06, FR-11, NFR-02 |
| PB-07 | P1 | Comparisons: equivalent offers, source/currency/time, uncertainty and stale state displayed in own workspace. | FR-07, NFR-04–05 |
| PB-08 | P1 | Alerts: agreed condition/channel and duplicate handling tested within an agreed delay. | FR-08, NFR-04 |
| PB-09 | P1 | Tiers/limits: agreed allowances enforced; mock billing and management permissions verified. | FR-09 |
| PB-10 | P1 | Administration: agreed account/failure/usage views protected by role checks. | FR-10–11, NFR-01 |
| PB-11 | P2 | History charts: plots match stored observations and dates. | FR-06–07 |
| PB-12 | P1 | Quality/release: relevant security, accuracy, usability, performance and restore checks, setup and handover evidence. | NFR-01–11 |

Sprint 1 initially selects parts of PB-01/02/03/07/12 for the synthetic connected checkpoint. The intended full journey also needs PB-04 and parts of PB-05/06/07. Completing one-source collection does not complete the two-source PB-02/06 items. Do not close whole-product items because a preparation task is complete.

Later sprint allocations are a forecast in the [manual](manual.md), not fixed individual commitments. Replan unfinished work at review. No hour estimates or story points have been agreed.
