# Role D manual security checks

I checked signed-out access in Brave on the local Riven app at `http://127.0.0.1:5173`. I used the [Role D security checklist](../../security-checklist.md).

The browser paragraphs below record my observations. The supplementary API results come from the [25 November sanitized request and response transcript](security-api-rerun-2026-11-25.txt), run at **14:52:03 IST (09:22:03 UTC)** on commit `9370f7c5a322d5dee9c71c92793df2a819afa17b`. The rerun used two disposable fixture accounts in local `riven_test` and Fastify HTTP injection.

## SEC-01 signed-out access

I signed out and reloaded the app. I saw the sign-in form. I opened `/api/v1/products` in Brave and saw `UNAUTHENTICATED` and “Please sign in.” The response contained no product data.

In the API rerun, signed-out GET requests to `/api/v1/products`, `/api/v1/observations`, `/api/v1/attempts`, and `/api/v1/auth/me` all returned the expected HTTP 401 with only the error response. **Result: Pass for signed-out reads.** The protected-write check remains outside this result.

## SEC-02 retailer data isolation

I signed in to the local app in Brave as Alpha, then signed out and signed in as Beta. Beta showed a different Products dashboard. I could not see the Alpha product I had noted.

In the API rerun, each fixture account received exactly its own product, linked observation, unlinked observation, and attempt. **Result: Pass for the two disposable accounts and records tested.**

## SEC-07 sign-out across browser tabs

I opened Products in two Brave tabs and signed out in the first tab. When I reloaded the second tab, Riven showed the sign-in form. The two-tab browser check passed. The checklist also has a separate server-side session revocation check.
