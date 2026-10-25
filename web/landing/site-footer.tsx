import { useRef } from "react";
import { DotGrid } from "./dot-grid";
import { useReveal } from "./use-reveal";

// Layout: CTA over an interactive dot grid → full-width wordmark → small print and link columns.
const ctaLines = ["Stop guessing what", "your competitors charge."];
// shortcut: placeholder contact address — confirm a real mailbox exists before relying on it.
const CONTACT_EMAIL = "hello@riven.sbs";
// Only links that go somewhere real; no about/team/terms/privacy pages exist yet.
const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  { title: "App", links: [{ label: "Sign in", href: "/app" }] },
  { title: "Contact", links: [{ label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }] },
];

export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  useReveal(root, 0.2);

  return (
    <footer ref={root} id="contact" data-enter className="enter-card overflow-hidden bg-[var(--riven-blue)] text-white">
      <div className="relative px-9 pt-40 pb-32">
        <DotGrid className="[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />
        <div className="relative mx-auto max-w-[1232px]">
          <h2 data-observe className="text-[clamp(40px,4.4vw,64px)] font-semibold leading-[1] tracking-[-0.06em]" aria-label={ctaLines.join(" ")}>
            {ctaLines.map((line, i) => (
              <span key={line} className="tl-mask block" aria-hidden>
                <span className="tl-line block" style={{ "--i": i } as React.CSSProperties}>
                  {line}
                </span>
              </span>
            ))}
          </h2>
          <div data-observe className="hiw-rise mt-10 flex gap-4 text-base">
            {/* No public sign-up yet (accounts are created for retailers), so the main action is Sign in */}
            <a href="/app" className="rounded-lg bg-white px-6 py-3 text-[var(--riven-black)] transition-colors hover:bg-[var(--riven-blue-mist)]">
              Sign in
            </a>
            <a href="#how-it-works" className="rounded-lg bg-[var(--riven-black)] px-6 py-3 text-white/85 transition-colors hover:text-white">
              See how it works
            </a>
          </div>
        </div>
      </div>

      {/* Full-width wordmark rising into place */}
      <div data-observe className="overflow-hidden px-9" aria-hidden>
        <p className="footer-mark mx-auto max-w-[1232px] text-[clamp(120px,24vw,400px)] font-semibold leading-[0.8] tracking-[-0.075em]">
          Riven
        </p>
      </div>

      <div data-observe className="hiw-rise px-9 pt-24 pb-12">
        <div className="mx-auto grid max-w-[1232px] gap-10 md:grid-cols-[1fr_repeat(3,200px)]">
          <div className="font-mono text-xs uppercase tracking-normal text-white/80">
            <span>© {new Date().getFullYear()} Riven. All rights reserved.</span>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <p className="mb-4 font-mono text-xs uppercase tracking-normal text-white/60">{c.title}</p>
              <ul className="flex flex-col gap-2 text-xl tracking-[-0.04em]">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="footer-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
