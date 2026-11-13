# User guide

**Riven** · Version 1.0 · 4 November 2026 · Approved by the client, 4 Nov 2026 · For retailers using https://riven.sbs/app

Riven shows what your competitors charge for the products you sell, and whether they have them in stock. Every price shows where it came from and when it was collected.

## 1. Before you start

- **Account:** there is no public sign-up. The Riven team creates your account and gives you your email and password.
- **Browser:** Google Chrome on a computer. The web app also works on a phone, but the extension needs desktop Chrome.

## 2. Sign in

1. Open https://riven.sbs/app.
2. Enter your email and password, then select **Sign in**.

You see only your own products and offers. To sign out, select your name at the top of the screen (**Sign out**).

## 3. Add a product

1. Select **Add product**.
2. Either paste an **Amazon product link** (Riven reads the name from the page), or enter the **Product name** yourself, with a **Brand** if you like.
3. Select **Add product**. Riven opens the product's competitor list and starts looking for competitors straight away.

## 4. Find competitors

On a product's **Competitor offers** screen, select **Discover competitors**. While it works, the button reads **Searching Amazon...**.

- Riven adds up to 5 competitor offers per product.
- Running it again does not add the same offer twice.

## 5. Check each offer

Each offer has a match label:

| Label | Meaning | What to do |
| --- | --- | --- |
| Confirmed | Same product identifier as yours | Nothing |
| Unverified | Similar title only; Riven is not sure | Open the offer and decide |
| Mismatch | A different product | Nothing; it is not compared |

For an unverified offer, open it. Under **Is this the same product as yours?**, select **Confirm match** or **Not the same**. Use **View on** (the store's name) to check the listing first.

To take an offer off your list, select **Remove offer**. To stop tracking a whole product, select **Delete product**; this also deletes its history.

## 6. Read prices and history

Open an offer to see its **Current price**, **Currency**, **Stock**, **Match**, and **Price history for this seller**.

| You see | It means |
| --- | --- |
| Price unavailable | The page showed no price. It is not zero. |
| Unknown (stock) | Riven could not tell whether it is in stock. It is not "out of stock". |
| A failed check | Riven tried and could not read the page. Earlier values are kept. |

## 7. Use the Riven extension

Amazon pages reach Riven only through the extension: Riven's server cannot read them itself. The extension sends pages you open, and it also checks Riven's due listings in the background while Chrome is open.

**Install it once:**

1. Get the extension:
   - **Team members:** in your copy of the Riven repository, run `npm ci`, then `npm run build:extension:live`.
   - **Retailers:** get the `extension` folder from the Riven team.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose the `extension` folder. A page opens explaining what the extension does.
4. Sign in at https://riven.sbs/app in the same Chrome profile.

**Update it:** team members pull the latest code, run `npm run build:extension:live` again, then select the reload button on the Riven card in `chrome://extensions`.

**Send a page:**

1. Open an Amazon product page.
2. Select the Riven icon in Chrome's toolbar, then **Send this page to Riven**.
3. The popup shows what Riven saved: price, stock, seller and time. The offer appears in Riven too.

**Background checks:**

- Every 5 minutes while Chrome is open, the extension asks Riven which shared listings are due and checks them in hidden tabs, one at a time, a few seconds apart.
- One check updates that listing for every retailer tracking it. The extension gets only the listing's address, never who tracks it.
- To turn them off, select the Riven icon and clear **Check Riven's due listings in the background**.

**What the extension sends:** only the product part of a page (title, price, stock, seller). Never the page header or your account, name or address.

| The extension says | What to do |
| --- | --- |
| Sign in to Riven in this Chrome profile first | Sign in at https://riven.sbs/app in this Chrome window, then try again |
| Riven server not reachable; attempt not recorded | Check your internet connection and try again later |
| No product found on this page | Open a product page itself, not a search or list page |
| Amazon showed a challenge page | Riven recorded it and pauses checks on that site for 6 hours. Riven never tries to get past a challenge |
| Not sent: (reason) | The page could not be read; Riven noted it. Try again later or use another product page |

## 8. How often prices update

- **Amazon:** when you or the background checks send a page through the extension (marked "Extension"). Each listing is due every 6 hours by default. If no retailer tracking it has Chrome open, it shows as stale after 12 hours.
- **eBay:** coming in Sprint 2 (RIV-21), the same way as Amazon.
- **Other sites:** not supported yet.

Check the time shown next to each price to see how recent it is.
