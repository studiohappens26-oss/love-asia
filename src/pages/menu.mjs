import { BUSINESS, esc, abs, head, logoSvg, restaurantSchema, breadcrumbSchema } from "../site.mjs";

const TAG_LABELS = { spicy: "Spicy", chef: "Chef’s special", new: "New", jain: "Jain option" };

/* ------------------------------ data helpers ------------------------------ */
const isVegPrice = (p, item) => (p.veg === undefined ? (item ? item.veg : true) : p.veg);

// Normalise a category into groups, filtered for the mode
function prepare(c, mode) {
  const groups = (c.groups || [{ prices: c.prices, items: c.items || [] }])
    .map((g) => {
      const items = g.items
        .map((i) => {
          if (!i.variants) return mode === "nonveg" || i.veg ? i : null;
          const variants = i.variants.filter((v) => mode === "nonveg" || isVegPrice(v, i));
          return variants.length ? { ...i, variants } : null;
        })
        .filter(Boolean);
      const prices = g.prices && g.prices.filter((p) => mode === "nonveg" || isVegPrice(p));
      return { ...g, items, prices };
    })
    .filter((g) => g.items.length);
  return { ...c, groups };
}

export const categoriesFor = (DATA, mode) => DATA.categories.map((c) => prepare(c, mode)).filter((c) => c.groups.length);

// the prices that apply to a dish (its own, its variants, or its group's)
function optionsOf(i, g) {
  return i.variants || (i.price === undefined && g.prices && g.prices.length ? g.prices : null);
}

/* ------------------------------ rendering ------------------------------ */
function makeRender(DATA, mode) {
  const money = (p) => (typeof p === "number" ? DATA.currency + p.toLocaleString("en-IN") : esc(p || ""));
  const markHtml = (veg, label) =>
    `<span class="mark ${veg ? "mark--veg" : "mark--nonveg"}"${label ? ` role="img" aria-label="${veg ? "Vegetarian" : "Non-vegetarian"}"` : ' aria-hidden="true"'}></span>`;

  function pills(list, item) {
    const marks = list.some((p) => p.veg !== undefined) || (item && item.variants && item.variants.some((v) => v.veg !== undefined));
    return list.map((p) => `<span class="pill">${marks ? markHtml(isVegPrice(p, item)) : ""}<span>${esc(p.label)}</span><b>${money(p.price)}</b></span>`).join("");
  }

  function priceText(list) {
    const nums = list.map((p) => p.price).filter((n) => typeof n === "number");
    if (!nums.length) return "";
    const lo = Math.min(...nums), hi = Math.max(...nums);
    return lo === hi ? money(lo) : `${money(lo)}<span class="dash">–</span>${hi.toLocaleString("en-IN")}`;
  }

  let dishId = 0;
  function dishHtml(i, g) {
    const v = i.variants;
    const options = optionsOf(i, g);
    const single = options && options.length === 1 ? options[0] : null;
    const list = options || [{ price: i.price }];
    const vegs = v ? v.map((x) => isVegPrice(x, i)) : [i.veg];
    const allVeg = vegs.every(Boolean), noneVeg = !vegs.some(Boolean);
    const mark = allVeg || noneVeg ? markHtml(allVeg, true) : `<span class="mark mark--mixed" role="img" aria-label="Veg and non-veg options"></span>`;
    const label = single && !(mode === "veg" && /^veg$/i.test(single.label)) ? ` <small>· ${esc(single.label)}</small>` : "";
    const tags = i.tags && i.tags.length ? `<p class="dish__tags">${i.tags.map((t) => `<span class="tag tag--${esc(t)}">${esc(TAG_LABELS[t] || t)}</span>`).join("")}</p>` : "";
    const details =
      (i.desc ? `<p class="dish__desc">${esc(i.desc)}</p>` : "") +
      (options && !single ? `<div class="pills">${pills(options, v ? i : null)}</div>` : "") +
      tags;
    const id = "dish-" + ++dishId;
    const search = esc((i.name + " " + (i.desc || "") + " " + (v ? v.map((x) => x.label).join(" ") : "")).toLowerCase());
    const headHtml = `${mark}<span class="dish__name">${esc(i.name)}${label}</span><span class="dish__price">${priceText(list)}</span>`;
    if (!details) return `<li class="dish" data-search="${search}"><div class="dish__head">${headHtml}</div></li>`;
    return `<li class="dish" data-search="${search}">
      <button class="dish__head" type="button" aria-expanded="false" aria-controls="${id}">${headHtml}<span class="dish__chev" aria-hidden="true"></span></button>
      <div class="dish__more" id="${id}" role="region" aria-label="${esc(i.name)}"><div class="dish__inner">${details}</div></div>
    </li>`;
  }

  function groupTone(g) {
    const v = g.items.map((i) => (i.variants ? i.variants.some((x) => isVegPrice(x, i)) : i.veg));
    return v.every(Boolean) ? " group__name--veg" : v.some(Boolean) ? "" : " group__name--nonveg";
  }

  const groupHtml = (g) => `<div class="group">
      ${g.name ? `<h3 class="group__name${groupTone(g)}">${esc(g.name)}</h3>` : ""}
      <ul class="dishes">${g.items.map((i) => dishHtml(i, g)).join("")}</ul>
    </div>`;

  return { money, groupHtml };
}

/* ------------------------------ schema ------------------------------ */
function menuSchema(DATA, mode, path) {
  const cats = categoriesFor(DATA, mode);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": abs(path + "#menu"),
    name: mode === "veg" ? "Love Asia Vegetarian Menu" : "Love Asia Full Menu (Veg & Non-Veg)",
    url: abs(path),
    inLanguage: "en-IN",
    hasMenuSection: cats.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      hasMenuItem: c.groups.flatMap((g) =>
        g.items.map((i) => {
          const opts = optionsOf(i, g) || [{ price: i.price }];
          const veg = i.variants ? i.variants.some((x) => isVegPrice(x, i)) && i.variants.every((x) => isVegPrice(x, i)) : i.veg;
          return {
            "@type": "MenuItem",
            name: i.name,
            ...(i.desc ? { description: i.desc } : {}),
            ...(veg ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
            offers: opts.filter((o) => typeof o.price === "number").map((o) => ({ "@type": "Offer", ...(o.label ? { name: o.label } : {}), price: o.price, priceCurrency: "INR" })),
          };
        })
      ),
    })),
  };
}

/* ------------------------------ shared bits ------------------------------ */
const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <clipPath id="koi-body-clip"><path d="M18 25 C 30 15, 60 10, 95 14 C 112 16, 118 22, 118 25 C 118 28, 112 34, 95 36 C 60 40, 30 35, 18 25Z" /></clipPath>
    <symbol id="koi" viewBox="0 0 120 50">
      <g stroke="rgba(60,58,55,.35)" stroke-width=".8">
        <path d="M22 25 C 10 14, 3 8, 0 5 C 7 18, 7 32, 0 45 C 3 42, 10 36, 22 25Z" fill="rgba(255,250,243,.9)" />
        <path d="M88 15 C 84 6, 76 2, 70 2 C 74 8, 78 12, 84 16Z" fill="rgba(255,250,243,.9)" />
        <path d="M88 35 C 84 44, 76 48, 70 48 C 74 42, 78 38, 84 34Z" fill="rgba(255,250,243,.9)" />
        <path d="M18 25 C 30 15, 60 10, 95 14 C 112 16, 118 22, 118 25 C 118 28, 112 34, 95 36 C 60 40, 30 35, 18 25Z" fill="#fffaf3" />
      </g>
      <g clip-path="url(#koi-body-clip)">
        <ellipse cx="92" cy="21" rx="15" ry="10" fill="#e0472a" opacity=".3" /><ellipse cx="92" cy="21" rx="12" ry="8" fill="#e0472a" opacity=".9" />
        <ellipse cx="60" cy="28" rx="17" ry="10" fill="#e0472a" opacity=".3" /><ellipse cx="60" cy="28" rx="14" ry="8" fill="#e0472a" opacity=".9" />
        <ellipse cx="34" cy="22" rx="7" ry="5" fill="#e0472a" opacity=".85" />
      </g>
      <circle cx="108" cy="19" r="1.5" fill="#1b1b1b" /><circle cx="108" cy="31" r="1.5" fill="#1b1b1b" />
    </symbol>
    <symbol id="pad" viewBox="-50 -50 100 100">
      <path d="M0 0 L46 -10 C 50 10 40 38 10 46 C -20 52 -46 30 -46 2 C -46 -26 -22 -48 4 -46 C 28 -44 42 -30 46 -10 Z" fill="currentColor" fill-opacity=".38"/>
      <path d="M0 0 L42 -9 C 44 9 36 34 9 41 C -18 46 -41 27 -41 2 C -41 -23 -20 -43 4 -41 C 25 -39 38 -27 42 -9 Z" fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2"/>
    </symbol>
  </defs>
</svg>`;
export { SVG_DEFS };

const MINI_BAMBOO = `<svg class="mini-scene" viewBox="0 0 84 240" preserveAspectRatio="xMidYMid slice">
  <circle cx="56" cy="72" r="20" fill="#e2765f" opacity=".38"/>
  <path d="M0 150 C 14 134 25 120 40 122 C 56 124 60 140 72 134 C 78 131 81 126 84 127 V240 H0Z" fill="#c4cbca" opacity=".7"/>
  <path d="M0 172 C 18 164 36 176 54 168 C 68 162 77 170 84 166 V240 H0Z" fill="#efebe2"/>
  <g class="mb mb--1" fill="#5f685a"><rect x="12" y="14" width="4" height="240" rx="2"/><rect x="10.8" y="66" width="6.4" height="2" rx="1" fill="#3a4036"/><rect x="10.8" y="140" width="6.4" height="2" rx="1" fill="#3a4036"/><path d="M15 67 C 9 63 3 63 -1 67 C 4 69 10 69 15 67Z" fill="#2f372c"/><path d="M15 141 C 10 136 5 134 1 135 C 5 139 10 141 15 141Z" fill="#46513f"/></g>
  <g class="mb mb--2" fill="#7d8578"><rect x="32" y="0" width="5" height="250" rx="2"/><rect x="30.8" y="48" width="7.4" height="2" rx="1" fill="#4c5448"/><rect x="30.8" y="118" width="7.4" height="2" rx="1" fill="#4c5448"/><path d="M37 49 C 45 44 53 44 59 47 C 52 51 44 52 37 49Z" fill="#46513f"/><path d="M37 119 C 44 115 50 115 55 117 C 50 121 44 122 37 119Z" fill="#2f372c"/></g>
  <g class="mb mb--3" fill="#a5ad9c"><rect x="68" y="36" width="3.5" height="220" rx="1.5"/><rect x="66.8" y="96" width="6" height="1.8" rx=".9" fill="#7d8578"/><path d="M69 97 C 63 93 57 93 53 96 C 58 99 64 99 69 97Z" fill="#6b7665"/></g>
</svg>`;

// simple CSS fish shown until tile-koi.js swaps in the real swimming koi
const MINI_POND = `<canvas class="mini-koi" hidden></canvas>
  <svg class="mini-pad mini-pad--a"><use href="#pad"/></svg>
  <svg class="mini-pad mini-pad--b"><use href="#pad"/></svg>
  <span class="mini-ripple"></span><span class="mini-ripple"></span>
  <span class="koi-orbit">
    <span class="koi-pos koi-pos--a"><svg class="koi-svg" viewBox="0 0 120 50"><use href="#koi"/></svg></span>
    <span class="koi-pos koi-pos--b"><svg class="koi-svg koi-svg--b" viewBox="0 0 120 50"><use href="#koi"/></svg></span>
  </span>`;

// The two big Veg / Non-Veg tiles (also used on the home page)
export function choiceTiles(root, headingLevel = "strong") {
  return `<div class="choices">
    <a class="choice choice--nonveg" href="${root}non-veg/">
      <span class="choice__art" aria-hidden="true">${MINI_POND}</span>
      <span class="seal choice__seal" aria-hidden="true">鯉</span>
      <span class="choice__label">
        <${headingLevel}><span class="mark mark--nonveg" aria-hidden="true"></span>Non-Veg</${headingLevel}>
        <small>The full menu</small>
      </span>
    </a>
    <a class="choice choice--veg" href="${root}veg/">
      <span class="choice__art" aria-hidden="true">${MINI_BAMBOO}</span>
      <span class="seal seal--veg choice__seal" aria-hidden="true">竹</span>
      <span class="choice__label">
        <${headingLevel}><span class="mark mark--veg" aria-hidden="true"></span>Veg</${headingLevel}>
        <small>Pure vegetarian</small>
      </span>
    </a>
  </div>`;
}

/* ------------------------------ /menu/ ------------------------------ */
export function chooserPage(DATA) {
  const root = "../";
  const path = "menu/";
  return `${head({
    title: "Menu | Love Asia, Hennur | Sushi, Ramen, Dim Sum & Thai",
    description: "Browse the Love Asia menu: sushi, ramen, bao, dim sum, Thai curries, noodles and desserts. Choose the full veg & non-veg menu or the pure vegetarian menu.",
    path,
    root,
    css: ["assets/css/style.css"],
    schema: [restaurantSchema(), breadcrumbSchema([{ name: "Home", path: "" }, { name: "Menu", path }])],
  })}
<body class="is-landing page-chooser">
${SVG_DEFS}
<main class="landing landing--page" id="landing">
  <div class="landing__decor" aria-hidden="true">
    <svg class="decor-pad decor-pad--1"><use href="#pad"/></svg>
    <svg class="decor-pad decor-pad--2"><use href="#pad"/></svg>
    <svg class="decor-pad decor-pad--3"><use href="#pad"/></svg>
    <svg class="decor-koi decor-koi--1" viewBox="0 0 120 50"><use href="#koi"/></svg>
    <svg class="decor-koi decor-koi--2" viewBox="0 0 120 50"><use href="#koi"/></svg>
  </div>
  <div class="landing__inner">
    <a class="landing__home" href="${root}" aria-label="Back to the Love Asia home page">← Home</a>
    <h1 class="brand"><span class="brand__logo">${logoSvg({ label: "Love Asia menu" })}</span></h1>
    <p class="landing__prompt">How would you like to dine today?</p>
    ${choiceTiles(root, "strong")}
    <p class="landing__more">
      <a href="${root}events/">Planning a party? See events &amp; buffets</a>
    </p>
  </div>
</main>
<script src="${root}assets/js/menu.js" defer></script>
<script src="${root}assets/js/tile-koi.js" defer></script>
</body>
</html>`;
}

/* --------------------------- /veg/ and /non-veg/ --------------------------- */
export function menuPage(DATA, mode) {
  const root = "../";
  const path = mode === "veg" ? "veg/" : "non-veg/";
  const other = mode === "veg" ? "non-veg/" : "veg/";
  const cats = categoriesFor(DATA, mode);
  const { groupHtml } = makeRender(DATA, mode);
  const count = cats.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.items.length, 0), 0);
  const title = mode === "veg"
    ? "Vegetarian Menu & Prices | Love Asia, Hennur, Bengaluru"
    : "Full Menu & Prices | Love Asia, Hennur | Sushi & Dim Sum";
  const description = mode === "veg"
    ? `Pure vegetarian menu at Love Asia, Hennur: ${count} dishes including veg sushi rolls, dim sum, gyoza, bao, Thai curries, ramen, noodles and desserts, with prices.`
    : `The full Love Asia menu with prices: ${count} dishes including sushi, dim sum, gyoza, bao, Thai curries, ramen, Khow Suey, noodles, rice and desserts. Veg & non-veg.`;

  const sections = cats.map((c) => `
      <section class="cat" id="cat-${esc(c.id)}" data-cat="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
        <h2 class="cat__title" id="h-${esc(c.id)}"><span>${esc(c.name)}</span></h2>
        ${c.note ? `<p class="cat__note"><span>${esc(c.note)}</span></p>` : ""}
        ${c.groups.map(groupHtml).join("")}
      </section>`).join("");

  const sheetItems = cats
    .map((c, n) => `<li style="--i:${n}"><a href="#cat-${esc(c.id)}" data-cat="${esc(c.id)}"><span>${esc(c.name)}</span><small>${c.groups.reduce((s, g) => s + g.items.length, 0)}</small></a></li>`)
    .join("");

  const scene = mode === "veg"
    ? `<div class="scene-grove" id="grove" data-scene="${root}assets/img/scene/"></div>`
    : `<div class="scene-pond"><div class="pond-caustics" id="caustics"></div><canvas id="pond"></canvas></div>`;

  return `${head({
    title,
    description,
    path,
    root,
    css: ["assets/css/style.css"],
    schema: [
      restaurantSchema(),
      menuSchema(DATA, mode, path),
      breadcrumbSchema([{ name: "Home", path: "" }, { name: "Menu", path: "menu/" }, { name: mode === "veg" ? "Vegetarian" : "Veg & Non-Veg", path }]),
    ],
  })}
<body class="is-menu is-ready mode-${mode}" data-mode="${mode}">
<div class="scene" aria-hidden="true">${scene}</div>

<div class="menu-view" id="menu-view">
  <header class="topbar">
    <a class="icon-btn" href="${root}menu/" aria-label="Back to menu choices">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <a class="topbar__logo" href="${root}" aria-label="Love Asia home">${logoSvg()}</a>
    <nav class="mode-switch" aria-label="Menu type">
      <a href="${root}veg/"${mode === "veg" ? ' aria-current="page"' : ""}><span class="mark mark--veg" aria-hidden="true"></span>Veg</a>
      <a href="${root}non-veg/"${mode === "nonveg" ? ' aria-current="page"' : ""}><span class="mark mark--nonveg" aria-hidden="true"></span>Non-Veg</a>
    </nav>
    <button class="icon-btn" id="search-btn" type="button" aria-label="Search the menu" aria-expanded="false" aria-controls="search-bar">
      <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5L20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>
  </header>

  <div class="search-bar" id="search-bar" hidden>
    <input id="search" type="search" placeholder="Search dishes…" autocomplete="off" enterkeyhint="search" aria-label="Search dishes" />
  </div>

  <div class="menu-hero">
    <span class="seal seal--hero${mode === "veg" ? " seal--veg" : ""}" aria-hidden="true">${mode === "veg" ? "竹" : "鯉"}</span>
    <h1 class="menu-hero__kicker">${mode === "veg" ? "Vegetarian Menu" : "The Full Menu"}</h1>
    <p class="menu-hero__sub">${mode === "veg" ? "Fresh from the bamboo grove" : "From the koi pond, veg &amp; non-veg"}</p>
    <p class="menu-hero__hint">Tap a dish for details</p>
  </div>

  <main class="menu" id="menu" tabindex="-1">${sections}
    <p class="empty" id="empty" hidden>No dishes match your search.</p>
  </main>

  <footer class="menu-footer">
    <p class="legend">
      <span><span class="mark mark--veg" aria-hidden="true"></span> Vegetarian</span>
      <span><span class="mark mark--nonveg" aria-hidden="true"></span> Non-vegetarian</span>
    </p>
    <p class="fine">Prices in ₹, exclusive of applicable taxes. Please inform your server of any allergies.</p>
    <p class="fine">${mode === "veg" ? `Looking for chicken, prawn or sushi? <a href="${root}${other}">See the full menu</a>.` : `Vegetarian? <a href="${root}${other}">See the pure-veg menu</a>.`} Hosting a party? <a href="${root}events/">Events &amp; buffets</a>.</p>
    <p class="fine"><a href="tel:${BUSINESS.phoneE164}">${esc(BUSINESS.phone)}</a> · ${esc(BUSINESS.hours.label)}</p>
    <a class="footer__logo" href="${root}" aria-label="Love Asia home">${logoSvg()}</a>
  </footer>
</div>

<div class="sheet-backdrop" id="sheet-backdrop" aria-hidden="true"></div>
<div class="sheet" id="sheet" hidden role="dialog" aria-label="Menu sections">
  <p class="sheet__title">Sections</p>
  <ol class="sheet__list" id="sheet-list">${sheetItems}</ol>
  <div class="sheet__foot">
    <button type="button" id="sheet-top">Back to top</button>
  </div>
</div>
<button class="fab" id="fab" type="button" aria-label="Menu sections" aria-expanded="false" aria-controls="sheet">
  <span class="fab__icon" aria-hidden="true"><i></i><i></i><i></i></span>
</button>


<script src="${root}assets/js/${mode === "veg" ? "bamboo" : "koi-pond"}.js" defer></script>
<script src="${root}assets/js/menu.js" defer></script>
<script src="${root}assets/js/smooth.js" defer></script>
</body>
</html>`;
}
