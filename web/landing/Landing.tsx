import { Compare } from "./compare";
import { Faq } from "./faq";
import { Features } from "./features";
import { HowItWorks } from "./how-it-works";
import { Principles } from "./principles";
import { Problem } from "./problem";
import { SectionMotion } from "./section-motion";
import { SiteFooter } from "./site-footer";
import { Stats } from "./stats";

// Public landing page at "/". The app (sign-in and dashboard) lives at /app.
const lines = ["Watch", "every price"];
// Delivered features only (PRODUCT.md, Sprint 1 scope).
const highlights = ["Competitor offers", "Price history", "Match checks", "Chrome extension"];

export function Landing() {
  return (
    <main className="riven-landing">
      {/* Hero stays pinned; everything after it slides over it */}
      <section className="sticky top-0 h-screen overflow-hidden bg-[var(--riven-black)] text-white">
        <div data-leave className="hero-leave absolute inset-0">
          {/* Blurred colour field that brightens in */}
          <div className="intro-bg absolute inset-0" aria-hidden />

          <header className="intro-chrome absolute inset-x-0 top-0 grid grid-cols-[1fr_auto_1fr] items-center px-5 py-5 md:px-9">
            <span className="text-[26px] font-bold leading-none tracking-[-0.06em]">Riven</span>
            <nav className="hidden gap-[clamp(48px,12vw,180px)] text-sm font-bold uppercase leading-[1.2] tracking-[-0.05em] md:flex">
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </nav>
            <a
              href="/app"
              className="col-start-3 justify-self-end text-[26px] font-bold uppercase leading-none tracking-[-0.06em] transition-colors hover:text-[var(--riven-blue-faded)]"
            >
              Sign in
            </a>
          </header>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-6 md:px-9">
            <ul className="intro-chrome mb-6 ml-auto w-fit text-right text-sm font-medium leading-snug">
              {highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <h1 className="text-[clamp(64px,13vw,200px)] font-bold leading-[0.9] tracking-[-0.06em]">
              {lines.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span className="intro-line block" style={{ animationDelay: `calc(var(--pre) + ${0.9 + i * 0.15}s)` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
          </div>
        </div>
      </section>

      {/* relative + z-10 so the content paints over the pinned hero */}
      <div className="relative z-10">
        <Problem />
        {/* white backdrop shows around the dark blocks while they are still scaled down */}
        <div className="bg-[var(--riven-white)]">
          <HowItWorks />
          <Stats />
          <Features />
          <Compare />
          <Principles />
          <Faq />
          <SiteFooter />
        </div>
      </div>
      <SectionMotion />

      {/* Preloader: blue screen with the brand typed in, split into halves that slide apart.
          Each half holds a full-height copy of the brand, offset so the word is cut along the seam. */}
      {(["top", "bottom"] as const).map((half) => (
        <div
          key={half}
          data-half={half}
          aria-hidden
          className={`pre-half fixed inset-x-0 z-50 h-1/2 overflow-hidden bg-[var(--riven-blue)] text-white ${half === "top" ? "top-0" : "bottom-0"}`}
        >
          <div className={`absolute inset-x-0 flex h-screen items-center justify-center ${half === "top" ? "top-0" : "bottom-0"}`}>
            <span className="flex items-center text-[clamp(56px,12vw,180px)] font-bold tracking-[-0.06em]">
              {[..."Riven"].map((c, i) => (
                <span key={i} className="pre-char" style={{ animationDelay: `${0.25 + i * 0.13}s` }}>
                  {c}
                </span>
              ))}
              <span className="pre-caret" />
            </span>
          </div>
        </div>
      ))}
    </main>
  );
}
