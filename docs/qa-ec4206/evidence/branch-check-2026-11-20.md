# Branch verification evidence - 20 November 2026

Owner: Ilmam
Execution assistance: Codex ran the local commands and recorded their actual outcomes
Time: approximately 18:20-18:22 Asia/Colombo
Branch: `qa/ec4206-role-a`
Commit: `ca9178d` (`docs(qa): reconcile 20 November auth evidence`)

## Results

| Command | Result |
|---|---|
| `npm run typecheck` | Passed for web, server, and extension TypeScript projects. |
| `npm test` | Failed: 1 extension fixture test timed out at the default 5000 ms; 75 tests passed and 23 were skipped. The slow test was `extension/src/capture.test.ts` for `amazon-uk-in-stock.html`, completing after about 6 seconds. |
| `npx vitest run extension/src/capture.test.ts --testTimeout 15000` | Passed: 1 file, 6 tests. |
| `npx vitest run --testTimeout 15000` | Passed: 12 files and 76 tests; 3 files and 23 database-dependent tests skipped. |

## Interpretation

The default command's failure is recorded, not hidden. The unchanged fixture and full suite passed when the per-test timeout was increased to 15 seconds, so this run provides functional evidence but also exposes a local test-duration/stability limitation. No product-code change or defect ID was created. Dilsan should decide whether the default-timeout instability belongs in Role D's defect/quality evidence.

Earlier database-dependent evidence remains separate: the four integration files passed 26/26 when run serially on 19 November. The normal suite's 23 skipped tests are not counted as current integration passes.
