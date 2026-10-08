# Love Asia — website

The website for **Love Asia**, a sushi and Pan-Asian restaurant at 1, Phase 2, Anjanappa Layout,
Kothanur, Hennur, Bengaluru 560077.

It's a fully static, SEO-optimised site with no frameworks. A small Node build script renders every
page into plain HTML, so search engines can read all the content and every dish.

## Pages

| URL | What it is |
|---|---|
| `/` | Home. The camera starts in the sky in front of a pastel bamboo grove. Scrolling parts the bamboo to reveal text behind it, then the camera descends past the ground into the koi pond. Sections cover the place, the menu (Veg / Non-Veg tiles), signature dishes, events, why guests come back, visit info with a map, and FAQs. |
| `/menu/` | The Veg / Non-Veg chooser. |
| `/non-veg/` | The full menu (veg + non-veg) over the animated koi pond. |
| `/veg/` | The pure-vegetarian menu in the bamboo grove. |
| `/events/` | Birthday parties and events: 100+ guests, buffets, and an enquiry form that opens WhatsApp. |

Old QR codes that point at `/#veg` or `/#nonveg` still work; they redirect to the new pages.

## SEO

- Each page has its own title, meta description, canonical URL, Open Graph and Twitter tags, and share image.
- Structured data (JSON-LD):
  - **Restaurant** (address, geo, hours, phone, cuisines, price range, capacity, amenities, listings)
  - **Menu** with every **MenuItem** and its price
  - **FAQPage**
  - **BreadcrumbList**
- `sitemap.xml`, `robots.txt` and a friendly 404 page.
- One H1 per page, semantic sections, descriptive link text, and local keywords (Hennur, Kothanur, Bengaluru).
- Light pages: no frameworks, deferred scripts, and fonts subset to the glyphs used.

## Editing

- **Business details** (phone, address, hours, map links): `src/site.mjs` → `BUSINESS`.
- **Menu dishes and prices**: `assets/js/menu-data.js`.
- **Home page copy**: `src/pages/home.mjs`. **Events copy**: `src/pages/events.mjs`.
- **Live URL**: update `SITE_URL` in `src/site.mjs` when you move to a custom domain.

## Build & deploy

```sh
node src/build.mjs          # → dist/
python3 -m http.server -d dist 8000
```

GitHub Actions (`.github/workflows/pages.yml`) builds and publishes `dist/` to GitHub Pages on every push to `main`.
