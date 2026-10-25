import { useRef, useState } from "react";
import { SectionTitle } from "./section-title";
import { useReveal } from "./use-reveal";

// Accordion, one answer open at a time. Answers follow PRODUCT.md (delivered scope, constraints).
const faqs = [
  ["Which stores does Riven support?", "Amazon UK is the first source. A second marketplace is planned."],
  ["Does Riven change my prices?", "No. Riven shows you competitor prices and history; you decide your own prices."],
  ["How does Riven collect prices?", "The Riven Chrome extension reads the product page you are viewing. Server-side collection is used only for sites that permit it."],
  ["How are competitors found?", "When you send a product, Riven lists other sellers' offers for the same product. You don't set up competitors by hand."],
  ["What happens when a price is missing?", "It's shown as missing. Riven never shows a missing price as zero, or unknown stock as out of stock."],
  ["Can other shops see my data?", "No. Each retailer has a private workspace, and one shop never sees another shop's data."],
  ["Is there a mobile app?", "No, but the web app works on narrow screens."],
];

export function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  useReveal(root, 0.2);

  return (
    <section ref={root} id="faq" className="bg-[var(--riven-white)] px-5 pb-32 text-[var(--riven-black)] md:px-9 md:pb-40">
      <div className="mx-auto grid max-w-[1232px] gap-12 border-t border-black/10 pt-32 md:grid-cols-[2fr_3fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <SectionTitle label="[07] · FAQ" lines={["Questions,", "answered."]} />
        </div>

        <ul data-observe className="hiw-rise">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <li key={q} className="border-t border-black/10 last:border-b">
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left text-[clamp(18px,1.8vw,22px)] font-semibold tracking-[-0.04em] transition-colors hover:text-[var(--riven-blue)]"
                >
                  {q}
                  {/* plus → minus: the vertical bar folds away */}
                  <span className="relative size-4 shrink-0" aria-hidden>
                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-current" />
                    <span className="acc-icon-v absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-current" />
                  </span>
                </button>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="acc-panel" data-open={isOpen || undefined}>
                  <div className="overflow-hidden">
                    <p className="max-w-[560px] pb-6 text-[15px] leading-[1.5] text-black/60">{a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
