import { groveBack, groveFront, dive } from "./scene.mjs";
import { BUSINESS, esc, head, siteHeader, siteFooter, restaurantSchema, breadcrumbSchema, faqSchema, faqHtml, waLink, ICON, fullAddress } from "../site.mjs";

export const EVENTS_FAQ = [
  { q: "How many guests can Love Asia host?", a: "We can seat 100+ guests at the same time, between the air-conditioned dining room and the open-air seating outside. That's enough for anything from a small birthday dinner to a big family do or an office party." },
  { q: "Do you offer buffets for parties?", a: "Yes. For parties and group bookings you can have a buffet or order à la carte. Tell us your numbers and budget and we'll help you work out the food." },
  { q: "Can we have both veg and non-veg food?", a: `Yes. Our <a href="../veg/">vegetarian menu</a> and <a href="../non-veg/">full menu</a> are both available for events, and every dish is marked veg or non-veg.` },
  { q: "Is Love Asia good for kids' birthday parties?", a: "Yes. There's a play area, and the kids usually spend half the party watching the koi." },
  { q: "How do I book a party?", a: `Send us your date, guest count and occasion on <a href="${waLink("Hi Love Asia! I'd like to plan a party.")}" rel="noopener" target="_blank">WhatsApp</a> or call <a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a>. Weekends go fast, so book early if you can.` },
];

const OCCASIONS = [
  ["Birthday parties", "Big birthdays, small birthdays and surprise dinners, with room for everyone you invite.", "誕"],
  ["Kids' birthdays", "There's a play area, and the koi pond keeps the little ones busy.", "童"],
  ["Anniversaries", "A quiet table by the pond for two, or a party for the whole family.", "愛"],
  ["Corporate lunches & team dinners", "Air-conditioned dining for team lunches, offsites and client meals.", "宴"],
  ["Family get-togethers", "Reunions, festive lunches and kitty parties over big shared plates.", "家"],
  ["Festive celebrations", "Book a buffet for your group over the festive season.", "祝"],
];

export function eventsPage() {
  const root = "../";
  const path = "events/";
  const b = BUSINESS;
  const heroCard = `<div class="hero-card hero-card--events" id="hero">
        <span class="seal" aria-hidden="true">宴</span>
        <p class="eyebrow">Events &amp; parties</p>
        <h1 id="ev-title">Birthday parties &amp; events in Hennur, Bengaluru</h1>
        <p class="lede">Have your party by the koi pond. We can seat 100+ guests at the same time, inside in the air-conditioned dining room or out in the open air, with a buffet or à la carte.</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="#enquire">Enquire now ${ICON.arrow}</a>
          <a class="btn" href="tel:${b.phoneE164}">${ICON.phone} ${esc(b.phone)}</a>
        </div>
      </div>`;
  return `${head({
    title: "Birthday Party & Event Venue in Hennur, Bengaluru | Love Asia",
    description: "Birthday parties, kids' parties and corporate lunches at Love Asia, Hennur. Seats 100+ guests at once, AC and open-air, buffet or à la carte.",
    path,
    root,
    css: ["assets/css/style.css", "assets/css/site.css"],
    schema: [restaurantSchema(), breadcrumbSchema([{ name: "Home", path: "" }, { name: "Events & Parties", path }]), faqSchema(EVENTS_FAQ)],
  })}
<body class="page-events">
<!-- the live koi pond behind every water section (only drawn while you're in the water) -->
<div class="pond-bg" id="pond-bg" aria-hidden="true"><div class="pond-caustics" id="caustics"></div><canvas id="pond"></canvas></div>

${siteHeader({ root, current: "events" })}

<main id="main">
  <!-- the same grove as the home page, shorter: the bamboo parts as you scroll down to the pond -->
  <section class="grove grove--short" id="top" aria-labelledby="ev-title" data-part=".6" data-pin=".5" data-len="1.5">
    <div class="grove__back" aria-hidden="true">${groveBack(root)}</div>
    <div class="grove__front">${groveFront(root, { hero: heroCard, reveal: "" })}</div>
  </section>

  <div class="pond-area" id="pond-area">
    ${dive(root)}

    <section class="block" aria-labelledby="glance-title">
      <span class="block__kanji" aria-hidden="true" data-k="祝"></span>
      <div class="panel">
        <p class="eyebrow">At a glance</p>
        <h2 id="glance-title">Room for the whole party</h2>
        <ul class="facts">
          <li><b>100+</b><span>guests at once</span></li>
          <li><b>Buffet</b><span>or à la carte</span></li>
          <li><b>Veg</b><span>&amp; non-veg</span></li>
          <li><b>AC</b><span>&amp; open-air</span></li>
        </ul>
      </div>
    </section>

  <section class="block" aria-labelledby="occ-title">
      <span class="block__kanji" aria-hidden="true" data-k="誕"></span>
    <div class="panel panel--wide">
      <p class="eyebrow">What we host</p>
      <h2 id="occ-title">Parties big and small</h2>
      <ul class="occasions">
        ${OCCASIONS.map(([t, d, k]) => `<li><span class="occ__kanji" aria-hidden="true" data-k="${k}"></span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
      </ul>
    </div>
  </section>

  <section class="block" aria-labelledby="why-ev">
      <span class="block__kanji" aria-hidden="true" data-k="愛"></span>
    <div class="panel">
      <p class="eyebrow">Why celebrate here</p>
      <h2 id="why-ev">Why have it here</h2>
      <ul class="ticks">
        <li><b>Room for everyone.</b> We can seat 100+ guests at the same time.</li>
        <li><b>Indoors or out.</b> An air-conditioned dining room, and open-air seating in the garden.</li>
        <li><b>The food.</b> Sushi, dim sum, bao, ramen, Thai curries and noodles.</li>
        <li><b>Buffet or à la carte.</b> Whichever suits your group.</li>
        <li><b>Veg guests covered.</b> A separate pure-veg menu, with every dish marked.</li>
        <li><b>Mocktails.</b> Kids and grown-ups both order them.</li>
        <li><b>Staff who've done this before.</b> They've run a lot of parties.</li>
      </ul>
      <p class="panel__more">Have a look at the food: <a href="${root}veg/">Veg menu</a> · <a href="${root}non-veg/">Full menu</a></p>
    </div>
  </section>

  <section class="block" id="enquire" aria-labelledby="enq-title">
      <span class="block__kanji" aria-hidden="true" data-k="宴"></span>
    <div class="panel">
      <p class="eyebrow">Plan your event</p>
      <h2 id="enq-title">Tell us about your celebration</h2>
      <p>Fill this in and we'll open WhatsApp with your message ready to send. Or just call <a href="tel:${b.phoneE164}">${esc(b.phone)}</a>.</p>
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
      <span class="block__kanji" aria-hidden="true" data-k="心"></span>
    <div class="panel">
      <p class="eyebrow">Good to know</p>
      <h2 id="ev-faq">Event FAQs</h2>
      ${faqHtml(EVENTS_FAQ)}
      <p class="panel__more">${ICON.pin} ${esc(fullAddress())} · <a href="${b.maps}" rel="noopener" target="_blank">Directions</a></p>
    </div>
  </section>
  </div>
</main>

${siteFooter({ root })}

<script src="${root}assets/js/site.js" defer></script>
<script src="${root}assets/js/smooth.js" defer></script>
<script src="${root}assets/js/garden.js" defer></script>
</body>
</html>`;
}
