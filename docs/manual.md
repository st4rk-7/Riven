# Team handbook

**Riven** · Version 1.0 draft · 4 November 2026 · Status: for team review

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 30 Sep 2026 | Core manual: product, architecture, technology, data meanings, quality and workflow. |
| 1.0 draft | 4 Nov 2026 | Product moved to the SRS; architecture, data meanings and technical decisions moved to the SDD. This file keeps how the team works. |

## 1. Where things are

| Information | Document |
| --- | --- |
| What Riven must do | [SRS](requirements.md) |
| How Riven is built, and technical decisions | [SDD](design.md) |
| How Riven is tested | [Test plan](test-plan.md) |
| How retailers use Riven | [User guide](user-guide.md) |
| Run, test and deploy | [Setup](setup.md), [database](database.md), [API](api.md) |
| Product brief and visual direction | [PRODUCT.md](../PRODUCT.md) |
| Whole-product scope and priorities | [Product backlog](backlog.md) |
| Where data comes from | [Source access decision](source-access-decision.md) |
| Who owns which task, status, blockers | Jira |
| Code and review | Git branches and pull requests |

Read only what your task needs. If two documents disagree, the newer reviewed one wins; fix the older one in the same pull request.

## 2. Ownership

| Member | Area |
| --- | --- |
| Dilsan | Screens, user flow, accessibility, frontend integration |
| Hirukshanan | API, accounts, tenant checks, data model and storage, `api.md` and `database.md` |
| Shewon | Collection, data quality, coordination, client decisions |
| Ilmam | Setup, seed data, automated checks, CI, job execution and recovery |

Current tickets are in Jira. Each owner decides, builds, tests, merges and explains their own ticket. Roles can be rebalanced when someone is blocked or overloaded. All four must be able to trace and run the whole retailer journey.

## 3. Quality rules applied at each step

- **Accounts:** the retailer comes from the verified session, never from the request. Every read, write and job checks ownership. Test with two accounts and signed-out access (NFR-01).
- **Storage:** money is a decimal string plus currency. Attempts are stored separately from observations. Migrations are reviewed (FR-06, NFR-05).
- **Collection:** timeouts and bounded work on every request; validated URLs; unknown values kept as unknown; no automatic retry after a blocked response (NFR-02, NFR-05).
- **Jobs:** collection runs outside web requests and survives a restart without duplicate observations (NFR-02, NFR-03).
- **Screens:** loading, empty, unknown, unverified, failed and stale states look different. Source, currency and time are shown. Keyboard use and clear labels are part of done (NFR-04, NFR-06).
- **Code structure:** site-specific code stays apart from product rules and the UI. Share only small contracts (NFR-07, NFR-10).

Do not solve tenant safety by hiding buttons, uncertainty by guessing prices, or future scale by adding services before measuring.

## 4. Feasibility and escalation

- **Amazon:** collection is for testing during the project, a risk the team accepted on 10 Oct 2026. Amazon pages come through the extension because server requests were refused on 12 Oct. A blocked response is recorded as `blocked`. Details: [source access decision](source-access-decision.md).
- **New sources:** check access, permitted use, retention and cost before collecting. Record the verdict in the source access decision.
- **Escalate early** when: a teammate cannot reproduce setup; a shared interface changes; a task is stuck after a focused attempt; sprint scope is not credible; hosting fails. Comment on the Jira ticket and tag Shewon.

## 5. Jira, GitHub and change

1. Each task has one Jira ticket with the result, the requirement IDs, the checks and a due date.
2. Branch with the ticket key, for example `feature/RIV-12-result-card`. Write a simple, accurate commit message. Never invent dates or another member's authorship.
3. The owner plans, builds and runs the checks for the whole ticket.
4. Open a pull request saying what changed, why, how it was checked (actual commands and results) and what remains.
5. The owner merges once CI passes and the app runs, then marks the ticket Done. If a merge breaks `main`, the owner fixes it the same day.

**Big changes: announce, don't ask.** Comment on your Jira ticket before merging if you change an API request or response, a database table, an observation field's meaning, a data source, or anything that breaks a teammate's work. If nobody objects within 24 hours, go ahead. Everything else is the owner's call. Source, paid-service and scope changes go through Shewon and the client.

**Daily update:** result, next step, blocker.

**Changing documents:** say why in the pull request. A new requirement goes through the backlog and, for scope, the client; nobody adds one silently.

## 6. Team decisions

Technical decisions are in the [SDD decision log](design.md#9-decision-log). Team process decisions:

| Date | Decision | Why |
| --- | --- | --- |
| 16 Oct 2026 | Owners complete and merge their own tickets; mandatory reviewers removed; big shared changes announced on Jira with a 24-hour objection window | Review loops were slowing every ticket |
| 4 Nov 2026 | Documents restructured into SRS, SDD, test plan, user guide and this handbook | One document per question; matches the module's required documents |

## 7. Sprint forecast

Six sprints in total. Forecast: S1 first journey; S2 repeat collection and second source; S3 comparisons and history; S4 alerts; S5 tiers and administration; S6 release and validation. Refine at each sprint review; this is a forecast, not a commitment.
