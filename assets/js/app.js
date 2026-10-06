(function () {
  "use strict";

  const DATA = window.LOVE_ASIA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const landing = $("#landing");
  const menuView = $("#menu-view");
  const menuEl = $("#menu");
  const searchBar = $("#search-bar");
  const searchInput = $("#search");
  const fab = $("#fab");
  const sheet = $("#sheet");
  const sheetList = $("#sheet-list");

  const pond = window.KoiPond($("#pond"));
  const grove = window.BambooGrove($("#grove"));

  let mode = null;
  let spy = null;
  let reveal = null;
  let currentCat = null;

  const TAG_LABELS = { spicy: "Spicy", chef: "Chef’s special", new: "New", jain: "Jain option" };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (p) => (typeof p === "number" ? DATA.currency + p.toLocaleString("en-IN") : esc(p || ""));
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* unsupported */ } };

  /* ------------------------------- logo ------------------------------- */
  // Traced from the Love Asia logo. Inline (not <use>) so its parts can animate.
  let logoCount = 0;
  function logoSvg() {
    const id = "lg-cut-" + ++logoCount;
    return `<svg class="logo" viewBox="24 40 154 128" role="img" aria-label="${esc(DATA.name)}">
  <defs><clipPath id="${id}"><rect x="0" y="85.5" width="204" height="60"/></clipPath></defs>
  <path class="lg-smile" clip-path="url(#${id})" d="M26.3 78A77 67 0 0 0 173.7 78" pathLength="1" fill="none" stroke="#dd1b46" stroke-width="6.6"/>
  <g class="lg-asia" fill="#231f20">
    <path d="M55 67h8L32.5 146H26z"/>
    <path d="M60 67h7v79h-7z"/>
    <path d="M111 67h7.6v79H111z"/>
    <path d="M134 67h7v79h-7z"/>
    <path d="M138 67h9l28 79h-7z"/>
  </g>
  <path class="lg-s" pathLength="1" d="M95.5 75C94 68.5 87 66 85.2 74C83.4 82 84 96 88 108C91 117 94 126 94 138C94 150 90 158 82 164" fill="none" stroke="#231f20" stroke-width="7"/>
  <g class="lg-love" fill="#dd1b46">
    <path d="M56.6 44h4.4v10.2H67.4V58H56.6z"/>
    <circle cx="86.6" cy="50.9" r="7.1"/>
    <path class="lg-heart" d="M115.3 58.2L108.6 51.2C106 48.4 107.6 44.2 111.2 44.2C113 44.2 114.4 45.3 115.3 46.8C116.2 45.3 117.6 44.2 119.4 44.2C123 44.2 124.6 48.4 122 51.2Z"/>
    <path d="M134 44h10.8v3.8h-6.4v3.2h5.8v3.6h-5.8v3.2h6.6V58H134z"/>
  </g>
  <text class="lg-tm" x="161" y="81" font-size="6.5" fill="#231f20">TM</text>
</svg>`;
  }
  $$("[data-logo]").forEach((el) => {
    el.innerHTML = logoSvg();
    if (el.dataset.logo === "intro" && !reduced) el.firstElementChild.classList.add("logo--intro");
  });

  /* ------------------------------ render ------------------------------ */
  const isVegPrice = (p, item) => (p.veg === undefined ? (item ? item.veg : true) : p.veg);
  const markHtml = (veg, label) =>
    `<span class="mark ${veg ? "mark--veg" : "mark--nonveg"}"${label ? ` role="img" aria-label="${veg ? "Vegetarian" : "Non-vegetarian"}"` : ' aria-hidden="true"'}></span>`;

  // Normalise a category into groups, filtered for the current mode
  function prepare(c) {
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

  function pills(list, item) {
    const marks = list.some((p) => p.veg !== undefined) || (item && item.variants && item.variants.some((v) => v.veg !== undefined));
    return list
      .map((p) => `<span class="pill">${marks ? markHtml(isVegPrice(p, item)) : ""}<span>${esc(p.label)}</span><b>${money(p.price)}</b></span>`)
      .join("");
  }

  // Collapsed price: one price, or the range across options
  function priceText(list) {
    const nums = list.map((p) => p.price).filter((n) => typeof n === "number");
    if (!nums.length) return "";
    const lo = Math.min(...nums), hi = Math.max(...nums);
    return lo === hi ? money(lo) : `${money(lo)}<span class="dash">–</span>${hi.toLocaleString("en-IN")}`;
  }

  let dishId = 0;
  function dishHtml(i, g) {
    const v = i.variants;
    const options = v || (i.price === undefined && g.prices && g.prices.length ? g.prices : null);
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
    const head = `${mark}<span class="dish__name">${esc(i.name)}${label}</span><span class="dish__price">${priceText(list)}</span>`;

    if (!details) return `<li class="dish" data-search="${search}"><div class="dish__head">${head}</div></li>`;
    return `<li class="dish" data-search="${search}">
      <button class="dish__head" type="button" aria-expanded="false" aria-controls="${id}">${head}<span class="dish__chev" aria-hidden="true"></span></button>
      <div class="dish__more" id="${id}" role="region"><div class="dish__inner">${details}</div></div>
    </li>`;
  }

  // colour a sub-heading green/red when every dish in it is veg/non-veg
  function groupTone(g) {
    const v = g.items.map((i) => (i.variants ? i.variants.some((x) => isVegPrice(x, i)) : i.veg));
    return v.every(Boolean) ? " group__name--veg" : v.some(Boolean) ? "" : " group__name--nonveg";
  }

  function groupHtml(g) {
    return `<div class="group">
      ${g.name ? `<h3 class="group__name${groupTone(g)}">${esc(g.name)}</h3>` : ""}
      <ul class="dishes">${g.items.map((i) => dishHtml(i, g)).join("")}</ul>
    </div>`;
  }

  function render() {
    const cats = DATA.categories.map(prepare).filter((c) => c.groups.length);

    sheetList.innerHTML = cats
      .map((c, n) => {
        const count = c.groups.reduce((s, g) => s + g.items.length, 0);
        return `<li style="--i:${n}"><a href="#cat-${esc(c.id)}" data-cat="${esc(c.id)}"><span>${esc(c.name)}</span><small>${count}</small></a></li>`;
      })
      .join("");

    menuEl.innerHTML =
      cats
        .map(
          (c) => `
      <section class="cat" id="cat-${esc(c.id)}" data-cat="${esc(c.id)}">
        <h2 class="cat__title"><span>${esc(c.name)}</span></h2>
        ${c.note ? `<p class="cat__note"><span>${esc(c.note)}</span></p>` : ""}
        ${c.groups.map(groupHtml).join("")}
      </section>`
        )
        .join("") + `<p class="empty" id="empty" hidden>No dishes match your search.</p>`;

    $("#hero-seal").textContent = mode === "veg" ? "竹" : "鯉";
    $("#hero-seal").classList.toggle("seal--veg", mode === "veg");
    $("#hero-kicker").textContent = mode === "veg" ? "Vegetarian Menu" : "The Full Menu";
    $("#hero-sub").textContent = mode === "veg" ? "Fresh from the bamboo grove" : "From the koi pond — veg & non-veg";
    $("#mode-hint").textContent = mode === "veg" ? "You’re viewing the vegetarian menu." : "You’re viewing the full menu (veg & non-veg).";

    setupSpy();
    setupReveal();
    if (searchInput.value) applySearch();
  }

  /* --------------------------- tap to expand --------------------------- */
  function setOpen(dish, open) {
    const btn = $(".dish__head", dish);
    if (!btn || btn.tagName !== "BUTTON") return;
    dish.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  }
  menuEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button.dish__head");
    if (!btn) return;
    const dish = btn.parentElement;
    const open = !dish.classList.contains("is-open");
    // one open at a time keeps the list tidy
    $$(".dish.is-open", menuEl).forEach((d) => d !== dish && setOpen(d, false));
    setOpen(dish, open);
    if (open) buzz();
  });

  /* ---------------------- scroll-spy for the section sheet ---------------------- */
  function setupSpy() {
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          currentCat = e.target.dataset.cat;
          $$("a", sheetList).forEach((a) => a.classList.toggle("is-active", a.dataset.cat === currentCat));
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    $$(".cat", menuEl).forEach((s) => spy.observe(s));
  }

  /* ------------------------- reveal-on-scroll ------------------------- */
  function setupReveal() {
    if (reveal) reveal.disconnect();
    const items = $$(".dish, .cat__title", menuEl);
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("in"));
      return;
    }
    reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            reveal.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((i) => reveal.observe(i));
  }

  /* ------------------------------ search ------------------------------ */
  function applySearch() {
    const q = searchInput.value.trim().toLowerCase();
    let any = false;
    $$(".cat", menuEl).forEach((sec) => {
      let shown = 0;
      $$(".group", sec).forEach((grp) => {
        let n = 0;
        $$(".dish", grp).forEach((it) => {
          const ok = !q || it.dataset.search.includes(q);
          it.hidden = !ok;
          if (ok) { n++; it.classList.add("in"); }
        });
        grp.hidden = n === 0;
        shown += n;
      });
      sec.hidden = shown === 0;
      if (shown) any = true;
    });
    $("#empty").hidden = any;
  }
  searchInput.addEventListener("input", applySearch);

  $("#search-btn").addEventListener("click", () => {
    const open = searchBar.hidden;
    searchBar.hidden = !open;
    $("#search-btn").setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus();
    else { searchInput.value = ""; applySearch(); }
  });

  /* ------------------------- section sheet (burger) ------------------------- */
  function toggleSheet(open) {
    if (open === undefined) open = sheet.hidden;
    fab.setAttribute("aria-expanded", String(open));
    fab.classList.toggle("is-open", open);
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(() => sheet.classList.add("is-open"));
      const active = $("a.is-active", sheetList) || $("a", sheetList);
      if (active) { active.focus({ preventScroll: true }); active.scrollIntoView({ block: "nearest" }); }
    } else {
      sheet.classList.remove("is-open");
      setTimeout(() => { if (!sheet.classList.contains("is-open")) sheet.hidden = true; }, reduced ? 0 : 280);
    }
  }
  fab.addEventListener("click", () => toggleSheet());
  $("#sheet-backdrop").addEventListener("click", () => toggleSheet(false));
  sheetList.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-cat]");
    if (!a) return;
    e.preventDefault();
    toggleSheet(false);
    const sec = document.getElementById("cat-" + a.dataset.cat);
    if (sec) sec.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  $("#sheet-top").addEventListener("click", () => { toggleSheet(false); window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) { toggleSheet(false); fab.focus(); } });

  /* ------------------------------ modes ------------------------------ */
  function setMode(next, opts = {}) {
    if (next !== "veg" && next !== "nonveg") return;
    const changed = next !== mode;
    mode = next;
    body.classList.toggle("mode-veg", mode === "veg");
    body.classList.toggle("mode-nonveg", mode === "nonveg");
    $$(".mode-switch [data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
    document.querySelector('meta[name="theme-color"]').setAttribute("content", mode === "veg" ? "#f4f1e8" : "#eef2f1");

    if (mode === "nonveg") pond.start();
    else { pond.stop(); grove.build(); }

    if (changed) {
      render();
      if (!opts.keepScroll) window.scrollTo(0, 0);
    }
    try { history.replaceState(null, "", "#" + mode); } catch (e) { /* file:// etc. */ }
  }

  function finishOpen() {
    body.classList.remove("is-revealing");
    landing.style.webkitMaskImage = landing.style.maskImage = "";
  }

  // Opening the menu "dissolves" the landing page outward from where it was tapped
  function openMenu(next, origin) {
    setMode(next);
    menuView.hidden = false;
    body.classList.remove("is-landing");
    body.classList.add("is-menu");
    landing.setAttribute("aria-hidden", "true");
    landing.inert = true;
    window.scrollTo(0, 0);

    const canMask = CSS.supports("mask-image", "radial-gradient(black, black)") || CSS.supports("-webkit-mask-image", "radial-gradient(black, black)");
    if (!origin || reduced || !canMask) return finishOpen();

    body.classList.add("is-revealing");
    const { x, y } = origin;
    const maxR = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 60;
    const start = performance.now(), dur = 900;
    if (next === "nonveg") { setTimeout(() => pond.splash(x, y), 120); setTimeout(() => pond.leap(), 700); }
    (function step(now) {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const r = e * maxR;
      const m = `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, #000 ${r + 40}px)`;
      landing.style.webkitMaskImage = landing.style.maskImage = m;
      if (k < 1) requestAnimationFrame(step);
      else finishOpen();
    })(start);
  }

  function showLanding() {
    pond.stop();
    toggleSheet(false);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#f6f1e7");
    body.classList.add("is-landing");
    body.classList.remove("is-menu");
    landing.removeAttribute("aria-hidden");
    landing.inert = false;
    setTimeout(() => { if (body.classList.contains("is-landing")) menuView.hidden = true; }, 500);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  $$(".choice").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect();
      const origin = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      openMenu(btn.dataset.mode, origin);
    })
  );
  $$(".mode-switch [data-mode]").forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  $("#back-btn").addEventListener("click", showLanding);

  // Tapping the pond (outside the cards) drops koi food and makes a ripple
  document.addEventListener("pointerdown", (e) => {
    if (mode !== "nonveg" || !body.classList.contains("is-menu")) return;
    if (e.target.closest("button, a, input, .topbar, .dish, .sheet, .fab")) return;
    pond.addRipple(e.clientX, e.clientY, true);
  }, { passive: true });

  /* --------------------------- printed menu --------------------------- */
  const pages = DATA.menuPages || [];
  const lightbox = $("#lightbox");
  if (pages.length) {
    $$(".pages-btn").forEach((b) => (b.hidden = false));
    $("#lightbox-track").innerHTML = pages
      .map((src, i) => `<figure><img src="${esc(src)}" alt="Printed menu page ${i + 1}" loading="lazy" decoding="async" /></figure>`)
      .join("");
    let opener = null;
    $$(".pages-btn").forEach((b) =>
      b.addEventListener("click", () => {
        opener = b;
        toggleSheet(false);
        lightbox.hidden = false;
        body.classList.add("no-scroll");
        $("#lightbox-close").focus();
      })
    );
    const close = () => { lightbox.hidden = true; body.classList.remove("no-scroll"); if (opener && opener.offsetParent) opener.focus(); };
    $("#lightbox-close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) close(); });
  }

  /* ------------------------------ paper grain ------------------------------ */
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 140;
    const g = c.getContext("2d");
    const img = g.createImageData(140, 140);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random();
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v < 0.5 ? 60 : 255;
      img.data[i + 3] = Math.random() * 22;
    }
    g.putImageData(img, 0, 0);
    document.documentElement.style.setProperty("--grain", `url(${c.toDataURL()})`);
  } catch (e) { /* purely decorative */ }

  /* ------------------------------ boot ------------------------------ */
  const initial = location.hash.replace("#", "");
  if (initial === "veg" || initial === "nonveg") openMenu(initial);
  requestAnimationFrame(() => body.classList.add("is-ready"));
})();
