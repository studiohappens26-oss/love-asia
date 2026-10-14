import { BUSINESS, esc, head, logoSvg, siteHeader, siteFooter, restaurantSchema, faqSchema, faqHtml, fullAddress, waLink, ICON, abs } from "../site.mjs";
import { choiceTiles, SVG_DEFS } from "./menu.mjs";
import { groveBack, groveFront, dive } from "./scene.mjs";

export const HOME_FAQ = [
  { q: "Where is Love Asia in Bengaluru?", a: `In Kothanur, near Hennur Main Road, about 5 minutes from Byg Brewski Hennur. The address is ${esc(fullAddress())}. <a href="${BUSINESS.maps}" rel="noopener" target="_blank">Get directions</a>.` },
  { q: "What are Love Asia's opening hours?", a: `We're open every day from 12 noon to 11 PM. On public holidays, give us a call first on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>.` },
  { q: "Where can I sit?", a: "There are three spaces across three floors: open-air seating outside, the air-conditioned Glass Atrium on the first floor, and the quieter Private Lounge on the second floor. Together they seat 105." },
  { q: "Is there a vegetarian menu?", a: `Yes. There's a separate <a href="veg/">pure-veg menu</a> with veg sushi, dim sum, gyoza, bao, Thai curries, ramen, noodles and desserts. The <a href="non-veg/">full menu</a> adds chicken, prawn, fish and seafood sushi.` },
  { q: "Can I host a party or event at Love Asia?", a: `Yes, for anything from 15 guests to 100+. Choose a set menu or order à la carte. Birthdays, family get-togethers and team events: tell us your date and guest count on the <a href="events/">events page</a>.` },
  { q: "Is Love Asia good for kids?", a: "Very. We have a dedicated toddler play zone, so parents can enjoy their meal while the little ones stay busy, and kids love watching the koi." },
  { q: "Can I work from Love Asia?", a: `Yes. There's free Wi-Fi and ${BUSINESS.chargingPoints} charging points, so it's an easy place to work, meet or have a corporate lunch.` },
  { q: "Is there parking?", a: "Yes, parking is available (self-park)." },
  { q: "How much does a meal cost?", a: `About ${esc(BUSINESS.costForTwo)}. The <a href="menu/">menu</a> has every price.` },
  { q: "Do you take reservations?", a: `Yes. Call us on <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>, email <a href="mailto:${BUSINESS.email}">${esc(BUSINESS.email)}</a> or <a href="${waLink("Hi Love Asia! I'd like to reserve a table.")}" rel="noopener" target="_blank">send us a WhatsApp</a>.` },
];

// Three floors, three moods. (Ambience photos go in `photo` when they're ready.)
const SPACES = [
  { name: "The Outdoors", where: "Open air", text: "Open-air seating with fresh air and garden calm.", best: "Sunset candle-light dinners and relaxed weekend sundowners." },
  { name: "The Glass Atrium", where: "First floor · AC", text: "A bright, spacious, air-conditioned floor. Massive glass windows let in the city's light and weather while you stay comfortable.", best: "Brunches, rainy-day meals, group tables and parties." },
  { name: "The Private Lounge", where: "Second floor", text: "Quiet, cool and intimate.", best: "Date nights, family dinners and small parties where the conversation runs long." },
];

// Our signature dishes. They slide; dish photos go in `photo` when they're ready.
const SIGNATURES = [
  { name: "Sushi", kanji: "寿司", text: "What we're best known for. Try the Seafood Futomaki or the Sake Expression roll. There's a full vegetarian list too, including the Paradise Roll and Raw Mango Avocado.", link: "non-veg/#cat-sushi" },
  { name: "Ramen", kanji: "拉麺", text: "Miso, Tonkatsu and a properly spicy Korean ramen, made veg or with chicken.", link: "non-veg/#cat-ramen" },
  { name: "Bao", kanji: "包", text: "Soft steamed baos: Tokyo Crumb Chicken, Exotic Veg, and the Penguin Chocolate Bao for dessert, which everyone ends up photographing.", link: "non-veg/#cat-gyoza-bao" },
  { name: "Dim sum & gyoza", kanji: "点心", text: "Har Gow, Heritage Siu Mai, Mushroom Cream Cheese and Jade Crunch Garden dumplings, plus pan-seared gyoza.", link: "non-veg/#cat-dimsum" },
  { name: "Curries & noodles", kanji: "麺", text: "Thai green and red curries, Burmese Khow Suey, Pad Thai, Indonesian Mee Goreng and wok-tossed Hakka noodles.", link: "non-veg/#cat-curries" },
];

const KIDS_ICON = `<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fbe7c9"/><circle cx="24" cy="21" r="9.5" fill="#fff8ee" stroke="#4a4136" stroke-width="1.6"/><circle cx="20.5" cy="20" r="1.3" fill="#4a4136"/><circle cx="27.5" cy="20" r="1.3" fill="#4a4136"/><path d="M20.5 24.5c2 2 5 2 7 0" fill="none" stroke="#4a4136" stroke-width="1.5" stroke-linecap="round"/><path d="M16 14c2-4 6-5 8-5s6 1 8 5" fill="none" stroke="#c9563c" stroke-width="2.2" stroke-linecap="round"/><path d="M13 39c1.5-5 6-8 11-8s9.5 3 11 8" fill="#f2b9a3"/><circle cx="36" cy="12" r="2.2" fill="#dd1b46"/></svg>`;

export function homePage() {
  const root = "";
  const b = BUSINESS;
  const hero = `<div class="hero-card" id="hero">
        <div class="hero__logo">${logoSvg()}</div>
        <p class="eyebrow">Kothanur · North Bengaluru</p>
        <p class="hero__display">Bold Asian flavours.<br />Serene open spaces.</p>
        <p class="hero__stats">5,000 sq ft to unwind. Three floors. Three moods. ${b.capacity} seats.</p>
        <h1 id="hero-title">Modern Pan-Asian restaurant in Kothanur, North Bengaluru</h1>
        <p class="hero__lede">With a koi pond, a calming Buddha waterfall, a toddler play zone and Bangalore's best weather as your backdrop.</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="tel:${b.phoneE164}">${ICON.phone} Reserve a table</a>
          <a class="btn" href="menu/">View menu ${ICON.arrow}</a>
        </div>
      </div>`;
  const reveal = `<div class="reveal-card" id="reveal">
        <span class="seal seal--veg reveal__seal" aria-hidden="true">愛</span>
        <h2>Step into the grove</h2>
        <p>Love Asia is a modern Pan-Asian restaurant for slow dinners, long catch-ups and celebrations that deserve a better setting. Walk past the koi pond, where the fish drift lazily below, and a serene Buddha waterfall welcomes you in. Beyond it, a towering glass structure frames Bangalore's gentle skies, so a rainy evening or a golden sunset becomes part of your meal.</p>
      </div>`;
  return `${head({
    title: "Love Asia | Pan-Asian Restaurant in Kothanur, Hennur, Bengaluru",
    description: "Bold Asian flavours, serene open spaces. A 105-seat Pan-Asian restaurant over three floors in Kothanur, near Hennur Main Road, with a koi pond, Buddha waterfall, glass atrium and toddler play zone.",
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

  <div class="pond-area" id="pond-area">
    ${dive(root)}

    <section class="block" id="spaces" aria-labelledby="spaces-title">
      <span class="block__kanji" aria-hidden="true" data-k="竹"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">Three floors, three moods</p>
        <h2 id="spaces-title">Sit where you feel like it</h2>
        <ul class="spaces">
          ${SPACES.map((sp) => `<li class="space">
            <p class="space__where">${esc(sp.where)}</p>
            <h3>${esc(sp.name)}</h3>
            <p>${esc(sp.text)}</p>
            <p class="space__best"><b>Best for</b> ${esc(sp.best)}</p>
          </li>`).join("")}
        </ul>
        <ul class="facts">
          <li><b>5,000</b><span>sq ft to unwind</span></li>
          <li><b>3</b><span>floors</span></li>
          <li><b>${b.capacity}</b><span>seats</span></li>
          <li><b>Daily</b><span>${esc(b.hours.short)}</span></li>
        </ul>
      </div>
    </section>

    <section class="block" id="menu" aria-labelledby="menu-title">
      <span class="block__kanji" aria-hidden="true" data-k="麺"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">The food</p>
        <h2 id="menu-title">Every plate, made for sharing</h2>
        <p>Japanese, Thai, Indonesian, Burmese and Chinese flavours from one modern Pan-Asian kitchen.</p>
        ${choiceTiles(root, "span")}
        <p class="panel__more"><a href="menu/">See all menu options</a></p>
      </div>
    </section>

    <section class="block" id="signatures" aria-labelledby="sig-title">
      <span class="block__kanji" aria-hidden="true" data-k="寿"></span>
      <div class="panel panel--wide">
        <p class="eyebrow">Known for</p>
        <h2 id="sig-title">Our signature dishes</h2>
        <div class="sig-slider" id="sig-slider" tabindex="0" aria-label="Signature dishes, scroll sideways">
          ${SIGNATURES.map((s) => `<a class="sig" href="${s.link}">
            <span class="sig__kanji" aria-hidden="true" data-k="${s.kanji}"></span>
            <h3>${esc(s.name)}</h3>
            <p>${esc(s.text)}</p>
          </a>`).join("")}
        </div>
        <div class="sig-nav">
          <button class="sig-nav__btn" type="button" data-dir="-1" aria-label="Previous dish" aria-controls="sig-slider">${ICON.arrow}</button>
          <button class="sig-nav__btn" type="button" data-dir="1" aria-label="Next dish" aria-controls="sig-slider">${ICON.arrow}</button>
        </div>
      </div>
    </section>

    <section class="block" id="kids" aria-labelledby="kids-title">
      <span class="block__kanji" aria-hidden="true" data-k="童"></span>
      <div class="panel">
        <p class="eyebrow">Room for little ones</p>
        <h2 id="kids-title">A play zone for toddlers</h2>
        <p>One of the few Pan-Asian restaurants in Bengaluru with a dedicated toddler play zone, so parents can enjoy the meal while the little ones stay busy.</p>
        <a class="kids-link" href="menu/">${KIDS_ICON}<span><b>Food for little ones</b><small>Explore the menu</small></span>${ICON.arrow}</a>
      </div>
    </section>

    <section class="block block--feed" id="feed-koi" aria-labelledby="koi-title">
      <span class="block__kanji" aria-hidden="true" data-k="鯉"></span>
      <div class="panel">
        <p class="eyebrow">Say hello</p>
        <h2 id="koi-title">Come and feed our koi</h2>
        <p>Everyone ends up at the koi pond sooner or later. Tap anywhere on the water around you to drop some food and watch them swim over. The real ones are waiting for you at Love Asia.</p>
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
        <h2 id="events-title">A floor for your celebration, from 15 guests to 100+</h2>
        <p>Choose a set menu or order à la carte, whichever suits your group. Birthdays, family get-togethers, team events: tell us your date and guest count, and we'll take care of the rest.</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="events/#enquire">Enquire about a party ${ICON.arrow}</a>
          <a class="btn" href="${waLink("Hi Love Asia! I'd like to plan a party.")}" rel="noopener" target="_blank">${ICON.whatsapp} WhatsApp us</a>
        </div>
      </div>
    </section>

    <section class="block" id="work" aria-labelledby="work-title">
      <span class="block__kanji" aria-hidden="true" data-k="飲"></span>
      <div class="panel">
        <p class="eyebrow">Work &amp; meetings</p>
        <h2 id="work-title">Bring your laptop. Stay for lunch.</h2>
        <p>With ${b.chargingPoints} charging points and free Wi-Fi, Love Asia is an easy place to work, meet and brainstorm over a corporate lunch.</p>
        <ul class="facts facts--two">
          <li><b>${b.chargingPoints}</b><span>charging points</span></li>
          <li><b>Free</b><span>Wi-Fi</span></li>
        </ul>
      </div>
    </section>

    <section class="block" id="visit" aria-labelledby="visit-title">
      <span class="block__kanji" aria-hidden="true" data-k="家"></span>
      <div class="panel panel--wide visit">
        <div>
          <p class="eyebrow">Visit us</p>
          <h2 id="visit-title">Find us in Kothanur</h2>
          <p class="visit__landmark">${esc(b.landmark)}.</p>
          <ul class="contact">
            <li>${ICON.pin}<address>${esc(b.name)}, ${esc(b.address.street)},<br />${esc(b.address.area)}, ${esc(b.address.locality)}, ${esc(b.address.region)} ${esc(b.address.postal)}</address></li>
            <li>${ICON.clock}<span>${esc(b.hours.label)}</span></li>
            <li>${ICON.phone}<a href="tel:${b.phoneE164}">${esc(b.phone)}</a></li>
            <li>${ICON.mail}<a href="mailto:${b.email}">${esc(b.email)}</a></li>
            <li>${ICON.car}<span>${esc(b.parking)}</span></li>
            <li>${ICON.insta}<a href="${b.instagram.url}" rel="noopener" target="_blank">Follow us on Instagram: @${esc(b.instagram.handle)}</a></li>
          </ul>
          <div class="cta-row">
            <a class="btn btn--ink" href="${b.maps}" rel="noopener" target="_blank">Get directions ${ICON.arrow}</a>
            <a class="btn" href="${b.google}" rel="noopener" target="_blank">Google us</a>
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
<script src="assets/js/garden.js" defer></script>
<script src="assets/js/tile-koi.js" defer></script>
</body>
</html>`;
}
