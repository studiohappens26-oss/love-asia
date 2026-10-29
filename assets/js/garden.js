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
    // draw (and show the water layer) only while some water is actually on screen. While
    // it's live the browser has to stack the whole page above it on its own layer, which
    // costs every frame, so in the garden it only wakes once the pond itself comes into
    // view, not as soon as the top of the garden picture does (the long stretch of fence
    // and bamboo you scroll back up through).
    const seen = new Set();
    const setLive = () => {
      const live = seen.size > 0;
      if (live === inWater) return;
      inWater = live;
      bg.classList.toggle("is-live", live);
      bg.classList.toggle("is-idle", !live);
      if (pond) live ? pond.start() : pond.stop();
    };
    const watch = (margin) => new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
      setLive();
    }, { rootMargin: margin });
    const gardenPond = area.querySelector(":scope > .dive");
    const rest = watch("0px");
    for (const el of area.children) if (el !== gardenPond) rest.observe(el);
    // (the pond sits a little below the middle of the garden picture)
    if (gardenPond) watch("0px 0px -38% 0px").observe(gardenPond);
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
      let lastScale = "", lastFrom = "";
      const fit = () => {
        const vw = stage.clientWidth, vh = stage.clientHeight;
        const k = Math.max(vw / iw, vh / ih); // object-fit: cover
        // smallest zoom at which the pond's inner ellipse covers the farthest screen corner
        S = Math.hypot(vw / 2 / (rx * k), Math.max(OY, 1 - OY) * vh / (ry * k)) * 1.06;
        // (only written when they change: the address bar sliding in and out fires resizes)
        const scale = S.toFixed(2), from = (1 / (S * 0.55)).toFixed(3);
        if (scale !== lastScale) dive.style.setProperty("--dive-scale", scale);
        // the water starts this much smaller and grows to full size as you go in
        if (from !== lastFrom) bg.style.setProperty("--pond-from", from);
        lastScale = scale; lastFrom = from;
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
      // Once the "Step into the grove" heading scrolls off the screen, a 1.5s film-like
      // glide takes over: the garden zooms into the pond and the page settles on the first
      // section in the water. People scroll in every way imaginable (slow drags, hard
      // flicks, trackpad momentum, swipes stacked on swipes), so the glide owns the scroll:
      //  - your own scrolling stops the moment it starts and comes back when it lands
      //  - it picks up at the speed you were already going, so there's no brake-and-go jerk
      //  - only scrolling you do starts it (not a menu link or the page reloading mid-way)
      // (The events page has no heading there, so it starts at the same point in the garden.)
      // ?dive=manual turns it off.
      const auto = !reduced && !/[?&]dive=manual\b/.test(location.search);
      const next = dive.nextElementSibling;
      if (auto && next) {
        const root = document.documentElement;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
        const cue = document.querySelector("#reveal h2");
        const GLIDE = 1500;
        let armed = true, running = false, touching = false, quietUntil = 0;
        let lastInput = -1e9, raf2 = 0, safety = 0, glideTop = 0, prevY = window.scrollY, down = false;
        // recent scroll positions, to read your speed and direction
        let samples = [];
        const speed = () => { // px per ms over the last ~120ms (+ is down)
          const now = performance.now();
          samples = samples.filter((s) => now - s[0] < 160);
          if (samples.length < 2) return 0;
          const [t0, y0] = samples[0], [t1, y1] = samples[samples.length - 1];
          return t1 > t0 ? (y1 - y0) / (t1 - t0) : 0;
        };
        const targetY = () => {
          const el = next.querySelector(".panel") || next;
          const header = document.querySelector(".site-header");
          return Math.round(el.getBoundingClientRect().top + window.scrollY - ((header && header.offsetHeight) || 64) - 20);
        };
        const headerH = () => { const h = document.querySelector(".site-header"); return (h && h.offsetHeight) || 64; };
        // has the heading gone (off the top, or tucked under the header)? `margin` is for re-arming
        const passed = (margin = 0) => cue
          ? cue.getBoundingClientRect().bottom <= headerH() - margin
          : dive.getBoundingClientRect().top <= window.innerHeight * 0.65 - margin;
        // past the trigger, but still short of the first section?
        const inZone = () => passed() && window.scrollY < targetY() - window.innerHeight * 0.25;
        const userScrolling = () => performance.now() > quietUntil && (touching || performance.now() - lastInput < 1600);

        // hold off the visitor's own scrolling while the glide runs
        const block = (e) => { if (e.cancelable) e.preventDefault(); };
        const blockKeys = (e) => { if (KEYS.has(e.key) && !e.target.closest("input, textarea, select")) e.preventDefault(); };
        const hold = (on) => {
          const f = on ? "addEventListener" : "removeEventListener";
          window[f]("touchmove", block, { passive: false });
          window[f]("wheel", block, { passive: false });
          window[f]("keydown", blockKeys);
          root.classList.toggle("is-auto-diving", on);
          if (coarse) root.classList.toggle("is-auto-diving--lock", on); // also stops a flick's coasting
        };
        const finish = () => {
          if (!running) return;
          running = false;
          cancelAnimationFrame(raf2);
          clearTimeout(safety);
          hold(false);
          samples = [];
          window.dispatchEvent(new Event("autodive:end"));
        };
        const start = () => {
          const from = window.scrollY, to = targetY(), d = to - from;
          armed = false;
          if (d < 40) return;
          // carry on at the speed you were going, easing to a stop on the section
          const v0 = Math.max(0, speed()), T = GLIDE;
          const m = Math.min(3, (v0 * T) / d); // start slope; <= 3 keeps it from overshooting
          const curve = (t) => (t * t * t - 2 * t * t + t) * m + (3 - 2 * t) * t * t;
          running = true;
          glideTop = from;
          hold(true);
          window.dispatchEvent(new Event("autodive:start"));
          safety = setTimeout(finish, T + 700); // whatever happens, never leave the page held
          window.scrollTo(0, from); // stops the page where it is: ends a flick's coasting or a key's scroll animation
          if (window.smoothScroll) { // desktop: Lenis does the glide (and ignores the wheel meanwhile)
            window.smoothScroll.scrollTo(from, { immediate: true, force: true }); // start from where the page really is
            window.smoothScroll.scrollTo(to, { duration: T / 1000, easing: curve, lock: true, force: true, onComplete: finish });
            return;
          }
          // every frame sets the exact position, so a finger still dragging can't push it off course
          // (and it only ever moves forward, so a push that slips through never makes it jump back)
          const t0 = performance.now();
          const step = (now) => {
            if (!running) return;
            const k = Math.min(1, (now - t0) / T);
            window.scrollTo(0, Math.min(to, Math.max(window.scrollY, glideTop + d * curve(k))));
            if (k < 1) raf2 = requestAnimationFrame(step);
            else { window.scrollTo(0, to); finish(); }
          };
          raf2 = requestAnimationFrame(step);
        };
        const check = () => {
          if (running) return;
          if (!passed(-40)) { armed = true; return; } // the heading is back on screen: ready again
          if (!armed || !userScrolling() || !inZone()) return;
          if (!down) return; // only when heading down
          start();
        };
        window.addEventListener("scroll", () => {
          const y = window.scrollY;
          if (y !== prevY) down = y > prevY; // (a plain mouse wheel jumps in steps: one event per click)
          prevY = y;
          samples.push([performance.now(), y]);
          if (samples.length > 12) samples.shift();
          check();
        }, { passive: true });
        const input = () => { lastInput = performance.now(); };
        window.addEventListener("wheel", input, { passive: true });
        window.addEventListener("keydown", (e) => { if (KEYS.has(e.key)) input(); });
        window.addEventListener("touchstart", () => { touching = true; input(); }, { passive: true });
        window.addEventListener("touchmove", input, { passive: true });
        const lift = () => { touching = false; input(); };
        window.addEventListener("touchend", lift, { passive: true });
        window.addEventListener("touchcancel", lift, { passive: true });
        // dragging the scrollbar counts as scrolling yourself
        window.addEventListener("pointerdown", (e) => { if (e.target === root || e.clientX >= root.clientWidth) input(); }, { passive: true });
        // a link to somewhere further down the page scrolls past on its own: leave that alone
        document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('a[href*="#"]')) quietUntil = performance.now() + 2500; });
        document.addEventListener("visibilitychange", () => { if (document.hidden) finish(); });
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
