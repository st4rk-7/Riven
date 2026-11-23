# Role D defect template

Draft format for A/B/C agreement. Dilsan confirmed that this Quality Assurance workstream uses GitHub only; Jira belongs to the separate Software Project subject. Do not create a GitHub issue for an unverified suspicion. A pull request may document a fixed defect even when no separate GitHub issue exists.

| Field | Value to supply from evidence |
| --- | --- |
| ID and GitHub link | Real GitHub issue or PR; if none exists, say so rather than inventing a key |
| Title and FR/NFR / TC ID | Short symptom and approved expectation |
| Date found / tester | Actual time with zone; distinguish automated/tool-assisted execution from owner manual testing |
| Baseline | Full tested SHA and branch |
| Environment | OS, Node/npm, database/browser/tool versions and local URL |
| Preconditions/data | Disposable synthetic accounts, records, ownership |
| Reproduction | Numbered exact steps/command |
| Expected | Result and authoritative requirement/API section |
| Actual | Observed result; include failed assertion/status/data |
| Evidence | Sanitized log/screenshot path or real URL |
| Severity / priority | Separate values with impact and urgency rationale |
| Impact | Affected users, workflow and data |
| Reproducibility | Actual attempts and outcomes |
| Cause | Suspected hypothesis or code-supported cause; owner confirmation separate |
| Component owner | Handbook responsibility; specific QA assignment only if recorded in GitHub/team review |
| Fix | Real PR/commit or none |
| Retest | Exact command, time, SHA and actual result |
| Status / closure | Actual GitHub issue/PR status, history and closure evidence; not inferred |

Proposed severity: Critical = severe exposure/data loss or core service unusable; High = major function unusable or serious integrity issue; Medium = important incorrect behavior with workaround; Low = minor visual/usability issue. Team agreement is pending. Priority is scheduling urgency and is not derived automatically from severity.

RCA fields: summary; requirement; traced component path; reproduction; immediate cause; why it occurred; detection gap (hypothesis unless supported); user impact; corrective and preventive action; retest; remaining risk. A New-to-Closed lifecycle requires actual GitHub issue/PR timestamps/history, never a reconstructed fictional sequence. The Software Project Jira history may be cited as background but is not QA task status.
