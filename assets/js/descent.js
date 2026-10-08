/*
 * Home page "camera descent".
 * The viewer is a camera that starts in the sky in front of a dense bamboo grove.
 *   1. Scrolling parts the bamboo like curtains (the grove stays put, it only opens).
 *   2. Then the camera sinks: the world slides up past the ground…
 *   3. …into the water, where the koi pond takes over for the rest of the page.
 * Only transforms/opacity change on scroll, so it stays smooth on phones.
 */
(function () {
  "use strict";

  const back = document.getElementById("stage-back");
  const front = document.getElementById("stage-front");
  if (!back || !front || !window.BambooKit) return;

  const world = document.getElementById("world");
  const wB = document.getElementById("w-bamboo");
  const wG = document.getElementById("w-ground");
  const wW = document.getElementById("w-water");
  const pondCanvas = document.getElementById("pond");
  const revealCard = document.querySelector(".reveal__inner");
  const Kit = window.BambooKit;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  let W = 0, H = 0, travel = 0;
  let stalks = [];
  let pond = null, pondOn = false;
  let lastPart = -1, lastDesc = -1, ticking = false;

  /* --------------------------- scenery --------------------------- */
  function groundSvg() {
    let tufts = "", stones = "";
    for (let i = 0; i < 26; i++) {
      const x = rand(0, 400), y = rand(16, 40), h = rand(6, 13);
      tufts += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}q-2 -${(h * 0.6).toFixed(1)} -5 -${h.toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)}q0 -${h.toFixed(1)} 1 -${(h * 1.2).toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)}q3 -${(h * 0.6).toFixed(1)} 6 -${(h * 0.9).toFixed(1)}"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const x = rand(10, 390), y = rand(60, 140), rx = rand(6, 15), ry = rx * rand(0.45, 0.62);
      stones += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="#d8d5cc"/><ellipse cx="${(x - rx * 0.2).toFixed(1)}" cy="${(y - ry * 0.3).toFixed(1)}" rx="${(rx * 0.55).toFixed(1)}" ry="${(ry * 0.4).toFixed(1)}" fill="#ebe8e1"/>`;
    }
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMin slice" width="100%" height="100%">
  <defs>
    <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e8d5"/><stop offset=".45" stop-color="#ebe6d6"/><stop offset="1" stop-color="#ede8dc"/></linearGradient>
  </defs>
  <path d="M0 22C40 10 80 18 120 14C170 9 210 24 260 18C310 12 350 20 400 14V150C360 156 320 148 280 154C230 162 180 144 130 152C80 160 40 144 0 152Z" fill="url(#gnd)"/>
  <path d="M0 22C40 10 80 18 120 14C170 9 210 24 260 18C310 12 350 20 400 14" fill="none" stroke="#9aa68d" stroke-opacity=".5" stroke-width="1.2"/>
  <g fill="#cbd8bb" opacity=".55"><ellipse cx="60" cy="40" rx="48" ry="10"/><ellipse cx="230" cy="44" rx="60" ry="11"/><ellipse cx="350" cy="36" rx="40" ry="8"/></g>
  <g stroke="#8f9e80" stroke-opacity=".6" stroke-width="1" fill="none" stroke-linecap="round">${tufts}</g>
  ${stones}
  <g transform="translate(318 30)" fill="#d3cec4" stroke="#8d877c" stroke-opacity=".5" stroke-width=".8">
    <rect x="-3" y="34" width="6" height="22"/><rect x="-11" y="54" width="22" height="5" rx="1"/>
    <rect x="-9" y="22" width="18" height="12" rx="1"/><rect x="-5" y="25" width="10" height="6" fill="#f6efe0"/>
    <path d="M-16 22L0 10L16 22Z"/><circle cx="0" cy="8" r="2.5"/>
  </g>
  <path d="M0 152C40 144 80 160 130 152C180 144 230 162 280 154C320 148 360 156 400 150" fill="none" stroke="#bdd2d3" stroke-width="5" stroke-opacity=".55"/>
</svg>`;
  }

  function waterDecor() {
    const pads = [
      [8, 6, 70, "#c9946c"], [78, 10, 54, "#8ea1a8"], [64, 3, 40, "#9a9a96"], [20, 14, 46, "#8ea1a8"],
    ].map(([x, y, s, c]) => `<svg class="w-pad" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;color:${c}"><use href="#pad"/></svg>`).join("");
    let rings = "";
    for (let i = 0; i < 6; i++) rings += `<span class="w-ring" style="left:${rand(10, 90).toFixed(0)}%;top:${rand(4, 30).toFixed(0)}%;animation-delay:${-rand(0, 6).toFixed(1)}s"></span>`;
    return pads + rings;
  }

  function build() {
    W = window.innerWidth;
    H = front.clientHeight || window.innerHeight;

    back.innerHTML = Kit.backdrop();
    // landscape screens: crop the backdrop around the mountains and pagoda
    if (W > H) back.firstElementChild.setAttribute("viewBox", "0 330 400 320");
    Kit.clouds(back);

    const groundY = Math.round(H * 0.9);
    const waterTop = groundY + Math.round(H * 0.27); // tucked under the ground's wavy shoreline
    wB.style.height = groundY + "px";
    wG.style.top = Math.round(groundY - H * 0.05) + "px";
    wG.style.height = Math.round(H * 0.42) + "px";
    wW.style.top = waterTop + "px";
    wW.style.height = Math.round(H * 1.7) + "px";
    travel = waterTop + Math.round(H * 0.15);

    // the bamboo curtain: three depths of pastel stalks, packed close together
    wB.innerHTML = "";
    stalks = [];
    const narrow = W < 600;
    const layers = [
      { tone: "p3", w: [8, 11], gap: narrow ? 30 : 46, far: true },
      { tone: "p2", w: [12, 16], gap: narrow ? 34 : 54 },
      { tone: "p1", w: [18, 25], gap: narrow ? 42 : 66 },
    ];
    for (const L of layers) {
      for (let x = rand(-L.gap, 0); x < W + L.gap; x += L.gap * rand(0.75, 1.2)) {
        // parting uses the independent CSS `translate` property, so it composes with the
        // stalk's own sway animation (`transform`) without an extra wrapper layer
        const el = Kit.stalk({ height: groundY + 60, width: rand(L.w[0], L.w[1]), left: x - 130, depth: 1, tone: L.tone });
        wB.appendChild(el);
        // curtains: centre stalks travel furthest; most gather into bunches at the edges
        const u = (x - W / 2) / (W / 2), dir = u < 0 ? -1 : 1, k = 1 - Math.min(1, Math.abs(u));
        // phones: open fully so the revealed text is clear; wide screens keep framing bunches
        const out = narrow ? 0.38 : 0.08, spread = narrow ? 0.2 : 0.14;
        const target = L.far ? (dir < 0 ? -0.4 * W : 1.4 * W) : dir < 0 ? -out * W + k * spread * W : (1 + out) * W - k * spread * W;
        stalks.push({ el, dx: target - x });
      }
    }

    wG.innerHTML = groundSvg();
    wW.querySelectorAll(".w-pad, .w-ring").forEach((n) => n.remove());
    wW.insertAdjacentHTML("beforeend", waterDecor());

    lastPart = lastDesc = -1;
    update();
  }

  /* --------------------------- scroll → camera --------------------------- */
  function update() {
    ticking = false;
    const y = window.scrollY / H;
    const part = reduced ? clamp(y / 0.9) : easeOut(clamp((y - 0.06) / 0.9));
    const desc = easeInOut(clamp((y - 1.55) / 2.4));

    if (part !== lastPart) {
      for (const s of stalks) s.el.style.translate = `${(s.dx * part).toFixed(1)}px 0`;
      // fade the text behind the bamboo in as it opens (set directly: a root CSS
      // variable would restyle the whole page every frame)
      if (revealCard) {
        revealCard.style.opacity = clamp(part * 1.6 - 0.45).toFixed(3);
        revealCard.style.transform = `scale(${(0.94 + part * 0.06).toFixed(4)})`;
      }
      lastPart = part;
    }
    if (desc !== lastDesc) {
      world.style.transform = `translate3d(0,${(-desc * travel).toFixed(1)}px,0)`;
      back.style.transform = `translate3d(0,${(-desc * travel * 0.35).toFixed(1)}px,0)`;
      // once the bamboo has left the screen it doesn't need compositing
      wB.style.visibility = desc > 0.75 ? "hidden" : "";
      back.style.visibility = desc > 0.97 ? "hidden" : "";
      const po = clamp((desc - 0.7) / 0.25);
      pondCanvas.style.opacity = po.toFixed(3);
      if (pond) {
        if (po > 0 && !pondOn) { pond.start(); pondOn = true; }
        else if (po === 0 && pondOn) { pond.stop(); pondOn = false; }
      }
      lastDesc = desc;
    }
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  // rebuild only for real size changes (rotation / desktop resize), not the address bar
  let rt = 0;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (window.innerWidth !== W || Math.abs((front.clientHeight || window.innerHeight) - H) > 120) build();
    }, 200);
  });

  build();

  if (window.KoiPond) {
    pond = window.KoiPond(pondCanvas, document.getElementById("caustics"));
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 600));
    idle(() => { pond.prepare(); update(); }, { timeout: 2500 });
    // tap the water to feed the koi
    document.addEventListener("pointerdown", (e) => {
      if (!pondOn || e.target.closest("a, button, input, select, textarea, .panel, .site-header, iframe")) return;
      pond.addRipple(e.clientX, e.clientY, true);
    }, { passive: true });
  }
})();
