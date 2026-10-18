# Riven API

Status: proposed contract for RIV-15.

## Authentication

### POST /api/v1/auth/sign-in

Request:
{
  "email": "retailer@example.com",
  "password": "<password>"
}

Success: 200
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

The server sets an HttpOnly session cookie.
Incorrect credentials return 401 with:
{
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect."
}

### GET /api/v1/auth/me

Returns the signed-in user and retailer using the same response shape.
Missing, invalid or expired sessions return 401.

### POST /api/v1/auth/sign-out

Invalidates the session and clears its cookie.
Returns 204 with no response body.

## Ownership

The backend derives retailer identity from the verified session.
Clients cannot choose another retailer's identity.
Every product, observation and attempt must belong to a retailer,
including observations and attempts not yet linked to a product.


## Products

### GET /api/v1/products

Requires a valid session.
Returns only the signed-in retailer's products.

Success: 200
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

If the retailer has no products:
{
  "products": []
}

Missing, invalid or expired sessions return 401.


## Observations

### GET /api/v1/observations

RIV-15 target: requires a valid session and returns only the
signed-in retailer's observations, newest first.

Success: 200
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
