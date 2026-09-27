# Requirements

**Updated:** 27 September 2026

**Status:** Draft for client review. Numerical targets and unresolved operating rules are proposals, not approved commitments.

The [project overview](project-overview.md) defines the objective and boundaries. Requirement IDs below preserve the supplied Stage 2 document. The [product backlog](product-backlog.md) maps work to these requirements.

## Functional requirements

| ID | Requirement |
| --- | --- |
| FR-01 | **User accounts.** Retailers shall sign in and out and access their own tenant account. The administrator shall have a separate role. |
| FR-02 | **Product management.** Retailers shall add, view, update and remove tracked products within their subscription limits. |
| FR-03 | **Competitor listings.** Retailers shall associate competitor listings with tracked products on two agreed source platforms. Platforms and listing input method require confirmation. |
| FR-04 | **Product matching.** The system shall check that a listing represents the intended product and variant and flag uncertain matches for review. |
| FR-05 | **Periodic collection.** Background workers shall collect price, stock availability and available offers at configured intervals. Supported intervals require confirmation. |
| FR-06 | **Historical records.** Observations shall retain the product, competitor, source, currency and collection time, including earlier observations for comparison. |
| FR-07 | **Retailer dashboard.** Retailers shall view comparisons in tables and historical trends in charts, including the last successful collection time. |
| FR-08 | **Alerts.** Retailers shall configure monitoring conditions and receive notifications when conditions are met. Initial conditions and the notification channel require confirmation. |
| FR-09 | **Subscription tiers.** The system shall support configurable tiers and enforce agreed tracking limits. Mock billing is acceptable; the tier-management actor and billing behaviour require confirmation. |
| FR-10 | **Administration.** The administrator shall oversee tenants, tracked products, collection failures and resource usage. Required metrics require confirmation. |
| FR-11 | **Collection status.** The system shall record collection failures and distinguish outdated or unavailable observations from successfully collected data. |

## Non-functional requirements

| ID | Requirement and validation |
| --- | --- |
| NFR-01 | **Security and tenant isolation.** Require authentication and role checks. A retailer must not read or change another tenant's data. Reject cross-tenant and unauthorised-role requests in tests. Securely hash passwords if stored locally; use HTTPS for deployed traffic. |
| NFR-02 | **Reliability.** A failed collection job must not stop unrelated jobs or dashboard access. Use bounded retries and record final status. Simulate a source failure and verify other jobs continue. |
| NFR-03 | **Performance.** Run collection in background workers. Proposed target: main dashboard pages load within three seconds for ten simultaneous users at agreed tracking limits in a documented test environment. Agree the measurement method before acceptance testing. |
| NFR-04 | **Data freshness.** Show collection time and mark observations stale after an agreed limit. Agree and test monitoring intervals, freshness limits and maximum alert delay. |
| NFR-05 | **Data accuracy.** Compare price, currency, variant and stock state against manually verified samples from each source. Missing data must not become zero price or an out-of-stock result. Agree sample size and required accuracy. |
| NFR-06 | **Usability.** Support adding a product, linking a competitor, viewing comparisons and configuring alerts with clear screens and validation messages. Validate these tasks in a client walkthrough. |
| NFR-07 | **Maintainability.** Separate source collection and notification logic into modules. Use version control, agreed coding standards and automated checks for critical behaviour. Changes to one source must pass regression checks for the other. |
| NFR-08 | **Recovery.** Document backup and restore procedures and verify restoration from a test backup. Agree backup frequency and acceptable data loss. |

## Constraints and decisions to resolve

Delivery involves four students and six sprints. The [roadmap](roadmap.md) contains the module windows. All decisions below are currently **open**; record the agreed answer, date and affected requirement IDs when resolved.

| Decision | What needs agreement | Needed for |
| --- | --- | --- |
| Source access | Two platforms, regions, categories, access method and reliable repeated access; confirm a supported alternative if necessary | FR-03–05; source probe in Sprint 1 |
| First journey | First source, sample listings, input method, required fields, matching rules and initial collection trigger | Sprint 1 acceptance |
| Tracking limits | Products per tenant and competitors per product; five products and two or three competitors are suggestions only | FR-02, FR-09; initial limits in Sprint 1 |
| Observation rules | Currency comparison, variant equivalence, available offers and stock availability versus stock quantity | FR-04–07; NFR-05 |
| Collection and freshness | Intervals, stale threshold, retry limits and retention needs | FR-05–06, FR-11; NFR-02, NFR-04 |
| Alerts | Conditions, first channel, acceptable delay and duplicate handling | FR-08; NFR-04 |
| Service tiers | Who configures tiers, enforced allowances, tier changes and mock billing behaviour | FR-09 |
| Administration | Tenant controls, collection visibility and resource metrics | FR-10 |
| Quality targets | Performance measurement, accuracy sample/threshold, usability checks and backup recovery targets | NFR-03–08 |
| Resources | Technology stack, hosting, operating budget and team availability | Architecture and sprint capacity |
| Retailer price changes | Whether recording a retailer's own price changes is required; automated repricing remains outside established scope | Scope review |

Resolve decisions before their dependent implementation is committed. Later features do not need every detail fixed before Sprint 1 starts.

## Scope control

Custom local-store integrations, affiliate marketing, predictive AI and public shopper comparison remain outside the initial core. Log new requests in the backlog, assess their cost and effect on the six-sprint forecast, and record the client's scope decision. Do not silently replace agreed real-source collection with mock data.
