# Marketplace API application guide

**Created:** 2 October 2026 · **Owner:** Shewon  
**Purpose:** Track application status and requirements for each marketplace's official API or data-access route.

> **Historical record (superseded 3 October 2026).** eBay rejected the developer account on 3 October 2026, so eBay is no longer a Sprint 1 candidate. The Sprint 1 source is books.toscrape.com. The current decision and statuses are in [source-access-decision.md](source-access-decision.md); where this guide disagrees, that document wins.

---

## Summary

| Marketplace | Route | Prerequisites | Approval time | Cost | Riven suitability | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **eBay** | Browse API (production) | Developer account, eBay Partner Network (EPN) | Dev account: ~1 day; EPN + production: days–weeks | Free (5,000 calls/day) | ❌ Not available | ⛔ Dev account rejected (3 Oct 2026) |
| **Walmart** | Solution Provider program | Business entity, application form, Zoom demo | 3–5 weeks | Free after approval | ⚠️ Seller-tool oriented; Riven must justify use | 🔴 Not started |
| **AliExpress** | Open Platform API | AliExpress seller account, business licence, app approval | 1–2 days for review | Free (seller-authorized) | ⚠️ Requires seller account; seller authorization needed for data | 🔴 Not started |
| **Temu** | Partner Platform / Research API | ISV registration, app key approval | Unknown (limited public info) | Unknown | ⚠️ Seller-oriented; Research API exists but access unclear | 🔴 Not started |
| **Amazon** | No suitable route found | See [source-access-decision.md](source-access-decision.md) | N/A | N/A | ❌ Blocked for Riven's current scope | 🔴 Blocked |
| **Oxylabs** | E-Commerce Scraper API (provider) | Account registration | Immediate (free trial) | Free: 2,000 results; paid: from $0.50/1K | ⚠️ Backup provider; downstream licence must be confirmed | 🔴 Not started |

---

## 1. eBay — Browse API

### What it is

eBay's Browse API lets any registered developer search listings and retrieve item details (price, currency, condition, availability, seller, images) using an application-level OAuth token. No buyer or seller login is needed for public listing data.

### Prerequisites

1. **eBay account** — any regular eBay account (free)
2. **eBay Developer account** — register at [developer.ebay.com](https://developer.ebay.com) (free, ~1 day approval)
3. **Application keyset** — created in the developer portal; separate keys for sandbox and production
4. **eBay Partner Network (EPN) membership** — required for production Browse API access; apply at [epn.ebay.com](https://epn.ebay.com)

### How to apply

1. Register at [developer.ebay.com](https://developer.ebay.com) → done (pending approval)
2. After approval, go to **My Account → Application Keysets → Create a Keyset**
3. Select **Production** environment
4. eBay generates: App ID (Client ID), Dev ID, Cert ID (Client Secret)
5. Apply for EPN membership at [epn.ebay.com](https://epn.ebay.com) — describe Riven as a price comparison/monitoring tool
6. After EPN approval, enable OAuth on the production keyset

### Authentication

- **OAuth 2.0 Client Credentials** grant (application token)
- No user login or seller account needed
- Token lasts ~2 hours, auto-refreshable
- Scope: `https://api.ebay.com/oauth/api_scope` (public data)

### What you get

| Field | Available | Notes |
| --- | --- | --- |
| Product title | ✅ | `title` |
| Price | ✅ | `price.value` |
| Currency | ✅ | `price.currency` |
| Condition | ✅ | `condition` |
| Availability | ✅ | `estimatedAvailabilities` |
| Seller info | ✅ | `seller.username`, `seller.feedbackScore` |
| Item URL | ✅ | `itemWebUrl` |
| Item ID | ✅ | `itemId` (REST format: `v1\|...\|...`) |
| Images | ✅ | `image.imageUrl` |

### Limitations

- **5,000 calls/day** on the free production tier
- Returns **active asking prices**, not completed sale prices
- Maximum **10,000 items** per search query
- eBay may require affiliate link display (`itemAffiliateWebUrl`) for commission eligibility
- **Sandbox is mostly broken** for Browse API search — developers report empty/generic results; use sandbox only for OAuth flow testing, not for product data
- Production access requires EPN membership and business-model review

### What to ask eBay

When applying for EPN / production access, describe Riven's use case:

> Riven is a price-intelligence platform for UK retailers. We want to use the eBay Browse API to retrieve publicly listed product prices and availability, store timestamped price history, generate comparisons and alerts, and display relevant observations to authenticated retailer customers. We will comply with eBay's API terms, display requirements, and rate limits.

### Confirm before building an adapter

- [ ] Dev account approved
- [ ] Production keyset generated
- [ ] EPN membership approved
- [ ] Terms permit: historical price retention, multi-tenant display, derived analytics
- [ ] One real `search` + `getItem` call returns price, currency, availability
- [ ] Rate limits are sufficient for prototype (5,000/day)

---

## 2. Walmart — Solution Provider program

### What it is

Walmart Marketplace APIs are available to approved Solution Providers who build software for Walmart sellers. Access includes product, pricing, inventory, and order APIs.

### Prerequisites

1. **Business entity** — Walmart expects a registered company, not an individual student
2. **Solution Provider application** — [submission form](https://developer.walmart.com/us-marketplace/docs/get-started-as-a-solution-provider)
3. **OAuth 2.0 implementation** — required for all solution providers
4. **Zoom demo** — Walmart schedules a kickoff call 1–2 days after submission, and a follow-up demo of your integration

### How to apply

1. Complete the [Solution Provider application form](https://developer.walmart.com/us-marketplace/docs/get-started-as-a-solution-provider)
2. Wait for approval email (Walmart says 3–5 weeks for full process)
3. Register on Solution Provider Center → get sandbox credentials
4. Develop integration using sandbox
5. Submit application for Walmart review → Zoom demo → approval → publish to App Store

### Authentication

- **OAuth 2.0 Authorization Code** grant
- Seller must authorize your application in Seller Center
- Access tokens expire in **15 minutes**; refresh tokens valid for **1 year**

### Limitations

- **Seller-oriented:** designed for tools that help Walmart sellers manage inventory/orders/pricing
- **Not designed for:** independent competitor monitoring across all Walmart listings
- **Requires a real business entity** — a university project may not qualify
- **3–5 week** full approval timeline
- **US marketplace primarily** (also Canada, Mexico)
- After approval, app must be **published on Walmart App Store** and pass marketing review

### What to ask Walmart

> We are developing Riven, a competitive-intelligence platform for e-commerce retailers. We would like to use Walmart Marketplace APIs to retrieve product pricing and availability data for competitor monitoring purposes. Does the Solution Provider program support this use case, or is there an alternative data-access route for non-seller analytics applications?

### Riven suitability verdict

⚠️ **Challenging.** Walmart's program is designed for seller tools, not independent price monitors. The business-entity requirement and 3–5 week timeline make this unsuitable for Sprint 1. Worth applying after Sprint 1 if the mentor/client confirms interest, but do not expect approval for Riven's current use case without significant justification.

---

## 3. AliExpress — Open Platform API

### What it is

AliExpress Open Platform provides API access for developers who are AliExpress sellers or ISVs building tools for AliExpress sellers.

### Prerequisites

1. **AliExpress seller account** — you must be a registered AliExpress seller
2. **Business licence** — enterprise registration required (uploaded during application)
3. **Developer type selection:**
   - **Self-developer** — builds tools for own store(s) only
   - **Commercial developer (ISV)** — builds tools for other AliExpress sellers
4. **App key approval** — reviewed in 1–2 days

### How to apply

1. Log in to [console.aliexpress.com](https://console.aliexpress.com) with AliExpress seller credentials
2. Accept API use agreement
3. Fill in developer information
4. Click **Create App** → choose Self-developer or Commercial developer
5. Fill in application information, upload business licence
6. Submit → wait 1–2 days for approval email
7. After approval, create app → receive App Key and App Secret

### Authentication

- **OAuth 2.0 Authorization Code** grant
- Seller must authorize your application
- Access tokens: 7 days (test) / 30 days (online)
- Refresh tokens: 30 days (test) / 180 days (online)
- All business data access requires **seller authorization**

### Available APIs

| API | Data |
| --- | --- |
| Product API | Product creation, catalog inquiry, listing/delisting |
| Order API | Order query, shipment management |
| Pricing API | Not clearly available for competitor monitoring |
| Search/Browse API | **Not documented for public listing search** |

### Limitations

- **Must be an AliExpress seller** — cannot register as a pure analytics developer
- **Business licence required** — individuals and university projects unlikely to qualify
- **Seller authorization mandatory** — can only access data from sellers who explicitly authorize your app
- **No public listing search API** — unlike eBay, there is no documented Browse/Search endpoint for general marketplace listings
- **ISVs serve sellers** — the platform is designed for seller tools, not independent competitor intelligence

### What to ask AliExpress

> We are developing a competitive-intelligence tool for e-commerce retailers. We need to retrieve publicly listed product prices and availability from AliExpress for price monitoring and comparison. Is there an API route for accessing public marketplace listing data without requiring individual seller authorization? If not, does AliExpress offer a data partnership or research API for this purpose?

### Riven suitability verdict

⚠️ **Poor fit for Riven's current use case.** The seller-account requirement and mandatory seller authorization make it impossible to monitor competitor products across the marketplace. There is no documented public listing search API. Consider only if Riven's scope changes to seller-authorized tools, or if AliExpress offers a separate research/data route.

---

## 4. Temu — Partner Platform

### What it is

Temu's Partner Platform provides API access for ISVs and developers building tools for Temu sellers. A **Research API** also exists but access requirements are not well documented publicly.

### Prerequisites

1. **ISV registration** on [partner.temu.com](https://partner.temu.com)
2. **App key, App secret, App token** — obtained after registration
3. **Seller authorization** — required for accessing seller business data

### How to apply

1. Visit [partner.temu.com](https://partner.temu.com) or [partner-eu.temu.com](https://partner-eu.temu.com)
2. Register as a developer/ISV
3. Apply for app credentials
4. Wait for approval (timeline not publicly documented)

### Authentication

- HTTPS-based API with signature verification
- All requests use **POST** method only
- Regional endpoints: US (`openapi-b-us.temu.com`), EU (`openapi-b-eu.temu.com`), Global (`openapi-b-global.temu.com`)

### Available APIs

| API | Data |
| --- | --- |
| Product API | Product creation, catalog, listing management (seller-authorized) |
| Pricing API | Price proposals, suggested prices (seller-authorized) |
| Order API | Order query and shipment (seller-authorized) |
| **Research API** | Query Temu SOR, Mall Info, Mall Goods — **access requirements unclear** |

### Limitations

- **Seller-oriented:** designed for tools serving Temu merchants
- **Research API exists** but prerequisites, approval process, and permitted use are not well documented
- **Limited public documentation** compared to eBay/Amazon/Walmart
- **No documented public listing search** for general marketplace monitoring
- **POST-only API** — no GET endpoints

### What to ask Temu

> We are developing Riven, a price-intelligence platform for retailers. We are interested in Temu's Research API to retrieve product pricing and availability data from Temu marketplace listings. What are the requirements for accessing the Research API? Is it available for independent analytics applications, or does it require seller authorization? What data fields are available, and are there restrictions on historical storage or display to third-party users?

### Riven suitability verdict

⚠️ **Unknown.** The Research API is promising but its access requirements are not publicly clear. Worth inquiring, but do not depend on it for Sprint 1.

---

## 5. Amazon — blocked

See [source-access-decision.md](source-access-decision.md) for the full assessment.

**Summary:**
- **Page scraping:** prohibited by UK Conditions of Use without express written consent
- **Product Advertising API:** licensed for advertising Amazon / driving sales, not competitor analytics
- **SP-API Pricing:** seller-only; Riven's intended users are not eligible Amazon sellers
- **No suitable route** for Riven's current scope, users, or budget

**No application to submit.** Revisit only if the mentor/client identifies a new access route or if Amazon's terms change.

---

## 6. Oxylabs — backup data provider

### What it is

Third-party scraping API service. Handles proxies, rendering, CAPTCHAs, and returns structured JSON. Covers Amazon, eBay, Walmart, and other e-commerce sites.

### Prerequisites

1. Account registration at [oxylabs.io](https://oxylabs.io) (free trial available)
2. No marketplace credentials needed — Oxylabs handles collection

### Free trial

- **2,000 results** free, no credit card required
- Covers: Amazon, eBay, Walmart and other e-commerce targets
- Structured JSON output with parsing

### Paid pricing

| Source | Cost |
| --- | --- |
| Amazon | $0.50 / 1,000 results |
| eBay | $0.45 / 1,000 results |
| General e-commerce | $1.15 / 1,000 results |
| With JS rendering | $1.35 / 1,000 results |

### Limitations

- **Downstream licence must be confirmed** — Oxylabs says to seek legal consultation before scraping; their marketing of "public data" and "competitor analysis" does not automatically mean Riven may store, analyse, and display provider-collected data to multiple tenants
- **Paid after free trial** — ongoing cost for production use
- **Not an official marketplace API** — data accuracy and completeness may differ from official sources
- **Response time:** ~10 seconds per request on average

### What to ask Oxylabs

> We are developing Riven, a multi-tenant price-intelligence SaaS for retailers. We want to use your E-Commerce Scraper API to collect product prices and availability from Amazon, eBay, and Walmart; retain timestamped historical observations; generate comparisons, analytics, and alerts; and display observations to authenticated retailer customers. Does our subscription permit this downstream use? Are there restrictions on historical storage, derived analytics, or multi-tenant display of collected data?

### Riven suitability verdict

⚠️ **Viable backup.** Quick to set up, multi-marketplace coverage, structured output. But must confirm downstream licence before using for production Riven, and ongoing cost after free trial. Best used as a fallback if official API routes fail or for marketplaces where no official route is available.

---

## Application priority order

```text
1. eBay Browse API        ← rejected 3 Oct 2026 (historical)
2. Temu Research API      ← ask about access now (quick inquiry)
3. Oxylabs free trial     ← test after eBay; confirm licence first
4. Walmart Solution Provider ← apply after Sprint 1 (3-5 week timeline)
5. AliExpress Open Platform  ← apply after Sprint 1 (seller account required)
6. Amazon                 ← blocked; revisit only with new information
```

## Action checklist

- [x] eBay: Developer account created — **rejected 3 Oct 2026**; remaining eBay items cancelled
- [ ] eBay: Apply for EPN membership
- [ ] eBay: Generate production keyset after dev account approval
- [ ] eBay: Make one production `search` + `getItem` call, record response
- [ ] eBay: Confirm terms permit Riven's retention and display use
- [ ] Temu: Send inquiry email about Research API access
- [ ] Oxylabs: Send use-case email about downstream licence (do not create account yet)
- [ ] Walmart: Submit Solution Provider application (after Sprint 1)
- [ ] AliExpress: Investigate seller account requirement (after Sprint 1)
- [ ] Record all approvals, denials, and pending status in this document

---

## Email templates

### Temu — Research API inquiry

**To:** Temu Partner Platform support (find contact on [partner.temu.com](https://partner.temu.com))  
**Subject:** Research API access inquiry — price intelligence application

> Dear Temu Partner Platform team,
>
> We are developing Riven, a price-intelligence platform for e-commerce retailers based in the UK. We are interested in accessing Temu's Research API to retrieve product pricing and availability data from Temu marketplace listings.
>
> Could you please confirm:
>
> 1. What are the requirements for accessing the Research API? Is ISV/seller registration required?
> 2. Is the Research API available for independent analytics applications, or does it require individual seller authorization?
> 3. What product data fields are available (e.g. product title, price, currency, availability, category)?
> 4. Are there restrictions on storing historical price observations, generating derived analytics, or displaying aggregated data to third-party users?
> 5. Is there a free tier or trial period for evaluation?
>
> We would be happy to provide additional details about our platform and intended use.
>
> Best regards,  
> Shewon  
> Riven project team

### Oxylabs — downstream licence inquiry

**To:** support@oxylabs.io  
**Subject:** Downstream use inquiry — multi-tenant price intelligence SaaS

> Dear Oxylabs team,
>
> We are developing Riven, a multi-tenant price-intelligence SaaS platform for e-commerce retailers. We are evaluating your E-Commerce Scraper API for collecting product price and availability data from marketplaces including Amazon, eBay, and Walmart.
>
> Before proceeding, we would like to confirm whether your subscription terms permit the following downstream use:
>
> 1. Retaining timestamped historical price observations in our database
> 2. Generating derived analytics, comparisons, and alerts from collected data
> 3. Displaying collected observations and analytics to multiple authenticated retailer customers (multi-tenant SaaS)
> 4. Using collected data for competitor-price monitoring on behalf of our customers
>
> If this use requires a specific plan tier or additional written authorization, please let us know the requirements.
>
> We would also appreciate clarification on the free trial terms — specifically whether the 2,000 free results are subject to the same downstream-use permissions.
>
> Best regards,  
> Shewon  
> Riven project team

---

*This document is a living record. Update status and checkboxes as applications progress. Do not mark any route as approved until written confirmation is received and terms are reviewed.*
