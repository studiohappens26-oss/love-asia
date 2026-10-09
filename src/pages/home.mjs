import { BUSINESS, esc, head, logoSvg, siteHeader, siteFooter, restaurantSchema, faqSchema, faqHtml, fullAddress, waLink, ICON, abs } from "../site.mjs";
import { choiceTiles, SVG_DEFS } from "./menu.mjs";
import { groveBack, groveFront, shore } from "./scene.mjs";

export const HOME_FAQ = [
  { q: "Where is Love Asia in Bengaluru?", a: `You'll find us at ${esc(fullAddress())}, in Kothanur near Hennur. <a href="${BUSINESS.maps}" rel="noopener" target="_blank">Get directions</a>.` },
  { q: "What are Love Asia's opening hours?", a: `We're open every day from 12:00 PM to 11:00 PM for lunch and dinner. On public holidays, give us a call first on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>.` },
  { q: "Do you have indoor and outdoor seating?", a: "Yes, both. You can sit outside in the open air by the garden, or inside in the air-conditioned dining room." },
  { q: "Is there a vegetarian menu?", a: `Yes. There's a separate <a href="veg/">pure-veg menu</a> with veg sushi, dim sum, gyoza, bao, Thai curries, ramen, noodles and desserts. The <a href="non-veg/">full menu</a> adds chicken, prawn, fish and seafood sushi.` },
  { q: "Can I host a birthday party or event at Love Asia?", a: `Yes. We host birthday parties, family celebrations and office get-togethers all the time, with a buffet or à la carte. Have a look at <a href="events/">events and parties</a>.` },
  { q: "Do you offer buffets?", a: "We do buffets for parties and group bookings. The full à la carte menu is available every day." },
  { q: "Is Love Asia kid-friendly?", a: "Very. There's a play area for children, and kids love watching the koi, so it's a popular spot for kids' birthdays." },
  { q: "How much does a meal cost?", a: `About ${esc(BUSINESS.costForTwo)}. The <a href="menu/">menu</a> has every price.` },
  { q: "Do you take reservations?", a: `Yes. Call us on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a> or <a href="${waLink("Hi Love Asia! I'd like to reserve a table.")}" rel="noopener" target="_blank">send us a WhatsApp</a>.` },
];

const SIGNATURES = [
  { name: "Sushi", kanji: "寿司", text: "What we're best known for. Try the Seafood Futomaki or the Sake Expression roll. There's a full vegetarian list too, including the Paradise Roll and Raw Mango Avocado.", link: "non-veg/#cat-sushi" },
  { name: "Ramen", kanji: "拉麺", text: "Miso, Tonkatsu and a properly spicy Korean ramen, made veg or with chicken.", link: "non-veg/#cat-ramen" },
  { name: "Bao", kanji: "包", text: "Soft steamed baos: Tokyo Crumb Chicken, Exotic Veg, and the Penguin Chocolate Bao for dessert, which everyone ends up photographing.", link: "non-veg/#cat-gyoza-bao" },
  { name: "Dim sum & gyoza", kanji: "点心", text: "Har Gow, Heritage Siu Mai, Mushroom Cream Cheese and Jade Crunch Garden dumplings, plus pan-seared gyoza.", link: "non-veg/#cat-dimsum" },
  { name: "Curries & noodles", kanji: "麺", text: "Thai green and red curries, Khow Suey, Pad Thai, Mee Goreng and wok-tossed Hakka noodles.", link: "non-veg/#cat-curries" },
  { name: "Mocktails", kanji: "飲", text: "Fresh, colourful mocktails that go well with a long lunch by the koi pond.", link: "#visit" },
];

const FEATURES = [
  ["The koi pond", "Eat beside a quiet koi pond in a Japanese-style garden."],
  ["Open-air seating", "Tables outside in the garden for slow evenings."],
  ["Air-conditioned indoors", "A cool dining room for hot afternoons and rainy days."],
  ["À la carte or buffet", "Order from the menu, or book a buffet for your group."],
  ["Friendly staff", "Guests often tell us how well they were looked after."],
  ["Good for kids", "There's a play area, and the koi keep little ones busy."],
  ["Veg and non-veg", "A separate pure-veg menu, with every dish clearly marked."],
  ["Mocktails", "Fresh, colourful drinks made at the bar."],
];

const FAVOURITES = ["Pad Thai noodles", "Chicken dim sum", "Black pepper prawns", "Tom Kha soup", "Mushroom cream cheese dim sum", "Khow Suey", "Prawn tempura", "Mongolian chicken", "Japanese coconut pudding"];

export function homePage() {
  const root = "";
  const b = BUSINESS;
  const hero = `<div class="hero-card" id="hero">
        <div class="hero__logo">${logoSvg()}</div>
        <p class="eyebrow">Kothanur · Hennur · Bengaluru</p>
        <p class="hero__display">Love, served Asian.</p>
        <h1 id="hero-title">Sushi &amp; Pan-Asian restaurant in Hennur, Bengaluru</h1>
        <p class="hero__lede">Sushi, ramen, bao and dim sum, eaten beside our koi pond.</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="menu/">View the menu ${ICON.arrow}</a>
          <a class="btn" href="events/">Plan a party</a>
        </div>
      </div>`;
  const reveal = `<div class="reveal-card" id="reveal">
        <span class="seal seal--veg reveal__seal" aria-hidden="true">愛</span>
        <h2>Step into the grove</h2>
        <p>Behind the bamboo there's a koi pond, soft light and Asian food made for sharing. A quiet corner of North Bengaluru.</p>
      </div>`;
  return `${head({
    title: "Love Asia | Sushi & Pan-Asian Restaurant in Hennur, Bengaluru",
    description: "Sushi, ramen, bao and dim sum by a koi pond in Kothanur, Hennur. Open-air and AC seating, veg and non-veg menus, buffets and birthday parties.",
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
<!-- the live koi pond behind every water section (only drawn while you're in the water) -->
<div class="pond-bg" id="pond-bg" aria-hidden="true"><div class="pond-caustics" id="caustics"></div><canvas id="pond"></canvas></div>

${siteHeader({ root, current: "home" })}

<main id="main">
  <!-- The grove. The sky and back bamboo drift slowly (sticky layer) while the tall
       foreground bamboo scrolls past and parts, like a camera panning down. -->
  <section class="grove" id="top" aria-labelledby="hero-title">
    <div class="grove__back" aria-hidden="true">${groveBack(root)}</div>
    <div class="grove__front">${groveFront(root, { hero, reveal })}</div>
  </section>

  ${shore(root)}

  <div class="pond-area" id="pond-area">
    <section class="block" id="about" aria-labelledby="about-title">
      <span class="block__kanji" aria-hidden="true" data-k="竹"></span>
      <div class="panel">
        <p class="eyebrow">The place</p>
        <h2 id="about-title">A Japanese garden in the middle of Hennur</h2>
        <p>Love Asia cooks food from Japan, Thailand, China, Korea, Malaysia and Indonesia, all in one place in Kothanur. Most people come for the sushi and dim sum. Plenty of them end up staying the whole afternoon by the koi pond.</p>
        <p>You can sit outside in the open air or inside in the air-conditioned dining room.</p>
        <ul class="facts">
          <li><b>Koi</b><span>pond-side tables</span></li>
          <li><b>Open-air</b><span>garden seating</span></li>
          <li><b>AC</b><span>indoor dining</span></li>
          <li><b>Daily</b><span>${esc(b.hours.short)}</span></li>
        </ul>
      </div>
    </section>

    <section class="block" id="menu" aria-labelledby="menu-title">
      <span class="block__kanji" aria-hidden="true" data-k="麺"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">The menu</p>
        <h2 id="menu-title">Choose your menu</h2>
        <p>Every dish and price is on here. Pick the full menu, or the vegetarian one if you don't eat meat.</p>
        ${choiceTiles(root, "span")}
        <p class="panel__more"><a href="menu/">See all menu options</a></p>
      </div>
    </section>

    <section class="block" id="signatures" aria-labelledby="sig-title">
      <span class="block__kanji" aria-hidden="true" data-k="寿"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">Known for</p>
        <h2 id="sig-title">Sushi, ramen, bao and dumplings</h2>
        <div class="sig-grid">
          ${SIGNATURES.map((s) => `<a class="sig" href="${s.link}">
            <span class="sig__kanji" aria-hidden="true" data-k="${s.kanji}"></span>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.text)}</p>
          </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="block block--feed" id="feed-koi" aria-labelledby="koi-title">
      <span class="block__kanji" aria-hidden="true" data-k="鯉"></span>
      <div class="panel">
        <p class="eyebrow">Say hello</p>
        <h2 id="koi-title">Come and feed our koi</h2>
        <p>Everyone ends up at the koi pond sooner or later. Tap anywhere on the water around you to drop some food and watch them swim over. The real ones are waiting in Kothanur.</p>
      </div>
      <div class="feed-zone" id="feed-zone">
        <p class="feed-hint" id="feed-hint">Tap the water to feed the koi</p>
        <p class="feed-count" id="feed-count" aria-live="polite"></p>
      </div>
    </section>

    <section class="block" id="events" aria-labelledby="events-title">
      <span class="block__kanji" aria-hidden="true" data-k="祝"></span>
      <div class="panel">
        <p class="eyebrow">Celebrations</p>
        <h2 id="events-title">Birthday parties and celebrations</h2>
        <p>We've hosted birthdays, anniversaries, kitty parties, team lunches and family get-togethers. Go for a buffet or order à la carte, with the koi pond in the background.</p>
        <ul class="ticks">
          <li>Air-conditioned dining room and open-air seating</li>
          <li>Buffet or à la carte, veg and non-veg</li>
          <li>A play area for younger guests</li>
          <li>Staff who have run plenty of parties</li>
        </ul>
        <div class="cta-row">
          <a class="btn btn--ink" href="events/">Plan your event ${ICON.arrow}</a>
          <a class="btn" href="${waLink("Hi Love Asia! I'd like to plan a party.")}" rel="noopener" target="_blank">${ICON.whatsapp} WhatsApp us</a>
        </div>
      </div>
    </section>

    <section class="block" id="why" aria-labelledby="why-title">
      <span class="block__kanji" aria-hidden="true" data-k="愛"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">Why Love Asia</p>
        <h2 id="why-title">Why people keep coming back</h2>
        <ul class="feature-grid">
          ${FEATURES.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
        </ul>
        <h3 class="fav-title">Guest favourites</h3>
        <ul class="chips">${FAVOURITES.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="block" id="visit" aria-labelledby="visit-title">
      <span class="block__kanji" aria-hidden="true" data-k="家"></span>
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
      <span class="block__kanji" aria-hidden="true" data-k="心"></span>
      <div class="panel">
        <p class="eyebrow">Good to know</p>
        <h2 id="faq-title">Frequently asked questions</h2>
        ${faqHtml(HOME_FAQ)}
      </div>
    </section>
  </div>
</main>

${siteFooter({ root })}

<script src="assets/js/site.js" defer></script>
<script src="assets/js/smooth.js" defer></script>
<script src="assets/js/home.js" defer></script>
</body>
</html>`;
}
