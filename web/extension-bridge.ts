// The Riven Chrome extension's fixed ID (from the "key" in extension/manifest.json).
const RIVEN_EXTENSION_ID = "npehakhmjaahoopfplbjkknaaafcphko";

type ChromeRuntime = {
  sendMessage?: (id: string, message: unknown, callback: (reply: unknown) => void) => void;
  lastError?: { message?: string };
};
type FetchReply = { ok: true; price: string | null } | { ok: false; error: string };

// Asks the extension to read an offer's Amazon page and send it to Riven.
// Resolves to a message for the retailer, or null when a price was saved.
export function fetchWithExtension(url: string): Promise<string | null> {
  // chrome.runtime only exists here when the extension lists this site in externally_connectable.
  const runtime = (globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
  const send = runtime?.sendMessage;
  if (!send) return Promise.resolve("Install the Riven extension in Chrome to fetch prices.");
  return new Promise((resolve) => {
    send(RIVEN_EXTENSION_ID, { type: "fetch-offer", url }, (reply) => {
      if (runtime.lastError || !reply) return resolve("The Riven extension did not answer. Reload it in chrome://extensions and try again.");
      const result = reply as FetchReply;
      if (!result.ok) return resolve(`Fetch failed: ${result.error}`);
      resolve(result.price === null ? "Saved, but Amazon showed no price. Set a UK delivery address on Amazon and fetch again." : null);
    });
  });
}
