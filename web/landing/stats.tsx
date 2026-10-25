import { useEffect, useRef } from "react";
import { useReveal } from "./use-reveal";

// Lyniq-style stats row: label + link left, statement right, then big numbers on hairlines.
// Every figure is true by design (PRODUCT.md forbids invented usage numbers).
const words = "Built for small shops, honest about every price.".split(" ");
const stats = [
  { value: 1, suffix: " click", title: "To send a product", text: "Straight from the product page you're viewing." },
  { value: 0, suffix: "", from: 20, title: "Competitors to set up", text: "Riven lists the offers for you." },
  { value: 100, suffix: "%", title: "Prices with a source", text: "Each one shows where and when it was collected." },
  { value: 99, prefix: "$", suffix: "", title: "What big tools charge", text: "Established tools start around $99 a month. Riven is for shops that can't pay that." },
];

export function Stats() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useEffect(() => {
    const els = [...(root.current?.querySelectorAll<HTMLElement>("[data-count]") ?? [])];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Count each number from its start value to its target once it scrolls into view.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const el = e.target as HTMLElement;
          const to = Number(el.dataset.count), from = Number(el.dataset.from ?? 0);
          const start = performance.now(), dur = 1400;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(from + (to - from) * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          el.textContent = String(from);
          requestAnimationFrame(tick);
        }),
      { threshold: 0.5 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} id="stats" className="bg-[var(--riven-white)] px-5 pt-16 pb-40 text-[var(--riven-black)] md:px-9">
      <div className="mx-auto max-w-[1232px] border-t border-black/10 pt-16">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-normal text-[var(--riven-blue)]">[03] · In numbers</p>
            <a href="#how-it-works" className="arrow-link w-fit text-sm">↳ See how it works</a>
          </div>
          <h2
            data-words
            className="text-[clamp(32px,3.4vw,46px)] font-semibold leading-[1.05] tracking-[-0.06em]"
            style={{ "--n": words.length } as React.CSSProperties}
          >
            {words.map((w, i) => (
              <span key={i} className="word-hl" style={{ "--i": i } as React.CSSProperties}>
                {w}{" "}
              </span>
            ))}
          </h2>
        </div>

        <ol className="mt-24 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <li key={s.title} data-observe className="hiw-rise" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="pb-6 text-[clamp(64px,7vw,104px)] font-medium leading-none tracking-[-0.07em] tabular-nums">
                {s.prefix}
                <span data-count={s.value} data-from={s.from}>
                  {s.value}
                </span>
                <span className="text-[0.4em] tracking-[-0.04em] text-black/40">{s.suffix}</span>
              </p>
              <div className="border-t border-black/10 pt-6">
                <h3 className="text-xl font-semibold tracking-[-0.04em]">{s.title}</h3>
                <p className="mt-2 max-w-[260px] text-sm leading-[1.4] text-black/60">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
