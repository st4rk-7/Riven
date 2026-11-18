# EC4206 Role A Ledger

Owner: Ilmam
Updated: 18 November 2026 (Asia/Colombo)

| Task | Status | Artifacts | Real evidence / dependency | Next step |
|---|---|---|---|---|
| A1 Scope and system map | Draft ready for review | `strategy.md`, `traceability.md` | Local baseline `29af237`; remote matched on 15 Nov but 17 Nov recheck failed due DNS; group approval not observed | Ilmam reviews; send scope/ID handoff; recheck remote before freezing. |
| A2 Plan and STLC | Draft ready for review | `test-plan-supplement.md`, `stlc.md` | Approved product plan preserved; environment not ready | Ilmam reviews; confirm environment operator/evidence location; freeze wording. |
| A3 Black-box design | Drafted, not run | `black-box.md`, `manual-cases.md`, updated `traceability.md` | Product name/URL/own-price partitions; name/brand/discovery/rate-limit boundaries; matching decision table; 20 detailed cases | Ilmam reviews and explains techniques; obtain scope/case feedback; prepare isolated environment before execution. |
| A4 Execute and reconcile | Blocked | Planned result evidence and final matrix | No dependencies, `.env`, database, app, or executed cases | Prepare isolated environment after design; never contact live marketplaces. |

## Repository state

- Branch: `qa/ec4206-role-a`
- Base: `29af23787b9de37d65f3ed00d30297e4f67185b3`
- Local commits: planning baseline and A3 design created; push/PR not performed
- Test execution: not started
- Jira: omitted for this EC4206 workstream at Ilmam's direction
- B/C/D branch or baseline status: not observed; do not claim active

## 17 November handoff package

- Scope IDs: `SCP-AUTH`, `SCP-PROD`, `SCP-OFFER`
- Canonical requirements: existing `FR-*` and `NFR-*`
- Reserved manual IDs: `TC-AUTH-001..006`, `TC-PROD-001..007`, `TC-OFFER-001..007`
- Role C should map future automation to `AT-*` plus the corresponding `TC-*` IDs.
- Role B should retain actual repository test names and may use `WB-*` only for analysis worksheets.
- Role D should use real issue/defect identifiers and link them to `TC-*` rows.
