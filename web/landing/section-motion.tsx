import { useEffect } from "react";
import Lenis from "lenis";

// Scroll-linked transitions between sections, one listener for the whole page:
// [data-leave] --leave 0→1 over the first viewport of scroll (hero zooms out and fades under the next section)
// [data-enter] --enter 0→1 as its top travels from the viewport bottom to 25% from the top
// [data-pass]  --pass  0→1 over the element's whole trip through the viewport (stretching glow)
// [data-words] --w     0→1 as it rises from 90% to 30% of the viewport (word-by-word highlight)
// [data-zoom]  --z     0→1 over 1.3 viewports from entering (slow headline settle)
// The CSS defaults every variable to the finished state, so reduced motion simply skips all of this.
export function SectionMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Smooth scrolling; native scroll events still fire, so the listeners below keep working.
    const lenis = new Lenis({ autoRaf: true, anchors: true });

    const all = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)];
    const leave = all("[data-leave]"), enter = all("[data-enter]"), pass = all("[data-pass]"), words = all("[data-words]");
    const zoom = all("[data-zoom]");
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      leave.forEach((el) => el.style.setProperty("--leave", clamp(scrollY / vh).toFixed(3)));
      // transform-origin is the top edge, so scaling never moves the top we measure
      enter.forEach((el) => el.style.setProperty("--enter", clamp((vh - el.getBoundingClientRect().top) / (vh * 0.75)).toFixed(3)));
      pass.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--pass", clamp((vh - r.top) / (vh + r.height)).toFixed(3));
      });
      words.forEach((el) => el.style.setProperty("--w", clamp((vh * 0.9 - el.getBoundingClientRect().top) / (vh * 0.6)).toFixed(3)));
      // slow settle: from entering at the bottom until its top is 30% of a screen past the top (Lyniq pace)
      zoom.forEach((el) => el.style.setProperty("--z", clamp((vh - el.getBoundingClientRect().top) / (vh * 1.3)).toFixed(3)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
