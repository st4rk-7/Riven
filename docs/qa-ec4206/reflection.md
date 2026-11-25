# Role D reflection

These are evidence-based discussion notes.

The QA workstream connects requirements, focused code tests, GitHub pull requests and CI. A product measurement was interpreted as a package count, Role B saved failing tests, the fix changed the parser rule, PR #43 reached main and a new 21-test retest passed. its To Do -> Done history is background, not a QA task lifecycle.

CI run 44891561292 succeeded for Role B's head. Today's local checks ran on the merge baseline, a different SHA. Keeping both identifiers makes evidence reproducible. Similarly, 83 unit passes with 23 skips and 26 integration passes describe different execution populations, with some overlap. The unit coverage percentage must retain its excluded UI/database scope.

Role A PRs #46, #47 and #48 and Role C PR #45 are merged. The final review still needs the Role D evidence link. The local JMeter work showed why setup behavior must be separated from measured behavior: login-based attempts hit the rolling limiter, while the corrected pre-authenticated read workload completed 3,269 samples with zero errors. Sonar needs an approved setup, and keyboard/mobile claims need real browser observations.

## Contribution record

- I reviewed the Role D scope, results and limitations and approved this evidence package on 23 November 2026.
- I reviewed the recorded checks and evidence and remain responsible for the submitted work and its explanation.

- Existing Role B tests/fix and A/B/C records retain their authorship. Their historical execution is attributed to those records

- No manual user study, browser usability pass or Sonar scan is claimed. The local JMeter run and automated checks are reported with their real scope and limitations.
