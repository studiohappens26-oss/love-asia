/*
 * Build-time scenery. Each layer of the home/events backdrop is written out as one
 * static SVG image, so the browser rasterises it once and only ever moves it
 * (cheap, GPU-composited) — no per-frame drawing, no hundreds of live DOM nodes.
 */

// small deterministic PRNG so every build produces the same art
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f1 = (n) => (Math.round(n * 10) / 10).toString();

const LEAF = "M0 0C14 -7 46 -8 78 0C46 6 14 6 0 0Z";

const TONES = {
  near: { stem: ["#8aa079", "#cbdabb", "#9fb28e"], node: "#728b64", leaves: ["#6f8a60", "#7f9a6e", "#91ab7f"] },
  far: { stem: ["#bccab0", "#e1e9d8", "#c8d4bd"], node: "#aebda2", leaves: ["#b2c3a3", "#c2d1b4"] },
};

function gradient(id, t) {
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${t.stem[2]}"/><stop offset=".42" stop-color="${t.stem[1]}"/><stop offset="1" stop-color="${t.stem[0]}"/></linearGradient>`;
}

// leaves reference one shared <path id="lf"> via <use> to keep the files small
function leafCluster(r, x, y, dir, scale, tone) {
  let s = `<g transform="translate(${f1(x)} ${f1(y)})">`;
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const ang = dir * (10 + r() * 48) + (dir < 0 ? 180 : 0) + (r() * 16 - 8);
    const k = scale * (0.75 + r() * 0.45);
    s += `<use href="#lf" fill="${tone.leaves[Math.floor(r() * tone.leaves.length)]}" transform="rotate(${Math.round(ang)})scale(${k.toFixed(2)} ${(k * (0.8 + r() * 0.3)).toFixed(2)})"/>`;
  }
  return s + "</g>";
}

// one stalk = a single shaded body, one highlight, one path for all its nodes, plus leaf sprays
function stalk(r, cx, w, H, tone, gid) {
  const thin = w < 20;
  let nodes = "", leaves = "", branches = "";
  let y = H + 30;
  const segH = Math.max(115, (100 + r() * 50) * (w / 24));
  while (y > -40) {
    const h = segH * (0.85 + r() * 0.25);
    y -= h;
    nodes += `M${f1(cx - w / 2 - 2)} ${f1(y + 1)}q${f1(w / 2 + 2)} -5 ${f1(w + 4)} 0`;
    if (y < H * 0.82 && r() < 0.62) {
      const dir = r() < 0.5 ? -1 : 1;
      const bx = cx + dir * w * 0.5, ex = bx + dir * (26 + r() * 40), ey = y - (16 + r() * 40);
      branches += `M${f1(bx)} ${f1(y)}Q${f1((bx + ex) / 2)} ${f1(y - 6)} ${f1(ex)} ${f1(ey)}`;
      leaves += leafCluster(r, ex, ey, dir, w / 22, tone);
    }
  }
  let s = `<rect x="${f1(cx - w / 2)}" y="-40" width="${f1(w)}" height="${H + 80}" rx="${f1(w * 0.3)}" fill="url(#${gid})"/>`;
  if (!thin) s += `<rect x="${f1(cx - w * 0.26)}" y="-40" width="${f1(w * 0.1)}" height="${H + 80}" fill="#fff" fill-opacity=".2"/>`;
  s += `<path d="${nodes}" stroke="${tone.node}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (branches) s += `<path d="${branches}" stroke="${tone.node}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return s + leaves;
}

/* One half of the bamboo "curtain". viewBox 900×1000; the inner edge is the side
   that stays on screen after parting (right edge for the left curtain). */
export function curtainSvg(side, layer) {
  const r = rng((side === "l" ? 11 : 23) + (layer === "near" ? 0 : 100));
  const W = 900, H = 1000, t = TONES[layer], gid = `g${side}${layer}`;
  const spacing = layer === "near" ? 78 : 52, wr = layer === "near" ? [26, 34] : [13, 18];
  let x = 20 + r() * 20, stalks = "";
  while (x < W - 10) {
    stalks += stalk(r, x, wr[0] + r() * (wr[1] - wr[0]), H, t, gid);
    x += spacing * (0.75 + r() * 0.5);
  }
  const flip = side === "r" ? ` transform="translate(${W} 0) scale(-1 1)"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${gradient(gid, t)}<path id="lf" d="${LEAF}" fill-opacity=".86"/></defs><g${flip}>${stalks}</g></svg>`;
}

function pagoda(x, baseY, s) {
  let out = "", y = baseY;
  for (let i = 0; i < 5; i++) {
    const w = (44 - i * 6.5) * s, bodyH = (i === 0 ? 16 : 10) * s, roofH = 6 * s, eave = 7 * s;
    out += `<rect x="${f1(x - w * 0.36)}" y="${f1(y - bodyH)}" width="${f1(w * 0.72)}" height="${f1(bodyH)}"/>`;
    y -= bodyH;
    out += `<path d="M${f1(x - w / 2 - eave)} ${f1(y - roofH * 0.2)}Q${f1(x - w / 2)} ${f1(y - roofH * 0.1)} ${f1(x - w * 0.3)} ${f1(y - roofH)}L${f1(x + w * 0.3)} ${f1(y - roofH)}Q${f1(x + w / 2)} ${f1(y - roofH * 0.1)} ${f1(x + w / 2 + eave)} ${f1(y - roofH * 0.2)}Z"/>`;
    y -= roofH;
  }
  out += `<rect x="${f1(x - 1.2 * s)}" y="${f1(y - 22 * s)}" width="${f1(2.4 * s)}" height="${f1(22 * s)}"/>`;
  return out;
}

/* Sky behind the grove: paper, a soft red sun, misty mountains and a pagoda. */
export function skySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfcf8"/><stop offset=".7" stop-color="#f7f4ec"/><stop offset="1" stop-color="#eef0e4"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#ef9f8b" stop-opacity=".55"/><stop offset=".7" stop-color="#ef9f8b" stop-opacity=".42"/><stop offset="1" stop-color="#ef9f8b" stop-opacity="0"/></radialGradient>
  <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dfdb"/><stop offset=".7" stop-color="#f3f2ea" stop-opacity="0"/></linearGradient>
  <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7d0cb"/><stop offset=".75" stop-color="#f1f0e7" stop-opacity="0"/></linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f4ec" stop-opacity="0"/><stop offset=".5" stop-color="#f6f4ec" stop-opacity=".95"/><stop offset="1" stop-color="#eef1e5"/></linearGradient>
</defs>
<rect width="1000" height="1000" fill="url(#sky)"/>
<circle cx="610" cy="320" r="110" fill="url(#sun)"/>
<g fill="#fff" fill-opacity=".75"><rect x="120" y="230" width="300" height="9" rx="4.5"/><rect x="190" y="248" width="180" height="7" rx="3.5"/><rect x="640" y="190" width="260" height="8" rx="4"/><rect x="700" y="207" width="140" height="6" rx="3"/></g>
<path d="M0 560C60 530 110 470 170 460C240 448 270 520 330 515C400 510 430 410 500 405C570 400 610 488 680 500C750 512 800 450 860 455C920 460 960 500 1000 510V1000H0Z" fill="url(#m1)"/>
<path d="M0 640C70 620 120 575 200 578C280 581 300 640 380 630C450 622 500 568 580 572C660 576 690 640 770 632C850 624 910 590 1000 600V1000H0Z" fill="url(#m2)"/>
<g fill="#aeb8b2" fill-opacity=".7">${pagoda(655, 640, 2.1)}</g>
<rect y="600" width="1000" height="400" fill="url(#mist)"/>
</svg>`;
}

/* The ground where the bamboo is planted: soft watercolour washes, no cartoon tufts. */
export function groundSvg() {
  const r = rng(7);
  let mounds = "";
  for (let i = 0; i < 7; i++) {
    const x = r() * 1200, w = 120 + r() * 160;
    mounds += `<ellipse cx="${f1(x)}" cy="${f1(70 + r() * 30)}" rx="${f1(w)}" ry="${f1(18 + r() * 12)}" fill="#cfdcc0" fill-opacity="${(0.35 + r() * 0.25).toFixed(2)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 200" preserveAspectRatio="none">
<defs><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e9d5"/><stop offset=".55" stop-color="#e6ecdb"/><stop offset="1" stop-color="#e9edde"/></linearGradient></defs>
<path d="M0 46C120 30 220 52 340 40C470 27 560 50 690 38C820 26 930 48 1050 36C1110 30 1160 34 1200 38V200H0Z" fill="#d6e1c8" fill-opacity=".7"/>
<path d="M0 62C140 48 250 70 380 58C520 45 610 68 740 56C880 44 990 66 1200 54V200H0Z" fill="url(#gw)"/>
${mounds}
<path d="M0 62C140 48 250 70 380 58C520 45 610 68 740 56C880 44 990 66 1200 54" fill="none" stroke="#b9c9a8" stroke-opacity=".55" stroke-width="2"/>
</svg>`;
}

/* The bank between the grove and the pond: grass → smooth stones → water.
   The stones sit on the waterline so there is never a hard seam. */
export const GROUND_BOTTOM = "#e9edde";
export const WATER_TOP = "#e3eeed";
export function shoreSvg() {
  const r = rng(31);
  const W = 1200, H = 300, EDGE = 88;
  // rounded garden shrubs (karikomi) sitting on the bank
  let shrubs = "";
  for (const [x, w] of [[90, 170], [330, 120], [560, 200], [820, 140], [1080, 190]]) {
    const h = w * 0.36;
    shrubs += `<ellipse cx="${x}" cy="${f1(EDGE - h * 0.25)}" rx="${f1(w / 2)}" ry="${f1(h / 2)}" fill="url(#shrub)"/>`;
    shrubs += `<ellipse cx="${f1(x - w * 0.12)}" cy="${f1(EDGE - h * 0.45)}" rx="${f1(w * 0.28)}" ry="${f1(h * 0.18)}" fill="#e6eedb" fill-opacity=".55"/>`;
  }
  // flat river stones straddling the waterline, with soft reflections
  let stones = "", refl = "";
  const tones = ["stoneW", "stoneC", "stoneW"];
  for (let x = -40; x < W + 60; ) {
    const rx = 26 + r() * 40, ry = rx * (0.3 + r() * 0.14);
    const cy = EDGE + 4 + Math.sin(x / 160) * 5 + r() * 6;
    const rot = r() * 10 - 5, g = tones[Math.floor(r() * tones.length)];
    refl += `<ellipse cx="${f1(x)}" cy="${f1(cy + ry * 1.5)}" rx="${f1(rx * 0.9)}" ry="${f1(ry * 0.7)}" fill="#a9bcbe" fill-opacity=".22"/>`;
    stones += `<ellipse cx="${f1(x)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" transform="rotate(${f1(rot)} ${f1(x)} ${f1(cy)})" fill="url(#${g})"/>`;
    if (r() < 0.35) stones += `<ellipse cx="${f1(x - rx * 0.25)}" cy="${f1(cy - ry * 0.55)}" rx="${f1(rx * 0.35)}" ry="${f1(ry * 0.2)}" fill="#c3d2b0" fill-opacity=".8"/>`;
    if (r() < 0.5) {
      const px = x + rx * (0.9 + r() * 0.4), pr = 5 + r() * 6;
      stones += `<ellipse cx="${f1(px)}" cy="${f1(cy + ry * 0.5)}" rx="${f1(pr)}" ry="${f1(pr * 0.55)}" fill="url(#stoneC)"/>`;
    }
    x += rx * (1.3 + r() * 0.7);
  }
  let ripples = "";
  for (let i = 0; i < 8; i++) {
    const x = r() * W, y = 175 + r() * 100, w = 26 + r() * 60;
    ripples += `<path d="M${f1(x - w)} ${f1(y)}Q${f1(x)} ${f1(y - 4)} ${f1(x + w)} ${f1(y)}" stroke="#fff" stroke-opacity=".75" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  const pad = (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s} ${s * 0.62})"><path d="M0 0L46 -10C50 10 40 38 10 46C-20 52 -46 30 -46 2C-46 -26 -22 -48 4 -46C28 -44 42 -30 46 -10Z" fill="${c}" fill-opacity=".42" stroke="${c}" stroke-opacity=".55" stroke-width="1.5"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GROUND_BOTTOM}"/><stop offset=".55" stop-color="#e8e9da"/><stop offset="1" stop-color="#e6e2d4"/></linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3e1e0"/><stop offset=".45" stop-color="${WATER_TOP}"/><stop offset="1" stop-color="${WATER_TOP}"/></linearGradient>
  <radialGradient id="shrub" cx=".42" cy=".3" r=".8"><stop offset="0" stop-color="#cbdab9"/><stop offset=".7" stop-color="#b6c9a3"/><stop offset="1" stop-color="#a6bc93"/></radialGradient>
  <radialGradient id="stoneW" cx=".4" cy=".28" r=".8"><stop offset="0" stop-color="#f0ece4"/><stop offset=".6" stop-color="#d9d3c8"/><stop offset="1" stop-color="#c2bbae"/></radialGradient>
  <radialGradient id="stoneC" cx=".4" cy=".28" r=".8"><stop offset="0" stop-color="#ecefed"/><stop offset=".6" stop-color="#d0d6d4"/><stop offset="1" stop-color="#b6bebd"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#water)"/>
<path d="M0 0H${W}V${EDGE}C1100 ${EDGE + 6} 1000 ${EDGE - 4} 900 ${EDGE + 3}C800 ${EDGE + 9} 700 ${EDGE - 3} 600 ${EDGE + 4}C500 ${EDGE + 10} 400 ${EDGE - 2} 300 ${EDGE + 5}C200 ${EDGE + 11} 100 ${EDGE} 0 ${EDGE + 6}Z" fill="url(#bank)"/>
${shrubs}
${refl}
${stones}
${ripples}
${pad(180, 230, 0.9, "#c9946c")}${pad(760, 255, 0.7, "#8ea1a8")}${pad(1030, 215, 0.6, "#9a9a96")}
</svg>`;
}

/* Small bamboo sprigs that hang over the corners of text panels. */
export function sprigSvg(variant) {
  const r = rng(variant === "a" ? 5 : 9);
  const t = TONES.near;
  let s = `<path d="M8 ${variant === "a" ? 24 : 40}Q70 ${variant === "a" ? 30 : 26} 140 ${variant === "a" ? 52 : 34}" stroke="${t.node}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const pts = variant === "a" ? [[46, 28, 1], [92, 38, 1], [132, 50, 1], [70, 32, -1]] : [[40, 36, 1], [86, 30, 1], [128, 34, 1], [60, 33, -1], [104, 31, -1]];
  for (const [x, y, d] of pts) {
    const n = 2 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const ang = d * (25 + r() * 55);
      const k = 0.85 + r() * 0.4;
      s += `<path d="${LEAF}" transform="translate(${x} ${y}) rotate(${f1(ang)}) scale(${k.toFixed(2)} ${(k * 0.95).toFixed(2)})" fill="${t.leaves[Math.floor(r() * t.leaves.length)]}" fill-opacity="${(0.82 + r() * 0.15).toFixed(2)}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 150">${s}</svg>`;
}
