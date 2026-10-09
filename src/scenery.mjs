/*
 * Build-time scenery. Each layer of the home/events backdrop is written out as one
 * static SVG image, so the browser rasterises it once and only ever moves it
 * (cheap, GPU-composited), with no per-frame drawing, no hundreds of live DOM nodes.
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
import { pagoda, templeHall, torii, minka, pine, cloudSvg } from "./architecture.mjs";
export { cloudSvg };

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
function leafCluster(r, x, y, dir, scale, tone, op = 1) {
  let s = `<g transform="translate(${f1(x)} ${f1(y)})">`;
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const ang = dir * (10 + r() * 45) + (dir < 0 ? 180 : 0) + (r() * 16 - 8);
    const k = scale * (0.75 + r() * 0.4);
    s += `<use href="#lf" fill="${tone.leaves[Math.floor(r() * tone.leaves.length)]}" fill-opacity="${((0.7 + r() * 0.25) * op).toFixed(2)}" transform="rotate(${Math.round(ang)})scale(${k.toFixed(2)} ${(k * (0.8 + r() * 0.3)).toFixed(2)})"/>`;
  }
  return s + "</g>";
}

// one ink bamboo stalk: tapered segments, node rings, a highlight, side branches with leaf sprays.
// Each part type is merged into a single path, so a stalk is 4 shapes (+ leaves) to draw
// instead of ~70; phones redraw these as they scroll, so fewer shapes means smoother scrolling.
function stalk(r, cx, w, H, tone, gid, leafy = 0.72, op = 1) {
  let seg = "", node = "", hl = "", twig = "", leaves = "";
  let y = H + 20;
  const segH = Math.max(95, (95 + r() * 45) * (w / 22));
  while (y > -60) {
    const h = segH * (0.85 + r() * 0.25);
    const w1 = w * 0.94;
    seg += `M${f1(cx - w / 2)} ${f1(y - 2)}L${f1(cx - w1 / 2)} ${f1(y - h + 3)}Q${f1(cx)} ${f1(y - h)} ${f1(cx + w1 / 2)} ${f1(y - h + 3)}L${f1(cx + w / 2)} ${f1(y - 2)}Z`;
    node += `M${f1(cx - w / 2 - 2)} ${f1(y - h + 1)}Q${f1(cx)} ${f1(y - h - 4)} ${f1(cx + w / 2 + 2)} ${f1(y - h + 1)}`;
    if (w >= 16 && h > 40) hl += `M${f1(cx - w * 0.24)} ${f1(y - h + 10)}h${f1(w * 0.1)}v${f1(h - 26)}h${f1(-w * 0.1)}Z`;
    y -= h;
    if (y < H - 220 && r() < leafy) {
      const dir = r() < 0.5 ? -1 : 1;
      // a short twig angled upward, so it never reads as a rope strung between stalks
      const bx = cx + dir * w * 0.5, ex = bx + dir * (16 + r() * 18), ey = y - (22 + r() * 26);
      twig += `M${f1(bx)} ${f1(y)}Q${f1(bx + dir * 4)} ${f1(y - 12)} ${f1(ex)} ${f1(ey)}`;
      leaves += leafCluster(r, ex, ey, dir, w / 22, tone, op);
    }
  }
  // opacity goes on each shape: a semi-transparent <g> would force an offscreen pass per tile
  const o = op < 1 ? ` fill-opacity="${op}"` : "", so = op < 1 ? ` stroke-opacity="${op}"` : "";
  return `<path d="${seg}" fill="url(#${gid})"${o}/>` +
    `<path d="${node}" stroke="${tone.node}" stroke-width="3" fill="none" stroke-linecap="round"${so}/>` +
    (hl ? `<path d="${hl}" fill="#fff" fill-opacity="${(0.22 * op).toFixed(2)}"/>` : "") +
    (twig ? `<path d="${twig}" stroke="${tone.node}" stroke-width="1.5" fill="none" stroke-linecap="round"${so}/>` : "") +
    leaves;
}

/* One layer of one half of the bamboo "curtain" (viewBox 900×H; the inner edge
   is the side that stays on screen after parting).
     back:   distant pale stalks and mid-tone stalks, as one image
     near-a / near-b: the dark foreground stalks, split in two so they can sway
                      out of step with each other
   The home page uses taller versions so the camera can pan down the stalks.
   crop: only the inner `crop` units wide (phones only ever see the inner edge), so a
   phone has a third of the shapes to draw. */
export function curtainSvg(side, layer, H = 1000, crop = 0) {
  const W = 900;
  const flip = side === "r" ? ` transform="translate(${W} 0) scale(-1 1)"` : "";
  const draw = (seed, tone, spacing, wr, pick, opacity, leafy) => {
    const r = rng(seed), t = TONES[tone], gid = `g${side}${tone}`;
    let x = 10 + r() * 30, out = "", i = 0;
    while (true) {
      const w = wr[0] + r() * (wr[1] - wr[0]);
      // keep every stalk whole: the inner edge (x = W) is where the two halves meet
      if (x + w / 2 > W - 6) break;
      const body = stalk(r, x, w, H, t, gid, leafy, opacity);
      // (stalks outside the crop are still generated, so the random sequence and the art stay the same)
      if ((!pick || pick(i)) && (!crop || x > W - crop - 70)) out += body;
      x += spacing * (0.75 + r() * 0.5);
      i++;
    }
    return { defs: gradient(gid, t), body: out };
  };
  let parts;
  const base = side === "l" ? 11 : 23;
  if (layer === "back") parts = [draw(base + 200, "far", 82, [8, 11], null, 0.6, 0.3), draw(base + 100, "mid", 108, [13, 16], null, 0.78, 0.5)];
  // near-a / near-b: alternate stalks; "near" (phones): all of them in one image, one layer to move
  else parts = [draw(base, "near", 128, [20, 26], layer === "near" ? null : (i) => (i % 2 === 0) === (layer === "near-a"), 1, 0.72)];
  const vb = crop ? `${side === "r" ? 0 : W - crop} 0 ${crop} ${H}` : `0 0 ${W} ${H}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${parts.map((p) => p.defs).join("")}<path id="lf" d="${LEAF}"/></defs><g${flip}>${parts.map((p) => p.body).join("")}</g></svg>`;
}

/* ---------------------- Japanese architecture silhouettes ---------------------- */
// The near ridge rises into a low knoll under the temple hall so its base sits on the ground.
// The far hill holds a temple hall and a five-storey pagoda among pines; the nearer
// hill has a torii and farmhouses. Laid out so the middle third (what a phone shows)
// carries the temple, pagoda and torii.
export function skylineSvgGroup() {
  const far = "#939c9a", near = "#7c8785", light = "#ebe8df";
  return `<g fill="${far}" opacity=".7">${pine(318, 624, 1.05, 1, far)}${templeHall(412, 622, 0.92, light)}${pine(520, 626, 0.9, -1, far)}${pagoda(612, 632, 1.38, light)}${pine(712, 628, 1, -1, far)}</g>` +
    `<g fill="${near}" opacity=".78">${minka(210, 662, 0.95, light)}${minka(258, 666, 0.75, light)}${torii(352, 670, 0.95)}${minka(790, 660, 0.9, light)}${minka(838, 666, 0.72, light)}${pine(880, 668, 0.8, 1, near)}</g>`;
}

const SKY_DEFS = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8f4ec"/><stop offset=".6" stop-color="#f3efe6"/><stop offset="1" stop-color="#ece7dc"/></linearGradient>
  <radialGradient id="sun"><stop offset="0" stop-color="#e2765f" stop-opacity=".55"/><stop offset=".72" stop-color="#e2765f" stop-opacity=".42"/><stop offset="1" stop-color="#e2765f" stop-opacity="0"/></radialGradient>`;
const HILL_DEFS = `
  <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3cacb"/><stop offset=".6" stop-color="#e7e6df" stop-opacity="0"/></linearGradient>
  <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9b2b0"/><stop offset=".65" stop-color="#ece9e1" stop-opacity="0"/></linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3efe6" stop-opacity="0"/><stop offset=".5" stop-color="#f3efe6" stop-opacity=".95"/><stop offset="1" stop-color="#ece7dc"/></linearGradient>`;
const HILLS = () => `
<path d="M0 560C60 530 110 470 170 460C240 448 270 520 330 515C400 510 430 410 500 405C570 400 610 488 680 500C750 512 800 450 860 455C920 460 960 500 1000 510V1000H0Z" fill="url(#m1)"/>
<path d="M0 640C70 620 120 575 200 578C250 580 290 616 330 619C380 615 440 615 490 618C520 610 545 575 580 572C660 576 690 640 770 632C850 624 910 590 1000 600V1000H0Z" fill="url(#m2)"/>
${skylineSvgGroup()}
<path d="M-10 690C80 670 170 690 260 678C350 666 430 690 520 676C610 662 700 688 790 676C880 664 950 684 1010 674V1000H-10Z" fill="#f2efe7" fill-opacity=".85"/>
<rect y="700" width="1000" height="300" fill="url(#mist)"/>`;

/* Sky behind the grove: paper, soft red sun, misty ink mountains, temples and a pagoda.
   plain: just the paper and sun; the home page draws the hills as their own layer
   (hillsSvg) so they can drift at a different speed. */
export function skySvg(plain = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
<defs>${SKY_DEFS}${plain ? "" : HILL_DEFS}</defs>
<rect width="1000" height="1000" fill="url(#sky)"/>
<circle cx="610" cy="330" r="120" fill="url(#sun)"/>${plain ? "" : HILLS()}
</svg>`;
}

// the mountains, temples, pagoda, torii and houses on their own (a band from y=380 down)
export function hillsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 380 1000 620"><defs>${HILL_DEFS}</defs>${HILLS()}</svg>`;
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
