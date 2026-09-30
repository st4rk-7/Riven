# Team working guide

**Updated:** 30 September 2026. **Status:** The coordinator named four role owners. Jira account mapping, task creation and capacity still need recording. This guide requires member-led, step-by-step learning when using AI.

## Start here

Read the [overview](project-overview.md), [requirements](requirements.md), [system baseline](architecture/system-baseline.md), [decision records](architecture/decisions.md) and [current sprint](sprints/sprint-01.md). Each issue adds a focused reading list and acceptance checks. The Markdown documents are the working baseline; PDFs in `references/` are historical/supporting material and do not automatically override later decisions.

The coordinator sets priorities with the client, checks integration and resolves cross-area decisions. They are not the sole programmer, tester or reviewer. All four members must understand the overall retailer journey and be able to run a demonstration.

## Learning-first development with AI

The purpose of the project is for each member to learn to design, implement, test and explain software. A task is not successfully completed just because an AI agent produced code or an automated check passed. The assigned member owns the reasoning and must be able to maintain the result.

For every task, the member follows this sequence:

1. **Understand:** Read the task and its linked requirements. In their own words, describe the user problem, expected behaviour, acceptance criteria, dependencies and any uncertainty. Ask AI to explain unfamiliar concepts or existing code; do not ask it to solve the whole task.
2. **Trace:** Locate the relevant files and trace how data moves through the affected parts of the application. Identify shared contracts and ask the other owner before changing them.
3. **Plan a small step:** State what the next small change will do, why it is needed, and how to check it. Resolve or record open decisions before dependent implementation.
4. **Implement with guidance:** Work in short steps. AI may explain, ask questions, suggest alternatives, review code, or help draft a small change after the member has proposed an approach. The member reads and understands every changed line, adapts it, and remains the author of the technical decision. Do not use an autonomous “complete the entire issue” instruction.
5. **Predict and verify:** Before running a check, say what result is expected. Run it, inspect the actual output, and explain any failure before changing code. Never report an unrun test as passing.
6. **Explain and demonstrate:** Before requesting review, explain the requirement, code/data flow, key decision, test evidence and remaining limits to a teammate. Be able to make a small change or debug a straightforward variation while explaining it.
7. **Record and review:** In Jira/PR, summarize the member's approach and decisions, actual checks/results, limitations, and material AI assistance. A teammate reviews both the software evidence and whether the owner can explain the work. Only then is the task ready to merge/mark Done.

If a member cannot explain a part, pause acceptance and learn that part together. Pairing and asking for help are expected; hiding uncertainty or pasting unreviewed generated code is not.

### AI tutor and pair-programmer prompt

Use this prompt in an agentic IDE for an assigned task:

```text
Act as my tutor and pair programmer for Jira task <KEY>, not as an autonomous task implementer.
First ask me to explain the task in my own words, then help me check the user problem,
acceptance criteria, dependencies and uncertain decisions. Read the relevant repository
instructions and code with me; explain the existing flow and ask me to locate the relevant
files. Help me plan one small step. Do not implement the whole task or make broad changes.
At each step, explain the purpose and likely effect before suggesting code. Ask me to
predict the result; then help me run and interpret the check. If you suggest or draft a
small code change, explain it and have me review, adapt and explain it before moving on.
Do not claim checks passed unless they were run and show their actual output. Finish by
helping me prepare to explain the design, data flow, decisions, tests and limitations to
a teammate. Do not merge, assign work, or change Jira/GitHub status.
```

## Four continuing responsibility areas

| Role and owner | Primary ownership across the product | Initial issue lead | Backup/reviewer |
| --- | --- | --- | --- |
| A — Dilsan, product experience | Client workflow, Figma/design system, forms, comparison/history/alert/admin screens, usability | First journey screens and UI states | Hirukshanan for contracts, Ilmam for journey tests |
| B — Hirukshanan, application and data | Auth/tenancy, domain rules, HTTP contracts, catalogue, database/migrations, limits/tiers | Contract, auth and product/listing API | Ilmam for security/operations; Shewon for observation semantics |
| C — Shewon, collection and data quality | Source access research, connectors, normalisation, matching, collection accuracy and parser regression; coordinate cross-area changes | Source feasibility and adapter | Hirukshanan for model/transactions; Ilmam for failure/resource checks |
| D — Ilmam, integration and operations | Durable job infrastructure, scheduler, CI, environment setup, observability, delivery adapters, deployment/recovery and integration checks | Reproducible setup/queue and integration | Hirukshanan for API/data; Shewon for scheduler/source limits |

No member is “only QA” or “only project management”. Everyone implements, tests, reviews and documents. Ilmam delivers substantial runtime code as well as integration support. Shewon coordinates integration decisions and improvements without becoming the sole implementer or reviewer of every area.

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
5. Work on a short-lived branch whose name includes its actual Jira key, such as `feature/RIV-12-listing-form`; `codex/` is not required. Include the key in commit and PR titles. Open a draft PR early when a contract affects another member.
6. The owner records actual checks and results, then demonstrates and explains the change to a teammate. The reviewer asks the owner to trace the affected flow and justify key decisions. Attach evidence to Jira/PR, fix review feedback, merge and demonstrate integration before marking Done. Require client review when a task explicitly depends on a client decision.
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

## Task completion and module learning evidence

The member remains responsible for understanding and reviewing every change. Another agent's confidence, generated explanation or green test alone is not acceptance evidence. The task owner must present the work and answer a teammate's questions about the flow, alternatives, test behaviour and failure cases. Capture brief evidence in the PR/Jira ticket: what the member decided and implemented, what AI assisted with, what the member changed after reviewing that assistance, and what they personally ran and observed. Follow any stricter module rules for AI disclosure or assessment.

## Change control and final report evidence

- Routine implementation details within an accepted issue: owner decides and explains in the PR.
- Shared contract/schema/dependency change: affected owner plus reviewer agrees, adds ADR if material, updates dependent issues/tests.
- Product scope, source-count, paid service or client-visible semantics change: coordinator records the client's decision and effect on backlog/schedule.
- Do not document every line of code. Preserve important reasons, alternatives, source references, actual experiments, PRs, failures and fixes as they happen; these become report evidence.

Before starting assigned work, each member explains the full workflow and states available time. Pair on the first integration and rebalance after the first week. The team can use AI throughout, but the member's own step-by-step reasoning, implementation practice and explanation remain central in every sprint.
