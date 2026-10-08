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

// Ink-wash tones, the same palette as the bamboo grove on the Veg menu
const TONES = {
  near: { stem: ["#5f685a", "#939c86", "#4c5448"], node: "#3a4036", leaves: ["#2f372c", "#46513f", "#5b6853"] },
  mid: { stem: ["#8f978a", "#b8bfae", "#7d8578"], node: "#6c7368", leaves: ["#6b7665", "#808a78", "#5c6657"] },
  far: { stem: ["#c4c9bd", "#d9ddd1", "#b6bcaf"], node: "#aab1a3", leaves: ["#b3bba9", "#c3c9b9"] },
};

function gradient(id, t) {
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${t.stem[2]}"/><stop offset=".4" stop-color="${t.stem[1]}"/><stop offset="1" stop-color="${t.stem[0]}"/></linearGradient>`;
}

// leaves reference one shared <path id="lf"> via <use> to keep the files small
function leafCluster(r, x, y, dir, scale, tone) {
  let s = `<g transform="translate(${f1(x)} ${f1(y)})">`;
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const ang = dir * (10 + r() * 45) + (dir < 0 ? 180 : 0) + (r() * 16 - 8);
    const k = scale * (0.75 + r() * 0.4);
    s += `<use href="#lf" fill="${tone.leaves[Math.floor(r() * tone.leaves.length)]}" fill-opacity="${(0.7 + r() * 0.25).toFixed(2)}" transform="rotate(${Math.round(ang)})scale(${k.toFixed(2)} ${(k * (0.8 + r() * 0.3)).toFixed(2)})"/>`;
  }
  return s + "</g>";
}

// one ink bamboo stalk: tapered segments, node rings, a highlight, side branches with leaf sprays
function stalk(r, cx, w, H, tone, gid, leafy = 0.72) {
  let s = "", leaves = "";
  let y = H + 20;
  const segH = Math.max(95, (95 + r() * 45) * (w / 22));
  while (y > -60) {
    const h = segH * (0.85 + r() * 0.25);
    const w1 = w * 0.94;
    s += `<path d="M${f1(cx - w / 2)} ${f1(y - 2)}L${f1(cx - w1 / 2)} ${f1(y - h + 3)}Q${f1(cx)} ${f1(y - h)} ${f1(cx + w1 / 2)} ${f1(y - h + 3)}L${f1(cx + w / 2)} ${f1(y - 2)}Z" fill="url(#${gid})"/>`;
    s += `<path d="M${f1(cx - w / 2 - 2)} ${f1(y - h + 1)}Q${f1(cx)} ${f1(y - h - 4)} ${f1(cx + w / 2 + 2)} ${f1(y - h + 1)}" stroke="${tone.node}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (w >= 16 && h > 40) s += `<rect x="${f1(cx - w * 0.24)}" y="${f1(y - h + 10)}" width="${f1(w * 0.1)}" height="${f1(h - 26)}" rx="2" fill="#fff" fill-opacity=".22"/>`;
    y -= h;
    if (y < H * 0.78 && r() < leafy) {
      const dir = r() < 0.5 ? -1 : 1;
      const bx = cx + dir * w * 0.5, ex = bx + dir * (28 + r() * 32), ey = y - (18 + r() * 32);
      s += `<path d="M${f1(bx)} ${f1(y)}Q${f1((bx + ex) / 2)} ${f1(y - 6)} ${f1(ex)} ${f1(ey)}" stroke="${tone.node}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      leaves += leafCluster(r, ex, ey, dir, w / 22, tone);
    }
  }
  return s + leaves;
}

/* One layer of one half of the bamboo "curtain" (viewBox 900×1000; the inner edge
   is the side that stays on screen after parting).
     back   — distant pale stalks + mid-tone stalks, as one image
     near-a / near-b — the dark foreground stalks, split in two so they can sway
                       out of step with each other */
export function curtainSvg(side, layer) {
  const W = 900, H = 1000;
  const flip = side === "r" ? ` transform="translate(${W} 0) scale(-1 1)"` : "";
  const draw = (seed, tone, spacing, wr, pick, opacity, leafy) => {
    const r = rng(seed), t = TONES[tone], gid = `g${side}${tone}`;
    let x = 10 + r() * 30, out = "", i = 0;
    while (x < W + 10) {
      const w = wr[0] + r() * (wr[1] - wr[0]);
      const body = stalk(r, x, w, H, t, gid, leafy);
      if (!pick || pick(i)) out += body;
      x += spacing * (0.75 + r() * 0.5);
      i++;
    }
    return { defs: gradient(gid, t), body: `<g opacity="${opacity}">${out}</g>` };
  };
  let parts;
  const base = side === "l" ? 11 : 23;
  if (layer === "back") parts = [draw(base + 200, "far", 56, [8, 11], null, 0.6, 0.3), draw(base + 100, "mid", 74, [13, 16], null, 0.78, 0.5)];
  else parts = [draw(base, "near", 88, [20, 26], (i) => (i % 2 === 0) === (layer === "near-a"), 0.94, 0.72)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${parts.map((p) => p.defs).join("")}<path id="lf" d="${LEAF}"/></defs><g${flip}>${parts.map((p) => p.body).join("")}</g></svg>`;
}

/* ---------------------- Japanese architecture silhouettes ---------------------- */
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
  for (let i = 0; i < 4; i++) out += `<rect x="${f1(x - 3 * s)}" y="${f1(y - 6 * s - i * 4.5 * s)}" width="${f1(6 * s)}" height="${f1(1.6 * s)}"/>`;
  return out;
}

// a curved-eave roof (upturned corners) spanning x0..x1, sitting on y, rising to y - h
const curvedRoof = (x0, x1, y, h, eave) =>
  `<path d="M${f1(x0 - eave)} ${f1(y + h * 0.05)}Q${f1(x0 + eave * 0.4)} ${f1(y - h * 0.08)} ${f1(x0 + (x1 - x0) * 0.16)} ${f1(y - h)}L${f1(x1 - (x1 - x0) * 0.16)} ${f1(y - h)}Q${f1(x1 - eave * 0.4)} ${f1(y - h * 0.08)} ${f1(x1 + eave)} ${f1(y + h * 0.05)}Z"/>`;

// temple hall (irimoya roof, two tiers) on a stone base
function templeHall(x, base, s) {
  const w = 120 * s;
  let out = `<rect x="${f1(x - w * 0.55)}" y="${f1(base - 6 * s)}" width="${f1(w * 1.1)}" height="${f1(6 * s)}"/>`;
  out += `<rect x="${f1(x - w * 0.4)}" y="${f1(base - 30 * s)}" width="${f1(w * 0.8)}" height="${f1(24 * s)}"/>`;
  out += curvedRoof(x - w * 0.5, x + w * 0.5, base - 30 * s, 13 * s, 12 * s);
  out += `<rect x="${f1(x - w * 0.27)}" y="${f1(base - 53 * s)}" width="${f1(w * 0.54)}" height="${f1(11 * s)}"/>`;
  out += curvedRoof(x - w * 0.34, x + w * 0.34, base - 53 * s, 15 * s, 10 * s);
  out += `<rect x="${f1(x - w * 0.22)}" y="${f1(base - 70 * s)}" width="${f1(w * 0.44)}" height="${f1(2.5 * s)}"/>`;
  return out;
}

// torii gate
function torii(x, base, s) {
  return `<rect x="${f1(x - 16 * s)}" y="${f1(base - 40 * s)}" width="${f1(3 * s)}" height="${f1(40 * s)}"/>` +
    `<rect x="${f1(x + 13 * s)}" y="${f1(base - 40 * s)}" width="${f1(3 * s)}" height="${f1(40 * s)}"/>` +
    `<rect x="${f1(x - 20 * s)}" y="${f1(base - 33 * s)}" width="${f1(40 * s)}" height="${f1(2.6 * s)}"/>` +
    `<path d="M${f1(x - 26 * s)} ${f1(base - 40 * s)}Q${f1(x)} ${f1(base - 37 * s)} ${f1(x + 26 * s)} ${f1(base - 40 * s)}L${f1(x + 27 * s)} ${f1(base - 44.5 * s)}Q${f1(x)} ${f1(base - 41.5 * s)} ${f1(x - 27 * s)} ${f1(base - 44.5 * s)}Z"/>`;
}

// small farmhouse (minka) with a steep thatched roof
function minka(x, base, s) {
  const w = 50 * s;
  return `<rect x="${f1(x - w * 0.42)}" y="${f1(base - 14 * s)}" width="${f1(w * 0.84)}" height="${f1(14 * s)}"/>` +
    `<path d="M${f1(x - w * 0.58)} ${f1(base - 12 * s)}L${f1(x - w * 0.2)} ${f1(base - 34 * s)}L${f1(x + w * 0.2)} ${f1(base - 34 * s)}L${f1(x + w * 0.58)} ${f1(base - 12 * s)}Z"/>`;
}

export function skylineSvgGroup(fill, opacity) {
  // temples on the far hill, houses and a torii on the near one
  return `<g fill="${fill}" fill-opacity="${opacity}">${templeHall(372, 612, 1.05)}${pagoda(655, 640, 2.1)}${torii(500, 652, 1.15)}${minka(250, 660, 1)}${minka(800, 654, 0.85)}${minka(845, 660, 0.7)}</g>`;
}

/* Sky behind the grove: paper, soft red sun, misty ink mountains, temples and a pagoda. */
export function skySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f4ec"/><stop offset=".6" stop-color="#f3efe6"/><stop offset="1" stop-color="#ece7dc"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#e2765f" stop-opacity=".55"/><stop offset=".72" stop-color="#e2765f" stop-opacity=".42"/><stop offset="1" stop-color="#e2765f" stop-opacity="0"/></radialGradient>
  <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3cacb"/><stop offset=".6" stop-color="#e7e6df" stop-opacity="0"/></linearGradient>
  <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9b2b0"/><stop offset=".65" stop-color="#ece9e1" stop-opacity="0"/></linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3efe6" stop-opacity="0"/><stop offset=".5" stop-color="#f3efe6" stop-opacity=".95"/><stop offset="1" stop-color="#ece7dc"/></linearGradient>
</defs>
<rect width="1000" height="1000" fill="url(#sky)"/>
<circle cx="610" cy="330" r="120" fill="url(#sun)"/>
<path d="M0 560C60 530 110 470 170 460C240 448 270 520 330 515C400 510 430 410 500 405C570 400 610 488 680 500C750 512 800 450 860 455C920 460 960 500 1000 510V1000H0Z" fill="url(#m1)"/>
<path d="M0 640C70 620 120 575 200 578C280 581 300 640 380 630C450 622 500 568 580 572C660 576 690 640 770 632C850 624 910 590 1000 600V1000H0Z" fill="url(#m2)"/>
${skylineSvgGroup("#8e9694", 0.55)}
<path d="M-10 690C80 670 170 690 260 678C350 666 430 690 520 676C610 662 700 688 790 676C880 664 950 684 1010 674V1000H-10Z" fill="#f2efe7" fill-opacity=".85"/>
<rect y="700" width="1000" height="300" fill="url(#mist)"/>
</svg>`;
}

/* Cherry-blossom branch reaching in from the top-right corner (as on the Veg menu). */
export function sakuraSvg() {
  const r = rng(77);
  const rr = (a, b) => a + r() * (b - a);
  const blossom = (x, y, rad) => {
    let s = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rr(0, 72))})">`;
    for (let i = 0; i < 5; i++) {
      s += `<path d="M0 0C${f1(-rad * 0.55)} ${f1(-rad * 0.4)} ${f1(-rad * 0.5)} ${f1(-rad * 1.1)} 0 ${f1(-rad * 1.2)}C${f1(rad * 0.12)} ${f1(-rad)} ${f1(rad * 0.28)} ${f1(-rad)} ${f1(rad * 0.36)} ${f1(-rad * 1.15)}C${f1(rad * 0.75)} ${f1(-rad * 0.95)} ${f1(rad * 0.55)} ${f1(-rad * 0.35)} 0 0Z" transform="rotate(${i * 72})" fill="${i % 2 ? "#f6c9cf" : "#f3bcc4"}" stroke="#d98c98" stroke-width=".5" stroke-opacity=".6"/>`;
    }
    return s + `<circle r="${f1(rad * 0.22)}" fill="#d0606f"/></g>`;
  };
  let branch = `<path d="M-10 30C40 50 80 62 130 72C175 82 215 96 290 128" stroke="#4b403a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  branch += `<path d="M110 70C125 100 140 120 150 150" stroke="#4b403a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  branch += `<path d="M190 92C200 70 215 55 236 46" stroke="#4b403a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  branch += `<path d="M60 56C70 80 66 100 74 118" stroke="#4b403a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  let flowers = "";
  for (const [x, y] of [[150, 152], [74, 120], [236, 46], [290, 128], [0, 40], [60, 62], [120, 70], [170, 92], [220, 98], [270, 124]]) {
    flowers += blossom(x + rr(-8, 8), y + rr(-10, 10), rr(8, 12));
    if (r() < 0.7) flowers += blossom(x + rr(-22, 22), y + rr(-16, 18), rr(6, 9));
    if (r() < 0.6) flowers += `<circle cx="${f1(x + rr(-26, 26))}" cy="${f1(y + rr(-18, 20))}" r="3.2" fill="#e79aa6"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 320 180"><g transform="scale(-1 1) translate(-320 0)">${branch}${flowers}</g></svg>`;
}

export const PETAL = "M0 0C-7 -6 -7 -15 0 -19C2 -16 4 -16 6 -19C13 -15 13 -6 0 0Z";
export const LEAF_PATH = LEAF;

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
