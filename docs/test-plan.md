# Test plan

**Riven** · Version 1.0 · 4 November 2026 · Status: approved by the client, 4 Nov 2026

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 4 Nov 2026 | First test plan, written from the tests and CI on `main` at `05d6100`. Approved by the client at the 4 Nov demo. |

## 1. Purpose and scope

This plan says how Riven is checked: which test levels exist, what each requirement in the [SRS](requirements.md) is checked by, and what is still untested. It covers the server, database, web app and extension. Design terms are explained in the [SDD](design.md).

## 2. Test levels

| Level | What it checks | Tool | Where | Status |
| --- | --- | --- | --- | --- |
| Static | Types in server, web app and extension | TypeScript (`tsc`) | `npm run typecheck` | Built; runs in CI |
| Unit | Parsers, matching, input checks, seed rules. No database, no network | Vitest | `server/**/*.test.ts`, `scripts/**/*.test.ts` | Built; runs in CI |
| Integration | API, sign-in, tenant isolation, save path, crawler and discovery against a real PostgreSQL | Vitest + PostgreSQL | Tests marked with `TEST_DATABASE_URL` | Built; runs in CI |
| Schema | The live database matches the migrations and auth configuration | `scripts/check-database.ts` | `npm run db:check` | Built; runs in CI |
| Manual | Screens, the extension in real Chrome, the live site | Checklist (section 6) | Recorded in the pull request | Built as a practice; no fixed checklist until now |
| UI automated | Screens in a browser | — | — | Not built |
| Performance, restore | NFR-03, NFR-08, NFR-09 | — | — | Not built |

## 3. Environment and test data

- **Automated tests never contact live sites.** Pages come from saved HTML fixtures in `server/sources/fixtures/` or from a local test server inside the test.
- **Database:** integration tests need `TEST_DATABASE_URL`, a separate test database. CI starts PostgreSQL 18 for this. Setup: [setup](setup.md).
- **Accounts:** tests create throwaway retailers and remove them. Seed data is clearly synthetic.
- **Fixtures:** saved Amazon pages cover a normal product, a price in a different layout and a page with no offer.

## 4. How to run

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run test:integration
```

`npm test` runs every test; integration tests skip themselves when `TEST_DATABASE_URL` is not set. `npm run test:integration` runs only the integration tests and fails if the database is not set.

## 5. Entry and exit criteria

- **Before merging a pull request:** CI passes (typecheck, `db:check`, all tests), and the pull request says which checks were run and their results.
- **A change to screens or the extension** also needs the matching manual checks from section 6, recorded in the pull request.
- **A new rule or bug fix** comes with a test that fails without it.
- A check that was not run is never reported as passed.

## 6. Manual checklist

Run on the live site (https://riven.sbs/app) or locally before a demo or release.

| # | Check | Requirement |
| --- | --- | --- |
| M1 | Sign in, refresh the page, sign out; signed-out pages show no data | FR-01 |
| M2 | Add a product by name, and by Amazon link | FR-02 |
| M3 | Run discovery; at most 5 offers appear; running it again adds no duplicates | FR-03 |
| M4 | Confirm, reject and remove an offer; the change survives a refresh | FR-04 |
| M5 | On an Amazon product page, send it with the extension; the offer appears with source and time | FR-05 |
| M6 | Product detail shows price history; a failed check does not remove earlier values | FR-06, FR-07 |
| M7 | A missing price, unknown stock and an unverified match each look different | FR-11 |
| M8 | Main tasks work with the keyboard only and on a narrow screen | NFR-06 |
| M9 | A second retailer account sees none of the first account's data | NFR-01 |

## 7. Requirement coverage

| Requirement | Automated tests | Manual | Gap |
| --- | --- | --- | --- |
| FR-01 Accounts | `auth.integration`: signed-out access refused; wrong passwords; session ends on sign-out; tampered cookies; sign-in rate limit | M1 | Administrator role not built |
| FR-02 Products | `products.test`: name, link and invalid input; `auth.integration`: remove only own product | M2 | Edit not built |
| FR-03 Discovery | `discovery.test`: one candidate per ASIN, no invented seller or price, stops at 5, no match adds nothing | M3 | — |
| FR-04 Matching | `matching.test`: same ASIN, different ASIN, model number, pack size, title stays unverified; `crawler.test`: retailer decision updates status | M4 | Price-gap guard not built |
| FR-05 Collection | `amazon-collector.test`: parse, 503 and non-HTML and CAPTCHA pages recorded as blocked, no retry, allowed hosts only; `crawler.test`: crawl, blocked, one retailer only, both fetchers update one offer | M5 | Per-product schedule, extension sending pages, site rules not built |
| FR-06 History | `auth.integration`: failed attempts keep observations, rollback when the attempt write fails; `crawler.test`: blocked does not erase | M6 | Skip-unchanged rule not built |
| FR-07 Comparison | — | M6 | Own price not built; no automated UI test |
| FR-08 to FR-10 | — | — | Not built |
| FR-11 Honest states | `amazon.test`: no guessed price; `auth.integration`: unknown price accepted | M7 | Stale rule not built |
| NFR-01 Security | `auth.integration`: product isolation, ignores a client-supplied retailer, cross-site writes refused, remove only own data; `seed.integration`: each retailer sees only its data | M9 | — |
| NFR-02 Reliability | `amazon-collector.test`: no retry after blocked | — | 10-second spacing, 3 tries not built |
| NFR-05 Accuracy | `amazon.test`: price parsing, never guesses; `auth.integration`: missing currency refused | — | Suspect-price rule not built |
| NFR-06 Usability | — | M8 | No automated check |
| NFR-03, 08, 09 | — | — | Not built |
| NFR-10 to 12 | — | — | Not built (site rules, failed-page fixtures, privacy) |

`seed.integration` needs `RIVEN_SEED_PASSWORD` and is skipped in CI; it runs locally.

## 8. Planned tests

Each planned rule in the SRS gets its test in the same pull request that builds it.

| Rule | Test to add |
| --- | --- |
| Site rules (NFR-10) | The same fixtures pass through the shared extractor with the existing expected values |
| Extension sends the page (FR-05, NFR-12) | The server parses a sent page; the page is not stored |
| Suspect price (NFR-05) | A price of 0 or under 10% of the last good price saves a failed attempt, not an observation |
| Skip unchanged (FR-06) | An identical value within 6 hours saves an attempt only |
| Price-gap guard (FR-04) | An offer more than 40% away from confirmed offers stays `unverified` |
| Per-product schedule (FR-05) | A paused product is not checked; a due product is |
| Stale state (FR-11) | An offer with no successful check past the threshold is marked stale |

## 9. Results

Results live with the change they check: the CI run and the pull request. This plan records no results of its own.
