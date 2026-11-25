# Role D SonarQube scan

I ran SonarScanner for NPM 5.1.0 against my local SonarQube Community Build 26.11.0.134175 project, `riven-qa`. The scan covered `server`, `shared`, `web`, and `extension`. The scanner reported commit `57b84517d2cb7eab1fb08867affca5ca354fc492`.

The scanner indexed 101 files and uploaded the analysis report successfully. The JavaScript, TypeScript, and CSS sensor reported 89 of 89 files analyzed. The scanner reported a total analysis time of 1 minute 55.246 seconds.

The scanner warned about parsing three saved Amazon HTML fixtures. Dependency analysis was skipped. This run did not import a coverage report, so SonarQube coverage from this run should be read separately from the Vitest coverage results.

The [sanitized scanner transcript](sonarqube-scanner-sanitized.txt) records the indexed files, commit, warnings, successful upload, and analysis task ID `8521ebbc-f30b-4348-b86f-8a8c9c08f886`.

I checked the [local dashboard](http://127.0.0.1:9000/dashboard?id=riven-qa) after processing. The [25 November 2026 Activity capture](screenshots/Screenshot%202026-11-25%20120143.png) shows **Quality Gate: Passed** and **486 issues** for the first analysis. The [Overall Code capture](screenshots/Screenshot%202026-11-25%20120131.png) shows the figures below.

| Overall Code metric | Dashboard result |
| --- | --- |
| Security | 1 open issue, rating B |
| Reliability | 485 open issues, rating D |
| Maintainability | 459 open issues, rating A |
| Accepted issues | 0 |
| Security hotspots | 0 |
| Coverage | 0.0% displayed, with no coverage report imported |
| Duplication | 40.5% |

SonarQube ran in [Multi-Quality Rule mode](https://docs.sonarsource.com/sonarqube-community-build/user-guide/code-metrics/changing-modes). One issue can affect several categories, so I used the dashboard total of 486 instead of adding the category counts. The dashboard also warns that Community Build has limited security analysis.

## Security finding

The [Security issues capture](screenshots/Screenshot%202026-11-25%20120444.png) shows one open **Low** security issue at `server/sources/fixtures/a-light-in-the-attic.html:319`. SonarQube flagged an external script tag without `integrity` and `crossorigin` attributes. The references I found at `57b8451` are in `server/app.test.ts` and `server/sources/books-toscrape.test.ts`. The tests read the saved HTML as text, and the parser uses Cheerio to extract product data.

I recommend treating this as a test-fixture finding pending team review. Keep the saved fixture intact if the parser test needs it. If the team agrees to exclude saved fixtures from future application-code scans, document that scope and keep the original scan results. If the HTML is ever served to a browser, remove the external script or review how it is loaded before serving it.

For the other findings, I recommend sorting reliability issues by severity and checking which files contribute most to duplication before proposing changes. For a coverage comparison, I would rerun the scan with a coverage report generated from the same commit and record which tests it covers.
