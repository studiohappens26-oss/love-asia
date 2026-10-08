/*
 * Bamboo grove — Japanese ink-wash (sumi-e) scene on paper:
 * soft red sun, misty mountains, a pagoda, drifting clouds, swaying ink bamboo,
 * a cherry-blossom branch and falling sakura petals.
 * Everything animates with CSS transforms only (GPU-composited, no per-frame JS).
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  const LEAF = "M0 0 C 14 -7, 46 -8, 78 0 C 46 6, 14 6, 0 0 Z";
  const PETAL = "M0 0 C -7 -6 -7 -15 0 -19 C 2 -16 4 -16 6 -19 C 13 -15 13 -6 0 0 Z";

  /* ---------------------------- backdrop ---------------------------- */
  function pagoda(x, baseY, s) {
    let out = "", y = baseY;
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const w = (44 - i * 6.5) * s, bodyH = (i === 0 ? 16 : 10) * s, roofH = 6 * s, eave = 7 * s;
      out += `<rect x="${x - w * 0.36}" y="${y - bodyH}" width="${w * 0.72}" height="${bodyH}"/>`;
      y -= bodyH;
      out += `<path d="M${x - w / 2 - eave} ${y - roofH * 0.2} Q ${x - w / 2} ${y - roofH * 0.1} ${x - w * 0.3} ${y - roofH} L ${x + w * 0.3} ${y - roofH} Q ${x + w / 2} ${y - roofH * 0.1} ${x + w / 2 + eave} ${y - roofH * 0.2} Z"/>`;
      y -= roofH;
    }
    out += `<rect x="${x - 1.2 * s}" y="${y - 22 * s}" width="${2.4 * s}" height="${22 * s}"/>`;
    for (let i = 0; i < 4; i++) out += `<rect x="${x - 3 * s}" y="${y - 6 * s - i * 4.5 * s}" width="${6 * s}" height="${1.6 * s}"/>`;
    return out;
  }

  // temple hall, torii gate and farmhouses — faint silhouettes on the hills
  const roof = (x0, x1, y, h, e) => `<path d="M${x0 - e} ${y + h * 0.05}Q${x0 + e * 0.4} ${y - h * 0.08} ${x0 + (x1 - x0) * 0.16} ${y - h}L${x1 - (x1 - x0) * 0.16} ${y - h}Q${x1 - e * 0.4} ${y - h * 0.08} ${x1 + e} ${y + h * 0.05}Z"/>`;
  function skyline() {
    const hall = (x, b, s) => {
      const w = 120 * s;
      return `<rect x="${x - w * 0.55}" y="${b - 6 * s}" width="${w * 1.1}" height="${6 * s}"/><rect x="${x - w * 0.4}" y="${b - 30 * s}" width="${w * 0.8}" height="${24 * s}"/>` +
        roof(x - w * 0.5, x + w * 0.5, b - 30 * s, 13 * s, 12 * s) + `<rect x="${x - w * 0.27}" y="${b - 53 * s}" width="${w * 0.54}" height="${11 * s}"/>` + roof(x - w * 0.34, x + w * 0.34, b - 53 * s, 15 * s, 10 * s);
    };
    const torii = (x, b, s) => `<rect x="${x - 16 * s}" y="${b - 40 * s}" width="${3 * s}" height="${40 * s}"/><rect x="${x + 13 * s}" y="${b - 40 * s}" width="${3 * s}" height="${40 * s}"/><rect x="${x - 20 * s}" y="${b - 33 * s}" width="${40 * s}" height="${2.6 * s}"/><path d="M${x - 26 * s} ${b - 40 * s}Q${x} ${b - 37 * s} ${x + 26 * s} ${b - 40 * s}L${x + 27 * s} ${b - 44.5 * s}Q${x} ${b - 41.5 * s} ${x - 27 * s} ${b - 44.5 * s}Z"/>`;
    const minka = (x, b, s) => { const w = 50 * s; return `<rect x="${x - w * 0.42}" y="${b - 14 * s}" width="${w * 0.84}" height="${14 * s}"/><path d="M${x - w * 0.58} ${b - 12 * s}L${x - w * 0.2} ${b - 34 * s}L${x + w * 0.2} ${b - 34 * s}L${x + w * 0.58} ${b - 12 * s}Z"/>`; };
    return `<g fill="#8e9694" opacity=".5">${hall(150, 548, 0.5)}${torii(232, 596, 0.5)}${minka(70, 590, 0.45)}${minka(370, 586, 0.4)}</g>`;
  }

  function backdrop() {
    return `
<svg class="jp-backdrop" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="mt-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3cacb"/><stop offset=".55" stop-color="#e7e6df" stop-opacity="0"/></linearGradient>
    <linearGradient id="mt-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9b2b0"/><stop offset=".6" stop-color="#ece9e1" stop-opacity="0"/></linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e2765f" stop-opacity=".55"/><stop offset=".72" stop-color="#e2765f" stop-opacity=".42"/><stop offset="1" stop-color="#e2765f" stop-opacity="0"/></radialGradient>
  </defs>
  <circle class="jp-sun" cx="292" cy="250" r="78" fill="url(#sun)"/>
  <path d="M0 520 C 30 500 55 455 92 440 C 128 425 150 470 185 468 C 222 466 246 395 292 392 C 334 389 362 446 400 458 V 800 H 0 Z" fill="url(#mt-far)"/>
  <path d="M-10 585 C 40 570 70 520 120 522 C 170 524 188 575 236 566 C 280 558 318 515 410 532 V 800 H -10 Z" fill="url(#mt-mid)"/>
  <g fill="#8e9694" opacity=".55">${pagoda(318, 548, 1)}</g>
  ${skyline()}
  <path d="M-10 640 C 60 620 120 640 190 628 C 260 616 330 640 410 626 V 800 H -10 Z" fill="#f2efe7" opacity=".85"/>
</svg>`;
  }

  function clouds(container) {
    const wrap = document.createElement("div");
    wrap.className = "jp-clouds";
    for (let i = 0; i < 4; i++) {
      const c = document.createElement("div");
      c.className = "jp-cloud";
      c.style.top = `${18 + i * 11 + rand(-3, 3)}%`;
      c.style.width = `${rand(38, 62)}vw`;
      c.style.animationDuration = `${rand(70, 110)}s`;
      c.style.animationDelay = `${-rand(0, 100)}s`;
      wrap.appendChild(c);
    }
    container.appendChild(wrap);
  }

  /* ---------------------------- bamboo ---------------------------- */
  const TONES = {
    1: { stem: ["#5f685a", "#939c86", "#4c5448"], node: "#3a4036", leaves: ["#2f372c", "#46513f", "#5b6853"], op: 0.92 },
    2: { stem: ["#8f978a", "#b8bfae", "#7d8578"], node: "#6c7368", leaves: ["#6b7665", "#808a78", "#5c6657"], op: 0.75 },
    3: { stem: ["#c4c9bd", "#d9ddd1", "#b6bcaf"], node: "#aab1a3", leaves: ["#b3bba9", "#c3c9b9"], op: 0.6 },
    // pastel set used by the home page curtain
    p1: { stem: ["#9db08c", "#c9d8b9", "#8aa079"], node: "#76906a", leaves: ["#7f9a6e", "#97b085", "#6f8a60"], op: 0.95 },
    p2: { stem: ["#b9c8ab", "#dbe5cf", "#a9ba99"], node: "#97ab88", leaves: ["#a3b893", "#b7c9a7"], op: 0.85 },
    p3: { stem: ["#d3ddc8", "#e7eee0", "#c6d2ba"], node: "#bac8ad", leaves: ["#c4d2b6", "#d2ddc6"], op: 0.8 },
  };

  function leafCluster(g, x, y, dir, scale, tone) {
    const c = el("g", { transform: `translate(${x} ${y})` });
    const inner = el("g", {});
    const count = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < count; i++) {
      const ang = dir * rand(10, 55) + (dir < 0 ? 180 : 0) + rand(-8, 8);
      const s = scale * rand(0.75, 1.15);
      inner.appendChild(el("path", {
        d: LEAF,
        fill: tone[(Math.random() * tone.length) | 0],
        "fill-opacity": rand(0.7, 0.95).toFixed(2),
        transform: `rotate(${ang.toFixed(1)}) scale(${s.toFixed(2)} ${(s * rand(0.8, 1.1)).toFixed(2)})`,
      }));
    }
    c.appendChild(inner);
    g.appendChild(c);
  }

  function stalk({ height, width, left, depth, tone }) {
    const svgW = 260;
    const svg = el("svg", { class: `bamboo-stalk depth-${depth}`, viewBox: `0 0 ${svgW} ${height}`, width: svgW, height, "aria-hidden": "true" });
    svg.style.left = `${left}px`;
    svg.style.animationDuration = `${rand(5.5, 8.5).toFixed(2)}s`;
    svg.style.animationDelay = `${-rand(0, 6).toFixed(2)}s`;
    svg.style.setProperty("--sway", `${rand(1.2, 2.6).toFixed(2)}deg`);
    const tones = TONES[tone || depth];
    svg.style.opacity = tones.op;

    const gid = `bg${Math.random().toString(36).slice(2, 8)}`;
    const defs = el("defs", {});
    const grad = el("linearGradient", { id: gid, x1: "0", x2: "1", y1: "0", y2: "0" });
    grad.appendChild(el("stop", { offset: "0", "stop-color": tones.stem[2] }));
    grad.appendChild(el("stop", { offset: "0.4", "stop-color": tones.stem[1] }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": tones.stem[0] }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    const cx = svgW / 2;
    const g = el("g", {});
    svg.appendChild(g);
    let y = height;
    const segH = rand(95, 140) * (width / 22);
    while (y > 30) {
      const h = Math.min(segH * rand(0.85, 1.1), y - 10);
      // slightly tapered ink segment
      const w0 = width, w1 = width * 0.94;
      g.appendChild(el("path", {
        d: `M${cx - w0 / 2} ${y - 2} L${cx - w1 / 2} ${y - h + 3} Q ${cx} ${y - h} ${cx + w1 / 2} ${y - h + 3} L ${cx + w0 / 2} ${y - 2} Z`,
        fill: `url(#${gid})`,
      }));
      g.appendChild(el("path", { d: `M${cx - width / 2 - 2} ${y - h + 1} Q ${cx} ${y - h - 4} ${cx + width / 2 + 2} ${y - h + 1}`, stroke: tones.node, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }));
      if (h > 40) g.appendChild(el("rect", { x: cx - width * 0.24, y: y - h + 10, width: width * 0.1, height: h - 26, rx: 2, fill: "rgba(255,255,255,0.22)" }));
      y -= h;
      if (y < height * 0.72 && Math.random() < 0.75) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const bx = cx + dir * width * 0.5, by = y;
        const ex = bx + dir * rand(28, 60), ey = by - rand(18, 50);
        g.appendChild(el("path", { d: `M${bx} ${by} Q ${(bx + ex) / 2} ${by - 6} ${ex} ${ey}`, stroke: tones.node, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }));
        leafCluster(g, ex, ey, dir, width / 22, tones.leaves);
      }
    }
    leafCluster(g, cx, y + 6, -1, width / 22, tones.leaves);
    leafCluster(g, cx, y + 6, 1, width / 22, tones.leaves);
    return svg;
  }

  /* ------------------------- cherry blossom ------------------------- */
  function blossom(x, y, r) {
    let s = `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rand(0, 72).toFixed(0)})">`;
    for (let i = 0; i < 5; i++) {
      s += `<path d="M0 0 C ${-r * 0.55} ${-r * 0.4} ${-r * 0.5} ${-r * 1.1} 0 ${-r * 1.2} C ${r * 0.12} ${-r} ${r * 0.28} ${-r} ${r * 0.36} ${-r * 1.15} C ${r * 0.75} ${-r * 0.95} ${r * 0.55} ${-r * 0.35} 0 0 Z" transform="rotate(${i * 72})" fill="${i % 2 ? "#f6c9cf" : "#f3bcc4"}" stroke="#d98c98" stroke-width=".5" stroke-opacity=".6"/>`;
    }
    s += `<circle r="${(r * 0.22).toFixed(1)}" fill="#d0606f"/></g>`;
    return s;
  }

  function sakuraBranch(side) {
    // branch grows from the top corner inward
    const flip = side === "right" ? "scale(-1 1) translate(-320 0)" : "";
    const pts = [
      [0, 40], [60, 62], [120, 70], [170, 92], [220, 98], [270, 124],
    ];
    let branch = `<path d="M-10 30 C 40 50 80 62 130 72 C 175 82 215 96 290 128" stroke="#4b403a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    branch += `<path d="M110 70 C 125 100 140 120 150 150" stroke="#4b403a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    branch += `<path d="M190 92 C 200 70 215 55 236 46" stroke="#4b403a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    branch += `<path d="M60 56 C 70 80 66 100 74 118" stroke="#4b403a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    let flowers = "";
    const spots = [[150, 152], [74, 120], [236, 46], [290, 128], ...pts];
    spots.forEach(([x, y]) => {
      flowers += blossom(x + rand(-8, 8), y + rand(-10, 10), rand(8, 12));
      if (Math.random() < 0.7) flowers += blossom(x + rand(-22, 22), y + rand(-16, 18), rand(6, 9));
      if (Math.random() < 0.6) flowers += `<circle cx="${(x + rand(-26, 26)).toFixed(1)}" cy="${(y + rand(-18, 20)).toFixed(1)}" r="3.2" fill="#e79aa6"/>`;
    });
    return `<svg class="sakura sakura--${side}" viewBox="-10 0 320 180" aria-hidden="true"><g transform="${flip}">${branch}${flowers}</g></svg>`;
  }

  function fallingPetals(container, n) {
    for (let i = 0; i < n; i++) {
      const isLeaf = i % 4 === 3;
      const wrap = document.createElement("div");
      wrap.className = "falling-leaf";
      wrap.style.left = `${rand(0, 100).toFixed(1)}%`;
      wrap.style.animationDuration = `${rand(12, 20).toFixed(1)}s`;
      wrap.style.animationDelay = `${-rand(0, 20).toFixed(1)}s`;
      const inner = document.createElement("div");
      inner.className = "falling-leaf__inner";
      inner.style.animationDuration = `${rand(2.4, 4).toFixed(1)}s`;
      inner.innerHTML = isLeaf
        ? `<svg viewBox="-2 -10 82 20" width="${rand(20, 28).toFixed(0)}" aria-hidden="true"><path d="${LEAF}" fill="#5b6853" fill-opacity=".75"/></svg>`
        : `<svg viewBox="-8 -20 22 22" width="${rand(10, 15).toFixed(0)}" aria-hidden="true"><path d="${PETAL}" fill="${["#f4c3ca", "#efb2bc", "#f8d6db"][i % 3]}"/></svg>`;
      wrap.appendChild(inner);
      container.appendChild(wrap);
    }
  }

  function BambooGrove(root) {
    let built = false, lastW = 0;

    function build() {
      // the scene is 100lvh tall, so the address bar never changes this
      const W = window.innerWidth, H = root.clientHeight || window.innerHeight;
      if (built && Math.abs(W - lastW) < 80) return;
      lastW = W;
      root.innerHTML = backdrop();
      clouds(root);
      const tall = H * 1.06;

      const far = document.createElement("div"); far.className = "bamboo-layer";
      const mid = document.createElement("div"); mid.className = "bamboo-layer";
      const near = document.createElement("div"); near.className = "bamboo-layer";

      // a light distant grove on the sides only, keeping the centre airy
      const farSpots = W < 600 ? [-0.02, 0.1, 0.2, 0.8, 0.9, 1.0] : [0.0, 0.07, 0.15, 0.22, 0.78, 0.85, 0.93, 1.0];
      farSpots.forEach((p) => far.appendChild(stalk({ height: tall * rand(0.8, 0.95), width: rand(8, 11), left: p * W - 130 + rand(-10, 10), depth: 3 })));
      const midSpots = W < 600 ? [-0.04, 0.06, 0.94, 1.03] : [-0.03, 0.06, 0.15, 0.85, 0.94, 1.02];
      midSpots.forEach((p) => mid.appendChild(stalk({ height: tall * rand(0.9, 1), width: rand(13, 16), left: p * W - 130, depth: 2 })));
      const nearSpots = W < 600 ? [-0.1, 1.08] : [-0.05, 0.07, 0.95, 1.06];
      nearSpots.forEach((p) => near.appendChild(stalk({ height: tall, width: rand(20, 26), left: p * W - 130, depth: 1 })));

      const branch = document.createElement("div");
      branch.className = "bamboo-layer";
      branch.innerHTML = sakuraBranch("right");

      const petals = document.createElement("div"); petals.className = "bamboo-layer";
      fallingPetals(petals, W < 600 ? 10 : 16);

      const mist = document.createElement("div"); mist.className = "jp-mist";

      root.append(far, mid, mist, near, branch, petals);
      built = true;
    }

    let t = 0;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => { if (built) build(); }, 200);
    });

    return { build };
  }

  window.BambooGrove = BambooGrove;
  window.BambooKit = { stalk, backdrop, clouds, sakuraBranch, fallingPetals };
})();
