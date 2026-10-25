import { useRef, type CSSProperties, type ReactNode } from "react";
import { SectionTitle } from "./section-title";
import { useReveal } from "./use-reveal";

// Lyniq-style bento: mixed-size cards with product UI inside. Delivered features only,
// planned ones carry a "Coming soon" badge (PRODUCT.md, Sprint 1 scope).
const at = (i: number) => ({ style: { "--i": i } as CSSProperties });

function Card({ span, i, className, children }: { span: string; i: number; className: string; children: ReactNode }) {
  // Outer div owns the staggered reveal; inner div owns the hover lift, so hover never waits on the delay.
  return (
    <div data-observe className={`hiw-rise ${span}`} style={{ transitionDelay: `${i * 80}ms` }}>
      <div data-enter className={`wipe card-lift flex h-full flex-col overflow-hidden rounded-3xl p-8 ${className}`}>{children}</div>
    </div>
  );
}

function CardText({ title, text, muted }: { title: string; text: string; muted: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.04em]">{title}</h3>
      <p className={`mt-2 max-w-[380px] text-[15px] leading-[1.45] ${muted}`}>{text}</p>
    </div>
  );
}

export function Features() {
  const root = useRef<HTMLElement>(null);
  useReveal(root, 0.2);

  return (
    <section ref={root} id="features" className="bg-[var(--riven-white)] px-5 py-32 text-[var(--riven-black)] md:px-9 md:py-40">
      <div className="mx-auto max-w-[1232px]">
        <SectionTitle label="[04] · Features" lines={["Everything you need", "to price with confidence."]} />

        <div className="mt-20 grid gap-5 md:grid-cols-6">
          <Card span="md:col-span-4" i={0} className="bg-[var(--riven-black)] text-white">
            <CardText title="Every offer in one place" text="See each competitor's price and stock side by side, without visiting each site." muted="text-white/60" />
            <div className="mt-auto">
              {[
                ["Seller A", "£47.50", "In stock"],
                ["Seller B", "£49.99", "Out of stock"],
                ["Seller C", "Price missing", "Stock unknown"],
              ].map(([seller, price, stock], i) => (
                <div key={seller} {...at(i)} className="hiw-item flex items-center justify-between gap-3 border-t border-white/10 py-3 text-sm">
                  <span>{seller}</span>
                  <span className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                    <span className={price.startsWith("£") ? "" : "italic text-white/50"}>{price}</span>
                    <span className="w-24 text-right text-white/50">{stock}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card span="md:col-span-2" i={1} className="bg-[var(--riven-blue-mist)]">
            <CardText title="Honest about gaps" text="Riven never fills a gap with a guess." muted="text-black/60" />
            <div className="mt-auto flex flex-wrap gap-2">
              {["Unverified match", "Price missing", "Stock unknown", "Stale data", "Collection blocked"].map((t, i) => (
                <span key={t} {...at(i)} className="hiw-item rounded-full border border-dashed border-black/30 px-3 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </Card>

          <Card span="md:col-span-2" i={2} className="bg-[var(--riven-blue)] text-white">
            <CardText title="Chrome extension" text="Send the product page you're viewing in one click." muted="text-white/75" />
            <div className="mt-auto rounded-2xl bg-white/10 p-4">
              <p {...at(0)} className="hiw-item text-sm">Wireless Earbuds Pro</p>
              <p {...at(1)} className="hiw-item mt-1 text-xs text-white/70">£49.99 · amazon.co.uk</p>
              <div {...at(2)} className="hiw-item pulse mt-4 rounded-lg bg-white py-2.5 text-center text-sm text-[var(--riven-blue)]">
                Send to Riven
              </div>
            </div>
          </Card>

          <Card span="md:col-span-4" i={3} className="border border-black/10 bg-[var(--riven-white)]">
            <CardText title="Price history" text="Watch how each competitor's price moves, with the source and time of every value." muted="text-black/60" />
            <svg viewBox="0 0 600 140" className="mt-auto h-36 w-full overflow-visible" aria-hidden>
              <path d="M0 120 H600 M0 70 H600 M0 20 H600" stroke="rgba(0,0,0,0.06)" />
              <path className="hiw-line" pathLength={1} d="M0 60 L80 58 L160 64 L240 50 L320 52 L400 88 L480 92 L600 100" fill="none" stroke="var(--riven-blue)" strokeWidth="2.5" strokeLinejoin="round" />
              <path className="hiw-line" pathLength={1} d="M0 40 L80 42 L160 40 L240 44 L320 44 L400 46 L480 70 L600 72" fill="none" stroke="var(--riven-blue-faded)" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <p {...at(2)} className="hiw-item mt-3 font-mono text-[11px] tracking-normal text-black/40">as of 24 Oct, 09:14 · amazon.co.uk · GBP · sample data</p>
          </Card>

          <Card span="md:col-span-3" i={4} className="border border-black/10 bg-[var(--riven-white)]">
            <CardText title="Your own private workspace" text="Each retailer signs in to their own workspace. No other shop sees your products or prices." muted="text-black/60" />
            <div className="mt-auto flex flex-col gap-2 text-sm">
              <span {...at(0)} className="hiw-item flex items-center justify-between rounded-xl bg-[var(--riven-blue)] px-4 py-3 text-white">
                Your shop <span className="text-xs text-white/70">12 products</span>
              </span>
              <span {...at(1)} className="hiw-item flex items-center justify-between rounded-xl border border-dashed border-black/20 px-4 py-3 text-black/40">
                Other shops <span className="text-xs">No access</span>
              </span>
            </div>
          </Card>

          <Card span="md:col-span-3" i={5} className="bg-[var(--riven-black)] text-white">
            <span className="mb-6 w-fit rounded-full border border-white/20 px-3 py-1 font-mono text-[11px] uppercase tracking-normal text-[var(--riven-blue-faded)]">
              Coming soon
            </span>
            <CardText title="Alerts and scheduled checks" text="Automatic collection on a schedule, and alerts when a competitor's price changes, are planned for upcoming releases." muted="text-white/60" />
          </Card>
        </div>
      </div>
    </section>
  );
}
