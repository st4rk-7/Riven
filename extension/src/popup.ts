import { type AmazonOffer, parseAmazonProductPage } from "../../server/sources/amazon.js";

const ALLOWED_HOSTS = ["www.amazon.co.uk", "amazon.co.uk"];
const RIVEN_API = "http://127.0.0.1:3000/api/v1/observations";

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
      const response = await fetch(RIVEN_API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageUrl, ...offer }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? `HTTP ${response.status}`);
      status.className = "ok";
      status.textContent = `Saved to Riven at ${new Date(body.observedAt).toLocaleTimeString()}`;
    } catch (error) {
      button.disabled = false;
      status.className = "error";
      status.textContent = `Not sent: ${(error as Error).message}. Is the Riven server running?`;
    }
  });
}

async function main() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const host = tab?.url ? new URL(tab.url).hostname : "";
  if (!tab?.id || !ALLOWED_HOSTS.includes(host)) {
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
    show(`<p class="error">${escape((error as Error).message)}</p>`);
  }
}

void main();
