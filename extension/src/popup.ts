import { type AmazonOffer, parseAmazonProductPage } from "../../server/sources/amazon.js";
import { isAllowedPage, recordFailedAttempt, sendOffer } from "./send.js";

const result = document.getElementById("result")!;

function show(html: string) {
  result.innerHTML = html;
}

function escape(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function render(offer: AmazonOffer, pageUrl: string) {
  const price = offer.price === null ? "Price unavailable" : `${offer.price} ${offer.currency ?? ""}`;
  const stock = { in_stock: "In stock", out_of_stock: "Out of stock", unknown: "Unknown" }[offer.availability];
  show(`
    <h1>${escape(offer.productName)}</h1>
    <dl>
      <dt>Price</dt><dd>${escape(price)}</dd>
      <dt>Stock</dt><dd>${stock}</dd>
      <dt>Seller</dt><dd>${escape(offer.seller ?? "Unknown")}</dd>
      <dt>ASIN</dt><dd>${escape(offer.asin)}</dd>
    </dl>
    <p class="muted">Read ${new Date().toLocaleString()}</p>
    <button id="send">Send to Riven</button>
    <p id="status" class="muted"></p>`);

  const button = document.getElementById("send") as HTMLButtonElement;
  const status = document.getElementById("status")!;
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.className = "muted";
    status.textContent = "Sending…";
    try {
      const observedAt = await sendOffer(offer, pageUrl);
      status.className = "ok";
      status.textContent = `Saved to Riven at ${new Date(observedAt).toLocaleTimeString()}`;
    } catch (error) {
      button.disabled = false;
      status.className = "error";
      status.textContent = `Not sent: ${(error as Error).message}. Is the Riven server running?`;
    }
  });
}

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isAllowedPage(tab.url)) {
    show('<p class="muted">Open an Amazon.co.uk product page, then click Riven again.</p>');
    return;
  }

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  try {
    render(parseAmazonProductPage(String(injection?.result ?? "")), tab.url!);
  } catch (error) {
    const reason = (error as Error).message;
    show(`<p class="error">${escape(reason)}</p><p id="status" class="muted">Recording the failed attempt…</p>`);
    document.getElementById("status")!.textContent = await recordFailedAttempt(tab.url!, reason);
  }
}

void main();
