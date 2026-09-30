# Sprint 1 member guides

Version 0.1, 30 September 2026. Proposed ownership and staged work packages, not actual Jira assignments or a promise that all later slices fit the sprint. The [core manual](../manual.md) is the shared baseline; [Sprint 1](../sprint-1.md) owns the goal.

| Member | Editable source | Handout |
| --- | --- | --- |
| Dilsan | [dilsan.tex](dilsan.tex) | [Frontend PDF](pdf/dilsan-sprint-1.pdf) |
| Hirukshanan | [hirukshanan.tex](hirukshanan.tex) | [Application/data PDF](pdf/hirukshanan-sprint-1.pdf) |
| Shewon | [shewon.tex](shewon.tex) | [Collection/coordination PDF](pdf/shewon-sprint-1.pdf) |
| Ilmam | [ilmam.tex](ilmam.tex) | [Setup/integration PDF](pdf/ilmam-sprint-1.pdf) |

## Separate Jira working guide

[Read the Jira PDF](pdf/jira-working-guide.pdf) · [Editable LaTeX](jira.tex)

Covers the coordinator's project/account checks, a ticket template, each member's daily routine, GitHub PR links, blockers, review, Done criteria, and sprint closure. It does not claim to have verified the current Jira UI or created any work items.

## GitHub versus Jira

It is normal to keep developer guidance and design documentation beside code. These guides explain how to approach a responsibility. Jira records which slice is actually selected, assigned, blocked, in review or Done. No second status table is maintained here. Guide steps do not each require a Jira ticket.

Commit the LaTeX sources and the five small generated PDFs together for this teaching project so teammates can download them without LaTeX. `common.tex` contains shared instructions; individual files contain role steps. Build logs/intermediates are ignored. At larger scale PDFs can be release artifacts instead; no extra publishing system is needed now.

Each member can give their PDF and the relevant manual sections to an AI tutor. They still must understand, implement/check small steps, and explain their submission. Do not upload private archive/chat logs or secrets as context.

## Build from the repository root

Requirements: Bash and a LaTeX installation providing `pdflatex`, `geometry`, `lmodern`, `parskip`, `xcolor`, `fancyhdr`, and `hyperref`.

```sh
bash docs/guides/build.sh
```

This builds each document twice with shell escape disabled and copies the PDFs into `pdf/`. If a build fails, inspect the named file under `build/`; do not distribute a stale PDF as the new version.

After editing: update the version/date in `common.tex` and this index, rebuild all five PDFs, check text and layout, and include both source and output in review. A guide version is a document version, not a Jira task key. Do not claim course/client approval from the version label.
