# Product

## Platform

web

## Users

Small e-commerce retailers of any kind, not tied to one marketplace. Today they check competitor prices and stock by hand. Each retailer works in their own private workspace. Retailers make their own pricing decisions; Riven informs them and never reprices automatically.

Other audiences: an administrator who oversees the service (planned), and the client and evaluators who review each sprint demo.

## Product Purpose

Riven lets a retailer see competitor prices, availability and changes for their products in one place, with the source and collection time of every value. Success: a retailer signs in, picks a product, and sees trustworthy competitor offers and price history without visiting each site.

## Positioning

- **Honest data.** Riven shows uncertainty instead of guessing: unverified matches, missing prices, unknown stock, stale data and failed collections are all visible. Missing price is never zero; unknown stock is never out of stock.
- **Lists competitors for you.** The retailer picks a product and Riven lists competitor offers automatically; no manual competitor setup (client decision, 10 Oct 2026).
- **Collects from what the retailer views.** A Riven browser extension sends the product page the retailer is looking at. A server crawler checks sites that accept server requests.
- **Affordable for small shops** that cannot pay the monthly prices of established competitor-tracking tools.

## Operating Context

- The retailer uses the Riven web dashboard and the Riven Chrome extension side by side: browse a marketplace product page, send it to Riven, then compare offers in the dashboard.
- Amazon is the first source; the marketplace region is set per deployment. A second marketplace is planned but not chosen.
- Prices depend on the visitor's delivery location; Amazon shows local currency unless the delivery location is in the UK.

## Capabilities and Constraints

What is built and what is planned, requirement by requirement: [SRS](docs/requirements.md), section 3.

Constraints:
- Not a shopping search engine and not an automatic repricing system.
- No mobile app (client decision, 10 Oct 2026); the web app must still work on narrow screens.
- A blocked collection is recorded as blocked.
- Undecided: second marketplace; tier limits and pricing.

Terminology: **product** (what the retailer tracks), **offer/listing** (a competitor's listing), **observation** (values actually collected), **attempt** (one try at collecting, successful or not), **match status** (`confirmed`, `unverified`, `mismatch`).

## Brand Commitments

- Name: Riven.
- Binding visual direction chosen by the team lead (25 Oct 2026): the whole product matches the public landing page (`web/landing/`, live at https://riven.sbs). Colours only blue `#0b75fe`, deep blue `#095fdf`, faded blue `#ace6fd`, mist blue `#e1f4fd`, black `#0c0c0c` and white; Inter with tight tracking for text, Geist Mono for small labels; rounded cards, thin dividers, pill status chips. App screens keep motion subtle (hover, short fades) and respect reduced motion. Reference sites are for inspiration only: no copied logos, copy or assets.
- Logo: the blue LED-style mark in `web/public/icon.png`.

## Evidence on Hand

- Real collected Amazon offers from extension and crawler testing (development data only).
- Sample data on the public landing page only, always labelled as sample data.
- A live deployment at https://riven.sbs.
- No customers, testimonials, pricing or benchmarks exist. Do not fabricate them.

## Product Principles

1. Never show a guess as a fact; uncertainty and failure are first-class states.
2. Every value carries its source, currency and collection time.
3. The retailer stays in control: Riven informs, the retailer decides prices and confirms matches.
4. One retailer never sees another retailer's data.
5. Small and understandable over impressive: build what the client needs now.

## Accessibility & Inclusion

Every task works with the keyboard alone; text has readable contrast; buttons and fields have clear labels; loading, empty, error, unknown, unverified and stale states are visually distinct. No formal WCAG audit is required unless the course or client asks.
