// Short pages that each answer one thing people search for (sushi near Hennur, a family
// restaurant, somewhere for a date). They share the koi pond water of the home page but
// skip the bamboo grove, so they open straight on the answer and stay light on phones.
import { BUSINESS, esc, head, siteHeader, siteFooter, restaurantSchema, breadcrumbSchema, faqSchema, faqHtml, fullAddress, waLink, ICON } from "../site.mjs";

const b = BUSINESS;
const tel = `<a href="tel:${b.phoneE164}">${esc(b.phone)}</a>`;
const mark = (veg) => `<span class="mark ${veg ? "mark--veg" : "mark--nonveg"}" role="img" aria-label="${veg ? "Vegetarian" : "Non-vegetarian"}"></span>`;
const rupees = (n) => `₹${n.toLocaleString("en-IN")}`;

// a menu category straight from menu-data.js, so prices here never drift from the menu
function dishList(DATA, id, { only } = {}) {
  const cat = DATA.categories.find((c) => c.id === id);
  const groups = cat.groups || [{ name: "", prices: cat.prices, items: cat.items }];
  return groups
    .map((g) => {
      const items = g.items.filter((i) => !only || only.includes(i.name));
      if (!items.length) return "";
      const prices = g.prices ? g.prices.map((p) => `${esc(p.label)} ${rupees(p.price)}`).join(" · ") : "";
      return `<div class="dish-group">
        ${g.name && !only ? `<h3>${esc(g.name)}${prices ? ` <small>${prices}</small>` : ""}</h3>` : ""}
        <ul class="dish-list">
          ${items.map((i) => `<li>${mark(i.veg)}<div><b>${esc(i.name)}</b>${i.price ? ` <small>${rupees(i.price)}</small>` : ""}${i.desc ? `<span>${esc(i.desc)}</span>` : ""}</div></li>`).join("\n          ")}
        </ul>
      </div>`;
    })
    .join("\n");
}

const block = (k, id, inner, wide = false) => `<section class="block" aria-labelledby="${id}">
      <span class="block__kanji" aria-hidden="true" data-k="${k}"></span>
      <div class="panel${wide ? " panel--wide" : ""}">
        ${inner}
      </div>
    </section>`;

function landingPage({ path, name, title, description, kanji, eyebrow, h1, lede, cta, sections, faq }) {
  const root = "../";
  const hero = `<section class="block landing-hero" aria-labelledby="lp-title">
      <span class="block__kanji" aria-hidden="true" data-k="${kanji}"></span>
      <div class="panel">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${root}">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(name)}</span></nav>
        <p class="eyebrow">${eyebrow}</p>
        <h1 id="lp-title">${h1}</h1>
        <p class="lede">${lede}</p>
        <div class="cta-row">
          <a class="btn btn--ink" href="tel:${b.phoneE164}">${ICON.phone} Reserve a table</a>
          ${cta}
        </div>
        <p class="landing-hero__meta">${ICON.pin} ${esc(b.address.area)}, near Hennur Main Road · ${esc(b.hours.label)}</p>
      </div>
    </section>`;
  const faqBlock = block("心", "lp-faq", `<p class="eyebrow">Good to know</p>
        <h2 id="lp-faq">Questions people ask</h2>
        ${faqHtml(faq)}
        <p class="panel__more">${ICON.pin} ${esc(fullAddress())} · <a href="${b.maps}" rel="noopener" target="_blank">Directions</a></p>`);
  return `${head({
    title,
    description,
    path,
    root,
    css: ["assets/css/style.css", "assets/css/site.css"],
    schema: [restaurantSchema(), breadcrumbSchema([{ name: "Home", path: "" }, { name, path }]), faqSchema(faq)],
  })}
<body class="page-landing">
<!-- the live koi pond behind the page (only drawn while it's on screen) -->
<div class="pond-bg" id="pond-bg" aria-hidden="true"><div class="pond-caustics" id="caustics"></div><canvas id="pond"></canvas></div>

${siteHeader({ root })}

<main id="main">
  <div class="pond-area" id="pond-area">
    ${hero}

    ${sections.join("\n\n    ")}

    ${faqBlock}
  </div>
</main>

${siteFooter({ root })}

<script src="${root}assets/js/site.js" defer></script>
<script src="${root}assets/js/smooth.js" defer></script>
<script src="${root}assets/js/garden.js" defer></script>
</body>
</html>`;
}

/* ------------------------------ sushi ------------------------------ */
export const SUSHI_FAQ = [
  { q: "Where can I get sushi near Hennur?", a: `At Love Asia in Kothanur, just off Hennur Main Road and about 5 minutes from Byg Brewski Hennur. The address is ${esc(fullAddress())}. <a href="${b.maps}" rel="noopener" target="_blank">Get directions</a>.` },
  { q: "Do you have vegetarian sushi?", a: `Yes, six veg rolls: Karai Kappa Maki, Yasai Pikurusu, Asparagus Kurimuchizu, Paradise Roll, Raw Mango Avocado and Yasai Saku Futomaki. They're all on the <a href="../veg/#cat-sushi">veg menu</a>.` },
  { q: "How much does sushi cost at Love Asia?", a: "Veg rolls are ₹415 for 4 pieces and ₹675 for 8. Non-veg rolls are ₹469 for 4 and ₹769 for 8. The signature rolls come as 8 pieces, from ₹769." },
  { q: "I don't eat raw fish. Is there anything for me?", a: "Plenty. Every veg roll is raw-fish free, and on the non-veg side the California Roll uses crab stick, the Katsu Spicy Roll is crispy chicken, and the Karai Sake Roll is made with cooked salmon." },
  { q: "Can we order sushi for a party?", a: `Yes. Sushi works well on a set menu for groups. Tell us your numbers on the <a href="../events/">events page</a> and we'll suggest a mix.` },
  { q: "Are you open for lunch?", a: `Yes, every day from 12 noon to 11 PM. Call ${tel} to book a table.` },
];

export function sushiPage(DATA) {
  return landingPage({
    path: "sushi-hennur/",
    name: "Sushi in Hennur",
    title: "Sushi in Hennur, Bengaluru | Veg & Non-Veg Rolls | Love Asia",
    description: "Sushi near Hennur Main Road in Kothanur, North Bengaluru. Veg and non-veg maki, futomaki, California and salmon rolls from ₹415. Open daily, 12 noon to 11 PM.",
    kanji: "寿",
    eyebrow: "Sushi · Kothanur, Hennur",
    h1: "Sushi in Hennur, North Bengaluru",
    lede: "Sushi is what we're best known for. Veg and non-veg rolls, made to order, in a garden restaurant with a koi pond, five minutes from Byg Brewski Hennur.",
    cta: `<a class="btn" href="../non-veg/#cat-sushi">Full sushi menu ${ICON.arrow}</a>`,
    sections: [
      block("司", "sushi-list", `<p class="eyebrow">The rolls</p>
        <h2 id="sushi-list">Our sushi list</h2>
        <p>Every roll comes as 4 or 8 pieces, so you can try a few. The signature rolls are 8 pieces each.</p>
        ${dishList(DATA, "sushi")}`, true),
      block("初", "first-time", `<p class="eyebrow">New to sushi?</p>
        <h2 id="first-time">Where to start</h2>
        <p>You don't have to like raw fish to enjoy sushi here. A few easy first rolls:</p>
        <ul class="ticks">
          <li><b>California Roll.</b> Avocado, cucumber and crab stick. Creamy, crunchy and nothing raw.</li>
          <li><b>Katsu Spicy Roll.</b> Crispy chicken katsu with some heat. A good one if you like fried chicken.</li>
          <li><b>Paradise Roll.</b> Asparagus and cucumber, topped with slices of avocado. Light and fresh.</li>
          <li><b>Raw Mango Avocado Roll.</b> Tangy raw mango with creamy avocado, a nice local twist.</li>
        </ul>
        <p>Ready for more? Try the Seafood Futomaki, packed with salmon, tuna and cream cheese, or the Maguro Tokiyo Roll made with premium tuna.</p>`),
      block("菜", "veg-sushi", `<p class="eyebrow">Pure veg</p>
        <h2 id="veg-sushi">Vegetarian sushi in North Bengaluru</h2>
        <p>Vegetarians get a full sushi list of their own, not one token cucumber roll. There are six veg rolls, from a spicy cucumber maki to a big futomaki filled with crunchy vegetables and cream cheese. They sit on our separate <a href="../veg/">pure-veg menu</a>, and every dish on the menu is marked veg or non-veg.</p>`),
      block("膳", "with-sushi", `<p class="eyebrow">Make a meal of it</p>
        <h2 id="with-sushi">What to have with your sushi</h2>
        <p>Most tables share a couple of rolls with some <a href="../non-veg/#cat-dimsum">dim sum</a>, a bowl of <a href="../non-veg/#cat-ramen">ramen</a> or a Thai curry with jasmine rice, then finish with the Penguin Chocolate Bao. Dinner for two comes to about ₹1,000.</p>
        <p class="panel__more"><a href="../menu/">See the whole menu ${ICON.arrow}</a></p>`),
    ],
    faq: SUSHI_FAQ,
  });
}

/* ------------------------------ families ------------------------------ */
export const FAMILY_FAQ = [
  { q: "Is Love Asia kid-friendly?", a: "Very. There's a dedicated toddler play zone, a koi pond the kids can watch for ages, and plenty of mild food on the menu." },
  { q: "Is there a play area for kids?", a: "Yes, a toddler play zone, so parents can eat in peace while the little ones stay busy close by." },
  { q: "My kids don't eat spicy food. What can they have?", a: "Fried rice, Hakka noodles, spring rolls, babycorn tempura, gyoza and the crumbed chicken bao are all mild. Every spicy dish is marked on the menu." },
  { q: "Do you have vegetarian food?", a: `Yes. There's a separate <a href="../veg/">pure-veg menu</a>, and every dish is marked veg or non-veg.` },
  { q: "Is there parking?", a: "Yes, parking is available (self-park)." },
  { q: "Can we host a kid's birthday party?", a: `Yes, from 15 guests to 100+. Have a look at the <a href="../events/">birthday parties page</a> or call ${tel}.` },
];

export function familyPage(DATA) {
  const kidsPicks = ["Veg Spring Roll (5 pcs)", "Babycorn Tempura", "Zing Fried Chicken", "Honey Glazed Chicken", "Gyoza Veg", "Gyoza Chicken", "Tokyo Crumb Chicken Bao (2 pcs)", "Classic Fried Rice", "Hakka Noodles", "Penguin Chocolate Bao (2 pcs)", "Mango Sticky Rice", "Asian Ice Cream (one scoop)"];
  const picks = DATA.categories.map((c) => (c.groups || [{ items: c.items }]).flatMap((g) => g.items)).flat().filter((i) => kidsPicks.includes(i.name));
  return landingPage({
    path: "family-restaurant-hennur/",
    name: "Family restaurant in Hennur",
    title: "Kid-Friendly Family Restaurant in Hennur, Bengaluru | Love Asia",
    description: "A family restaurant in Kothanur near Hennur Main Road with a toddler play zone, a koi pond, a pure-veg menu and parking. Open daily, 12 noon to 11 PM.",
    kanji: "家",
    eyebrow: "Family dining · Kothanur, Hennur",
    h1: "A kid-friendly family restaurant in Hennur",
    lede: "A toddler play zone for the little ones, a koi pond for everyone, and a big shared menu with veg and non-veg for the whole family. Lunch or dinner, any day of the week.",
    cta: `<a class="btn" href="../menu/">View menu ${ICON.arrow}</a>`,
    sections: [
      block("童", "why-families", `<p class="eyebrow">Why families come here</p>
        <h2 id="why-families">Room for everyone, little ones included</h2>
        <ul class="ticks">
          <li><b>A toddler play zone.</b> One of the few Pan-Asian restaurants in Bengaluru with one, so you can actually finish your meal.</li>
          <li><b>The koi pond.</b> Kids could watch the koi all afternoon, and the Buddha waterfall keeps it calm.</li>
          <li><b>Food for every age.</b> Mild noodles and fried rice for fussy eaters, sushi and Thai curries for the grown-ups.</li>
          <li><b>Veg and non-veg.</b> A separate pure-veg menu, with every dish marked.</li>
          <li><b>Space.</b> ${b.capacity} seats over three floors, including the air-conditioned Glass Atrium for big family tables.</li>
          <li><b>Easy to get to.</b> Just off Hennur Main Road, with parking (self-park).</li>
        </ul>`),
      block("味", "kids-food", `<p class="eyebrow">Mild and kid-approved</p>
        <h2 id="kids-food">What the kids usually order</h2>
        <ul class="dish-list">
          ${picks.map((i) => `<li>${mark(i.veg)}<div><b>${esc(i.name)}</b>${i.desc ? `<span>${esc(i.desc)}</span>` : ""}</div></li>`).join("\n          ")}
        </ul>
        <p class="panel__more">Every price is on the <a href="../menu/">menu</a>.</p>`, true),
      block("誕", "kids-party", `<p class="eyebrow">Birthdays</p>
        <h2 id="kids-party">Kids' birthday parties</h2>
        <p>Book a floor for the party, from 15 guests to 100+, with a set menu or à la carte. The play zone and the koi keep the kids busy, and the parents get a proper meal too.</p>
        <p class="panel__more"><a href="../events/">Plan a birthday party ${ICON.arrow}</a></p>`),
    ],
    faq: FAMILY_FAQ,
  });
}

/* ------------------------------ date night ------------------------------ */
export const DATE_FAQ = [
  { q: "Is Love Asia good for a date?", a: "Yes. Book an outdoor table for a candle-lit dinner as the sun goes down, or ask for the Private Lounge on the second floor if you'd like it quieter." },
  { q: "Can we book a candle-light dinner?", a: `Yes. Call ${tel} or <a href="${waLink("Hi Love Asia! I'd like to book a table for two.")}" rel="noopener" target="_blank">WhatsApp us</a> and ask for an outdoor table. Let us know if it's a special occasion.` },
  { q: "What does dinner for two cost?", a: `About ${esc(b.costForTwo)}. The <a href="../menu/">menu</a> has every price.` },
  { q: "How late are you open?", a: "Every day until 11 PM. We open at 12 noon." },
  { q: "Can you help with an anniversary or a surprise?", a: `Tell us what you have in mind when you book and we'll help where we can. For bigger celebrations, see the <a href="../events/">events page</a>.` },
  { q: "Where are you?", a: `In Kothanur, near Hennur Main Road and about 5 minutes from Byg Brewski Hennur. <a href="${b.maps}" rel="noopener" target="_blank">Get directions</a>.` },
];

export function datePage(DATA) {
  return landingPage({
    path: "date-night-hennur/",
    name: "Date night in Hennur",
    title: "Romantic Dinner & Date Night in Hennur, Bengaluru | Love Asia",
    description: "Candle-lit outdoor dinners and a quiet private lounge in Kothanur, near Hennur Main Road. Sushi, dim sum and Thai curries for two, about ₹1,000. Open till 11 PM.",
    kanji: "愛",
    eyebrow: "Date night · Kothanur, Hennur",
    h1: "Date night in Hennur, North Bengaluru",
    lede: "A candle-lit table in the open air as the sun goes down, or a quiet corner in the Private Lounge. Bold Asian food to share, and a koi pond on the way in.",
    cta: `<a class="btn" href="${waLink("Hi Love Asia! I'd like to book a table for two.")}" rel="noopener" target="_blank">${ICON.whatsapp} Book on WhatsApp</a>`,
    sections: [
      block("景", "tables", `<p class="eyebrow">Pick your table</p>
        <h2 id="tables">Three settings for two</h2>
        <ul class="ticks">
          <li><b>The Outdoors.</b> Open-air seating with garden calm. Best for sunset candle-light dinners.</li>
          <li><b>The Private Lounge.</b> Second floor. Quiet, cool and intimate, for the dinners where the conversation runs long.</li>
          <li><b>The Glass Atrium.</b> First floor, air-conditioned, with huge windows. Lovely on a rainy evening.</li>
        </ul>`),
      block("膳", "for-two", `<p class="eyebrow">What to order</p>
        <h2 id="for-two">Dinner for two</h2>
        <p>Start with 4 pieces each of two sushi rolls (the Paradise Roll and the Sake Expression are a good pair), add a basket of dim sum, then share a Thai green or red curry with jasmine rice. Save room for the Japanese Cheesecake with Caramel Sauce or the Coconut Pudding.</p>
        ${dishList(DATA, "desserts", { only: ["Japanese Cheesecake with Caramel Sauce", "Japanese Coconut Pudding", "Penguin Chocolate Bao (2 pcs)", "Mango Sticky Rice"] })}
        <p class="panel__more"><a href="../menu/">See the whole menu ${ICON.arrow}</a></p>`, true),
      block("祝", "occasions", `<p class="eyebrow">Something to celebrate?</p>
        <h2 id="occasions">Anniversaries and proposals</h2>
        <p>Tell us it's a special night when you book, and we'll do our best to give you a good table. Planning something bigger, with family and friends? Have a look at our <a href="../events/">events page</a>.</p>`),
    ],
    faq: DATE_FAQ,
  });
}
