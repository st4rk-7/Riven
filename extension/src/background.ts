import type { Site } from "../../server/sources/sites.js";
import { type Capture, capturePage } from "./capture.js";
import { dueListings, recordAttempt, sendPage, siteForPage } from "./send.js";

// "Fetch" from the Riven website, and the background checks: open the page in a background tab, take only
// its product part, send it to Riven, then close the tab. Only Riven's own pages can ask (externally_connectable).
export type FetchReply = { ok: true; price: string | null; currency: string | null } | { ok: false; error: string };

const READ_TIMEOUT_MS = 30_000;
const POLL_MS = 800;
const CHECK_EVERY_MINUTES = 5;
const GAP_MS = 5_000;
// A Chrome event keeps the worker alive for about 5 minutes, so one run checks a few listings at most.
const MAX_CHECKS_PER_RUN = 6;
const PAUSE_AFTER_BLOCK_MS = 6 * 60 * 60 * 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Pages keep loading ads and trackers long after the product is on screen, so the tab may never
// report "complete". Take the page as soon as its product part exists, or it shows a challenge.
async function captureWhenReady(tabId: number, site: Site): Promise<NonNullable<Capture>> {
  const deadline = Date.now() + READ_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId },
        func: capturePage,
        args: [site.capture, site.strip, site.blocked.source],
      });
      if (injection?.result) return injection.result;
    } catch {
      // The new page has not committed yet; try again shortly.
    }
    await wait(POLL_MS);
  }
  throw new Error(`The ${site.name} page did not show a product within 30 seconds.`);
}

async function isPaused(site: Site): Promise<boolean> {
  const { pausedUntil = {} } = await chrome.storage.local.get("pausedUntil");
  return ((pausedUntil as Record<string, number>)[site.name] ?? 0) > Date.now();
}

// A challenge page stops checks on that site for a while; Riven never tries to get past one.
async function pause(site: Site) {
  const { pausedUntil = {} } = await chrome.storage.local.get("pausedUntil");
  await chrome.storage.local.set({ pausedUntil: { ...(pausedUntil as Record<string, number>), [site.name]: Date.now() + PAUSE_AFTER_BLOCK_MS } });
}

async function fetchOffer(url: string): Promise<FetchReply> {
  const site = siteForPage(url);
  if (!site) return { ok: false, error: "Riven can't read pages from this site yet." };
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    const page = await captureWhenReady(tab.id!, site);
    if ("blocked" in page) {
      await pause(site);
      await recordAttempt(url, "blocked", `${site.name} showed a challenge page`);
      return { ok: false, error: `${site.name} showed a challenge page; checks on it are paused for 6 hours.` };
    }
    // Riven records a failed attempt itself when it cannot read what was sent.
    const offer = await sendPage(url, page.html);
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

// Background checks (RIV-43): while Chrome is open, check the shared listings Riven says are due.
// The retailer is told at install and can turn this off in the popup.
let checking = false;

async function checkDueListings() {
  const { backgroundChecks = true } = await chrome.storage.local.get("backgroundChecks");
  if (!backgroundChecks || checking) return;
  checking = true;
  try {
    let checked = 0;
    for (const url of (await dueListings()) ?? []) {
      const site = siteForPage(url);
      if (!site || (await isPaused(site))) continue;
      await fetchOffer(url);
      if (++checked >= MAX_CHECKS_PER_RUN) break;
      await wait(GAP_MS);
    }
  } finally {
    checking = false;
  }
}

function scheduleChecks() {
  void chrome.alarms.create("due-checks", { periodInMinutes: CHECK_EVERY_MINUTES });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  scheduleChecks();
  if (reason === "install") void chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});
chrome.runtime.onStartup.addListener(scheduleChecks);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "due-checks") void checkDueListings();
});
