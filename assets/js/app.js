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
  const catsEl = $("#cats");
  const searchBar = $("#search-bar");
  const searchInput = $("#search");

  const pond = window.KoiPond($("#pond"));
  const grove = window.BambooGrove($("#grove"));

  let mode = null;
  let spy = null;
  let reveal = null;

  const TAG_LABELS = { spicy: "Spicy", chef: "Chef’s special", new: "New", jain: "Jain option" };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const price = (p) => (typeof p === "number" ? DATA.currency + p.toLocaleString("en-IN") : esc(p || ""));

  $("#brand-title").textContent = DATA.name;
  $("#brand-tag").textContent = DATA.tagline;

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

  // Price pills; a single remaining price collapses to a plain price
  function pills(list, item) {
    return list
      .map((p) => {
        const veg = isVegPrice(p, item);
        const showMark = p.veg !== undefined || (item && item.variants && item.variants.some((v) => v.veg !== undefined));
        return `<span class="pill">${showMark ? markHtml(veg) : ""}<span>${esc(p.label)}</span><b>${price(p.price)}</b></span>`;
      })
      .join("");
  }

  function itemHtml(i) {
    const v = i.variants;
    const single = v && v.length === 1 ? v[0] : null;
    const shownPrice = single ? single.price : i.price;
    const vegs = v ? v.map((x) => isVegPrice(x, i)) : [i.veg];
    const allVeg = vegs.every(Boolean), noneVeg = !vegs.some(Boolean);
    const mark = allVeg || noneVeg ? markHtml(allVeg, true) : `<span class="mark mark--mixed" role="img" aria-label="Veg and non-veg options"></span>`;
    return `
            <li class="item" data-search="${esc((i.name + " " + (i.desc || "") + " " + (v ? v.map((x) => x.label).join(" ") : "")).toLowerCase())}">
              ${mark}
              <div class="item__main">
                <div class="item__row">
                  <h4 class="item__name">${esc(i.name)}${single && !(mode === "veg" && /^veg$/i.test(single.label)) ? ` <small>· ${esc(single.label)}</small>` : ""}</h4>
                  ${shownPrice !== undefined ? `<span class="item__dots" aria-hidden="true"></span><span class="item__price">${price(shownPrice)}</span>` : ""}
                </div>
                ${i.desc ? `<p class="item__desc">${esc(i.desc)}</p>` : ""}
                ${v && !single ? `<div class="pills">${pills(v, i)}</div>` : ""}
                ${i.tags && i.tags.length ? `<p class="item__tags">${i.tags.map((t) => `<span class="tag tag--${esc(t)}">${esc(TAG_LABELS[t] || t)}</span>`).join("")}</p>` : ""}
              </div>
            </li>`;
  }

  function groupHtml(g) {
    const head = g.name || (g.prices && g.prices.length)
      ? `<div class="group__head">
          ${g.name ? `<h3 class="group__name">${esc(g.name)}</h3>` : ""}
          ${g.prices && g.prices.length ? `<div class="pills pills--group">${pills(g.prices)}</div>` : ""}
        </div>`
      : "";
    return `<div class="group">${head}<ul class="items">${g.items.map(itemHtml).join("")}</ul></div>`;
  }

  function render() {
    const cats = DATA.categories.map(prepare).filter((c) => c.groups.length);

    catsEl.innerHTML = cats
      .map((c) => `<a class="chip" href="#cat-${esc(c.id)}" data-cat="${esc(c.id)}">${esc(c.name)}</a>`)
      .join("");

    menuEl.innerHTML =
      cats
        .map(
          (c) => `
      <section class="cat" id="cat-${esc(c.id)}" data-cat="${esc(c.id)}">
        <h2 class="cat__title"><span>${esc(c.name)}</span></h2>
        ${c.note ? `<p class="cat__note">${esc(c.note)}</p>` : ""}
        <div class="panel">${c.groups.map(groupHtml).join("")}</div>
      </section>`
        )
        .join("") + `<p class="empty" id="empty" hidden>No dishes match your search.</p>`;

    $("#hero-kicker").textContent = mode === "veg" ? "Pure Vegetarian" : "The Full Menu";
    $("#hero-sub").textContent = mode === "veg" ? "Fresh from the bamboo grove" : "From the koi pond — veg & non-veg";
    $("#mode-hint").textContent =
      mode === "veg" ? "You’re viewing the vegetarian menu." : "You’re viewing the full menu (veg & non-veg).";

    setupSpy();
    setupReveal();
    if (searchInput.value) applySearch();
  }

  /* ---------------------- scroll-spy for category chips ---------------------- */
  function setupSpy() {
    if (spy) spy.disconnect();
    const chips = new Map($$(".chip", catsEl).map((c) => [c.dataset.cat, c]));
    let current = null;
    spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.dataset.cat;
          if (id === current) return;
          current = id;
          chips.forEach((c, k) => c.classList.toggle("is-active", k === id));
          const chip = chips.get(id);
          if (chip) catsEl.scrollTo({ left: chip.offsetLeft - catsEl.clientWidth / 2 + chip.clientWidth / 2, behavior: reduced ? "auto" : "smooth" });
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    $$(".cat", menuEl).forEach((s) => spy.observe(s));
  }

  /* ------------------------- reveal-on-scroll ------------------------- */
  function setupReveal() {
    if (reveal) reveal.disconnect();
    const items = $$(".item, .cat__title", menuEl);
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
      { rootMargin: "0px 0px -6% 0px" }
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
        $$(".item", grp).forEach((it) => {
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
    catsEl.classList.toggle("is-dim", !!q);
  }
  searchInput.addEventListener("input", applySearch);

  $("#search-btn").addEventListener("click", () => {
    const open = searchBar.hidden;
    searchBar.hidden = !open;
    $("#search-btn").setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus();
    else { searchInput.value = ""; applySearch(); }
  });

  /* ------------------------------ modes ------------------------------ */
  function setMode(next, opts = {}) {
    if (next !== "veg" && next !== "nonveg") return;
    const changed = next !== mode;
    mode = next;
    body.classList.toggle("mode-veg", mode === "veg");
    body.classList.toggle("mode-nonveg", mode === "nonveg");
    $$(".mode-switch [data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
    document.querySelector('meta[name="theme-color"]').setAttribute("content", mode === "veg" ? "#e6f0d8" : "#0d2a33");

    if (mode === "nonveg") pond.start();
    else { pond.stop(); grove.build(); }

    if (changed) {
      render();
      if (!opts.keepScroll) window.scrollTo(0, 0);
    }
    try { history.replaceState(null, "", "#" + mode); } catch (e) { /* file:// etc. */ }
  }

  function openMenu(next) {
    setMode(next);
    menuView.hidden = false;
    body.classList.remove("is-landing");
    body.classList.add("is-menu");
    landing.setAttribute("aria-hidden", "true");
    landing.inert = true;
    window.scrollTo(0, 0);
  }

  function showLanding() {
    pond.stop();
    body.classList.add("is-landing");
    body.classList.remove("is-menu");
    landing.removeAttribute("aria-hidden");
    landing.inert = false;
    setTimeout(() => { if (body.classList.contains("is-landing")) menuView.hidden = true; }, 500);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
  }

  catsEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    e.preventDefault();
    const sec = document.getElementById("cat-" + chip.dataset.cat);
    if (sec) sec.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  $$(".choice").forEach((btn) => btn.addEventListener("click", () => openMenu(btn.dataset.mode)));
  $$(".mode-switch [data-mode]").forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));
  $("#back-btn").addEventListener("click", showLanding);

  // Tapping the pond drops koi food and makes a ripple
  document.addEventListener("pointerdown", (e) => {
    if (mode !== "nonveg" || !body.classList.contains("is-menu")) return;
    if (e.target.closest("button, a, input, .topbar, .cats")) return;
    pond.addRipple(e.clientX, e.clientY, true);
  }, { passive: true });

  /* --------------------------- printed menu --------------------------- */
  const pages = DATA.menuPages || [];
  const lightbox = $("#lightbox");
  if (pages.length) {
    $("#pages-btn").hidden = false;
    $("#lightbox-track").innerHTML = pages
      .map((src, i) => `<figure><img src="${esc(src)}" alt="Printed menu page ${i + 1}" loading="lazy" decoding="async" /></figure>`)
      .join("");
    $("#pages-btn").addEventListener("click", () => {
      lightbox.hidden = false;
      body.classList.add("no-scroll");
      $("#lightbox-close").focus();
    });
    const close = () => { lightbox.hidden = true; body.classList.remove("no-scroll"); $("#pages-btn").focus(); };
    $("#lightbox-close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) close(); });
  }

  /* ------------------------------ boot ------------------------------ */
  const initial = location.hash.replace("#", "");
  if (initial === "veg" || initial === "nonveg") openMenu(initial);
  requestAnimationFrame(() => body.classList.add("is-ready"));
})();
