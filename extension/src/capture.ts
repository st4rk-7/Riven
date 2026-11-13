// What a page looks like to Riven's extension: the product part to send, a challenge page, or not ready yet.
export type Capture = { html: string } | { blocked: true } | null;

// Runs inside the viewed page through chrome.scripting, so it must not use anything from outside itself.
// Returns only the site rule's sections plus the page's Product JSON-LD, never the header or account area (NFR-12).
export function capturePage(capture: string[], strip: string[], blocked: string): Capture {
  if (new RegExp(blocked, "i").test(document.title + " " + (document.body?.innerText ?? ""))) return { blocked: true };
  if (document.readyState === "loading") return null;

  const sections: Element[] = [];
  // Document order puts an outer section first, so a section inside one already taken is skipped.
  for (const element of document.querySelectorAll(capture.join(","))) {
    if (!sections.some((section) => section.contains(element))) sections.push(element);
  }
  if (!sections.length) return null;

  const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .filter((script) => (script.textContent ?? "").includes("Product"))
    .map((script) => `<script type="application/ld+json">${script.textContent}</script>`);
  const parts = sections.map((section) => {
    const copy = section.cloneNode(true) as Element;
    copy.querySelectorAll(["script", "style", "noscript", "iframe", ...strip].join(",")).forEach((node) => node.remove());
    return copy.outerHTML;
  });
  return { html: `<html><body>${jsonLd.join("")}${parts.join("")}</body></html>` };
}
