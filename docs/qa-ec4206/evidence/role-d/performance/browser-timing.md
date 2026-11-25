# PERF-02 dashboard reload in Brave

I recorded two reloads of the local Riven Products page at `http://127.0.0.1:5173/app` in Brave DevTools. I used a 320 × 768 CSS px viewport with network throttling off. The Products page showed two entries and the Search field.

| Run | Cache setting | Populated dashboard visible in timeline preview | Largest Contentful Paint | Cumulative Layout Shift | Status |
| --- | --- | --- | --- | --- | --- |
| First reload | Enabled | About 1.4 s | 1.27 s | 0.00 | Within 3 s in the local preview |
| Second reload | Disabled in DevTools | About 0.6 s | 578.9 ms | 0.00 | Within 3 s in the local preview |

For the [PERF-02 check](../../../nonfunctional.md), I used the timeline preview showing both the product list and Search. Both previews appeared within the proposed 3 s target in this local setup. The preview times are estimates and the LCP column gives the separate values displayed by DevTools. Browser extensions were active.

- **Cache enabled:** [Full Performance capture](../screenshots/Screenshot%202026-11-25%20112331.png) and [populated dashboard preview](../screenshots/Screenshot%202026-11-25%20112534.png).
- **Cache disabled:** [Performance capture with populated dashboard preview and LCP](../screenshots/Screenshot%202026-11-25%20112830.png).
