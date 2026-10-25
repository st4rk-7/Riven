import { useRef, type CSSProperties } from "react";
import { SectionTitle } from "./section-title";
import { useReveal } from "./use-reveal";

// Old way vs new way: rows stagger in, then the "by hand" side gets struck through one row at a time.
const rows = [
  ["Twenty tabs open, one per competitor", "One dashboard with every offer"],
  ["Prices copied into a spreadsheet", "Prices collected from the page you view"],
  ["Guessing if it's the same product", "Matches confirmed, or flagged as unverified"],
  ["No record of what changed", "History with source and time on every price"],
  ["A missing price looks like zero", "A missing price stays missing"],
];

export function Compare() {
  const root = useRef<HTMLElement>(null);
  useReveal(root, 0.2);

  return (
    <section ref={root} id="compare" data-enter className="enter-card bg-[var(--riven-black)] px-5 py-32 text-white md:px-9 md:py-40">
      <div className="mx-auto max-w-[1232px]">
        <SectionTitle dark label="[05] · Before and after" lines={["Stop copying prices.", "Start comparing them."]} />

        <div data-observe className="mt-20">
          <div className="grid grid-cols-2 gap-6 pb-6 font-mono text-xs uppercase tracking-normal">
            <span className="text-white/40">By hand</span>
            <span className="w-fit rounded-full bg-[var(--riven-blue)] px-3 py-1">With Riven</span>
          </div>
          {rows.map(([before, after], i) => (
            <div
              key={before}
              className="hiw-item grid grid-cols-2 gap-6 border-t border-white/10 py-6 text-[clamp(16px,1.8vw,22px)] leading-[1.3] tracking-[-0.03em]"
              style={{ "--i": i } as CSSProperties}
            >
              <span className="text-white/40">
                <span className="strike">{before}</span>
              </span>
              <span className="flex gap-3">
                <span className="mt-[0.45em] size-2 shrink-0 rounded-full bg-[var(--riven-blue)]" aria-hidden />
                {after}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
