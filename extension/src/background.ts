import { parseAmazonProductPage } from "../../server/sources/amazon.js";
import { isAllowedPage, recordFailedAttempt, sendOffer } from "./send.js";

// "Fetch" from the Riven website: open the offer's Amazon page in a background tab, read it like the
// popup does, send it to Riven, then close the tab. Only Riven's own pages can ask (externally_connectable).
export type FetchReply = { ok: true; price: string | null; currency: string | null } | { ok: false; error: string };

const READ_TIMEOUT_MS = 30_000;
const POLL_MS = 800;

// Amazon pages keep loading ads and trackers long after the product is on screen, so the tab may never
// report "complete". Read the page as soon as the product title exists and the HTML has been parsed.
async function readWhenReady(tabId: number): Promise<string> {
  const deadline = Date.now() + READ_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => (document.readyState !== "loading" && document.querySelector("#productTitle") ? document.documentElement.outerHTML : null),
      });
      if (typeof injection?.result === "string") return injection.result;
    } catch {
      // The new page has not committed yet; try again shortly.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error("The Amazon page did not show a product within 30 seconds.");
}

async function fetchOffer(url: string): Promise<FetchReply> {
  if (!isAllowedPage(url)) return { ok: false, error: "Riven can only fetch Amazon product pages." };
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    const html = await readWhenReady(tab.id!);
    let offer;
    try {
      offer = parseAmazonProductPage(html);
    } catch (error) {
      const reason = (error as Error).message;
      await recordFailedAttempt(url, reason);
      return { ok: false, error: reason };
    }
    await sendOffer(offer, url);
    return { ok: true, price: offer.price, currency: offer.currency };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  } finally {
    await chrome.tabs.remove(tab.id!).catch(() => undefined);
  }
}

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fetch-offer" || typeof message.url !== "string") return false;
  void fetchOffer(message.url).then(sendResponse);
  return true; // keeps the reply channel open for the async answer
});
