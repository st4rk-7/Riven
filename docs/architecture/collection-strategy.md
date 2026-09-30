# Source collection strategy and Amazon feasibility gate

**Updated:** 28 September 2026. **Status:** Amazon is the user's first required platform. Method and live feasibility are not established. This document plans collection; it does not claim a scraper has passed testing.

## Initial dataset recommendation

- Marketplace: **Amazon UK (`amazon.co.uk`)**, recommended for English-language observations in GBP and the expressed interest in European markets. UK is not an EU marketplace; choose an EU marketplace instead if that is a client requirement.
- Category: **new, ordinary wired USB computer mice**, with exact manufacturer/model, colour, pack quantity and connector recorded. Begin with 3–5 verified product URLs, not Amazon search/category crawling. Candidate model families can be identified by the team; this document deliberately contains no invented ASINs or claimed current listings.
- Input: retailer pastes a product URL and confirms expected product/variant. Automatic search and matching across the entire internet are excluded.
- Context: one recorded delivery region and locale. A shipping destination may affect offers; a UK URL viewed from Sri Lanka does not establish a UK-delivered price.
- Offer recommendation: featured **new-condition** offer, retaining observed seller identity, if the client accepts this meaning. Named-seller monitoring is a different requirement and must be demonstrated separately.
- Fields: displayed item price, currency, availability, observed seller, variant/condition, source URL and time. Shipping, taxes and promotions are separate nullable fields; do not calculate conditional coupon/Prime prices as universal prices.

These recommendations simplify validation, not the final product's category support. Data models remain category-neutral. Client usefulness of these products must still be confirmed.

With one featured offer per product on one marketplace, Sprint 1 demonstrates monitoring, not a complete cross-retailer comparison. Do not compare different mouse models as equivalent competitors. Full comparisons need equivalent offers from multiple sellers or the later second platform, under the agreed semantics.

## Evidence found in official documentation

Checked 28 September 2026:

1. Amazon UK conditions restrict automated extraction and reuse of listing/price data under the ordinary website licence. Public page visibility is not confirmation that the proposed repeated collection, storage and retailer use is permitted. [Amazon UK conditions](https://digprjsurvey.amazon.co.uk/csad/help/node/GLSBYFE9MGKKQXXM).
2. Amazon's Product Pricing API exposes pricing/offer information for seller use cases; production integration needs registration, suitable roles and seller authorisation. The team has not reported those credentials. A static sandbox is not live competitor data. [Product Pricing](https://developer-docs.amazon/sp-api/lang-us/docs/product-pricing-api), [onboarding](https://developer-docs.amazon.com/sp-api/docs/onboarding-overview).
3. PA-API 5 documentation now points to a deprecation notice and Creators API. Old PA-API tutorials are not a viable baseline. Creators API targets publishers/affiliate partners; locale-specific eligibility, use and retention rules need checking for this retailer-monitoring application. Do not assume it authorises a historical competitor-price database. [Deprecation](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation), [Creators introduction](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction), [licence references](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/license-agreement).

This is an access/dependency assessment, not a legal determination. The concrete conclusion is that no Amazon route is yet evidenced as available and suitable for Riven. No live source probe was run for this document.

## Alternatives and decision

| Route | Benefit | Main limitation | Current disposition |
| --- | --- | --- | --- |
| Amazon SP-API with an authorised seller | Structured pricing/offer interface fits a retailer use case | Account/role access, permitted uses, retention and any fees must be established | Assess first if the client can provide seller participation; not an available dependency yet |
| Creators API | Official catalogue interface | Affiliate orientation and applicable rules may not fit historical retailer analytics | Not selected; validate fit before any adoption |
| Direct HTTP + Cheerio | Low resource use; no paid collection-provider dependency | Page access rights, markup changes, geo/offer ambiguity and blocking | Use only on sources where the required access/use is supported; Amazon permission not established |
| Plain Playwright rendering | Executes page JavaScript when approved content requires it | More CPU/RAM; does not solve access, semantic accuracy or blocking | Optional per-source adapter mode after evidence; not automatic fallback for a block |
| Managed data provider / marketplace scraper | May reduce connector maintenance | Recurring costs, rights/provenance, quotas, retention, lock-in and reliability | Outside current zero-funded baseline; any adoption changes cost/API-dependency assumptions |
| Local fixture source | Deterministic team/CI progress without remote requests | Does not meet real Amazon collection acceptance | Use for development, clearly labelled; never present as live data |

**Recommendation:** settle the data access route before promising Amazon delivery. For supported page collection, reuse HTTP, Cheerio and Playwright libraries behind a small Riven connector interface rather than building a browser or parsing engine. The project adds monitor management, correctness rules, durable jobs, history, comparison, alerts, isolation and operations.

Crawlee is an established TypeScript crawling framework, and Scrapy is a Python alternative. Crawlee supplies useful routing/concurrency facilities, but Riven initially has a small set of known URLs and pg-boss already owns scheduling/retries. Adding a second crawl queue now increases coordination complexity. Reconsider it if multi-page discovery becomes an approved requirement; do not adopt fingerprint/proxy features to bypass source restrictions. [Crawlee documentation](https://crawlee.dev/js/docs/introduction).

## Feasibility gate: issue #2

Time-box the first investigation to **two working days**, an estimate for the team to schedule rather than an invented calendar deadline. If access is unresolved at the end, record the dependency and escalate; repeating blocked requests is not progress.

1. Confirm source route and allowed purpose, fields, historical retention, sharing, request limits and authentication. Attach official references/access evidence, never credentials. Establish client willingness to obtain the required access. Do not silently replace Amazon.
2. Record 3–5 real URLs and their exact model/variant/offer/delivery context. Include at least one edge case, such as unavailable price, promotion or variant mismatch; use a synthetic fixture for an unavailable live edge case and label it.
3. Where live access is supported, run a small permitted sample on two days. Compare each observation against a contemporaneous manual check under the same context. Separate transport success from field correctness; retain failure evidence in the denominator.
4. Demonstrate timeout, missing price, ambiguous variant, seller change, source unavailable and duplicate job handling with local fixtures. Measure runtime and memory on team hardware.
5. Record a verdict: **supported**, **supported with explicit limits**, or **blocked**. For success, every accepted sample must have correct price/currency/identity; unknown fields stay unknown. Record the actual count/rate, not “100% reliable”.

If Amazon is blocked and no access route/budget is available, keep Amazon integration visibly blocked. Continue source-independent engineering using fixtures. Ask the client to obtain access or explicitly approve a different initial source/scope. Temu and AliExpress are not automatically easier alternatives and require their own gate. One connector proves only that connector, not universal web collection.

## Collection flow after the gate passes

Supported URL + expected identity → canonicalise/validate → enqueue durable run → fetch through selected adapter → normalise → validate identity/semantics → commit observation/attempt → expose comparison → evaluate alerts when implemented.

- Allow only configured source HTTPS hosts/product routes; validate redirects and resolved destinations, and reject private/internal network targets. Product input must not become an unrestricted fetch service.
- Use structured product data when present and correct for the selected offer. A source-specific selector can be a fallback, but a missing selector causes a classified error, not a guessed value.
- Validate returned product/variant/seller context before accepting a price. A generic HTTP 200 or a plausible number is not sufficient.
- Version the connector/parser and store that version with observations. Keep small, permitted and sanitised fixtures for regression tests; avoid committing full copyrighted pages or personal/session data.
- Start with one worker and no concurrent browser pages. A proposed job budget is 30 seconds for HTTP or 60 seconds for rendering; measure and revise. A source's permitted limits override configuration suggestions.
- Let pg-boss own job-level retries. Avoid nested automatic retries multiplying requests. Proposed maximum: three total attempts for transient failures, exponential backoff and any applicable `Retry-After`. Access denial, CAPTCHA, schema mismatch and uncertain identity do not trigger automatic retries.
- Pause an affected connector after repeated permanent/parser errors. Leave other sources and dashboard reads available. Fix the adapter, run fixtures/contract checks, then resume a small authorised canary before restoring its schedule.

## Evidence record format

Store results under `docs/evidence/` when experiments actually run; no empty success report is generated now.

| Date/time | Commit/parser version | Marketplace and context | URL/ASIN/variant/seller | Method and access basis | Expected vs observed fields | Runtime/memory | Outcome/error | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Redact credentials, cookies and personal delivery addresses. Keep source samples and logs only where storage is permitted. Include a field-level mismatch count and failed requests in the report. The final report should describe measured limitations, not promise that Amazon cannot break.
