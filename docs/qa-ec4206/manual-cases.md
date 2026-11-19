# EC4206 Manual Test Cases

Status: Draft - designed, not executed
Owner: Ilmam (Role A)
Date: 18 November 2026 (Asia/Colombo)
Planning baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`

## Common execution rules

- Execute only on an isolated local/test Riven instance and record the full tested commit.
- Use synthetic Alpha/Beta retailers and disposable products/observations.
- Do not contact or load-test a live marketplace. Use saved fixtures or an authorized controlled double where a source response is required.
- Record actual result, status, date/time, tester, evidence, defect, and cleanup after execution. Until then every case is `Not run`.
- Expected HTTP details below are current baseline expectations; UI wording may be added only after observing the running interface.

## Authentication and tenant isolation

### TC-AUTH-001 - Valid retailer sign-in

- Requirements: `FR-01`, `NFR-01`
- Priority: P0
- Preconditions: isolated database is ready; synthetic Alpha account exists; no limiter contamination.
- Data: valid Alpha email/password stored privately.
- Steps: open local `/app`; enter Alpha credentials; submit; request `/api/v1/auth/me` or open the product list.
- Expected: sign-in succeeds; response/session identifies Alpha and Alpha's retailer only; an HttpOnly session is established; protected Alpha data can load; no password or retailer-selection field is exposed.
- Cleanup: sign out and verify the private session value is not captured in evidence.
- Status: Executed - partial evidence; final verdict pending.

Execution record (attempt 1):

- Tester: Ilmam, with Codex observing the already authenticated UI.
- Date/time (Asia/Colombo): 19 November 2026, 21:26.
- Branch and full commit: `qa/ec4206-role-a` at `1cf49f607cea7cac409033dbef3b2409b219bad6`.
- Environment and versions: isolated local Riven instance at `http://127.0.0.1:5173/app`; ChatGPT in-app browser (engine/version not exposed by the inspection interface).
- Preconditions/data actually used: Ilmam entered the private synthetic credentials; no credential, cookie, or password value was captured.
- Actual result: authenticated Products view was visible with a `Sign out` control. The protected list loaded `Synthetic Wired Mouse`, showing one offer, unavailable lowest confirmed price, and one review-needed item. No password or retailer-selection field was visible on the authenticated page.
- Status: Partial evidence only. The observable successful-login and protected-data portion passed, but Alpha identity/tenant response and the HttpOnly cookie attribute were not independently inspected, so the complete case is not yet marked Passed.
- Evidence: `evidence/auth-ui-2026-11-19.md`.
- Defect/retest: no defect raised from this observation; complete the identity/session-attribute checks before assigning a final verdict.
- Cleanup/residual data: session intentionally left signed in for the next authorized test; synthetic seed data unchanged.

### TC-AUTH-002 - Invalid and malformed credentials

- Requirements: `FR-01`
- Priority: P0
- Preconditions: isolated app is running; use an IP/limiter key not reserved for `TC-AUTH-006`.
- Data sets: malformed email; missing password; password over 128 characters; unknown email; known email with wrong password.
- Steps: submit each data set separately and record status/code/message.
- Expected: malformed input returns HTTP 400 `INVALID_REQUEST`; unknown email and wrong password return HTTP 401 `INVALID_CREDENTIALS` with the same safe message; no session or retailer data is returned.
- Cleanup: none beyond removing sensitive values from evidence.
- Status: Not run.

### TC-AUTH-003 - Signed-out protected access

- Requirements: `FR-01`, `NFR-01`
- Priority: P0
- Preconditions: no valid session cookie.
- Steps: request protected product and observation routes; attempt a protected write with the permitted local origin.
- Expected: every protected request returns HTTP 401 `UNAUTHENTICATED`; no retailer data changes.
- Cleanup: confirm no test records were created.
- Status: Not run.

### TC-AUTH-004 - Cross-retailer isolation

- Requirements: `NFR-01`
- Priority: P0
- Preconditions: synthetic Alpha and Beta accounts each own distinct products/observations; both IDs are known to the tester.
- Steps: sign in as Alpha; list data; submit Beta product/observation IDs in read/update/delete paths and any misleading body field; repeat the inverse as Beta where relevant.
- Expected: each session sees only its retailer's data; another retailer's IDs cannot reveal or change records; client-supplied retailer identity is ignored or rejected; original records remain unchanged.
- Cleanup: delete only records created for this test using their owning session.
- Status: Not run.

### TC-AUTH-005 - Sign-out revokes session

- Requirements: `FR-01`
- Priority: P0
- Preconditions: Alpha is signed in with a valid session.
- Steps: confirm one protected request succeeds; sign out; repeat the same protected request; refresh the app.
- Expected: sign-out returns HTTP 204; the prior session is revoked/cleared; subsequent protected access returns HTTP 401 and the UI returns to sign-in without retailer data.
- Cleanup: none.
- Status: Passed - observable revocation outcome; sign-out transport status not captured.

Execution record:

- Tester: Ilmam, with Codex observing the post-action UI and protected endpoint.
- Date/time (Asia/Colombo): 19 November 2026, 21:29.
- Branch and full commit: `qa/ec4206-role-a` at `976292d89ee8579f8bf3a362a2082c063fed8ba9`.
- Environment and versions: isolated local Riven instance; ChatGPT in-app browser (engine/version not exposed by the inspection interface).
- Preconditions/data actually used: the authenticated session and protected product list recorded in `evidence/auth-ui-2026-11-19.md`; Ilmam selected Sign out.
- Actual result: `/app` returned to the sign-in form, the authenticated navigation and product data were absent, and `/api/v1/auth/me` in the same browser context returned `UNAUTHENTICATED` with `Please sign in.`
- Status: Passed for the observable revocation behavior. The exact HTTP status of the sign-out request itself was not captured, so this record does not claim direct evidence of the expected 204 transport response.
- Evidence: `evidence/sign-out-2026-11-19.md`.
- Defect/retest: no defect observed; capture the sign-out network response in a future automated/API run if the 204 contract needs separate evidence.
- Cleanup/residual data: browser remained signed out; synthetic seed data unchanged.

### TC-AUTH-006 - Sign-in rate-limit boundary

- Requirements: `FR-01`
- Priority: P1
- Preconditions: isolated environment; fresh effective client IP/limiter state; run after other sign-in cases.
- Steps: within 60 seconds submit six wrong-password requests from the same effective client while varying any browser-supplied forwarding header.
- Expected: attempts 1-5 receive invalid-credential responses; attempt 6 returns HTTP 429 `RATE_LIMITED` with retry guidance; spoofed forwarding values do not create new limiter identities.
- Cleanup: wait for/reset only the authorized test limiter state before later authentication work.
- Status: Not run.

## Product creation and discovery

### TC-PROD-001 - Create product from valid manual input

- Requirements: `FR-02`, `NFR-01`
- Priority: P0
- Preconditions: Alpha is signed in; no product with the selected synthetic label exists.
- Data: name `EC4206 Synthetic Desk Lamp`; optional brand `EC4206 Test Brand`.
- Steps: use Add product manual entry; submit; return to product list; refresh.
- Expected: HTTP 201/current UI success; trimmed name/brand are stored under Alpha; product remains visible after refresh; Beta cannot see it.
- Cleanup: remove the synthetic product as Alpha after dependent cases.
- Status: Not run.

### TC-PROD-002 - Product URL equivalence classes

- Requirements: `FR-02`
- Priority: P1
- Preconditions: Alpha is signed in; an authorized local fixture/test double exists for the valid supported class.
- Data sets: controlled readable supported URL; `not-a-url`; URL over 2000 characters; unsupported host; mixed URL plus manual-name fields.
- Steps: submit each class separately through the suitable controlled interface.
- Expected: only the controlled supported/readable class creates a product using derived name/identifier; invalid/unreadable/mixed classes return a safe product error and create nothing.
- Constraint: if no approved local double exists, mark the valid-source row Blocked/Not run; do not contact a live marketplace for this case.
- Cleanup: remove any product created by the valid controlled row.
- Status: Not run.

### TC-PROD-003 - Reject invalid manual product request

- Requirements: `FR-02`, `NFR-01`
- Priority: P0
- Preconditions: Alpha is signed in.
- Data sets: empty body; missing name; blank/whitespace name; non-string name; valid name plus `retailerId`; valid name plus unknown field.
- Steps: submit each data set; record response; list Alpha and Beta products afterward.
- Expected: each request returns HTTP 400 `INVALID_PRODUCT`; no product is created; client fields cannot choose another tenant.
- Cleanup: none.
- Status: Not run.

### TC-PROD-004 - Product and own-price boundaries

- Requirements: `FR-02`, `FR-07`, `NFR-05`
- Priority: P1
- Preconditions: Alpha is signed in; one disposable Alpha product exists.
- Data: name lengths `0,1,2,499,500,501`; brand lengths `0,1,199,200,201`; valid own prices `0`, `1049`, `302539.9`, `1,049.99`; invalid prices `-5`, `12.345`, `abc`; valid/invalid/missing currency.
- Steps: submit one boundary data set at a time; reload the product after each accepted edit; verify rejected edits preserve the last good state.
- Expected: name 1-500 accepted, 0/501 rejected; brand 0-200 accepted, 201 rejected; valid price formats normalize to two decimals with uppercase three-letter currency; empty price clears price/currency; invalid/missing-currency edits return HTTP 400 and do not change the product.
- Cleanup: restore or delete the disposable product.
- Status: Not run.

### TC-PROD-005 - Discovery five-listing boundary

- Requirements: `FR-03`
- Priority: P0
- Preconditions: isolated database; controlled saved candidate fixture; Alpha product with known listing counts.
- Steps: with four distinct existing listings, run discovery against at least two suitable new candidates; then run discovery when five listings already exist.
- Expected: the first run adds only one and finishes at five; the second adds zero and remains at five; every stored listing belongs to Alpha and uses observable candidate data without invented seller/price.
- Cleanup: remove the disposable product/listings.
- Status: Not run.

### TC-PROD-006 - Repeated discovery avoids duplicates

- Requirements: `FR-03`
- Priority: P0
- Preconditions: controlled fixture produces a stable set of candidate identifiers; initial discovery completed.
- Steps: record listing identifiers/count; repeat discovery with the same fixture; list observations again.
- Expected: no duplicate listing identifier is added; the count remains unchanged; observable response reports zero new additions when all candidates are known.
- Cleanup: remove the disposable product/listings.
- Status: Not run.

### TC-PROD-007 - Cross-retailer product modification

- Requirements: `FR-02`, `NFR-01`
- Priority: P0
- Preconditions: Beta owns a disposable product; Alpha is signed in and knows its ID.
- Steps: as Alpha attempt to edit and delete Beta's product; then inspect it as Beta.
- Expected: operations do not reveal ownership and return the current not-found/denied behavior; Beta's product and values remain unchanged.
- Cleanup: Beta deletes its own disposable product.
- Status: Not run.

## Matching and history

### TC-OFFER-001 - Same identifier confirms

- Requirements: `FR-04`
- Priority: P0
- Preconditions: controlled matching interface or fixture; product and offer have the same valid identifier.
- Steps: evaluate/link the offer.
- Expected: result is `confirmed` regardless of title differences because equal identifiers are decisive.
- Cleanup: remove disposable records if persisted.
- Status: Not run.

### TC-OFFER-002 - Conflicts and unrelated offers mismatch

- Requirements: `FR-04`
- Priority: P0
- Preconditions: controlled matching interface/fixture.
- Data sets: different identifiers; `M185` versus `M190`; one item versus `2-Pack`; unrelated title below similarity threshold.
- Steps: evaluate each data set separately.
- Expected: every data set results in `mismatch`; later title similarity cannot override a decisive identifier/model/pack conflict.
- Cleanup: remove disposable records if persisted.
- Status: Not run.

### TC-OFFER-003 - Similar title remains unverified

- Requirements: `FR-04`
- Priority: P0
- Preconditions: neither side has decisive identifiers or conflicting model/pack size.
- Data: retailer product `Logitech M185 Wireless Mouse, Grey`; offer `Logitech M185 Wireless Mouse - Swift Grey`.
- Steps: evaluate/link the offer and observe its initial match status.
- Expected: result is `unverified`, never automatic `confirmed`; retailer review remains required.
- Cleanup: remove disposable records if persisted.
- Status: Not run.

### TC-OFFER-004 - Retailer match decision is tenant-scoped

- Requirements: `FR-04`, `NFR-01`
- Priority: P0
- Preconditions: Alpha owns an unverified observation; Beta is a separate account.
- Steps: Alpha confirms/rejects its observation and refreshes; Beta attempts the same observation ID; inspect as Alpha again.
- Expected: Alpha's valid decision persists; Beta receives not-found/denied behavior and cannot change it; only `confirmed` or `mismatch` are accepted update values.
- Cleanup: remove the disposable listing as Alpha.
- Status: Not run.

### TC-OFFER-005 - Failed attempt preserves history

- Requirements: `FR-06`
- Priority: P0
- Preconditions: Alpha product has at least one valid earlier observation; controlled input can record a failed/blocked attempt.
- Steps: record the earlier observation values/count; submit the controlled failure; reload history and attempts.
- Expected: a failed/blocked attempt is visible with safe reason/time; prior observation remains unchanged and available; no invalid replacement observation is created.
- Cleanup: remove disposable product/history after evidence.
- Status: Not run.

### TC-OFFER-006 - History shows source, currency, and time

- Requirements: `FR-06`, `FR-07`
- Priority: P1
- Preconditions: Alpha product has multiple controlled observations.
- Steps: open product detail/history; compare displayed values with API records.
- Expected: history retains earlier observations and visibly associates each value with source, currency, and collection time; ordering is consistent with observation time.
- Cleanup: remove disposable records.
- Status: Not run.

### TC-OFFER-007 - Unknown values remain honest

- Requirements: `FR-11`, `NFR-05`
- Priority: P0
- Preconditions: controlled valid offer with `price=null`, `currency=null`, and `availability=unknown`.
- Steps: save/read the controlled offer and view its UI state; compare API/database meaning.
- Expected: missing price remains null/unknown rather than zero; unknown stock is not shown as out of stock; source/time and unverified state remain visible where applicable.
- Cleanup: remove disposable records.
- Status: Not run.

## Execution record template

Copy this block under each case only when executing it:

```text
Tester:
Date/time (Asia/Colombo):
Branch and full commit:
Environment and versions:
Preconditions/data actually used:
Actual result:
Status: Passed | Failed | Blocked | Not run
Evidence:
Defect/retest:
Cleanup/residual data:
```

## AI assistance record

AI assistance was used to structure the cases and cross-check expected results against the current schemas, routes, tests, and documented requirements. Ilmam must review and explain every case, choose the execution data, perform or directly supervise execution, and record actual results honestly.
