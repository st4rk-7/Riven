# Product

## Platform

web

## Users

Small e-commerce retailers of any kind, not tied to one marketplace. Today they check competitor prices and stock by hand. Each retailer works in their own private workspace. Retailers make their own pricing decisions; Riven informs them and never reprices automatically.

Other audiences: an administrator who oversees the service (planned, Sprint 5), the client (a senior student), and course mentors/evaluators at the University of Ruhuna (EC5406) who review each sprint demo.

## Product Purpose

Riven lets a retailer see competitor prices, availability and changes for their products in one place, with the source and collection time of every value. Success: a retailer signs in, picks a product, and sees trustworthy competitor offers and price history without visiting each site.

## Positioning

- **Honest data.** Riven shows uncertainty instead of guessing: unverified matches, missing prices, unknown stock, stale data and failed collections are all visible. Missing price is never zero; unknown stock is never out of stock.
- **Lists competitors for you.** The retailer picks a product and Riven lists competitor offers automatically; no manual competitor setup (client decision, 10 Oct 2026).
- **Collects from what the retailer views.** A Riven browser extension reads the product page the retailer is looking at, with no proxies or scraping tricks. Server-side collection is used only for sites that permit it.
- **Affordable for small shops** that cannot pay established tools' monthly prices (e.g. Prisync from $99/month).

## Operating Context

- The retailer uses the Riven web dashboard and the Riven Chrome extension side by side: browse a marketplace product page, send it to Riven, then compare offers in the dashboard.
- Amazon UK is the first source; a second marketplace and scheduled collection are planned for Sprint 2.
- Prices depend on the visitor's delivery location; Amazon shows local currency unless the delivery location is in the UK.

## Capabilities and Constraints

Delivered (Sprint 1, Oct 2026): sign-in/out with per-retailer data separation; PostgreSQL storage; extension collection of Amazon UK offers; product matching (identifier first, conflict check, title-only stays unverified, retailer confirms or rejects); every collection attempt recorded; four screens — sign-in, product search, competitor offers, product detail with price history.

Planned final scope (not yet built): scheduled collection, second source, comparisons and history, alerts, subscription tiers with mock billing, administration.

Constraints:
- Not a shopping search engine and not an automatic repricing system.
- No mobile app (client decision, 10 Oct 2026); the web app must still work on narrow screens.
- No bypassing of site access controls; blocked collection is recorded as blocked.
- Undecided: second marketplace; tier limits and pricing.

Terminology: **product** (what the retailer tracks), **offer/listing** (a competitor's listing), **observation** (values actually collected), **attempt** (one try at collecting, successful or not), **match status** (`confirmed`, `unverified`, `mismatch`).

## Brand Commitments

- Name: Riven.
- Binding visual direction chosen by the team lead (25 Oct 2026, replaces the 10 Oct Cal.com direction): the whole product matches the public landing page (`web/landing/`, live at https://riven.sbs). Colours only blue `#0b75fe`, deep blue `#095fdf`, faded blue `#ace6fd`, mist blue `#e1f4fd`, black `#0c0c0c` and white; Inter with tight tracking for text, Geist Mono for small labels; rounded cards, thin dividers, pill status chips. App screens keep motion subtle (hover, short fades) and respect reduced motion. Reference sites are for inspiration only: no copied logos, copy or assets.
- Logo: the blue LED-style mark in `web/public/icon.png`.

## Evidence on Hand

- Real collected Amazon UK offers from extension testing (development data only).
- Sample products, offers and price history in `web/data.ts`, always labelled "Sample data" in the UI.
- No customers, testimonials, pricing, benchmarks or hosted deployment exist. Do not fabricate them.

## Product Principles

1. Never show a guess as a fact; uncertainty and failure are first-class states.
2. Every value carries its source, currency and collection time.
3. The retailer stays in control: Riven informs, the retailer decides prices and confirms matches.
4. One retailer never sees another retailer's data.
5. Small and understandable over impressive: build what the client needs now.

## Accessibility & Inclusion

Every task works with the keyboard alone; text has readable contrast; buttons and fields have clear labels; loading, empty, error, unknown, unverified and stale states are visually distinct. No formal WCAG audit is required unless the course or client asks.
