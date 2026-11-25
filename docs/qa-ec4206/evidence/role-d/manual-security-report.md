# Role D manual security checks

I checked signed-out access in Brave on the local Riven app at `http://127.0.0.1:5173`. I used the [Role D security checklist](../../security-checklist.md).

## SEC-01 signed-out access

I signed out and reloaded the app. I saw the sign-in form. I opened `/api/v1/products` in Brave and saw `UNAUTHENTICATED` and “Please sign in.” The response contained no product data.

A separate tool-assisted local check sent signed-out GET requests to `/api/v1/products`, `/api/v1/observations`, `/api/v1/attempts`, and `/api/v1/auth/me`. All four returned HTTP 401 with only the expected error response. The read checks passed. SEC-01 also includes a protected write check, which is outside this result.

## SEC-02 retailer data isolation

I signed in to the local app in Brave as Alpha, then signed out and signed in as Beta. Beta showed a different Products dashboard. I could not see the Alpha product I had noted.

A separate tool-assisted check compared the records returned by the normal API reads for both local test accounts. Alpha and Beta had 2 and 1 products, 6 and 1 observations, and 5 and 0 attempts. There were no shared record IDs. The browser product check and the API comparison passed for these accounts and records.

## SEC-07 sign-out across browser tabs

I opened Products in two Brave tabs and signed out in the first tab. When I reloaded the second tab, Riven showed the sign-in form. The two-tab browser check passed. The checklist also has a separate server-side session revocation check.
