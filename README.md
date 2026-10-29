# Love Asia website

The website for **Love Asia**, a sushi and Pan-Asian restaurant at 1, Phase 2, Anjanappa Layout,
Kothanur, Hennur, Bengaluru 560077.

It's a fully static, SEO-optimised site with no frameworks. A small Node build script renders every
page into plain HTML, so search engines can read all the content and every dish.

## Pages

| URL | What it is |
|---|---|
| `/` | Home. You scroll down a bamboo grove like a camera panning down the stalks. The tall foreground bamboo parts as it scrolls past, while the sky, temples, pagoda and clouds drift behind at slower speeds. Then you step into a moss garden with a koi pond in the middle, and scrolling dives into the pond until the water fills the screen. From there, live koi swim behind every section (tap the water to feed them). Sections cover the place, the menu (Veg / Non-Veg tiles), signature dishes, feeding the koi, events, why guests come back, visit info, and FAQs. |
| `/menu/` | The Veg / Non-Veg chooser. |
| `/non-veg/` | The full menu (veg + non-veg) over the animated koi pond. |
| `/veg/` | The pure-vegetarian menu in the bamboo grove. |
| `/events/` | Birthday parties and events, in the same scenery as home: a shorter bamboo grove, the dive into the garden pond, and live koi behind every section. parties from 15 to 100+ guests, set menus or à la carte, and an enquiry form that opens WhatsApp. |

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
- Light pages: CSS inlined, self-hosted font subsets (Shippori Mincho + Zen Kaku Gothic New),
  scenery pre-rendered at build time into static SVGs (`src/scenery.mjs`), the Google map loads as you scroll near it,
  and the koi pond script only loads when you reach it. Lighthouse (mobile): 98 to 100 in every category.
- Motion: the grove's parting and parallax are CSS scroll-driven animations, run by the compositor, with a
  small JS fallback in `assets/js/garden.js` (shared by the home and events pages). The temples, pagoda, torii, farmhouses, pines and clouds
  are drawn in `src/architecture.mjs`; the garden pond scene is `src/garden-pond.mjs`. On desktop (mouse or trackpad), scrolling is smoothed with
  [Lenis](https://github.com/darkroomengineering/lenis) (`assets/vendor/`, MIT). Phones keep native scrolling,
  and Lenis isn't downloaded there.
- Auto-dive: once the "Step into the grove" heading scrolls off the screen (on the events page, once the
  garden is two-thirds up the screen), a 1.5s glide carries the page through the pond zoom to the first
  section in the water. The visitor's own scrolling is held off until it lands, so flicks, trackpad momentum
  and stacked swipes can't fight it. Links and reloads don't trigger it. Add `?dive=manual` to turn it off.
  If you stay still for 3 seconds, a small "Scroll down" nudge flashes for a second, every 3 seconds.
- Keyword pages (`src/pages/landing.mjs`): `/sushi-hennur/`, `/family-restaurant-hennur/` and
  `/date-night-hennur/`, each with its own FAQ and breadcrumb schema. The sushi and dessert lists come
  straight from `menu-data.js`, so prices stay in sync.

## Editing

- **Business details** (phone, address, hours, map links): `src/site.mjs` → `BUSINESS`.
- **Menu dishes and prices**: `assets/js/menu-data.js`.
- **Home page copy**: `src/pages/home.mjs`. **Events copy**: `src/pages/events.mjs`. **Keyword pages**: `src/pages/landing.mjs`.
- **Live URL**: `SITE_URL` in `src/site.mjs` (currently https://loveasia.in).

## Build & deploy

```sh
node src/build.mjs          # → dist/
python3 -m http.server -d dist 8000
```

GitHub Actions (`.github/workflows/pages.yml`) builds and publishes `dist/` to GitHub Pages on every push to `main`.
