/*
 * Home page.
 *  - The grove's parting and parallax are CSS scroll-driven animations. Where the
 *    browser doesn't support those yet, the same motion is set here on scroll
 *    (only `translate`/`transform`/`opacity`, so it stays on the GPU).
 *  - One live koi pond sits behind all the water sections. Its script loads when
 *    you get near the water, and it only draws while the water is on screen.
 *  - Tap the open water anywhere to drop food for the koi.
 */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* ------------------------------ the grove ------------------------------ */
  const grove = document.querySelector(".grove");
  if (grove) {
    // the bamboo sway, clouds and petals only run while the grove is on screen
    new IntersectionObserver(([e]) => grove.classList.toggle("is-paused", !e.isIntersecting)).observe(grove);

    const supported = window.CSS && CSS.supports("animation-timeline: scroll()");
    if (!supported) {
      const q = (s) => grove.querySelector(s);
      const nearL = q(".g-near.g-l"), nearR = q(".g-near.g-r"), farL = q(".g-far.g-l"), farR = q(".g-far.g-r");
      const hills = q(".g-hills"), sky = q(".g-sky"), cloudsEl = q(".jp-clouds"), sakura = q(".grove__front .sakura");
      const hero = document.getElementById("hero"), reveal = document.getElementById("reveal");
      let vh = window.innerHeight, lastY = -1, ticking = false;

      const update = () => {
        ticking = false;
        const y = Math.min(window.scrollY, vh * 2.45);
        if (y === lastY) return;
        lastY = y;
        const p = y / vh; // progress in screen heights
        const part = ease(clamp(p / 1.15));
        const drift = clamp(p / 1.45);
        nearL.style.translate = `${(-part * 88).toFixed(2)}% 0`;
        nearR.style.translate = `${(part * 88).toFixed(2)}% 0`;
        farL.style.translate = `${(-part * 80).toFixed(2)}% 0`;
        farR.style.translate = `${(part * 80).toFixed(2)}% 0`;
        farL.style.transform = farR.style.transform = `translateY(${(-drift * 30).toFixed(2)}%)`;
        hills.style.transform = `translateY(${(-drift * 20).toFixed(2)}%)`;
        sky.style.transform = `translateY(${(-drift * 5).toFixed(2)}%)`;
        cloudsEl.style.transform = `translateY(${(-drift * 8 * vh / 100).toFixed(1)}px)`;
        if (sakura) sakura.style.translate = `0 ${(-clamp(p) * 34 * vh / 100).toFixed(1)}px`;
        const h = clamp((p - 0.06) / 0.56);
        hero.style.opacity = (1 - h).toFixed(3);
        hero.style.translate = `0 ${(-h * vh * 0.1).toFixed(1)}px`;
        // the reveal card fades in as it rises into view
        const r = clamp((p - 0.5) / 0.45);
        reveal.style.opacity = r.toFixed(3);
        reveal.style.scale = (0.94 + r * 0.06).toFixed(4);
        reveal.style.translate = `0 ${((1 - r) * vh * 0.08).toFixed(1)}px`;
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", () => { vh = window.innerHeight; lastY = -1; onScroll(); });
      update();
    }
  }

  /* ------------------------------ the koi pond ------------------------------ */
  const area = document.getElementById("pond-area");
  const bg = document.getElementById("pond-bg");
  if (area && bg) {
    const hint = document.getElementById("feed-hint");
    const countEl = document.getElementById("feed-count");
    let pond = null, loading = false, inWater = false, fed = 0;

    const boot = () => {
      // the cards cover much of the water, so a lighter pond is plenty here
      pond = window.KoiPond(document.getElementById("pond"), document.getElementById("caustics"), { maxDpr: 1, maxKoi: window.innerWidth > 900 ? 6 : 4, petals: 6 });
      if (inWater) pond.start();
    };
    const load = () => {
      if (pond || loading) return;
      loading = true;
      if (window.KoiPond) return boot();
      const s = document.createElement("script");
      s.src = "assets/js/koi-pond.js";
      s.onload = boot;
      document.head.appendChild(s);
    };

    // fetch the pond script a little before you reach the water
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "100% 0px" }).observe(area);
    // draw (and show the water layer) only while the water is on screen
    new IntersectionObserver(([e]) => {
      inWater = e.isIntersecting;
      bg.classList.toggle("is-live", inWater);
      bg.classList.toggle("is-idle", !inWater);
      if (pond) inWater ? pond.start() : pond.stop();
    }).observe(area);
    bg.classList.add("is-idle");

    // tap the open water (not a card, link or button) to drop food
    area.addEventListener("pointerdown", (e) => {
      if (!pond || e.button > 0) return;
      if (e.target.closest("a, button, input, select, textarea, summary, iframe, .panel")) return;
      pond.addRipple(e.clientX, e.clientY, true);
      fed++;
      if (hint) hint.classList.add("is-hidden");
      if (countEl) countEl.textContent = fed === 1 ? "Here they come!" : `${fed} pinches of food`;
      if (!reduced && fed % 4 === 0) setTimeout(() => pond.leap(), 600);
    }, { passive: true });
  }
})();
