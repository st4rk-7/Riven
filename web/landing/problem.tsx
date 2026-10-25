import { useRef } from "react";
import { useReveal } from "./use-reveal";

// Problem statement: one blunt two-line headline (Auxia-style line tilt), then three pains on hairlines.
const lines = ["Checking prices by hand", "doesn't scale."];
// Width of the longest line ÷ font size (Inter 600, -0.06em tracking). Both lines share one size,
// set so the longest line fills the full width. Re-measure if the wording, font or tracking changes.
const LONGEST_EM = 10.6;
const pains = [
  { n: "01", title: "Tabs everywhere", text: "Twenty competitor pages open, copied into a spreadsheet that's outdated by tomorrow." },
  { n: "02", title: "Changes you miss", text: "A rival drops their price on Friday night. You find out on Monday, after the sales are gone." },
  { n: "03", title: "Guesswork pricing", text: "Without history you can't see patterns, so every price change is a gamble." },
];

export function Problem() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="problem" data-enter className="enter-sheet relative overflow-hidden bg-[var(--riven-black)] px-9 py-40 text-white">
      <div data-pass className="glow-bridge pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" aria-hidden />
      <div className="relative mx-auto max-w-[1232px]">
        <p className="mb-8 text-center font-mono text-xs uppercase tracking-normal text-[var(--riven-blue-faded)]">[01] · The problem</p>
        {/* Lyniq-style big headline: breaks out to the full screen width, both lines one size, the longest
            line filling the width (100cqw ÷ its em width). It zooms 130% → 100% over ~1.3 screens of scroll.
            data-zoom sits on the unscaled wrapper so the scale never feeds back into the measurement. */}
        <div
          data-zoom
          className="relative left-1/2 w-[calc(100vw-40px)] -translate-x-1/2 [container-type:inline-size] md:w-[calc(100vw-72px)]"
        >
          <h2
            data-observe
            className="zoom-settle text-center font-semibold leading-[0.94] tracking-[-0.06em] whitespace-nowrap"
            style={{ fontSize: `calc(100cqw / ${LONGEST_EM} * 0.96)` }}
            aria-label={lines.join(" ")}
          >
            {lines.map((line, i) => (
              <span key={line} className="tl-mask block" aria-hidden>
                <span className={`tl-line block ${i === lines.length - 1 ? "text-white/40" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
        </div>

        <ol className="mt-32 grid gap-10 md:grid-cols-3 md:gap-5">
          {pains.map((p, i) => (
            <li
              key={p.n}
              data-observe
              className="hiw-rise border-t border-white/15 pt-6"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span className="font-mono text-xs tracking-normal text-[var(--riven-blue)]">{p.n}</span>
              <h3 className="mt-6 text-[26px] font-semibold leading-[1.3] tracking-[-0.04em]">{p.title}</h3>
              <p className="mt-3 max-w-[340px] text-[15px] leading-[1.4] text-white/60">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
