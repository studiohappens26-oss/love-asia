/*
 * Business details and shared page chrome (head, header, footer, logo).
 * Edit BUSINESS when anything about the restaurant changes; every page,
 * the structured data and the sitemap are rebuilt from it.
 */

export const SITE_URL = "https://studiohappens26-oss.github.io/love-asia"; // no trailing slash
export const BASE_PATH = new URL(SITE_URL + "/").pathname; // "/love-asia/"

export const BUSINESS = {
  name: "Love Asia",
  tagline: "Sushi & Pan-Asian Restaurant in Hennur, Bengaluru",
  phone: "+91 86603 29719",
  phoneE164: "+918660329719",
  whatsapp: "918660329719",
  address: {
    street: "1, Phase 2, Anjanappa Layout, Kothanur",
    area: "Hennur",
    locality: "Bengaluru",
    region: "Karnataka",
    postal: "560077",
    country: "IN",
  },
  geo: { lat: 13.0676369, lng: 77.6482515 },
  hours: { label: "Open daily, 12 noon – 11 pm", days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "12:00", closes: "23:00" },
  priceRange: "₹₹",
  costForTwo: "₹1,000 for two (approx.)",
  capacity: 100,
  cuisines: ["Pan-Asian", "Japanese", "Sushi", "Thai", "Chinese", "Korean", "Malaysian", "Indonesian"],
  google: "https://share.google/MaBbqN2bvV0pP56fA",
  maps: "https://www.google.com/maps/search/?api=1&query=Love%20Asia%2C%20Anjanappa%20Layout%2C%20Kothanur%2C%20Bengaluru%20560077",
  mapsEmbed: "https://maps.google.com/maps?q=13.0676369,77.6482515&z=16&output=embed",
  listings: [
    "https://www.zomato.com/bangalore/love-asia-hennur-bangalore",
    "https://www.district.in/dining/bangalore/love-asia-hennur-bangalore",
    "https://www.swiggy.com/restaurants/love-asia-hennur-bangalore-1336626/dineout",
    "https://www.eazydiner.com/bengaluru/love-asia-kothanur-bengaluru-712232",
  ],
};

export const fullAddress = () => {
  const a = BUSINESS.address;
  return `${a.street}, ${a.area}, ${a.locality}, ${a.region} ${a.postal}`;
};

// every kanji used on the site, so the seal font is downloaded as a tiny subset
const SEAL_GLYPHS = "鯉竹愛宴寿司拉麺包点心飲誕童家祝";

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const abs = (path) => SITE_URL + "/" + path.replace(/^\//, "");
export const waLink = (text) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;

/* ------------------------------- logo ------------------------------- */
// Traced from the Love Asia logo. Inline so its parts can animate.
let logoCount = 0;
export function logoSvg({ intro = false, label = BUSINESS.name } = {}) {
  const id = "lg-cut-" + ++logoCount;
  return `<svg class="logo${intro ? " logo--intro" : ""}" viewBox="24 40 154 128" role="img" aria-label="${esc(label)}">
  <defs><clipPath id="${id}"><rect x="0" y="85.5" width="204" height="60"/></clipPath></defs>
  <path class="lg-smile" clip-path="url(#${id})" d="M26.3 78A77 67 0 0 0 173.7 78" pathLength="1" fill="none" stroke="#dd1b46" stroke-width="6.6"/>
  <g class="lg-asia" fill="#231f20"><path d="M55 67h8L32.5 146H26z"/><path d="M60 67h7v79h-7z"/><path d="M111 67h7.6v79H111z"/><path d="M134 67h7v79h-7z"/><path d="M138 67h9l28 79h-7z"/></g>
  <path class="lg-s" pathLength="1" d="M95.5 75C94 68.5 87 66 85.2 74C83.4 82 84 96 88 108C91 117 94 126 94 138C94 150 90 158 82 164" fill="none" stroke="#231f20" stroke-width="7"/>
  <g class="lg-love" fill="#dd1b46"><path d="M56 43h7v9.3h5V59H56z"/><circle cx="87.5" cy="51.3" r="8.4"/><path class="lg-heart" d="M110.5 42.8L115 47.3L119.5 42.8L125 48.3V50.1L115 59.6L105 50.1V48.3Z"/><path d="M134 43h11v4h-4v2h4v4h-4v2h4v4H134z"/></g>
  <text class="lg-tm" x="161" y="81" font-size="6.5" fill="#231f20">TM</text>
</svg>`;
}

/* ------------------------------ icons ------------------------------ */
export const ICON = {
  phone: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6.6 3.5l2.6 3.1-1.6 2.3a12 12 0 0 0 7.5 7.5l2.3-1.6 3.1 2.6-1.4 3.1c-.3.6-.9 1-1.6.9C10.3 20.8 3.2 13.7 2.6 6.5c-.1-.7.3-1.3.9-1.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 20l1.2-3.9A8.5 8.5 0 1 1 8.4 19z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.5c0 3 2.5 6.5 6.5 6.5l1-1.6-1.8-1-1 .9c-1.2-.5-2.3-1.6-2.8-2.8l.9-1-1-1.8z" fill="currentColor"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ------------------------------- head ------------------------------- */
export function head({ title, description, path, root, css = [], schema = [], ogType = "website", image = "assets/img/og-image.png", noindex = false, extraHead = "" }) {
  const url = abs(path);
  const ld = schema.length
    ? `<script type="application/ld+json">${JSON.stringify(schema.length === 1 ? schema[0] : { "@context": "https://schema.org", "@graph": schema.map((s) => { const { ["@context"]: _, ...rest } = s; return rest; }) })}</script>`
    : "";
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${url}" />
  ${noindex ? '<meta name="robots" content="noindex" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />'}
  <meta name="theme-color" content="#f6f1e7" />
  <meta name="geo.region" content="IN-KA" />
  <meta name="geo.placename" content="Hennur, Bengaluru" />
  <meta name="geo.position" content="${BUSINESS.geo.lat};${BUSINESS.geo.lng}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${esc(BUSINESS.name)}" />
  <meta property="og:locale" content="en_IN" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${abs(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Love Asia — sushi and Pan-Asian restaurant in Hennur, Bengaluru" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${abs(image)}" />
  <link rel="icon" href="${root}assets/img/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="${root}assets/img/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@700&text=${encodeURIComponent(SEAL_GLYPHS)}&display=swap" rel="stylesheet" />
  ${css.map((c) => `<link rel="stylesheet" href="${root}${c}" />`).join("\n  ")}
  ${extraHead}
  ${ld}
</head>`;
}

/* ------------------------- header & footer ------------------------- */
const NAV = [
  { href: "", label: "Home", key: "home" },
  { href: "menu/", label: "Menu", key: "menu" },
  { href: "events/", label: "Events & Parties", key: "events" },
  { href: "#visit", label: "Visit", key: "visit", homeOnly: true },
];

export function siteHeader({ root, current }) {
  const links = NAV.filter((n) => n.key !== "home")
    .map((n) => {
      const href = n.homeOnly ? (current === "home" ? "#visit" : `${root}#visit`) : root + n.href;
      return `<a href="${href}"${n.key === current ? ' aria-current="page"' : ""}>${n.label === "Events & Parties" ? '<span class="long">Events &amp; Parties</span><span class="short">Events</span>' : n.label}</a>`;
    })
    .join("");
  return `<header class="site-header">
  <a class="site-header__logo" href="${root}" aria-label="${esc(BUSINESS.name)} — home">${logoSvg()}</a>
  <nav class="site-nav" aria-label="Main">${links}</nav>
  <a class="site-header__call" href="tel:${BUSINESS.phoneE164}" aria-label="Call ${esc(BUSINESS.name)}">${ICON.phone}<span>Call</span></a>
</header>`;
}

export function siteFooter({ root }) {
  const a = BUSINESS.address;
  return `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <a href="${root}" aria-label="${esc(BUSINESS.name)} — home">${logoSvg()}</a>
      <p>${esc(BUSINESS.tagline)}.</p>
    </div>
    <div>
      <h2>Visit</h2>
      <address>${esc(BUSINESS.name)}<br />${esc(a.street)},<br />${esc(a.area)}, ${esc(a.locality)} ${esc(a.postal)}</address>
      <p><a href="${BUSINESS.maps}" rel="noopener" target="_blank">Get directions</a></p>
    </div>
    <div>
      <h2>Hours &amp; contact</h2>
      <p>${esc(BUSINESS.hours.label)}</p>
      <p><a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a></p>
      <p><a href="${waLink("Hi Love Asia! I'd like to make a reservation.")}" rel="noopener" target="_blank">WhatsApp us</a></p>
    </div>
    <div>
      <h2>Explore</h2>
      <p><a href="${root}menu/">Menu</a> · <a href="${root}veg/">Veg</a> · <a href="${root}non-veg/">Non-Veg</a></p>
      <p><a href="${root}events/">Birthday parties &amp; events</a></p>
      <p><a href="${BUSINESS.google}" rel="noopener" target="_blank">Love Asia on Google</a></p>
    </div>
  </div>
  <p class="site-footer__fine">© ${new Date().getFullYear()} ${esc(BUSINESS.name)}, ${esc(a.area)}, ${esc(a.locality)}. All rights reserved.</p>
</footer>`;
}

/* --------------------------- structured data --------------------------- */
export function restaurantSchema() {
  const b = BUSINESS, a = b.address;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": abs("#restaurant"),
    name: b.name,
    description: "Sushi and Pan-Asian restaurant in Hennur, Bengaluru with a koi pond, air-conditioned dining for 100+ guests, à la carte and buffet options, and a venue for birthday parties and events.",
    url: abs(""),
    image: [abs("assets/img/og-image.png")],
    logo: abs("assets/img/logo.png"),
    telephone: b.phoneE164,
    priceRange: b.priceRange,
    servesCuisine: b.cuisines,
    acceptsReservations: true,
    hasMenu: abs("menu/"),
    maximumAttendeeCapacity: b.capacity,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.locality,
      addressRegion: a.region,
      postalCode: a.postal,
      addressCountry: a.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng },
    hasMap: b.maps,
    areaServed: ["Hennur", "Kothanur", "Kalyan Nagar", "HBR Layout", "Horamavu", "North Bengaluru"],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: b.hours.days, opens: b.hours.opens, closes: b.hours.closes }],
    amenityFeature: ["Koi pond", "Air-conditioned dining", "Seating for 100+ guests", "Outdoor seating", "Rooftop seating", "Kid-friendly", "Buffet", "Private parties & events"].map((n) => ({ "@type": "LocationFeatureSpecification", name: n, value: true })),
    sameAs: [b.google, ...b.listings],
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } })),
  };
}

export const faqHtml = (faqs) =>
  `<div class="faq">${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("")}</div>`;
