import type { CSSProperties } from "react";

// Mono index label + headline whose lines rise and untilt (tl-line). The last line is dimmed.
// Must sit inside a component that calls useReveal, which sets data-in on the h2.
export function SectionTitle({ label, lines, dark = false }: { label: string; lines: string[]; dark?: boolean }) {
  return (
    <>
      <p className={`mb-8 font-mono text-xs uppercase tracking-normal ${dark ? "text-[var(--riven-blue-faded)]" : "text-[var(--riven-blue)]"}`}>
        {label}
      </p>
      <h2
        data-observe
        className="max-w-[1000px] text-[clamp(40px,6vw,88px)] font-semibold leading-[0.98] tracking-[-0.065em]"
        aria-label={lines.join(" ")}
      >
        {lines.map((line, i) => (
          <span key={line} className="tl-mask block" aria-hidden>
            <span
              className={`tl-line block ${i > 0 && i === lines.length - 1 ? (dark ? "text-white/40" : "text-black/40") : ""}`}
              style={{ "--i": i } as CSSProperties}
            >
              {line}
            </span>
          </span>
        ))}
      </h2>
    </>
  );
}
