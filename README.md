# Love Asia — Digital Menu

A lightweight, fully static, mobile-first animated menu for **Love Asia**.

- **Landing:** the Love Asia logo draws itself in. Guests then choose **Non-Veg** or **Veg**, and both choices fit on any phone screen.
  Tapping a choice opens the menu with a ripple-out reveal.
- **Non-Veg** shows the **full menu** (veg + non-veg) over a watercolour koi pond. The koi swim with flexible
  wave-like strokes, and every few seconds one leaps out with a splash. Lily pads, lotus flowers, sakura petals
  and a visiting dragonfly add life. Tapping the water drops food, and the koi swim over to it.
- **Veg** shows **only vegetarian dishes** in a Japanese ink-wash bamboo grove with swaying bamboo, a red sun,
  misty mountains, a pagoda, cherry blossom and falling petals.
- Every dish is its own see-through card showing only the name and price. **Tap a dish** to expand its description,
  price options and tags.
- The **burger button** (bottom right) opens a section list to jump between sections. A Veg/Non-Veg switch and
  search sit in the top bar.

There are no frameworks and no build step: plain HTML, CSS and JS (~60 KB before fonts).
Animations pause when the tab is hidden and respect the "reduce motion" setting.

## Editing the menu

All dishes live in **`assets/js/menu-data.js`**. Each item looks like this:

```js
{ name: "Tom Yum", desc: "Hot & sour lemongrass broth", price: 229, veg: true, tags: ["spicy"] }
```

- `veg: true` dishes appear in both menus. `veg: false` dishes appear only in the Non-Veg menu.
- `tags` (optional): `spicy`, `chef`, `new`, `jain`.
- Change `currency`, `name` and `tagline` at the top of the file.

> The dishes were typed up from the photos of the printed menu in `assets/menu/`.

### Printed menu photos (optional)
Photos live in `assets/menu/` and are listed in `menuPages` in `menu-data.js`.
A "View printed menu" button then appears with a swipeable viewer.

## Direct links
- `index.html#nonveg` opens the full (koi) menu directly
- `index.html#veg` opens the veg (bamboo) menu directly

These links work well for table QR codes.

## Running locally / hosting
Open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

Deployment is automatic: `.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`.
It can also be run by hand from the Actions tab.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The live site is at https://studiohappens26-oss.github.io/love-asia/
