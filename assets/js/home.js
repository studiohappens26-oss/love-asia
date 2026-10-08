/*
 * Home page.
 *  - The grove is pinned (CSS position: sticky) while scrolling parts the bamboo;
 *    only `translate`/`opacity` of six elements change, so it stays on the GPU.
 *  - The koi in the water are CSS animations; off-screen ones are paused.
 *  - The interactive "feed our koi" pond loads its script only when you get near it
 *    and stops drawing whenever it's off-screen.
 */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - t, 2.2);

  /* ------------------------------ the grove ------------------------------ */
  const grove = document.querySelector(".grove");
  const stage = grove && grove.querySelector(".grove__stage");
  if (stage) {
    const q = (s) => stage.querySelector(s);
    const nearL = q(".g-near.g-l"), nearR = q(".g-near.g-r"), farL = q(".g-far.g-l"), farR = q(".g-far.g-r");
    const hero = document.getElementById("hero"), reveal = document.getElementById("reveal");
    let vh = stage.clientHeight, end = grove.offsetHeight, lastP = -1, ticking = false;

    function update() {
      ticking = false;
      const p = Math.min(window.scrollY, end) / vh;
      if (p === lastP) return;
      lastP = p;
      const part = ease(clamp((p - 0.06) / 0.8));
      nearL.style.translate = `${(-part * 86).toFixed(2)}% 0`;
      nearR.style.translate = `${(part * 86).toFixed(2)}% 0`;
      farL.style.translate = `${(-part * 70).toFixed(2)}% 0`;
      farR.style.translate = `${(part * 70).toFixed(2)}% 0`;
      const h = clamp(1 - p / 0.32);
      hero.style.opacity = h.toFixed(3);
      hero.style.translate = `0 ${(-p * 70).toFixed(1)}px`;
      hero.style.visibility = h < 0.02 ? "hidden" : "";
      const r = clamp((part - 0.42) / 0.5);
      reveal.style.opacity = r.toFixed(3);
      reveal.style.scale = (0.95 + r * 0.05).toFixed(4);
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { vh = stage.clientHeight; end = grove.offsetHeight; lastP = -1; onScroll(); });
    update();

    // the gentle bamboo sway only runs while the grove is on screen
    new IntersectionObserver(([e]) => stage.classList.toggle("is-paused", !e.isIntersecting)).observe(grove);
  }

  /* ------------------------- koi drifting in the water ------------------------- */
  const swimIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting)), { rootMargin: "100px 0px" });
  document.querySelectorAll(".swimmer").forEach((s) => { s.classList.add("is-paused"); swimIO.observe(s); });

  /* ------------------------------ feed the koi ------------------------------ */
  const feed = document.getElementById("feed-pond");
  if (feed) {
    const canvas = document.getElementById("feed-canvas");
    const hint = document.getElementById("feed-hint");
    const countEl = document.getElementById("feed-count");
    let pond = null, loading = false, visible = false, fed = 0;

    const boot = () => {
      pond = window.KoiPond(canvas, document.getElementById("feed-caustics"), { contained: true });
      if (visible) pond.start();
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      feed.classList.toggle("is-live", visible);
      if (visible && !pond && !loading) {
        loading = true;
        if (window.KoiPond) return boot();
        const s = document.createElement("script");
        s.src = "assets/js/koi-pond.js";
        s.onload = boot;
        document.head.appendChild(s);
      } else if (pond) {
        visible ? pond.start() : pond.stop();
      }
    }, { rootMargin: "150px 0px" }).observe(feed);

    canvas.addEventListener("pointerdown", (e) => {
      if (!pond) return;
      const r = canvas.getBoundingClientRect();
      pond.addRipple(e.clientX - r.left, e.clientY - r.top, true);
      fed++;
      hint.classList.add("is-hidden");
      countEl.textContent = fed === 1 ? "Here they come!" : `${fed} pinches of food scattered`;
      if (!reduced && fed % 4 === 0) setTimeout(() => pond.leap(), 600);
    });
  }
})();
