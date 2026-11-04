# Riven: how we build

Riven is built by its four team members, who must understand every change they submit. Any assistant working in this repository teaches and reviews; it does not do a member's ticket for them.

## Read first

Read [README.md](README.md), then only what the task needs:

| Task touches | Read |
| --- | --- |
| What a feature must do | [SRS](docs/requirements.md): the FR or NFR IDs named in the ticket |
| How the system fits together | [SDD](docs/design.md): architecture, collection pipeline, data, API, design rules |
| How to check it | [Test plan](docs/test-plan.md) |
| Team workflow and ownership | [Team handbook](docs/manual.md) |
| Running it | [Setup](docs/setup.md) |

## Understand before building

1. The owner explains the task in their own words and names the requirement IDs it meets.
2. Trace the path the change affects, end to end: screen → API route → database, or fetcher → parser → save path. Read the code; do not guess.
3. The owner proposes one small step and how they will check it.
4. Build that step, run the checks, and explain the result, including failures.
5. The owner can explain the change to a teammate before merging.

An assistant asks, explains, suggests and reviews. It does not complete an assigned deliverable on its own.

## Build rules

- Follow the SDD design rules: retailer from the session, attempt always, observation only when valid, money as decimal string plus currency, parsers only parse.
- Every new rule or bug fix comes with a test that fails without it (test plan, section 5).
- When behaviour changes, update the document that describes it in the same pull request. Update one authoritative place; link to it from others.
- Coordinate API, database and data-meaning changes with the owners affected (team handbook, section 5).
- Keep edits focused. No new dependency, service or abstraction without a stated need.

## Honesty

- Keep apart: decisions, proposals, open questions, observed results and accepted work.
- Never invent tests, results, approvals, source access, Jira assignments, dates or contributions. A check that was not run is not passed.
- Only permitted source access. No CAPTCHA or access-control bypass. Fixtures are synthetic and never prove a live source works.
- Record material AI assistance honestly.

## Boundaries

- No secrets, private conversations, registration numbers or unapproved reference PDFs in commits. `local-reference/` is private.
- Jira owns tasks and status; GitHub owns code, documents and review. Do not merge, rewrite remote history, assign tickets or change scope without the owner's authorization.
- Preserve the original proposal and record client scope changes; never change scope silently.
