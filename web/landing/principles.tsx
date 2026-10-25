import { useRef, useState } from "react";
import { SectionTitle } from "./section-title";
import { useReveal } from "./use-reveal";

// Lyniq-style interactive list: big words, inactive ones dimmed; hover, focus or tap swaps the detail panel.
// Content = Riven's product principles (PRODUCT.md).
const items = [
  { word: "Honest data", text: "Unverified matches, missing prices, unknown stock and failed collections are shown as they are. Riven never shows a guess as a fact.", tag: "Missing price ≠ £0" },
  { word: "Sourced values", text: "Every price carries its source, its currency and the time it was collected.", tag: "as of 09:14 · amazon.co.uk" },
  { word: "You decide", text: "Riven informs; it never reprices for you. You confirm matches and set your own prices.", tag: "Confirm · Reject" },
  { word: "Private by default", text: "Each retailer works in their own workspace. One shop never sees another shop's data.", tag: "Your workspace only" },
];

export function Principles() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useReveal(root, 0.2);
  const item = items[active];

  return (
    <section ref={root} id="principles" className="bg-[var(--riven-white)] px-5 py-32 text-[var(--riven-black)] md:px-9 md:py-40">
      <div className="mx-auto max-w-[1232px]">
        <SectionTitle label="[06] · Principles" lines={["What Riven", "stands for."]} />

        <div data-observe className="hiw-rise mt-20 grid gap-12 md:grid-cols-[3fr_2fr] md:items-start">
          <ul className="flex flex-col">
            {items.map((it, i) => (
              <li key={it.word} className="border-t border-black/10 last:border-b">
                <button
                  type="button"
                  aria-pressed={active === i}
                  aria-controls="principle-detail"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-baseline gap-4 py-4 text-left text-[clamp(36px,5vw,72px)] font-semibold leading-[1.05] tracking-[-0.06em] transition-colors duration-300 ${
                    active === i ? "text-[var(--riven-black)]" : "text-black/15 hover:text-black/30"
                  }`}
                >
                  {it.word}
                  <span className={`font-mono text-sm tracking-normal ${active === i ? "text-[var(--riven-blue)]" : ""}`}>(0{i + 1})</span>
                </button>
              </li>
            ))}
          </ul>

          <div id="principle-detail" aria-live="polite" className="md:sticky md:top-32">
            <div key={active} className="swap-in rounded-3xl bg-[var(--riven-black)] p-8 text-white">
              <span className="font-mono text-xs tracking-normal text-[var(--riven-blue-faded)]">0{active + 1} / 0{items.length}</span>
              <h3 className="mt-6 text-[26px] font-semibold tracking-[-0.04em]">{item.word}</h3>
              <p className="mt-3 text-[15px] leading-[1.5] text-white/65">{item.text}</p>
              <span className="mt-8 inline-block rounded-full bg-[var(--riven-blue)] px-4 py-1.5 font-mono text-xs tracking-normal">{item.tag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
