/*
 * Menu pages (/menu/, /veg/, /non-veg/). All dishes are pre-rendered into the
 * HTML at build time (good for SEO); this script only adds behaviour:
 * tap-to-expand cards, the section sheet, search, the printed-menu viewer
 * and the animated backgrounds.
 */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) { /* unsupported */ } };

  /* ------------------------------ paper grain ------------------------------ */
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 140;
    const g = c.getContext("2d");
    const img = g.createImageData(140, 140);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() < 0.5 ? 60 : 255;
      img.data[i + 3] = Math.random() * 22;
    }
    g.putImageData(img, 0, 0);
    document.documentElement.style.setProperty("--grain", `url(${c.toDataURL()})`);
  } catch (e) { /* decorative */ }

  /* ------------------------------ /menu/ chooser ------------------------------ */
  if (body.classList.contains("page-chooser")) {
    // a soft ink ripple from the tapped tile, then navigate
    $$(".choice").forEach((a) =>
      a.addEventListener("click", (e) => {
        if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        const r = a.getBoundingClientRect();
        const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
        for (let i = 0; i < 2; i++) {
          const ring = document.createElement("span");
          ring.className = "ink-ring" + (a.classList.contains("choice--veg") ? " ink-ring--veg" : "");
          ring.style.left = x + "px";
          ring.style.top = y + "px";
          body.appendChild(ring);
        }
        body.classList.add("is-leaving");
        setTimeout(() => { location.href = a.href; }, 320);
      })
    );
    // coming back via the browser's back button
    window.addEventListener("pageshow", () => { body.classList.remove("is-leaving"); $$(".ink-ring").forEach((r) => r.remove()); });
    return;
  }

  /* ------------------------------ menu pages ------------------------------ */
  const mode = body.dataset.mode;
  const menuEl = $("#menu");
  const searchBar = $("#search-bar");
  const searchInput = $("#search");
  const fab = $("#fab");
  const sheet = $("#sheet");
  const sheetList = $("#sheet-list");

  // backgrounds
  let pond = null;
  if (mode === "nonveg" && window.KoiPond) {
    pond = window.KoiPond($("#pond"), $("#caustics"));
    pond.start();
    setTimeout(() => pond.leap(), 900);
    document.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, a, input, .topbar, .dish, .sheet, .fab, .lightbox")) return;
      pond.addRipple(e.clientX, e.clientY, true);
    }, { passive: true });
  } else if (mode === "veg" && window.BambooGrove) {
    window.BambooGrove($("#grove")).build();
  }

  // tap to expand (one open at a time)
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
    $$(".dish.is-open", menuEl).forEach((d) => d !== dish && setOpen(d, false));
    setOpen(dish, open);
    if (open) buzz();
  });

  // section sheet highlights the section in view
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$("a", sheetList).forEach((a) => a.classList.toggle("is-active", a.dataset.cat === e.target.dataset.cat));
    }),
    { rootMargin: "-30% 0px -65% 0px" }
  );
  $$(".cat", menuEl).forEach((s) => spy.observe(s));

  // search
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
          if (ok) n++;
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

  // burger → section sheet
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

  // printed menu viewer
  const lightbox = $("#lightbox");
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
  const closeBox = () => { lightbox.hidden = true; body.classList.remove("no-scroll"); if (opener && opener.offsetParent) opener.focus(); };
  $("#lightbox-close").addEventListener("click", closeBox);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) closeBox(); });
})();
