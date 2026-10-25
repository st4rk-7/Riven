import { useEffect, type RefObject } from "react";

// Reveal once: every [data-observe] inside root gets data-in when it scrolls into view.
export function useReveal(root: RefObject<HTMLElement | null>, threshold = 0.3) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { threshold },
    );
    root.current?.querySelectorAll("[data-observe]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root, threshold]);
}
