/*
 * The Non-Veg menu tile: real swimming koi (the same simulation as the big pond, in a
 * small two-fish version) replace the simple CSS fish once the script has loaded.
 * It only draws while the tile is on screen.
 */
(function () {
  "use strict";
  const tile = document.querySelector(".choice--nonveg");
  const canvas = tile && tile.querySelector(".mini-koi");
  if (!canvas || !("IntersectionObserver" in window)) return;

  const src = document.currentScript.src.replace(/tile-koi\.js.*$/, "koi-pond.js");
  let pond = null, visible = false, asked = false;

  // the home page may already be loading the pond script for the big pond
  function whenKoiReady(cb) {
    if (window.KoiPond) return cb();
    let s = document.querySelector('script[src*="koi-pond.js"]');
    if (!s) {
      s = document.createElement("script");
      s.src = src;
      document.head.appendChild(s);
    }
    s.addEventListener("load", cb, { once: true });
  }

  function boot() {
    if (pond || !window.KoiPond) return;
    pond = window.KoiPond(canvas, null, {
      contained: true,
      maxKoi: 2,
      pads: 2,
      petals: 3,
      noFly: true,
      maxDpr: 1.5,
      // koi sized to the tile, so they have room to turn
      unit: (W, H) => Math.max(40, Math.min(80, Math.min(W, H) * 0.22)),
    });
    canvas.hidden = false;
    tile.classList.add("is-live");
    if (visible) pond.start();
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !asked) { asked = true; whenKoiReady(boot); }
    if (pond) visible ? pond.start() : pond.stop();
  }, { rootMargin: "120px 0px" }).observe(tile);
})();
