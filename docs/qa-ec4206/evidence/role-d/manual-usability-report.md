# Role D manual usability report

I tested keyboard use, sign-in accessibility, and the product screens in the local Riven app. I used Brave 1.100.58 at `http://127.0.0.1:5173/app` and followed the [Role D usability checklist for NFR-06](../../usability-checklist.md). I ran the keyboard sign-in check on 24 November 2026 at about 7:00 a.m. IST. My local checkout was `21e5ba0`.

| Case | What I checked | What I observed | Status |
| --- | --- | --- | --- |
| USA-01 | Keyboard sign-in | I could see focus move through Email, Password, and Sign in at both window sizes I tried. Shift+Tab moved back to Password. Pressing Enter completed sign-in and opened the dashboard. | Pass |
| USA-02 | Sign-in accessibility | I saw the names Email, Password, and Sign in in Brave DevTools. Both fields showed `Required: true`, and Sign in had the role `button`. I heard Narrator read “Email or password is incorrect.” | Pass |
| USA-03 | Product search and Add product | I could reach both controls with Tab and see the focus. Typing the name of a product already in my list narrowed the results. Pressing Enter on Add product opened the form. | Pass |
| USA-04 | Keyboard offer review | I could use the offer review controls with the keyboard. I checked the decision again after refreshing. | Partial. The action and saved status still need to be identified. |
| USA-05 | Edit dialog | I checked keyboard focus in the edit dialog and closed it with Escape. | Partial. The focus return target needs confirmation. |
| USA-06 | Feedback and page states | I checked the feedback for validation, loading, empty results, unknown values, and failures. My follow-up screenshot shows the Products error message, advice to check the server, and a visible Retry button. | Partial. The supplied captures show validation and failure feedback. |
| USA-07 | Layout at different window sizes | At 320 × 768 CSS px, my screenshots show the sign-in form, the Products error screen, and the populated Products list fitting across the viewport. The long product name wraps inside its card. Search and Add product are visible, and I can see the focus outline on Search. At 375 and 768 CSS px, I checked both the sign-in page and the Products list and saw no clipping or sideways scrolling. | Pass for the sign-in and Products screens at the tested widths. |
| USA-08 | Text and control contrast | At 320 × 768 CSS px, Brave DevTools showed **15.11:1** for each 16 px Email and Password label (`oklch(0.269 0 none)`) and **6.55:1** for the 14 px sign-in error text (`oklch(0.505 0.213 27.518)`) against the light sign-in card. The 16 px Sign in button text (`#FFFFFF` on `#095FDF`) measured **5.65:1**. All four readings meet the [WCAG 2.2 AA minimum of 4.5:1 for normal text](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). | Partial. The four text samples met AA. The ring and disabled-state readings are CSS calculations. |

## Screenshots

- **USA-01:** Visible keyboard focus on [Email](screenshots/Screenshot%202026-11-25%20101136.png), [Password](screenshots/Screenshot%202026-11-25%20101146.png), and [Sign in](screenshots/Screenshot%202026-11-25%20101155.png).
- **USA-02:** DevTools properties for [Email](screenshots/Screenshot%202026-11-25%20101839.png), [Password](screenshots/Screenshot%202026-11-25%20101850.png), and [Sign in](screenshots/Screenshot%202026-11-25%20101906.png). The Sign in capture also shows the required-field prompt and the error marked with `role="alert"`.
- **USA-06:** The [required-field prompt](screenshots/Screenshot%202026-11-25%20101906.png) and [sign-in error](screenshots/Screenshot%202026-11-25%20111600.png) are linked here. The Products error capture is retained with the original private QA observations.
- **USA-07:** At 320 × 768 CSS px, I captured [sign-in](screenshots/Screenshot%202026-11-25%20110600.png) and the [populated Products list](screenshots/Screenshot%202026-11-25%20111008.png). The 375 and 768 px results are my manual observations.
- **USA-08:** DevTools contrast samples for the [Email label](screenshots/Screenshot%202026-11-25%20111358.png), [Password label](screenshots/Screenshot%202026-11-25%20111449.png), [sign-in error](screenshots/Screenshot%202026-11-25%20111600.png), and [Sign in button](screenshots/Screenshot%202026-11-25%20111634.png).

For USA-08, I could see the blue focus ring around Sign in when I reached it with Tab. The stylesheet sets the ring to `#095FDF` against the white card (`#FFFFFF`). The calculated contrast is **5.65:1**, above the [3:1 minimum for focus indicators](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

The disabled Sign in button uses 64% opacity while the request is in progress. Its estimated text contrast from the CSS colors is **2.90:1** over white. [WCAG 2.2 exempts inactive controls from minimum text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
