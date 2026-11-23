# Role D security cases

D1 proposal, NFR-01 / FR-01. Expected outcomes derive from [API](../api.md) and current `server/auth.integration.test.ts`. Run automated regression only against verified local `_test` PostgreSQL. Manual OWASP checks are NOT RUN. Guide labels: A01 access control and A07 authentication; edition not independently verified.

| ID | Procedure using disposable A/B accounts | Expected | Existing automated case |
| --- | --- | --- | --- |
| SEC-01 | Signed-out GET products, observations, attempts, auth/me; try protected write with trusted Origin | 401 UNAUTHENTICATED, no private data | rejects signed-out reads and writes |
| SEC-02 | Sign in as A/B; compare product lists and observation/attempt contents including unlinked records | Each sees its authorized private records | isolates products…; persists observations…; seeded retailer isolation |
| SEC-03 | A requests B's product/listing deletion; separately try product edit and match decision with B's IDs | Ownership-safe 404 and B unchanged | removes a listing or a whole product only for its own retailer covers deletes; edit/decision route cases need separate evidence |
| SEC-04 | Send B retailerId query/body and x-retailer-id while authenticated as A | Session A determines ownership | isolates products and ignores a client-supplied retailer identity; persists observations… |
| SEC-05 | Reuse tampered and expired session; inspect response | 401 and no private data | invalidates sessions on sign-out and rejects expired or tampered cookies |
| SEC-06 | Browser write with untrusted Origin; try configured extension and allowed web Origin | 403 FORBIDDEN_ORIGIN for untrusted request; valid request admitted | rejects cross-site writes and permits only the configured extension origin |
| SEC-07 | Sign out then reuse captured old synthetic cookie | 204 sign-out; old cookie gets 401 | invalidates sessions on sign-out… |

For each manual run record tester, browser/version, viewport, local URL, SHA, time/zone, setup, exact requests and sanitized responses, expected/actual result and PASS/FAIL/BLOCKED. Never save cookies or passwords. A 200 requires checking the returned IDs/data; a deliberate 401/403/404 can be a passing negative test. Public listing readings may be shared under the SRS; private tracking, decisions and own prices must remain isolated. See [evidence](evidence/role-d/README.md) for actual automated execution, not inferred passes from this mapping.
