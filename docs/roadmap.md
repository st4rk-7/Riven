# Riven — Project Roadmap

**Updated:** 27 September 2026

**Status:** Proposed feature forecast; dates follow the supplied module schedule.

## 1. Where we are

- Project selected and title decided; proposal submitted, according to the team.
- Functional requirements, non-functional requirements and initial product backlog written.
- Current position: requirements review and Sprint 1 preparation.
- The available requirements document is a draft for client review. Writing requirements does not establish that the client has accepted them or that technical feasibility has been demonstrated.

The project is a multi-tenant competitor-monitoring system for retailers. Its core outcome is to collect selected competitor prices, stock availability and offers periodically, preserve history, show comparisons and trigger agreed alerts. Retailers make their own pricing decisions. The administrator manages the service; subscription limits separate service tiers.

Success means the agreed core workflow works with the selected sources, meets agreed quality targets, is usable by the client, and can be deployed, demonstrated and handed over with the required module evidence.

## 2. How SDLC and Scrum fit together

Use the module schedule for dates, SDLC activities for engineering the software, and Scrum to plan and review increments.

For every sprint:

Plan the goal and select backlog items → clarify requirements → design the selected change → implement and integrate → test → demonstrate and collect feedback → retrospective and refine the backlog.

These activities overlap. Design, testing, documentation and integration happen throughout the six sprints. The final sprint is not the first time the whole application is assembled or tested.

## 3. Next steps, in order

1. **Review the existing requirements with the client.** Confirm the essential workflow and scope boundaries. Resolve decisions needed for Sprint 1: candidate sources, product/variant identification, required fields, tracking limits, monitoring interval and acceptance measures. Record decisions; retain explicit unknowns.
2. **Prepare the team workflow.** Set up the repository, issue board, team access, branch/PR review rules and repeatable local setup. Assign a person to coordinate backlog priorities with the client and agree team availability. The module outline mentions Jira; confirm whether GitHub Projects is accepted for assessed tracking.
3. **Agree a Definition of Done.** Acceptance criteria met; relevant tests pass; another team member reviews the change; code is merged and integrated into the running application; affected documentation is updated; no known critical defect remains in the increment.
4. **Hold Sprint 1 Planning on its start date.** Agree one Sprint Goal, select a realistic set of existing backlog items, split them into tasks, estimate them and coordinate ownership. The team chooses work against actual capacity, not an assumed number of story points.
5. **Deliver and review Sprint 1, then repeat.** Do not wait for every later feature or screen to be fully designed.

Initial architecture, wireframes, data modelling and source-feasibility investigations are work to include in Sprint 1. Prepare enough to begin; continue refining them inside the sprint. Keep the initial technical approach small: a modular web application, persistent storage and background workers. Choose frameworks and hosting based on team skills, source needs and budget.

## 4. Six-sprint delivery forecast

Dates below are from the supplied revised schedule, checked 27 September 2026. Feature allocations are a proposed forecast, not approved commitments; refine them with the client and team before each sprint.

| Sprint | Development window | Evaluation window | Proposed working outcome |
|---|---|---|---|
| 1 | 28 Sep–11 Oct 2026 | 12–18 Oct 2026 | First end-to-end workflow: a retailer signs in, adds a supported competitor listing and sees its collected price, availability and timestamp. Establish tenant isolation, minimal UI/data design and a runnable application. Probe both candidate sources early. |
| 2 | 19 Oct–1 Nov 2026 | 2–8 Nov 2026 | Repeatable collection: scheduled jobs, timestamped history, collection status and bounded retries; extend to the second agreed source. Make matching/variant checks explicit and show missing/stale data correctly. |
| 3 | 9–22 Nov 2026 | 23–29 Nov 2026 | Useful comparison workflow: manage products/listings, compare competitors and inspect price-history charts. Demonstrate correctly matched observations from both agreed sources. |
| 4 | 4–17 Jan 2027 | 18–24 Jan 2027 | Actionable alerts: configure agreed conditions, deliver through the first agreed channel and prevent duplicate alerts. Validate the complete monitoring-to-alert journey with the client. |
| 5 | 25 Jan–7 Feb 2027 | 8–14 Feb 2027 | Service management: subscription tiers and agreed limits, mock billing if agreed, tenant administration and collection/usage visibility. Submit C4 architecture documentation in the evaluation week. |
| 6 | 15–28 Feb 2027 | 1–7 Mar 2027 | Release candidate: finish remaining agreed core gaps, resolve defects, run full acceptance/load/recovery checks, verify deployment and provide operating/user instructions. Prepare for the coding-standards and AI code-review evaluation. |

Security, tenant isolation, basic limits, testing, documentation and deployment capability grow from Sprint 1 onward. Scheduling a feature in a later sprint does not defer the foundations needed earlier.

The November–January gap contains field visits, open slots, study leave and examinations; it is not an extra committed sprint.

## 5. What each sprint needs

Before implementation, record:

- Sprint dates and one clear goal.
- Selected product-backlog IDs, acceptance criteria and relevant NFR targets.
- Tasks, estimates, coordinated ownership and known dependencies.
- The demonstration that will prove the goal is achieved.

At the end, keep:

- A working integrated increment, meaningful test results and relevant PRs.
- Client/evaluator feedback and a short retrospective.
- Updated backlog and documentation.

The sprint backlog is a selection from the single product backlog plus the delivery plan. Use issue-board fields/views; a separate large document is unnecessary unless the module requests one. Unfinished work returns to the product backlog for reprioritisation; do not label it Done or automatically carry it over without replanning.

## 6. Risks and decisions

| Risk | Early check and response |
|---|---|
| A source cannot supply reliable repeated observations | Time-box a source probe early in Sprint 1. Record results and agree a supported alternative or scope adjustment promptly. Do not silently replace real collection with mock data. |
| Incorrect product variants or currencies are compared | Check known sample listings manually; confirm identifiers, variants and currency rules before presenting a comparison as equivalent. |
| Too much work for six sprints | Prioritise the agreed core. Put new ideas into the product backlog; trade scope with the client rather than silently adding work. |
| Tenant data leaks or background jobs duplicate records/alerts | Build access control early and verify these behaviours as they are implemented. |
| Hosting or notification costs exceed resources | Agree operating budget and expected workload before choosing services. |

The four students collectively deliver the system and coordinate task ownership during planning. The client validates usefulness and scope decisions; module evaluators assess course requirements. Record the backlog coordinator and technical/review owners on the team board during planning.

## 7. Completion and handover

After Sprint 6, use the remaining scheduled period for acceptance follow-up, necessary corrections, handover and final reporting. Avoid planning essential core features for this buffer.

- Final report preparation: 22–28 March 2027.
- Final report deadline window: 29 March–4 April 2027.
- Final panel evaluation: 5–11 April 2027.

Finish with a deployed and tested system, agreed acceptance evidence, setup/configuration and user instructions, backup/restore guidance, a final report and demo, and recorded limitations. Transfer repository and deployment access as agreed without exposing credentials.

## 8. One rule for staying on track

Use this roadmap for direction, the product backlog for all agreed work, and the current sprint backlog for day-to-day execution. Revise later feature allocations when evidence changes; keep the core objective and deadlines visible. Progress is working, validated software—not only completed tickets.

## Schedule basis

- Scope basis: [project overview](project-overview.md), [requirements](requirements.md) and [product backlog](product-backlog.md).
- Current sprint: [Sprint 1 plan](sprints/sprint-01.md).
- [Supplied module schedule](https://docs.google.com/spreadsheets/d/1VVkTQPaGKsHn--LGGsGYFMPGsYsyMoklWXYrCAhmzzQ/edit?gid=318942371#gid=318942371), checked 27 September 2026.
- The schedule specifies three-week sprints, with evaluation in week three. It lists C4 architecture documentation due 8–14 February and describes C4 as replacing the SRS-style design document. Follow current module instructions for the exact submission format.
- The supplied schedule header says EC5404 while the module information sheet says EC5406. This roadmap uses the dates in the schedule supplied by the team; verify that administrative label with the coordinator.
- Dates are week windows from the schedule, not invented exact submission times. Follow subsequent coordinator updates.
