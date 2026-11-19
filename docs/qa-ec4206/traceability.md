# EC4206 Traceability Matrix

Status: Seed matrix with one partial manual execution record
Owner: Ilmam (Role A)
Updated: 19 November 2026 (Asia/Colombo)
Planning baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`

## ID convention

- Existing product requirements remain authoritative: `FR-NN` and `NFR-NN`.
- EC4206 scope groups: `SCP-AUTH`, `SCP-PROD`, `SCP-OFFER`.
- Role A manual tests: `TC-AUTH-NNN`, `TC-PROD-NNN`, `TC-OFFER-NNN`.
- Role B white-box/unit/BDD evidence: keep its repository test name plus optional `WB-NNN` worksheet ID.
- Role C automation: `AT-NNN`, always mapped back to one or more `TC-*` IDs.
- Role D defects: use the real GitHub issue/defect ID; do not invent `DEF-*` values.
- Evidence references: repository path, PR/commit, CI/run URL, or sanitized screenshot/log filename.

IDs are stable once shared. If a case is removed, mark it Retired rather than reusing its ID.

## Seed requirement-to-test mapping

All cases below are drafted in `black-box.md` and `manual-cases.md`. `TC-AUTH-001` has partial UI evidence but no final verdict; every other case remains Drafted - Not run.

| Scope | Requirement | Planned manual ID | Planned behavior | Priority | Role B | Role C | Role D | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| `SCP-AUTH` | `FR-01` | `TC-AUTH-001` | Valid synthetic retailer signs in and receives only its identity/workspace. | P0 | Pending | Candidate | Pending | Executed - Partial; verdict pending | `evidence/auth-ui-2026-11-19.md` |
| `SCP-AUTH` | `FR-01` | `TC-AUTH-002` | Invalid or malformed credentials are rejected with safe feedback. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-AUTH` | `FR-01`, `NFR-01` | `TC-AUTH-003` | Signed-out access to protected retailer data is rejected. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-AUTH` | `NFR-01` | `TC-AUTH-004` | Alpha cannot read or change Beta's products/observations using misleading IDs. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-AUTH` | `FR-01` | `TC-AUTH-005` | Sign-out revokes the session and subsequent protected access fails. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-AUTH` | `FR-01` | `TC-AUTH-006` | Six consecutive failed sign-in attempts exercise the implemented five-request boundary. | P1 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-02` | `TC-PROD-001` | Valid manual name with optional brand creates a retailer-owned product. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-02` | `TC-PROD-002` | Valid supported product URL follows the URL input path without accepting unsafe/unsupported input. | P1 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-02` | `TC-PROD-003` | Blank/invalid product input is rejected with observable feedback. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-02` | `TC-PROD-004` | Implemented product-name and brand boundaries are enforced. | P1 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-03` | `TC-PROD-005` | Discovery adds no more than five suitable candidate offers. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-03` | `TC-PROD-006` | Repeated discovery does not add a duplicate listing. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-PROD` | `FR-02`, `NFR-01` | `TC-PROD-007` | A retailer cannot update/delete another retailer's product. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-04` | `TC-OFFER-001` | Same implemented identifier produces `confirmed`. | P0 | Candidate | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-04` | `TC-OFFER-002` | Different identifier or conflicting model/pack size produces `mismatch`. | P0 | Candidate | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-04` | `TC-OFFER-003` | Similar title alone remains `unverified`. | P0 | Candidate | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-04`, `NFR-01` | `TC-OFFER-004` | Retailer confirms/rejects only its own observation and the decision persists. | P0 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-06` | `TC-OFFER-005` | Failed/blocked attempt does not delete or overwrite earlier valid history. | P0 | Pending | Candidate | Candidate | Drafted - Not run | - |
| `SCP-OFFER` | `FR-06`, `FR-07` | `TC-OFFER-006` | History shows source, currency, collection time, and earlier observations. | P1 | Pending | Candidate | Pending | Drafted - Not run | - |
| `SCP-OFFER` | `FR-11`, `NFR-05` | `TC-OFFER-007` | Missing price remains unknown/null rather than becoming zero; unknown stock remains distinct. | P0 | Candidate | Candidate | Candidate | Drafted - Not run | - |

## Planned-only gap rows

These requirements may be traced as known gaps but must not be reported as current passing behavior.

| Requirement | Planned rule | Current EC4206 disposition |
|---|---|---|
| `FR-04` | More-than-40% price-gap guard | Planned/not implemented at baseline; no passing case claim. |
| `FR-06` | Skip identical observation within six hours | Planned/not implemented at baseline; no passing case claim. |
| `FR-11` | Twelve-hour stale state | Planned/partial; verify current implementation before designing an execution case. |

## Change control

Record the date, proposer, reason, affected IDs, decision, and required reruns for any scope/case change. Never renumber shared IDs merely to make a table appear continuous.
