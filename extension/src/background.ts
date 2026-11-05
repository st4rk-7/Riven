import { parseAmazonProductPage } from "../../server/sources/amazon.js";
import { isAllowedPage, recordFailedAttempt, sendOffer } from "./send.js";

// "Fetch" from the Riven website: open the offer's Amazon page in a background tab, read it like the
// popup does, send it to Riven, then close the tab. Only Riven's own pages can ask (externally_connectable).
export type FetchReply = { ok: true; price: string | null; currency: string | null } | { ok: false; error: string };

const LOAD_TIMEOUT_MS = 30_000;

function waitForLoad(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { chrome.tabs.onUpdated.removeListener(listener); reject(new Error("The page took too long to load.")); }, LOAD_TIMEOUT_MS);
    function listener(id: number, info: { status?: string }) {
      if (id !== tabId || info.status !== "complete") return;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }
    chrome.tabs.onUpdated.addListener(listener);
    // The page may have finished before the listener was attached.
    void chrome.tabs.get(tabId).then((tab) => { if (tab.status === "complete") listener(tabId, { status: "complete" }); }, () => undefined);
  });
}

async function fetchOffer(url: string): Promise<FetchReply> {
  if (!isAllowedPage(url)) return { ok: false, error: "Riven can only fetch Amazon product pages." };
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    await waitForLoad(tab.id!);
    const [injection] = await chrome.scripting.executeScript({ target: { tabId: tab.id! }, func: () => document.documentElement.outerHTML });
    let offer;
    try {
      offer = parseAmazonProductPage(String(injection?.result ?? ""));
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
