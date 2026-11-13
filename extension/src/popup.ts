import { capturePage } from "./capture.js";
import { type SavedOffer, recordAttempt, sendPage, siteForPage } from "./send.js";

const result = document.getElementById("result")!;
const toggle = document.getElementById("background-checks") as HTMLInputElement;

function show(html: string) {
  result.innerHTML = html;
}

function escape(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function render(offer: SavedOffer) {
  const price = offer.price === null ? "Price unavailable" : `${offer.price} ${offer.currency ?? ""}`;
  const stock = { in_stock: "In stock", out_of_stock: "Out of stock", unknown: "Unknown" }[offer.availability];
  show(`
    <h1>${escape(offer.productName)}</h1>
    <dl>
      <dt>Price</dt><dd>${escape(price)}</dd>
      <dt>Stock</dt><dd>${stock}</dd>
      <dt>Seller</dt><dd>${escape(offer.seller ?? "Unknown")}</dd>
      <dt>Item</dt><dd>${escape(offer.asin)}</dd>
    </dl>
    <p class="ok">Saved to Riven at ${new Date(offer.observedAt).toLocaleTimeString()}</p>`);
}

async function main() {
  const { backgroundChecks = true } = await chrome.storage.local.get("backgroundChecks");
  toggle.checked = Boolean(backgroundChecks);
  toggle.addEventListener("change", () => void chrome.storage.local.set({ backgroundChecks: toggle.checked }));

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const site = siteForPage(tab?.url);
  if (!tab?.id || !site) {
    show('<p class="muted">Open an Amazon product page, then click Riven again.</p>');
    return;
  }

  show('<button id="send">Send this page to Riven</button><p id="status" class="muted"></p>');
  const button = document.getElementById("send") as HTMLButtonElement;
  const status = document.getElementById("status")!;
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.className = "muted";
    status.textContent = "Sending…";
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: capturePage,
      args: [site.capture, site.strip, site.blocked.source],
    });
    const page = injection?.result;
    if (!page || "blocked" in page) {
      const reason = page ? `${site.name} showed a challenge page` : "No product found on this page";
      status.className = "error";
      status.textContent = `${reason}. ${await recordAttempt(tab.url!, page ? "blocked" : "failed", reason)}`;
      return;
    }
    try {
      render(await sendPage(tab.url!, page.html));
    } catch (error) {
      button.disabled = false;
      status.className = "error";
      status.textContent = `Not sent: ${(error as Error).message}`;
    }
  });
}

void main();
