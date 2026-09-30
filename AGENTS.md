# Riven working rules

This repository is the retailer competitor-monitoring project. Read `docs/README.md`, then the assigned issue and its linked requirements/architecture/sprint documents.

- Keep the whole-product goal and FR/NFR/PB traceability visible. Sprint scope is an increment, not permission to discard future foundations.
- `docs/architecture/system-baseline.md` version 0.1 is a proposed baseline, not a claim of implementation or team/client approval. Resolve consequential open dependencies before committing dependent work; do not ask again for decisions already explicitly accepted.
- TypeScript and Amazon-first are user decisions. Amazon UK/wired mice and the remaining stack are recommendations pending the documented checks. No Amazon collection method is proven yet.
- The existing local prototype predates this baseline. Preserve it; review its code, dependencies and assumptions before reuse. Do not treat SQLite, the demo connector or custom auth as approved architecture.
- Keep business rules separate from source adapters, transport, persistence and UI. Use SOLID to contain changes; avoid speculative abstractions or microservices.
- Tenant isolation, correct price/variant/currency semantics, durable work, explicit errors/freshness and meaningful tests are requirements from the first increment.
- Prefer approved source APIs/feeds or permitted page collection. Do not bypass access controls, CAPTCHA or blocks. Fixtures are for development and cannot establish real-source acceptance.
- Do not add paid services, new platforms, live repricing, AI features or unrelated redesigns silently. Record material decisions and tradeoffs in `docs/architecture/decisions.md`.
- Preserve other members' work. Use focused branches/PRs, versioned schemas/migrations, actual test evidence and a second member's review. Do not auto-merge or change GitHub assignments/status without task authorisation.
- Keep tokens, credentials, cookies, private conversations and personal delivery details out of code, logs and public issues. Local PDFs under `references/` are not for automatic publishing.
- Record observed results separately from assumptions. Never invent successful tests, client approval, source permissions or performance measurements.
- This is a learning project. A team member must understand, make and explain their own implementation decisions. AI tools may teach, clarify, suggest and review one small step at a time; they must not autonomously complete an entire assigned task for submission. Do not accept code the owner cannot explain, trace, run and change.
- Before implementation, the owner explains the task, relevant code/data flow and a small plan. During implementation, pause at meaningful steps to explain the change and let the owner reason, implement or explicitly review it. The owner runs the checks, investigates failures and demonstrates the finished change to another member. Record the member's reasoning, actual evidence and AI assistance in the PR/task where useful for module assessment.
- Use an ordinary team branch prefix such as `feature/` or `fix/` with the actual Jira key. `codex/` is not a required project convention.

See `docs/team-working-guide.md` for ownership, GitHub workflow and the learning-first AI tutor prompt.
