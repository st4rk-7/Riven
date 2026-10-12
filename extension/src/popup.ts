import { type AmazonOffer, parseAmazonProductPage } from "../../server/sources/amazon.js";

const ALLOWED_HOSTS = ["www.amazon.co.uk", "amazon.co.uk"];

const result = document.getElementById("result")!;

function show(html: string) {
  result.innerHTML = html;
}

function escape(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function render(offer: AmazonOffer) {
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
    <p class="muted">Read ${new Date().toLocaleString()}</p>`);
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
    render(parseAmazonProductPage(String(injection?.result ?? "")));
  } catch (error) {
    show(`<p class="error">${escape((error as Error).message)}</p>`);
  }
}

void main();
