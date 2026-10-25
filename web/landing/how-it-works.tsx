import { useEffect, useRef } from "react";
import { useReveal } from "./use-reveal";

// Motion: Auxia-style scroll-drawn spine — each step lights up when the fill reaches it, then its
// tag blurs in, copy fades and the card's rows stagger in. Heading uses the Lyniq word rise.
// Copy follows Riven's delivered Sprint 1 scope (PRODUCT.md): no alerts or scheduled checks claimed.
const steps = [
  { tag: "Send a product", text: "Open a product page and click the Riven extension. It reads the title, price and stock from the page you're viewing." },
  { tag: "See competitor offers", text: "Riven lists other sellers' offers for the same product. No manual competitor setup." },
  { tag: "Check every match", text: "Identifier matches are confirmed. Title-only matches stay unverified until you confirm or reject them." },
  { tag: "Follow the history", text: "Every price keeps its source, currency and collection time, so you see what changed and when." },
];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useReveal(root);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-step]")];
    // Spine fill head sits at 60% of the viewport; a step activates once the head passes its node.
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      el.style.setProperty("--p", p.toFixed(4));
      const head = p * r.height;
      for (const li of items) {
        const node = li.querySelector<HTMLElement>(".hiw-node");
        if (!node) continue;
        const nodeY = node.getBoundingClientRect().top + node.offsetHeight / 2 - r.top;
        const on = head >= nodeY;
        li.toggleAttribute("data-active", on);
        if (on) li.setAttribute("data-in", ""); // content reveal is one-way
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={root} id="how-it-works" className="bg-[var(--riven-white)] px-5 py-32 text-[var(--riven-black)] md:px-9 md:py-40">
      <div className="mx-auto max-w-[1232px]">
        <p className="mb-6 font-mono text-xs uppercase tracking-normal text-[var(--riven-blue)]">[02] · How it works</p>
        <h2 data-observe className="max-w-[900px] text-[clamp(48px,7.2vw,104px)] font-semibold leading-[0.96] tracking-[-0.07em]">
          {"Four steps to every price".split(" ").map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="hiw-word inline-block" style={{ "--i": i } as React.CSSProperties}>
                {w}&nbsp;
              </span>
            </span>
          ))}
        </h2>
        <p data-observe className="hiw-rise mt-8 max-w-[520px] text-base text-black/60">
          From the product page you&apos;re viewing to a clear view of the market. Riven informs; you decide your prices.
        </p>

        <div ref={track} className="relative mt-24 md:mt-32" style={{ "--p": 0 } as React.CSSProperties}>
          {/* Spine: faded track, blue fill drawn by scroll, glowing head at the fill's end */}
          <div className="absolute inset-y-0 left-[5px] w-[2px] bg-[var(--riven-blue-mist)] md:left-1/2 md:-translate-x-1/2" aria-hidden>
            <div className="hiw-fill h-full w-full bg-[var(--riven-blue)]" />
            <span className="hiw-head absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--riven-blue)]" />
          </div>

          <ol className="flex flex-col gap-24 md:gap-40">
            {steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <li key={s.tag} data-step className="relative grid grid-cols-1 gap-8 pl-10 md:grid-cols-2 md:items-center md:gap-x-32 md:pl-0">
                  <span
                    className="hiw-node absolute left-[6px] top-[18px] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--riven-blue-mist)] bg-[var(--riven-white)] md:left-1/2 md:top-1/2"
                    aria-hidden
                  />

                  <div className={`relative flex flex-col items-start gap-4 ${right ? "md:order-2" : "md:items-end md:text-right"}`}>
                    {/* Branch from the spine to the tag (desktop only) */}
                    <span
                      className={`hiw-branch absolute top-[18px] hidden h-[2px] w-16 bg-[var(--riven-blue)] md:block ${right ? "-left-16 origin-left" : "-right-16 origin-right"}`}
                      aria-hidden
                    />
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--riven-blue)] px-5 py-2 text-sm text-white">
                      <span className="font-mono text-xs tracking-normal opacity-70">0{i + 1}</span>
                      <span aria-label={s.tag}>
                        {[...s.tag].map((c, j) => (
                          <span key={j} aria-hidden className="hiw-char inline-block" style={{ "--i": j } as React.CSSProperties}>
                            {c === " " ? " " : c}
                          </span>
                        ))}
                      </span>
                    </span>
                    <p className="hiw-copy max-w-[340px] text-[15px] leading-[1.45] text-black/60">{s.text}</p>
                  </div>

                  <div className={`hiw-card ${right ? "md:order-1" : ""}`}>
                    <StepCard index={i} />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

const shell = "rounded-2xl bg-[var(--riven-black)] p-6 text-white shadow-[0_30px_60px_-30px_rgba(11,117,254,0.45)]";
// stagger index for .hiw-item rows inside a card
const item = (i: number) => ({ style: { "--i": i } as React.CSSProperties });
const chip = "rounded-full px-2.5 py-0.5 text-[11px] tracking-normal";

// Sample data only, labelled as such, in line with the product's "never fabricate" rule.
function StepCard({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className={shell}>
        <div {...item(0)} className="hiw-item mb-5 flex items-center justify-between text-xs text-white/50">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--riven-blue)]" /> Riven extension
          </span>
          <span>amazon.co.uk</span>
        </div>
        <div {...item(1)} className="hiw-item rounded-xl border border-white/10 p-4">
          <p className="text-sm">Wireless Earbuds Pro</p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-[var(--riven-blue-faded)]">£49.99</span>
            <span className={`${chip} bg-white/10 text-white/70`}>In stock</span>
          </div>
        </div>
        <div {...item(2)} className="hiw-item mt-4 rounded-lg bg-[var(--riven-blue)] py-3 text-center text-sm">
          Send to Riven
        </div>
      </div>
    );

  if (index === 1)
    return (
      <div className={shell}>
        <p {...item(0)} className="hiw-item mb-4 text-xs text-white/50">Competitor offers · 3 found · sample data</p>
        {[
          { seller: "Seller A", price: "£47.50", stock: "In stock", tone: "text-[var(--riven-blue-faded)]" },
          { seller: "Seller B", price: "£49.99", stock: "Out of stock", tone: "text-white/50" },
          { seller: "Seller C", price: "Price missing", stock: "Stock unknown", tone: "text-white/50 border border-dashed border-white/30" },
        ].map((o, i) => (
          <div key={o.seller} {...item(i + 1)} className="hiw-item flex items-center justify-between gap-3 border-t border-white/10 py-3 text-sm">
            <span className="shrink-0">{o.seller}</span>
            <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
              <span className={o.price.startsWith("£") ? "" : "text-white/50 italic"}>{o.price}</span>
              <span className={`${chip} ${o.tone}`}>{o.stock}</span>
            </span>
          </div>
        ))}
      </div>
    );

  if (index === 2)
    return (
      <div className={shell}>
        <p {...item(0)} className="hiw-item mb-4 text-xs text-white/50">Match check</p>
        <div {...item(1)} className="hiw-item flex items-center justify-between border-t border-white/10 py-3 text-sm">
          <span>
            Seller A <span className="text-white/40">· identifier match</span>
          </span>
          <span className={`${chip} bg-[var(--riven-blue)]`}>Confirmed</span>
        </div>
        <div {...item(2)} className="hiw-item border-t border-white/10 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span>
              Seller C <span className="text-white/40">· title only</span>
            </span>
            <span className={`${chip} border border-white/30 text-white/70`}>Unverified</span>
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="rounded-md bg-white px-3 py-1.5 text-[var(--riven-black)]">Confirm</span>
            <span className="rounded-md border border-white/20 px-3 py-1.5 text-white/70">Reject</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className={shell}>
      <div {...item(0)} className="hiw-item mb-4 flex items-baseline justify-between">
        <span className="text-xs text-white/50">Seller A · price history</span>
        <span className="text-sm text-[var(--riven-blue-faded)]">£47.50</span>
      </div>
      <svg viewBox="0 0 300 100" className="h-32 w-full overflow-visible" aria-hidden>
        <path d="M0 80 H300 M0 50 H300 M0 20 H300" stroke="rgba(255,255,255,0.08)" />
        <path
          className="hiw-line"
          pathLength={1}
          d="M0 40 L50 38 L100 42 L150 36 L200 58 L250 60 L300 66"
          fill="none"
          stroke="var(--riven-blue)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <p {...item(1)} className="hiw-item mt-3 font-mono text-[11px] tracking-normal text-white/40">
        as of 24 Oct, 09:14 · amazon.co.uk · GBP
      </p>
    </div>
  );
}
