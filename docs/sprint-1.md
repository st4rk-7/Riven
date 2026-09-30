# Sprint 1

**Status:** simplified proposal for team review, not assigned or completed work.

Use the [core manual](manual.md) for shared architecture, technology status and data contracts, the [backlog](backlog.md) for whole-product scope, and the [four member guides](guides/README.md) for staged instructions. Later slices in a guide are not automatic sprint commitments.

Earlier supplied schedule: development 28 September–11 October 2026; evaluation 12–18 October 2026. Confirm these windows against current course instructions before dating the Jira sprint.

## Intended sprint goal

A retailer signs in, adds a supported competitor listing, requests collection, and sees its price, currency, availability, source, and time in their own workspace.

Live-source acceptance depends on a suitable Amazon access route. If it remains blocked, record that honestly and agree any change with the client. A sample-data demonstration does not complete this live-source goal.

## First checkpoint: learn one connected flow

Before tackling the entire goal, make one page request one clearly labelled synthetic observation from the backend and display it. All four members should be able to explain the request and response.

This is a learning checkpoint within Sprint 1, not a replacement for the sprint goal. It needs no live collection, account system, scheduling, charts, billing, or admin screens. Do not expose it as a production retailer service.

## First small tasks

These are proposed owners, not Jira assignments. Confirm available hours and the correct Jira accounts before creating tickets. Use actual Jira keys once created.

| Owner | First task | Check with a teammate |
| --- | --- | --- |
| Dilsan | Sketch one observation card, then display sample values. | Explain the fields; show a result and an unavailable-price state. |
| Hirukshanan | Agree one small sample response with Dilsan and Shewon, then add one backend route returning it. | Call the route and explain the response. No database or authentication in this first task. |
| Shewon | Define the sample observation's meanings and review the Amazon access/use/retention question. | Explain price, currency, availability, source, and time; record an evidence-backed access verdict or blocker. |
| Ilmam | Agree and document the minimum setup needed for the page and backend. | A second member follows the commands on their computer. Record failures rather than assuming setup works. |

Shewon's initial access investigation is time-boxed to two working days after it starts. Escalate unresolved access; do not spend the whole sprint trying scrapers. The others can continue with synthetic data.

Integrate the sample flow together before opening a second task for each person. Then select the next small step toward the sprint goal based on remaining capacity and what the team learned. The old ten-task pack is not an automatic commitment.

## Simple daily workflow

1. Read your task and explain the expected result in your own words.
2. Say what one small change you will make and how you will check it.
3. Work on a short branch, for example `feature/RIV-12-observation-card`, using a real ticket key.
4. Run the checks yourself. Record what actually happened and explain failures.
5. Open a small PR, explain the change, and demonstrate it to your reviewer.
6. Merge reviewed work, verify it together, then mark the task Done.

Jira: **To Do → In Progress → Done**. Work awaiting review stays In Progress. Note blockers on the task. Give a short update: result, next step, blocker. Do not maintain a competing GitHub-issue backlog.

A task needs only: owner, intended result, a few steps/checks, reviewer, and a blocker if one exists. AI assistance should be disclosed according to module rules. Nobody is expected to understand the whole stack on day one, but everyone must explain the changes they submit.

## Sprint review evidence

Show the actual integrated result, checks run, each member's contribution, unresolved limitations, client feedback, and one improvement for the next sprint. For the full intended goal, verify sign-in/out, account isolation, valid listing entry, accurate supported-source observations, and honest failure/unknown states. Never label an unrun check as passed.
