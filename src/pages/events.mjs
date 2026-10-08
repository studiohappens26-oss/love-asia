import { BUSINESS, esc, head, siteHeader, siteFooter, restaurantSchema, breadcrumbSchema, faqSchema, faqHtml, waLink, ICON, fullAddress } from "../site.mjs";

export const EVENTS_FAQ = [
  { q: "How many guests can Love Asia host?", a: "We comfortably host 100+ guests, so everything from an intimate birthday dinner to a large family celebration or office party fits." },
  { q: "Do you offer buffets for parties?", a: "Yes. For parties and group bookings you can choose a buffet or order from our à la carte menu — we'll help you pick what suits your group and budget." },
  { q: "Can we have both veg and non-veg food?", a: `Of course. Our <a href="../veg/">vegetarian menu</a> and <a href="../non-veg/">full menu</a> are both available for events, with dishes clearly marked veg or non-veg.` },
  { q: "Is Love Asia good for kids' birthday parties?", a: "Yes — it's kid-friendly with a play area for children, and the koi pond is always a hit with little guests." },
  { q: "How do I book a party?", a: `Send us your date, guest count and occasion on <a href="${waLink("Hi Love Asia! I'd like to plan a party.")}" rel="noopener" target="_blank">WhatsApp</a> or call <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>. Weekends fill up quickly, so it helps to book early.` },
];

const OCCASIONS = [
  ["Birthday parties", "Adult birthdays, milestone birthdays and surprise dinners, with space for the whole crowd.", "誕"],
  ["Kids' birthdays", "A kid-friendly venue with a play area and a koi pond the little ones love.", "童"],
  ["Anniversaries", "A calm, candle-lit corner by the pond for two — or a celebration for the whole family.", "愛"],
  ["Corporate lunches & team dinners", "Air-conditioned dining for office teams, offsites and client meals.", "宴"],
  ["Family get-togethers", "Reunions, festive lunches and kitty parties around big shared plates.", "家"],
  ["Festive celebrations", "Make the most of the season with a buffet spread for your group.", "祝"],
];

export function eventsPage() {
  const root = "../";
  const path = "events/";
  const b = BUSINESS;
  return `${head({
    title: "Birthday Party & Event Venue in Hennur, Bengaluru — Love Asia",
    description: "Birthday parties, kids' parties, corporate lunches and family celebrations at Love Asia, Hennur. Seats 100+, air-conditioned, buffet or à la carte.",
    path,
    root,
    css: ["assets/css/style.css", "assets/css/site.css"],
    schema: [restaurantSchema(), breadcrumbSchema([{ name: "Home", path: "" }, { name: "Events & Parties", path }]), faqSchema(EVENTS_FAQ)],
  })}
<body class="page-events mode-veg">
<div class="scene" aria-hidden="true"><div class="scene-grove" id="grove"></div></div>

${siteHeader({ root, current: "events" })}

<main id="main" class="sub-main">
  <section class="sub-hero" aria-labelledby="ev-title">
    <div class="panel panel--hero">
      <span class="seal" aria-hidden="true">宴</span>
      <p class="eyebrow">Events &amp; parties</p>
      <h1 id="ev-title">Birthday parties &amp; events in Hennur, Bengaluru</h1>
      <p class="lede">Celebrate by the koi pond. Love Asia hosts 100+ guests in an air-conditioned, Japanese-garden setting, with buffet or à la carte menus your whole group will enjoy.</p>
      <ul class="facts">
        <li><b>100+</b><span>guests</span></li>
        <li><b>Buffet</b><span>or à la carte</span></li>
        <li><b>Veg</b><span>&amp; non-veg</span></li>
        <li><b>AC</b><span>dining room</span></li>
      </ul>
      <div class="cta-row">
        <a class="btn btn--ink" href="#enquire">Enquire now ${ICON.arrow}</a>
        <a class="btn" href="tel:${b.phoneE164}">${ICON.phone} ${esc(b.phone)}</a>
      </div>
    </div>
  </section>

  <section class="block" aria-labelledby="occ-title">
    <div class="panel panel--wide">
      <p class="eyebrow">What we host</p>
      <h2 id="occ-title">Celebrations of every size</h2>
      <ul class="occasions">
        ${OCCASIONS.map(([t, d, k]) => `<li><span class="occ__kanji" aria-hidden="true">${k}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
      </ul>
    </div>
  </section>

  <section class="block" aria-labelledby="why-ev">
    <div class="panel">
      <p class="eyebrow">Why celebrate here</p>
      <h2 id="why-ev">Everything your party needs</h2>
      <ul class="ticks">
        <li><b>Room for everyone</b> — seating for 100+ guests</li>
        <li><b>Comfortable all year</b> — air-conditioned dining, plus outdoor and rooftop seating</li>
        <li><b>Food people talk about</b> — sushi, dim sum, bao, ramen, Thai curries and noodles</li>
        <li><b>Your choice of format</b> — buffet spreads or à la carte from the full menu</li>
        <li><b>Something for every diet</b> — a dedicated pure-veg menu, clearly marked</li>
        <li><b>Great mocktails</b> — a hit with every age group</li>
        <li><b>A team that's done this before</b> — warm, attentive staff who've run countless parties</li>
      </ul>
      <p class="panel__more">See what's cooking: <a href="${root}veg/">Veg menu</a> · <a href="${root}non-veg/">Full menu</a></p>
    </div>
  </section>

  <section class="block" id="enquire" aria-labelledby="enq-title">
    <div class="panel">
      <p class="eyebrow">Plan your event</p>
      <h2 id="enq-title">Tell us about your celebration</h2>
      <p>Fill this in and we'll open WhatsApp with your details ready to send — or simply call <a href="tel:${b.phoneE164}">${esc(b.phone)}</a>.</p>
      <form class="enquiry" id="enquiry" action="${waLink("Hi Love Asia! I'd like to plan a party.")}" method="get" target="_blank">
        <label>Your name<input name="name" autocomplete="name" required /></label>
        <label>Occasion
          <select name="occasion">
            <option>Birthday party</option><option>Kids' birthday</option><option>Anniversary</option>
            <option>Corporate lunch / dinner</option><option>Family get-together</option><option>Other</option>
          </select>
        </label>
        <div class="enquiry__row">
          <label>Date<input name="date" type="date" /></label>
          <label>Guests<input name="guests" type="number" min="1" max="500" inputmode="numeric" placeholder="e.g. 40" /></label>
        </div>
        <label>Food preference
          <select name="food"><option>Buffet</option><option>À la carte</option><option>Not sure yet</option></select>
        </label>
        <label>Anything else?<textarea name="notes" rows="3" placeholder="Veg / non-veg mix, timing, cake, decor…"></textarea></label>
        <button class="btn btn--ink" type="submit">${ICON.whatsapp} Send on WhatsApp</button>
      </form>
    </div>
  </section>

  <section class="block" aria-labelledby="ev-faq">
    <div class="panel">
      <p class="eyebrow">Good to know</p>
      <h2 id="ev-faq">Event FAQs</h2>
      ${faqHtml(EVENTS_FAQ)}
      <p class="panel__more">${ICON.pin} ${esc(fullAddress())} · <a href="${b.maps}" rel="noopener" target="_blank">Directions</a></p>
    </div>
  </section>
</main>

${siteFooter({ root })}

<script src="${root}assets/js/bamboo.js" defer></script>
<script src="${root}assets/js/site.js" defer></script>
</body>
</html>`;
}
