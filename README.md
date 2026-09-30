# Riven

A four-student software project helping retailers monitor selected competitors' prices and availability.

**Current state:** a documentation-only working start. Proposal submission is reported by the team; requirements and technical recommendations need review. No application, passed implementation tests, live Amazon connector, or actual Jira assignment is claimed here.

## Start with your next task, not every document

1. Read [Sprint 1](docs/sprint-1.md) for the shared goal.
2. Read sections 2–5 of the [core manual](docs/manual.md) for the product, responsibilities, and basic data flow.
3. Open your [member guide](docs/guides/README.md). Follow one working slice at a time; explain and check your work.

## Reference shelf

- [Proposal reference](docs/proposal.md): original intent and unresolved wording.
- [Working SRS](docs/requirements.md): scope, functional requirements (FR), non-functional requirements (NFR), and acceptance evidence.
- [Core manual](docs/manual.md): architecture, proposed technology decisions, shared data meanings, principles, quality, and team workflow.
- [Product backlog](docs/backlog.md): PB-01–12 whole-product deliverables; not a duplicate live board.
- [Sprint 1](docs/sprint-1.md): current outcome and integration checkpoints.
- [Member guides](docs/guides/README.md): editable LaTeX and generated PDFs.
- [Jira working guide](docs/guides/pdf/jira-working-guide.pdf): coordinator setup, task updates, PR links, blockers, review, and sprint closure.

**GitHub owns versioned guidance, code, and review. Jira owns actual assignments, status, blockers, and progress.** Keeping documentation beside code is intentional; nobody needs to read the whole reference shelf before every change.

## What is fixed, and what is not

TypeScript, four members, six sprints, and Amazon as the first intended source are user decisions. The remaining stack is a recommendation to verify. Suitable Amazon access/use/retention is unproven. Synthetic fixtures support learning but cannot pass live-source acceptance.

Earlier code, full planning material, private reference PDFs, and old Git history are preserved separately by the coordinator. They are not completed work in this start. Original proposal/module copies are also available locally under the ignored `local-reference/` directory, pending publication review.

There is no app to install yet. Add runnable setup and test commands only after verification. To rebuild the guide PDFs, see [guide build instructions](docs/guides/README.md). No software license has been selected.
