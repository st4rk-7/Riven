# EC4206 Black-Box Test Design

Status: Designed; authentication-derived cases partially executed
Owner: Ilmam (Role A)
Updated: 20 November 2026 (Asia/Colombo)
Planning baseline: `29af23787b9de37d65f3ed00d30297e4f67185b3`

## 1. Purpose and method

This worksheet derives test conditions before execution for the three agreed scope groups. It uses only externally observable rules supported by the current code, database constraints, or approved requirements. Planned Sprint 2 rules are not treated as current expected behavior.

The techniques used are:

- equivalence partitioning for product name, product URL, and own-price/currency input;
- boundary value analysis for implemented text limits, the five-listing discovery cap, and the five-failure sign-in limit;
- a decision table for offer matching;
- derived manual cases linked to `manual-cases.md` and `traceability.md`.

Execution status is maintained in `manual-cases.md` and `traceability.md`. As of 20 November, the invalid-credential, signed-out-access, logout-revocation, and sign-in-rate-limit cases have passed; valid sign-in has partial evidence; the remaining cases are Not run. Fixtures and controlled test doubles do not prove live marketplace behavior.

## 2. Equivalence partitioning

### 2.1 Product name

Implemented rule: after trimming, a manually entered product name must be a string containing `1..500` characters. The request object is strict and rejects unexpected fields.

| Partition | Class | Representative value | Expected result | Derived case |
|---|---|---|---|---|
| `PN-V1` | Valid | `Desk lamp` | Product input accepted, subject to authentication/database success. | `TC-PROD-001` |
| `PN-V2` | Valid boundary class | One non-space character | Accepted. | `TC-PROD-004` |
| `PN-V3` | Valid boundary class | 500 non-space characters | Accepted. | `TC-PROD-004` |
| `PN-I1` | Invalid empty/missing | Missing name, empty string, or only spaces | Rejected as `INVALID_PRODUCT`; no product created. | `TC-PROD-003`, `TC-PROD-004` |
| `PN-I2` | Invalid length | 501 characters | Rejected; no product created. | `TC-PROD-004` |
| `PN-I3` | Invalid type | Number, array, object, or `null` as name | Rejected; no product created. | `TC-PROD-003` |
| `PN-I4` | Invalid request shape | Valid name plus client-supplied `retailerId` or unknown field | Rejected; client cannot select tenant identity. | `TC-PROD-003`, `TC-AUTH-004` |

### 2.2 Product URL input

Implemented rule: the alternative URL path accepts one trimmed syntactically valid URL up to 2000 characters, then the collector must return a readable supported Amazon product. A URL and manual-name object are alternative strict request shapes.

| Partition | Class | Representative value | Expected result | Derived case |
|---|---|---|---|---|
| `PU-V1` | Valid supported/readable | Approved fixture or controlled collector for an allowed Amazon product URL | Product name/identifier derived and product created. | `TC-PROD-002` |
| `PU-I1` | Invalid syntax | `not-a-url` | Rejected; no fetch/persistence. | `TC-PROD-002` |
| `PU-I2` | Invalid length | URL longer than 2000 characters | Rejected; no fetch/persistence. | `TC-PROD-002` |
| `PU-I3` | Unsupported/unreadable | Syntactically valid non-Amazon URL, blocked page, non-HTML page, or collector failure | Safe error asks for a supported link or manual name; no product created. | `TC-PROD-002` |
| `PU-I4` | Invalid mixed shape | URL plus name/brand or unknown field | Rejected by strict input validation. | `TC-PROD-002` |

Execution constraint: do not exercise `PU-V1` against a live marketplace merely to satisfy this assignment. Execute it only with an already-authorized local fixture/test double or record it Blocked/Not run. Existing unit tests may provide supporting evidence but remain distinct from Role A manual execution.

### 2.3 Retailer's own price and currency

Implemented rule: editing accepts a non-negative numeric string with optional valid comma grouping and at most two decimal places. It normalizes to two decimals. A non-empty price requires a three-letter currency, normalized to uppercase. Empty price clears both fields.

| Partition | Class | Representative value | Expected result | Derived case |
|---|---|---|---|---|
| `OP-V1` | Valid integer | price `1049`, currency `gbp` | Stored as `1049.00`, `GBP`. | `TC-PROD-004` |
| `OP-V2` | Valid decimal | price `302539.9`, currency `LKR` | Stored as `302539.90`, `LKR`. | `TC-PROD-004` |
| `OP-V3` | Valid grouped number | price `1,049.99`, currency `GBP` | Stored as `1049.99`, `GBP`. | `TC-PROD-004` |
| `OP-V4` | Valid clear | empty price with any supplied currency | Price and currency both become `null`. | `TC-PROD-004` |
| `OP-I1` | Invalid sign | `-5` with `GBP` | Rejected; no update. | `TC-PROD-004` |
| `OP-I2` | Invalid precision | `12.345` with `GBP` | Rejected; no update. | `TC-PROD-004` |
| `OP-I3` | Invalid format | letters or malformed comma grouping such as `10,49` | Rejected; no update. | `TC-PROD-004` |
| `OP-I4` | Missing/invalid currency | non-empty price with no currency or currency not exactly three letters | Rejected; no update. | `TC-PROD-004` |

Important distinction: current product-own-price validation permits zero. The planned `NFR-05` suspect-price rule concerns collected observations, not the retailer's own price, so zero must not be rejected here unless the product requirement changes.

## 3. Boundary value analysis

### 3.1 Product name and brand lengths

Character counts are measured after trimming for name. Brand is trimmed by the API and limited to 200 characters.

| Field | Boundary | Test values | Expected classification | Case |
|---|---:|---|---|---|
| Product name | Minimum 1 | `0`, `1`, `2` characters | Invalid, valid, valid | `TC-PROD-004` |
| Product name | Maximum 500 | `499`, `500`, `501` characters | Valid, valid, invalid | `TC-PROD-004` |
| Brand | Minimum 0 | `0`, `1` characters | Valid optional value, valid | `TC-PROD-004` |
| Brand | Maximum 200 | `199`, `200`, `201` characters | Valid, valid, invalid | `TC-PROD-004` |

### 3.2 Discovery listing cap

Implemented rule: one product retains at most five distinct candidate listings and repeated discovery does not add known identifiers.

| Existing distinct listings | New suitable distinct candidates | Expected additions | Expected final total | Case |
|---:|---:|---:|---:|---|
| 4 | 2 or more | 1 | 5 | `TC-PROD-005` |
| 5 | 1 or more | 0 | 5 | `TC-PROD-005` |
| 5 | duplicates of known listings | 0 | 5 | `TC-PROD-006` |

The lower normal state (zero existing listings with suitable candidates) is covered by `TC-PROD-005`. Candidate pages must come from saved fixtures or controlled local input.

### 3.3 Sign-in failure limit

Implemented rule: at most five sign-in requests per 60-second window for one effective client IP; the sixth is rate-limited. Browser-supplied forwarding values must not change the effective client identity.

| Failed request number in one window | Expected result | Case |
|---:|---|---|
| 4 | Invalid credentials response, not yet rate-limited | `TC-AUTH-006` |
| 5 | Invalid credentials response, limit reached | `TC-AUTH-006` |
| 6 | HTTP 429 with `RATE_LIMITED` and retry guidance | `TC-AUTH-006` |

Run this case in an isolated environment and schedule it after other sign-in cases so limiter state does not contaminate them.

## 4. Decision table - offer matching

The current matching order is decisive identifier, then model conflict, then pack-size conflict, then title similarity. A title-only match never confirms automatically.

Legend: `Y` yes, `N` no, `-` irrelevant because an earlier condition decides the result.

| Condition / action | R1 | R2 | R3 | R4 | R5 | R6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Both product and offer identifiers are present | Y | Y | N | N | N | N |
| Identifiers are equal | Y | N | - | - | - | - |
| Both sides contain model tokens with no overlap | - | - | Y | N | N | N |
| Pack sizes differ | - | - | - | Y | N | N |
| Title similarity meets the implemented threshold | - | - | - | - | Y | N |
| **Result: confirmed** | X |  |  |  |  |  |
| **Result: mismatch** |  | X | X | X |  | X |
| **Result: unverified** |  |  |  |  | X |  |

### 4.1 Derived decision-table cases

| Rule | Representative data | Expected result | Case |
|---|---|---|---|
| R1 | Same ASIN, any title | `confirmed` | `TC-OFFER-001` |
| R2 | Different ASINs, even with similar title | `mismatch` | `TC-OFFER-002` |
| R3 | No decisive identifiers; `M185` versus `M190` | `mismatch` | `TC-OFFER-002` |
| R4 | Same model/title but single item versus `2-Pack` | `mismatch` | `TC-OFFER-002` |
| R5 | No conflict; sufficiently similar title only | `unverified` | `TC-OFFER-003` |
| R6 | No conflict but unrelated/insufficiently similar title | `mismatch` | `TC-OFFER-002` |

The planned more-than-40% price-gap guard is not included because it is not implemented at the planning baseline.

## 5. Technique-to-requirement coverage

| Technique | Requirements | Primary cases |
|---|---|---|
| Product-name partitions and boundaries | `FR-02` | `TC-PROD-001`, `003`, `004` |
| URL partitions | `FR-02` | `TC-PROD-002` |
| Own-price/currency partitions | `FR-07`, `NFR-05` data meaning | `TC-PROD-004` |
| Discovery cap boundary | `FR-03` | `TC-PROD-005`, `006` |
| Sign-in failure boundary | `FR-01` | `TC-AUTH-006` |
| Matching decision table | `FR-04` | `TC-OFFER-001`, `002`, `003` |

## 6. Review questions

Ilmam should be able to explain:

1. why partitions reduce redundant tests without skipping behavior classes;
2. why values immediately below, at, and above a boundary are selected;
3. why matching conditions must be evaluated in their implemented order;
4. why a similar title produces `unverified`, never `confirmed`;
5. why fixture evidence is not evidence of live marketplace collection.

## 7. Owner understanding check

Ilmam explained that a similar title cannot prove product identity because a different product may share the same word pattern, illustrated by `cat` and `catfish`. Therefore a title-only similarity remains `unverified`; stronger identifier evidence or retailer review is required before confirmation.

## 8. AI assistance record

AI assistance was used to inspect current schemas, tests, and constraints; propose representative partitions/boundaries; and draft the decision table. Ilmam remains responsible for checking the derivations against the code, explaining the techniques, selecting execution data, and approving the final cases.
