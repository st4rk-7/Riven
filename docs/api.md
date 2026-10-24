# Riven API

Status: implemented backend contract for RIV-15; frontend and real-browser
extension integration checks remain pending.

Authentication uses Better Auth 1.7.11 and PostgreSQL. Only the three
authentication routes described here are exposed; public sign-up is disabled.

Base path: /api/v1
Request and response bodies use JSON unless stated otherwise.
All examples contain illustrative data.

## Authentication and ownership

- Authentication uses a server-verified session in an HttpOnly cookie.
- Production cookies require Secure and an appropriate SameSite policy.
- The backend derives retailer identity from the verified session.
- Clients cannot choose a retailer identity through request fields.
- Every product, observation and attempt belongs to a retailer.
- Observations and attempts retain retailer ownership even when productId
  is null.
- Product matching considers only the signed-in retailer's products.
- Missing, invalid or expired sessions return 401 on protected endpoints.
- Cookie, origin and CSRF handling for both the web app and extension
  is restricted to the configured WEB_ORIGIN, API origin and optional exact
  RIVEN_EXTENSION_ORIGIN. Browser writes must include a trusted Origin.
  Non-browser writes without Origin require X-Riven-Client: riven.
  Cross-origin browser requests must use credentials: include.
- Sessions expire after 24 hours without automatic refresh. Every protected
  request verifies the database session; there is no client-side session cache.
- Authenticated responses use Cache-Control: no-store.

## Errors

Errors use this shape:

```json
{
  "code": "UNAUTHENTICATED",
  "message": "Please sign in."
}
```

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | INVALID_REQUEST | Invalid authentication request |
| 400 | INVALID_OFFER | Invalid observation request |
| 400 | INVALID_ATTEMPT | Invalid attempt request |
| 400 | UNSUPPORTED_SOURCE | Source is not supported |
| 401 | INVALID_CREDENTIALS | Email or password is incorrect |
| 401 | UNAUTHENTICATED | Missing, invalid or expired session |
| 403 | FORBIDDEN_ORIGIN | Request origin is not allowed |
| 429 | RATE_LIMITED | Too many sign-in attempts; see Retry-After |
| 500 | INTERNAL_ERROR | Unexpected server failure |

Messages must not expose passwords, session tokens, database details
or internal stack traces.

## Sign in

### POST /api/v1/auth/sign-in

Request:

```json
{
  "email": "retailer@example.com",
  "password": "<password>"
}
```

Success: 200. The server sets the session cookie.

```json
{
  "user": {
    "id": "user-1",
    "name": "Demo User"
  },
  "retailer": {
    "id": "retailer-1",
    "name": "Demo Store"
  }
}
```

Errors:
- 400 INVALID_REQUEST for malformed input.
- 401 INVALID_CREDENTIALS for an incorrect email or password.

Use the same credentials error whether or not the email exists.
Passwords and session tokens are never returned in the JSON response.
Sign-in permits up to five attempts per client IP in a 60-second window.
The limiter is process-local; multiple server processes require shared storage.
Login accepts only email and password. Public registration is not provided.

## Current session

### GET /api/v1/auth/me

Requires a valid session.

Success: 200. Returns the same user and retailer shape as sign-in.

Missing, invalid or expired sessions return 401 UNAUTHENTICATED.

## Sign out

### POST /api/v1/auth/sign-out

Invalidates the current session and clears its cookie.

Success: 204 with no response body.
If the session is already absent or expired, still clear the cookie
and return 204.

A previously valid session must no longer authorize requests after
sign-out.

## Products

### GET /api/v1/products

Requires a valid session.
Returns only the signed-in retailer's products.

Success: 200.

```json
{
  "products": [
    {
      "id": "product-1",
      "name": "Wireless Mouse",
      "brand": "Logitech",
      "asin": null
    }
  ]
}
```

Returns {"products": []} when the retailer has no products.
asin may be null.

Missing, invalid or expired sessions return 401 UNAUTHENTICATED.

### POST /api/v1/products

Requires a valid session. Adds a product the signed-in retailer sells.

Send either an Amazon product link, whose page Riven reads for the name and
ASIN (Amazon UK, US and SG hosts only):

```json
{ "url": "https://www.amazon.co.uk/dp/B00552K0GM" }
```

or the details typed by hand (brand and asin are optional):

```json
{ "name": "Wireless Mouse", "brand": "Logitech", "asin": "B00552K0GM" }
```

Success: 201 with the product, in the same shape as GET /api/v1/products.
Earlier offers not linked to any product are linked to it when they match.

Returns 400 INVALID_PRODUCT for a blank name, unknown fields, or a link
Riven cannot read (another site, or Amazon blocked the request).

## Observations

### GET /api/v1/observations

Requires a valid session.
Returns only the signed-in retailer's observations, newest first.

Success: 200.

```json
[
  {
    "id": "observation-1",
    "productId": null,
    "asin": "B000000001",
    "productName": "Example wireless mouse",
    "price": "19.99",
    "currency": "GBP",
    "availability": "in_stock",
    "seller": null,
    "source": "Amazon UK",
    "observedAt": "2026-10-19T09:00:00Z",
    "matchStatus": "unverified",
    "collectedVia": "extension"
  }
]
```

Returns [] when the retailer has no observations.

Field meanings:
- productId: linked retailer product ID, or null when unmatched.
- price: decimal string with two decimal places, or null.
- currency: three uppercase letters, or null.
- A non-null price requires a currency.
- seller: seller name, or null when unavailable.
- availability: in_stock, out_of_stock or unknown.
- matchStatus: confirmed, unverified or mismatch.
- collectedVia: extension or crawler.
- observedAt: server-generated ISO 8601 UTC timestamp.

Missing values must not be replaced with zero or guessed values.
An unmatched observation still belongs to the signed-in retailer.

Missing, invalid or expired sessions return 401 UNAUTHENTICATED.

### POST /api/v1/observations

Requires a valid session.
Accepts one offer collected by the browser extension.

Request:

```json
{
  "pageUrl": "https://www.amazon.co.uk/dp/B000000001",
  "asin": "B000000001",
  "productName": "Example wireless mouse",
  "price": "19.99",
  "currency": "GBP",
  "availability": "in_stock",
  "seller": null
}
```

Validation:
- pageUrl must be a valid URL from a supported source.
- Current accepted hostnames are amazon.co.uk and www.amazon.co.uk.
- asin must contain exactly 10 uppercase letters or digits.
- productName must contain 1–500 characters after trimming.
- price must be a decimal string with two decimal places, or null.
- currency must contain three uppercase letters, or be null.
- A non-null price requires a currency.
- availability must be in_stock, out_of_stock or unknown.
- seller must contain at most 200 characters after trimming, or be null.

Success: 201.
Returns one observation object using the GET observation shape.
Also records a successful attempt for the same retailer.

The backend generates the ID, timestamp, source and match status.
The request cannot select retailer ownership or confirm its own match.
An unmatched observation has productId: null and remains unverified.
A failed write must not leave a partially recorded successful collection.

Errors:
- 400 INVALID_OFFER for invalid fields.
- 400 UNSUPPORTED_SOURCE for an unsupported source.
- 401 UNAUTHENTICATED for a missing, invalid or expired session.

Invalid offers from a supported source record a failed attempt after
authentication. An invalid offer does not create an observation.
Unsupported sources are rejected.

## Attempts

### GET /api/v1/attempts

Requires a valid session.
Returns only the signed-in retailer's attempts, newest first.

Success: 200.

```json
[
  {
    "id": "attempt-1",
    "productId": null,
    "source": "Amazon UK",
    "status": "failed",
    "reason": "Could not read an offer from the page.",
    "attemptedAt": "2026-10-19T09:00:00Z"
  }
]
```

Returns [] when the retailer has no attempts.

Field meanings:
- productId: linked retailer product ID, or null.
- status: ok, blocked or failed.
- reason: safe explanation, or null.
- attemptedAt: server-generated ISO 8601 UTC timestamp.

An attempt with productId: null still belongs to a retailer.
A failed attempt must not erase a previous valid observation.

Missing, invalid or expired sessions return 401 UNAUTHENTICATED.

### POST /api/v1/attempts

Requires a valid session.
Records a failed or blocked collection reported by the extension.

Request:

```json
{
  "pageUrl": "https://www.amazon.co.uk/dp/B000000001",
  "status": "blocked",
  "reason": "The page could not be accessed."
}
```

Validation:
- pageUrl must be a valid URL from a supported source.
- Current accepted hostnames are amazon.co.uk and www.amazon.co.uk.
- status must be failed or blocked.
- reason must contain 1–300 characters after trimming.
- reason must not contain credentials or private page content.

Success: 201.
Returns one attempt object using the GET attempt shape.

The backend generates its ID, source and timestamp, assigns retailer
ownership from the session and sets productId to null.
This endpoint does not create an observation.
Clients cannot report status: ok through this endpoint.

Errors:
- 400 INVALID_ATTEMPT for invalid fields.
- 400 UNSUPPORTED_SOURCE for an unsupported source.
- 401 UNAUTHENTICATED for a missing, invalid or expired session.

## Implementation checks

- A retailer can sign in, check their session and sign out.
- Incorrect credentials do not create a session.
- Signed-out requests to protected endpoints return 401.
- Signing out invalidates the previous session.
- Retailer A cannot read retailer B's products, observations or attempts.
- Unmatched observations and attempts remain isolated by retailer.
- Client-supplied retailer identity cannot change ownership.
- Observation and successful-attempt writes succeed or fail together.
- Failed collection preserves earlier valid observations.
- Existing extension request and response shapes remain compatible.

## Remaining integration work

- RIV-18 provisions two retailer accounts using the agreed user/account tables.
- Connect Dilsan's sign-in screen and real catalogue requests to these endpoints.
- Verify cookies and sign-out in a real browser and the configured Chrome extension.
- Announce the API and database changes on RIV-15 before merging, following manual section 10.
- Agree any additional product operations before implementing them.
