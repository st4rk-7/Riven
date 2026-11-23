# Role D usability cases

NFR-06. All runtime cases are initially NOT RUN. Source review is not a browser pass. Local synthetic accounts only; no representative user study or WCAG certification is claimed.

| ID | Procedure | Expected |
| --- | --- | --- |
| USA-01 | Tab/Shift+Tab and Enter through sign-in | Logical order; visible focus; submit works |
| USA-02 | Inspect accessible names for email/password and submit | Correct names, required state and error announcement |
| USA-03 | Keyboard through search/add-product controls without external discovery | Main controls reachable, usable and understandable |
| USA-04 | Keyboard through synthetic competitor offers and confirm/reject controls | Clear named controls and saved decision |
| USA-05 | Open/close edit dialog; inspect focus restoration and Escape | Visible focus, no trap, predictable return |
| USA-06 | Trigger local validation; inspect loading/empty/unknown/failed states | Readable next action; null not zero, unknown not out-of-stock |
| USA-07 | Repeat main screens at 320, 375 and 768 CSS px | No important clipping or unintended horizontal overflow |
| USA-08 | Measure text/background contrast for normal/error/disabled/focus states | Record actual color pair, tool, ratio and chosen criterion; no unmeasured pass |

Record for each: tester, date/time/zone, SHA, local route, browser/version, viewport, test data, steps, expected/actual, status, exact element and sanitized screenshot path. Store no real accounts or private pages. Count tasks and viewport checks separately using [metrics](metrics.md). A single tester is a one-tester evaluation; currently no manual tester execution is recorded.
