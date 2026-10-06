# Love Asia — Digital Menu

A lightweight, fully static, mobile-first animated menu for **Love Asia**.

- **Landing:** guests choose **Non-Veg** or **Veg**.
- **Non-Veg** shows the **full menu** (veg + non-veg) over an animated koi pond: shimmering water,
  koi swimming around, lily pads, and ripples. Tapping the water drops food and the koi swim to it.
- **Veg** shows **only vegetarian dishes** in a swaying bamboo grove with drifting leaves.
- Guests can switch between the two menus from the top bar at any time. The menu also has category chips and search.

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

> The current dishes are **sample placeholders**. Replace them with the items from the printed menu.

### Printed menu photos (optional)
Put scans in `assets/menu/` and list them in `menuPages` in `menu-data.js`.
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

To host it, use any static host. GitHub Pages works: Settings → Pages → deploy from branch, root folder.
