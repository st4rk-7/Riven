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

Amazon pages reach Riven through the extension, from pages you open yourself.

**Install it once:**

1. Get the `extension` folder from the Riven team.
2. In Chrome, open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose the `extension` folder.
4. Sign in at https://riven.sbs/app in the same Chrome profile.

**Send a page:**

1. Open an Amazon product page.
2. Select the Riven icon in Chrome's toolbar. It shows **Reading this page…**, then **Sending…**.
3. The offer appears in Riven with its price, stock and time.

| The extension says | What to do |
| --- | --- |
| Sign in to Riven in this Chrome profile first | Sign in at https://riven.sbs/app in this Chrome window, then try again |
| Riven server not reachable; attempt not recorded | Check your internet connection and try again later |
| Failed attempt recorded in Riven | The page could not be read; Riven noted it. Try again later or use another product page |

## 8. How often prices update

- **Amazon:** when you send a page with the extension (marked "Extension"), or when Riven's scheduled check reads it (marked "Scheduled").
- **Other sites:** not supported yet.

Check the time shown next to each price to see how recent it is.
