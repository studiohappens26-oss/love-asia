/*
 * The garden scenery shared by the home and events pages.
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
  const KOI_SRC = document.currentScript.src.replace(/garden\.js.*$/, "koi-pond.js");
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* ------------------------------ the grove ------------------------------ */
  const grove = document.querySelector(".grove");
  if (grove) {
    // the bamboo sway, clouds and petals only run while the grove is on screen
    new IntersectionObserver(([e]) => grove.classList.toggle("is-paused", !e.isIntersecting)).observe(grove);

    // on phones the bamboo holds still while your finger is scrolling (it resumes from
    // the same lean when you stop), so the GPU has less to blend during the scroll
    if (window.matchMedia("(pointer: coarse)").matches) {
      let still = 0, scrolling = false;
      window.addEventListener("scroll", () => {
        if (!scrolling) { scrolling = true; grove.classList.add("is-scrolling"); }
        clearTimeout(still);
        still = setTimeout(() => { scrolling = false; grove.classList.remove("is-scrolling"); }, 180);
      }, { passive: true });
    }

    const supported = window.CSS && CSS.supports("animation-timeline: scroll()");
    if (!supported) {
      const q = (s) => grove.querySelector(s);
      const nearL = q(".g-near.g-l"), nearR = q(".g-near.g-r"), farL = q(".g-far.g-l"), farR = q(".g-far.g-r");
      const hills = q(".g-hills"), cloudsEl = q(".jp-clouds"), sakura = q(".grove__front .sakura");
      const hero = document.getElementById("hero"), reveal = document.getElementById("reveal");
      // grove lengths in screen heights (the same numbers as the CSS custom properties)
      const num = (k, d) => parseFloat(grove.dataset[k]) || d;
      const PART = num("part", 0.95), PIN = num("pin", 0.95), LEN = num("len", 1.95);
      let vh = window.innerHeight, lastY = -1, ticking = false;

      const update = () => {
        ticking = false;
        const y = Math.min(window.scrollY, vh * LEN);
        if (y === lastY) return;
        lastY = y;
        const p = y / vh; // progress in screen heights
        const part = ease(clamp(p / PART));
        const drift = clamp(p / PIN);
        nearL.style.translate = `${(-part * 85).toFixed(2)}% 0`;
        nearR.style.translate = `${(part * 85).toFixed(2)}% 0`;
        farL.style.translate = `${(-part * 76).toFixed(2)}% 0`;
        farR.style.translate = `${(part * 76).toFixed(2)}% 0`;
        farL.style.transform = farR.style.transform = `translateY(${(-drift * 30).toFixed(2)}%)`;
        hills.style.transform = `translateY(${(-drift * 20).toFixed(2)}%)`;
        cloudsEl.style.transform = `translateY(${(-drift * 8 * vh / 100).toFixed(1)}px)`;
        if (sakura) sakura.style.translate = `0 ${(-clamp(p) * 34 * vh / 100).toFixed(1)}px`;
        if (!reveal) return; // (events page: the hero card simply scrolls away)
        const h = clamp((p - 0.06) / 0.56);
        hero.style.opacity = (1 - h).toFixed(3);
        hero.style.translate = `0 ${(-h * vh * 0.1).toFixed(1)}px`;
        // the reveal card fades in as it rises into view
        const r = clamp((p - 0.45) / 0.45);
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
      s.src = KOI_SRC;
      s.onload = boot;
      document.head.appendChild(s);
    };

    // fetch the pond script a little before you reach the water
    // (on pages that open on the water, wait until the page itself has finished loading)
    const soon = () => (document.readyState === "complete" ? setTimeout(load, 300) : window.addEventListener("load", () => setTimeout(load, 300), { once: true }));
    new IntersectionObserver(([e]) => { if (e.isIntersecting) soon(); }, { rootMargin: "100% 0px" }).observe(area);
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
      pond.feed(e.clientX, e.clientY);
      fed++;
      if (hint) hint.classList.add("is-hidden");
      if (countEl) countEl.textContent = fed === 1 ? "Here they come!" : `${fed} pinches of food`;
      if (!reduced && fed % 4 === 0) setTimeout(() => pond.leap(), 600);
    }, { passive: true });

    /* ------------------------- diving into the garden pond ------------------------- */
    // The garden picture is pinned and zoomed in on its pond (a hole that shows the live
    // koi pond behind the page) until the water fills the screen. The zoom itself is a CSS
    // scroll-driven animation; this works out how far to zoom for this screen, does the
    // zoom in browsers without scroll-driven animations, and calls the koi over to the pond.
    const dive = document.querySelector(".dive");
    if (dive) {
      const stage = dive.querySelector(".dive__stage"), img = dive.querySelector(".dive__garden"), sheen = dive.querySelector(".dive__sheen");
      const [, cy, rx, ry, iw, ih] = img.dataset.pond.split(" ").map(Number);
      const OY = cy / ih; // the picture is anchored and zoomed at the pond's centre
      let S = 7;
      const fit = () => {
        const vw = stage.clientWidth, vh = stage.clientHeight;
        const k = Math.max(vw / iw, vh / ih); // object-fit: cover
        // smallest zoom at which the pond's inner ellipse covers the farthest screen corner
        S = Math.hypot(vw / 2 / (rx * k), Math.max(OY, 1 - OY) * vh / (ry * k)) * 1.06;
        dive.style.setProperty("--dive-scale", S.toFixed(2));
        // the water starts this much smaller and grows to full size as you go in
        document.documentElement.style.setProperty("--pond-from", (1 / (S * 0.55)).toFixed(3));
      };
      fit();
      window.addEventListener("resize", fit);

      const scrollDriven = window.CSS && CSS.supports("animation-timeline: view()");
      let lured = false, ticking = false;
      const onScroll = () => {
        ticking = false;
        const top = dive.getBoundingClientRect().top, vh = window.innerHeight;
        // the koi come to the pond as you arrive at it
        if (top > vh) lured = false;
        else if (!lured && top <= 0 && pond) { lured = true; pond.addRipple(stage.clientWidth / 2, OY * stage.clientHeight, true); }
        if (!scrollDriven) {
          const p = clamp(-top / ((dive.offsetHeight - vh) * 0.82));
          const z = 1 + (S - 1) * Math.pow(p, 2.2);
          img.style.transform = `scale(${z.toFixed(3)})`;
          const koi = document.getElementById("pond");
          koi.style.transformOrigin = `50% ${(OY * stage.clientHeight).toFixed(0)}px`;
          koi.style.transform = p >= 1 ? "" : `scale(${Math.min(1, z / (S * 0.55)).toFixed(3)})`;
          const q = clamp((-top / (dive.offsetHeight - vh) - 0.4) / 0.6);
          sheen.style.opacity = (q < 0.55 ? q / 0.55 : (1 - q) / 0.45) * 0.55;
        }
      };
      window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
      onScroll();

      /* ---- auto-dive: reach the fence and the page carries you into the pond ---- */
      // Scrolling down to the garden's fence starts a short, film-like glide: the zoom
      // into the pond plays and the page settles on the first section in the water.
      // Any touch, wheel or key hands control straight back. ?dive=manual turns it off.
      const auto = !reduced && !/[?&]dive=manual\b/.test(location.search);
      const next = dive.nextElementSibling;
      if (auto && next) {
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        let armed = true, running = false, touching = false, waiting = false, lastY = window.scrollY, raf2 = 0;
        const targetY = () => {
          const el = next.querySelector(".panel") || next;
          return el.getBoundingClientRect().top + window.scrollY - 84; // just below the header
        };
        const finish = () => {
          if (!running) return;
          running = false;
          cancelAnimationFrame(raf2);
          document.documentElement.classList.remove("is-auto-diving");
          window.dispatchEvent(new Event("autodive:end"));
        };
        const start = () => {
          const from = window.scrollY, to = targetY();
          armed = false;
          if (to <= from + 10) return;
          running = true;
          window.dispatchEvent(new Event("autodive:start"));
          const dur = Math.max(2000, Math.min(2800, ((to - from) / window.innerHeight) * 1250));
          if (window.smoothScroll) { // desktop: Lenis does the glide
            window.smoothScroll.scrollTo(to, { duration: dur / 1000, easing: easeIO, onComplete: finish });
            return;
          }
          // phones: hold the page still for the glide so a flick can't fight it
          if (coarse) document.documentElement.classList.add("is-auto-diving");
          const t0 = performance.now();
          const step = (now) => {
            if (!running) return;
            const k = Math.min(1, (now - t0) / dur);
            window.scrollTo({ top: from + (to - from) * easeIO(k), behavior: "instant" });
            if (k < 1) raf2 = requestAnimationFrame(step); else finish();
          };
          raf2 = requestAnimationFrame(step);
        };
        window.addEventListener("scroll", () => {
          const y = window.scrollY, down = y > lastY;
          lastY = y;
          if (running) return;
          const top = dive.getBoundingClientRect().top, vh = window.innerHeight;
          if (top > vh * 0.6) { armed = true; return; } // back above the garden: ready again
          // the fence sits near the top of the garden picture: start once it reaches mid-screen
          // a finger still on the glass: wait for it to lift, then glide
          if (armed && down && top <= vh * 0.35 && -top < (dive.offsetHeight - vh) * 0.5) { if (touching) waiting = true; else start(); }
        }, { passive: true });
        // the visitor takes over: stop gliding
        const stop = () => {
          waiting = false;
          if (!running) return;
          if (window.smoothScroll) window.smoothScroll.scrollTo(window.scrollY, { immediate: true });
          finish();
        };
        window.addEventListener("touchstart", () => { touching = true; stop(); }, { passive: true });
        const lift = () => { touching = false; if (waiting) { waiting = false; start(); } };
        window.addEventListener("touchend", lift, { passive: true });
        window.addEventListener("touchcancel", lift, { passive: true });
        for (const ev of ["wheel", "keydown", "mousedown"]) window.addEventListener(ev, stop, { passive: true });
      }
    }
  }

  /* ------------------------------ scroll prompt ------------------------------ */
  // If someone stays on one spot for 3 seconds, a tiny "Scroll down" nudge flashes at the
  // bottom for a second, then again every 3 seconds while they stay. Any scroll, touch or
  // key resets it. Not shown at the end of the page, while typing, or during the auto-dive.
  if (document.querySelector(".grove, .dive")) {
    const diveEl = document.querySelector(".dive");
    const cue = document.createElement("div");
    cue.className = "scroll-cue";
    cue.setAttribute("aria-hidden", "true");
    cue.innerHTML = '<span class="scroll-cue__text"></span><span class="scroll-cue__arrow"></span>';
    document.body.appendChild(cue);
    const text = cue.firstChild;
    let idle = 0, blink = 0, gliding = false;
    const message = () => {
      const vh = window.innerHeight, doc = document.documentElement;
      if (window.scrollY + vh > doc.scrollHeight - vh * 0.8) return ""; // nearly at the end
      if (diveEl) {
        const r = diveEl.getBoundingClientRect();
        if (r.top <= 2 && -r.top < (r.height - vh) * 0.8) return "Scroll to dive in";
      }
      return "Scroll down";
    };
    const flash = () => {
      if (gliding || document.hidden) return;
      const busy = document.activeElement && document.activeElement.closest("input, textarea, select");
      const m = busy ? "" : message();
      if (m) {
        text.textContent = m;
        cue.classList.add("is-on");
      }
      blink = setTimeout(() => {
        cue.classList.remove("is-on");
        blink = setTimeout(flash, 3000);
      }, m ? 1000 : 0);
    };
    const reset = () => {
      cue.classList.remove("is-on");
      clearTimeout(idle);
      clearTimeout(blink);
      idle = setTimeout(flash, 3000);
    };
    for (const ev of ["scroll", "touchstart", "wheel", "keydown", "pointerdown"]) window.addEventListener(ev, reset, { passive: true });
    window.addEventListener("autodive:start", () => { gliding = true; reset(); });
    window.addEventListener("autodive:end", () => { gliding = false; reset(); });
    reset();
  }
})();
