# Team working guide

**Updated:** 30 September 2026. **Status:** Proposed allocation by role; Jira account mapping and capacity are still needed.

## Start here

Read the [overview](project-overview.md), [requirements](requirements.md), [system baseline](architecture/system-baseline.md), [decision records](architecture/decisions.md) and [current sprint](sprints/sprint-01.md). Each issue adds a focused reading list and acceptance checks. The Markdown documents are the working baseline; PDFs in `references/` are historical/supporting material and do not automatically override later decisions.

The coordinator sets priorities with the client, checks integration and resolves cross-area decisions. They are not the sole programmer, tester or reviewer. All four members must understand the overall retailer journey and be able to run a demonstration.

## Four continuing responsibility areas

| Role | Primary ownership across the product | Initial issue lead | Backup/reviewer |
| --- | --- | --- | --- |
| A — Product experience | Client workflow, Figma/design system, forms, comparison/history/alert/admin screens, usability | #1 requirements coordination and #3 UI, with all members contributing requirements | B for contracts, D for journey tests |
| B — Application and data | Auth/tenancy, domain rules, HTTP contracts, catalogue, database/migrations, limits/tiers | #4 architecture and foundation, jointly with D | D for security/operations; C for observation semantics |
| C — Collection and data quality | Source access research, connectors, normalisation, matching, collection accuracy and parser regression | #2 source feasibility | B for model/transactions; D for failure/resource checks |
| D — Integration and operations | Durable job infrastructure, scheduler, CI, environment setup, observability, delivery adapters, deployment/recovery and integration checks | #4 reproducible setup/queue and #2 failure testing | B for API/data; C for scheduler/source limits |

No member is “only QA” or “only project management”. Everyone implements, tests, reviews and documents. D delivers substantial runtime code as well as integration support. The user may take A or another role after the team discusses strengths; being able to do everything does not mean accepting every task.

Stable ownership means knowing where to ask, not exclusive control of files. A frontend lead continues with comparisons, history, alerts and administration in later sprints. When workload is uneven, pair on another area and update the sprint assignments. Reassess ownership at each retrospective. Every critical area needs a backup who has reviewed and run it.

## Six-sprint responsibility forecast

These are outcomes, not fixed personal commitments. Use the [roadmap](roadmap.md) for official date windows and [backlog](product-backlog.md) for scope IDs.

| Sprint | A: product experience | B: application/data | C: collection/accuracy | D: integration/operations |
| --- | --- | --- | --- | --- |
| 1 | First journey, states and UI; coordinate sample/use-case decision | Contracts, tenant/auth foundation, schema, product/monitor endpoints | Amazon gate; first supported adapter and fixtures | Local setup/CI, durable queue/worker lifecycle, integration and initial restore |
| 2 | Collection status, history basics and controls | History/query model, monitor lifecycle | Second source gate/adapter, matching regression | Scheduler, retry/restart/downtime behaviour and bounded resource use |
| 3 | Comparison tables, filters and history charts | Equivalent-offer grouping, pagination and aggregate queries | Expanded accuracy samples, seller/variant-change handling | Pilot load tests, bottleneck fixes and deployment resource decision |
| 4 | Alert rule forms, event inbox and usability | Alert conditions/state/event deduplication | Changes interpreted correctly; no false alerts for source errors | Durable notification delivery and end-to-end recovery tests |
| 5 | Tier/usage/admin screens | Tier policy, limits and admin permissions | Connector health/diagnostics for admin use | Metrics, operational controls, backup routine and deployment rehearsal |
| 6 | Accessibility/usability polish and user guide | Data/auth regression and final migrations | Final source/accuracy report and connector maintenance guide | Release/restore/load checks, deployment/runbook; whole team acceptance/demo |

Testing, reviews and documentation occur every sprint, not just in D's column. C4 architecture documentation grows from the baseline and decision records; confirm the module's submission format.

## Jira and GitHub workflow

One repository, one product backlog and one Jira Scrum project (`RIV`) with sprint views. Jira owns tasks, assignees, estimates and status. GitHub owns source code, blueprints, branches and pull requests. Do not create two independent task boards.

1. Plan a working sprint outcome, then split work into reviewable issues (roughly 0.5–2 working days where possible; estimates are team estimates).
2. Each Jira task records PB/FR/NFR IDs, deliverable, scope exclusions, contract/doc links, dependencies, acceptance criteria, test evidence expected, owner, reviewer, estimate and sprint.
3. GitHub issues #1–#4 are legacy preparation records. Link them from the corresponding Jira tasks; use Jira for new tasks and updates.
4. Use `To Do → In Progress → Done` in Jira. A PR awaiting review remains In Progress; note a blocked dependency on the task. Add a Review status only if the team chooses it.
5. Work on a short-lived branch whose name includes its Jira key, such as `codex/RIV-12-listing-form`; include that key in commit and PR titles. Open a draft PR early when a contract affects another member.
6. Run the agreed checks, attach evidence to the Jira task or PR, obtain another member's review, merge and demonstrate integration before marking Done. Require client review when a task explicitly depends on a client decision.
7. Give a short daily update: completed evidence, next deliverable, blocker. Integrate at least twice each development week; review together before evaluation. Split work further if integration is repeatedly delayed.

Use Jira Scrum for module tracking. Never post tokens in chats/tasks or give an agent broader permissions than its task needs.

## Remaining S1 implementation tickets to prepare

Keep existing preparation issues as references. Create implementation work in Jira after contracts and capacity are reviewed; these local labels are planned task names, not claims that Jira tasks already exist.

| Planned task | Lead / reviewer | Dependencies | Acceptance evidence |
| --- | --- | --- | --- |
| S1-A — First journey screens and API states | A / B,D | #1,#3; schemas from #4 | Sign-in, product/monitor form, queued/failed/stale/unknown states; keyboard walkthrough |
| S1-B — Tenant-aware accounts and product/monitor API | B / D | #1,#4 | PostgreSQL migrations, auth and two-tenant tests; quotas; validated source URLs |
| S1-C — Source adapter and observation validation | C / B | #1,#2; shared contract | Honest access verdict, real samples if supported, fixtures for edge cases, normalisation tests |
| S1-D — Durable collection integration and recovery | D / B,C | #4, then S1-B/C | Atomic enqueue, restart/replay tests, observation persistence and safe failure state |
| S1-E — Whole journey acceptance | All; rotating reviewer / coordinator | S1-A–D | Live supported-source journey, independent accuracy check, tenant isolation, clean setup and restore evidence |

Fixture-backed integration can proceed while access is unresolved; S1-C live-source and S1-E live acceptance remain blocked. Do not rename fixture data as a successful Amazon connector to satisfy the board.

## Agentic IDE handoff prompt

```text
Work in this Riven repository on issue <number/title> only.
Read AGENTS.md, docs/README.md, docs/requirements.md,
docs/architecture/system-baseline.md, docs/architecture/decisions.md,
docs/sprints/sprint-01.md and the issue's specific references.
Summarise the deliverable, dependencies and relevant FR/NFR/PB IDs.
Distinguish confirmed requirements, recommended designs and open decisions.
Check the current code and branch; the earlier prototype is not an approved baseline.
Use the agreed contracts. Raise material missing decisions before dependent work;
do independent work without inventing client answers.
Implement only the assigned scope after the team accepts the relevant baseline.
Include meaningful tests, actual verification output, documentation changes and
an ADR when changing an architectural decision. Never expose secrets, bypass
source restrictions, or represent fixture results as live-source evidence.
Prepare a PR summary explaining what changed, why, test results and limitations.
Only update Jira and GitHub state within the assigned task.
```

The member remains responsible for understanding and reviewing generated code. Another agent's confidence is not acceptance evidence.

## Change control and final report evidence

- Routine implementation details within an accepted issue: owner decides and explains in the PR.
- Shared contract/schema/dependency change: affected owner plus reviewer agrees, adds ADR if material, updates dependent issues/tests.
- Product scope, source-count, paid service or client-visible semantics change: coordinator records the client's decision and effect on backlog/schedule.
- Do not document every line of code. Preserve important reasons, alternatives, source references, actual experiments, PRs, failures and fixes as they happen; these become report evidence.

Before assigning names, ask each member to explain the full workflow and choose an area they can sustain. Estimate availability, pair on the first integration and rebalance after the first week. No fixed six-sprint plan can remove the need for this feedback.
