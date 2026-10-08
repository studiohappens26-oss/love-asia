import { BUSINESS, esc, head, logoSvg, siteHeader, siteFooter, restaurantSchema, faqSchema, faqHtml, fullAddress, waLink, ICON, abs } from "../site.mjs";
import { choiceTiles, SVG_DEFS } from "./menu.mjs";
import { groveLayers, shore, pondDecor } from "./scene.mjs";

export const HOME_FAQ = [
  { q: "Where is Love Asia in Bengaluru?", a: `Love Asia is at ${esc(fullAddress())} — in Kothanur, just off Hennur Main Road in North Bengaluru. <a href="${BUSINESS.maps}" rel="noopener" target="_blank">Get directions</a>.` },
  { q: "What are Love Asia's opening hours?", a: `We're open every day from 12:00 PM to 11:00 PM for lunch and dinner. On public holidays it's worth calling ahead on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>.` },
  { q: "Do you have indoor and outdoor seating?", a: "Both. Sit outside in our open-air seating by the garden, or inside in the fully air-conditioned dining room." },
  { q: "Is there a vegetarian menu?", a: `Yes — a dedicated <a href="veg/">pure-vegetarian menu</a> with veg sushi rolls, dim sum, gyoza, bao, Thai curries, ramen, noodles and desserts. The <a href="non-veg/">full menu</a> adds chicken, prawn, fish and seafood sushi.` },
  { q: "Can I host a birthday party or event at Love Asia?", a: `Absolutely — we regularly host birthday parties, family celebrations and corporate get-togethers, with buffet or à la carte options. See <a href="events/">events &amp; parties</a> for details.` },
  { q: "Do you offer buffets?", a: "Buffet options are available for parties and group bookings, alongside our full à la carte menu every day." },
  { q: "Is Love Asia kid-friendly?", a: "Very. Families love the koi pond and there's a play area for children, which also makes it a favourite for kids' birthday parties." },
  { q: "How much does a meal cost?", a: `Around ${esc(BUSINESS.costForTwo)}. See the <a href="menu/">menu</a> for full prices.` },
  { q: "Do you take reservations?", a: `Yes — call us on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a> or <a href="${waLink("Hi Love Asia! I'd like to reserve a table.")}" rel="noopener" target="_blank">message us on WhatsApp</a>.` },
];

const SIGNATURES = [
  { name: "Sushi", kanji: "寿司", text: "Our best-known plates. Signature rolls like the Seafood Futomaki and Sake Expression, plus a full vegetarian sushi list — Paradise Roll, Raw Mango Avocado and more.", link: "non-veg/#cat-sushi" },
  { name: "Ramen", kanji: "拉麺", text: "Steaming bowls of Miso, Tonkatsu and fiery Spicy Korean ramen, made veg or with chicken.", link: "non-veg/#cat-ramen" },
  { name: "Bao", kanji: "包", text: "Pillowy steamed baos — the Tokyo Crumb Chicken, the Exotic Veg, and the much-photographed Penguin Chocolate Bao for dessert.", link: "non-veg/#cat-gyoza-bao" },
  { name: "Dim sum & gyoza", kanji: "点心", text: "Hand-folded Har Gow, Heritage Siu Mai, Mushroom Cream Cheese and Jade Crunch Garden dumplings, plus pan-seared gyoza.", link: "non-veg/#cat-dimsum" },
  { name: "Curries & noodles", kanji: "麺", text: "Thai green and red curries, Khow Suey, Pad Thai, Mee Goreng and wok-tossed Hakka noodles.", link: "non-veg/#cat-curries" },
  { name: "Mocktails", kanji: "飲", text: "Bright, refreshing mocktails that guests keep coming back for — the perfect partner for a long lunch by the koi pond.", link: "#visit" },
];

const FEATURES = [
  ["Koi pond ambience", "Dine beside a calm koi pond in a Japanese-garden setting."],
  ["Open-air seating", "Relaxed outdoor tables in the garden, perfect for long evenings."],
  ["Air-conditioned indoors", "A cool, comfortable indoor dining room, whatever the weather."],
  ["À la carte & buffets", "Order from the full menu, or choose a buffet for your group."],
  ["Warm, attentive staff", "Guests consistently mention our friendly, courteous service."],
  ["Kid-friendly", "A play area for little ones and a menu the whole family enjoys."],
  ["Veg & non-veg menus", "A dedicated pure-veg menu, clearly marked, alongside the full menu."],
  ["Great mocktails", "Colourful, refreshing drinks made fresh at the bar."],
];

const FAVOURITES = ["Pad Thai noodles", "Chicken dim sum", "Black pepper prawns", "Tom Kha soup", "Mushroom cream cheese dim sum", "Khow Suey", "Prawn tempura", "Mongolian chicken", "Japanese coconut pudding"];

export function homePage() {
  const root = "";
  const b = BUSINESS;
  const reveal = `<div class="reveal-card" id="reveal">
        <span class="seal seal--veg reveal__seal" aria-hidden="true">愛</span>
        <h2>Step into the grove</h2>
        <p>Behind the bamboo: a koi pond, soft light, and Asian food made to be shared — a little escape from the city, right in North Bengaluru.</p>
      </div>`;
  return `${head({
    title: "Love Asia — Sushi & Pan-Asian Restaurant in Hennur, Bengaluru",
    description: "Sushi, ramen, bao and dim sum by a koi pond in Kothanur, Hennur. Open-air and AC seating, veg & non-veg menus, buffets and birthday parties.",
    path: "",
    root,
    css: ["assets/css/style.css", "assets/css/site.css"],
    extraHead: `<script>/* old QR codes pointed at /#veg and /#nonveg */ (function(h){ if (h === "#veg") location.replace("veg/"); else if (h === "#nonveg" || h === "#non-veg") location.replace("non-veg/"); })(location.hash);</script>`,
    schema: [
      { "@context": "https://schema.org", "@type": "WebSite", "@id": abs("#website"), name: b.name, url: abs(""), inLanguage: "en-IN", publisher: { "@id": abs("#restaurant") } },
      restaurantSchema(),
      faqSchema(HOME_FAQ),
    ],
  })}
<body class="page-home">
${SVG_DEFS}
${siteHeader({ root, current: "home" })}

<main id="main">
  <!-- The grove: pinned while the bamboo parts, then it scrolls away like a camera descending -->
  <section class="grove" id="top" aria-labelledby="hero-title">
    <div class="grove__stage">
      ${groveLayers(root, { middle: reveal })}
      <div class="hero-card" id="hero">
        <div class="hero__logo">${logoSvg()}</div>
        <p class="eyebrow">Kothanur · Hennur · Bengaluru</p>
        <p class="hero__display">Love, served Asian.</p>
        <h1 id="hero-title">Sushi &amp; Pan-Asian restaurant in Hennur, Bengaluru</h1>
        <p class="hero__lede">Sushi, ramen, bao and dim sum, served by a koi pond in a calm Japanese garden.</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="menu/">View the menu ${ICON.arrow}</a>
          <a class="btn" href="events/">Plan a party</a>
        </div>
      </div>
    </div>
  </section>

  ${shore(root)}

  <div class="pond-area" id="pond-area">
    ${pondDecor()}

    <section class="block" id="about" aria-labelledby="about-title">
      <div class="panel">
        <p class="eyebrow">The place</p>
        <h2 id="about-title">A calm Japanese garden in the middle of Hennur</h2>
        <p>Love Asia brings the flavours of Japan, Thailand, China, Korea, Malaysia and Indonesia together under one roof in Kothanur. Come for the sushi and dim sum, stay for the koi pond, the unhurried service and the kind of ambience that turns lunch into an afternoon.</p>
        <p>Choose your spot: open-air seating out in the garden, or our air-conditioned indoor dining room.</p>
        <ul class="facts">
          <li><b>Koi</b><span>pond-side dining</span></li>
          <li><b>Open-air</b><span>garden seating</span></li>
          <li><b>AC</b><span>indoor dining</span></li>
          <li><b>Daily</b><span>${esc(b.hours.short)}</span></li>
        </ul>
      </div>
    </section>

    <section class="block" id="menu" aria-labelledby="menu-title">
      <div class="panel panel--wide panel--left">
        <p class="eyebrow">The menu</p>
        <h2 id="menu-title">Choose your menu</h2>
        <p>Browse every dish with prices — the full menu from the koi pond, or our pure-vegetarian menu from the bamboo grove.</p>
        ${choiceTiles(root, "span")}
        <p class="panel__more"><a href="menu/">See all menu options</a></p>
      </div>
    </section>

    <section class="block" id="signatures" aria-labelledby="sig-title">
      <div class="panel panel--wide">
        <p class="eyebrow">Known for</p>
        <h2 id="sig-title">Sushi, ramen, bao &amp; dumplings</h2>
        <div class="sig-grid">
          ${SIGNATURES.map((s) => `<a class="sig" href="${s.link}">
            <span class="sig__kanji" aria-hidden="true">${s.kanji}</span>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.text)}</p>
          </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="block" id="feed-koi" aria-labelledby="koi-title">
      <div class="panel panel--wide panel--left">
        <p class="eyebrow">Say hello</p>
        <h2 id="koi-title">Come feed our koi</h2>
        <p>The koi pond is the heart of Love Asia. Tap the water to scatter a little food and watch them glide over — then come and meet them in person.</p>
        <div class="feed-pond" id="feed-pond">
          <div class="pond-caustics" id="feed-caustics"></div>
          <canvas id="feed-canvas" aria-label="Interactive koi pond — tap the water to feed the koi" role="img"></canvas>
          <p class="feed-hint" id="feed-hint" aria-hidden="true">Tap the water to feed the koi</p>
          <p class="feed-count" id="feed-count" aria-live="polite"></p>
        </div>
      </div>
    </section>

    <section class="block" id="events" aria-labelledby="events-title">
      <div class="panel">
        <p class="eyebrow">Celebrations</p>
        <h2 id="events-title">Birthday parties &amp; celebrations</h2>
        <p>Birthdays, anniversaries, kitty parties, team lunches and family get-togethers — we've hosted them all. Pick a buffet or order à la carte, and let the koi pond set the scene.</p>
        <ul class="ticks">
          <li>Air-conditioned indoor dining plus open-air seating</li>
          <li>Buffet and à la carte options, veg &amp; non-veg</li>
          <li>Kid-friendly, with a play area for little guests</li>
          <li>A team that's run countless parties</li>
        </ul>
        <div class="cta-row">
          <a class="btn btn--ink" href="events/">Plan your event ${ICON.arrow}</a>
          <a class="btn" href="${waLink("Hi Love Asia! I'd like to plan a party.")}" rel="noopener" target="_blank">${ICON.whatsapp} WhatsApp us</a>
        </div>
      </div>
    </section>

    <section class="block" id="why" aria-labelledby="why-title">
      <div class="panel panel--wide panel--left">
        <p class="eyebrow">Why Love Asia</p>
        <h2 id="why-title">Why guests keep coming back</h2>
        <ul class="feature-grid">
          ${FEATURES.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
        </ul>
        <h3 class="fav-title">Guest favourites</h3>
        <ul class="chips">${FAVOURITES.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="block" id="visit" aria-labelledby="visit-title">
      <div class="panel panel--wide visit">
        <div>
          <p class="eyebrow">Visit us</p>
          <h2 id="visit-title">Find us in Kothanur, Hennur</h2>
          <ul class="contact">
            <li>${ICON.pin}<address>${esc(b.name)}, ${esc(b.address.street)},<br />${esc(b.address.area)}, ${esc(b.address.locality)} ${esc(b.address.postal)}</address></li>
            <li>${ICON.clock}<span>${esc(b.hours.label)}</span></li>
            <li>${ICON.phone}<a href="tel:${b.phoneE164}">${esc(b.phone)}</a></li>
          </ul>
          <div class="cta-row">
            <a class="btn btn--ink" href="${b.maps}" rel="noopener" target="_blank">Get directions ${ICON.arrow}</a>
            <a class="btn" href="tel:${b.phoneE164}">${ICON.phone} Call to book</a>
          </div>
        </div>
        <div class="map" id="map" data-src="${b.mapsEmbed}">
          <button class="map__load" type="button">${ICON.pin}<span>Show map</span></button>
        </div>
      </div>
    </section>

    <section class="block" id="faq" aria-labelledby="faq-title">
      <div class="panel panel--left">
        <p class="eyebrow">Good to know</p>
        <h2 id="faq-title">Frequently asked questions</h2>
        ${faqHtml(HOME_FAQ)}
      </div>
    </section>
  </div>
</main>

${siteFooter({ root })}

<script src="assets/js/site.js" defer></script>
<script src="assets/js/home.js" defer></script>
</body>
</html>`;
}
