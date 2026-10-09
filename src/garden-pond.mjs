/*
 * The garden you walk into after the bamboo grove: a moss garden behind a bamboo fence,
 * with a koi pond in the middle. The pond's water is a hole in this picture, so the live
 * koi pond behind the page shows through it; scrolling zooms into the pond until the
 * water fills the screen (see .dive in site.css and garden.js).
 *
 * viewBox 1600×1100. The pond is centred at (800, 650), 59.1% of the height, which is
 * where the image is anchored and zoomed from. Phones see roughly x 545–1055, so
 * everything that matters sits around the pond.
 */
import { pine } from "./architecture.mjs";
import { f, rng, smooth, rock, shrub, lantern, iris, grass } from "./garden-parts.mjs";

const W = 1600, H = 1100;
export const POND = { cx: 800, cy: 650, rx: 238, ry: 140, w: W, h: H };

// an organic, slightly kidney-shaped pond outline (closed)
function pondPoints() {
  const pts = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(2 * a + 0.6) + 0.05 * Math.sin(3 * a + 1.9);
    pts.push([POND.cx + Math.cos(a) * POND.rx * k, POND.cy + Math.sin(a) * POND.ry * k]);
  }
  return pts;
}
const closed = (pts) => smooth([...pts, pts[0], pts[1]]).replace(/^M[^C]+C/, `M${f(pts[0][0])} ${f(pts[0][1])}C`) + "Z";

// the smallest radii of the outline, so the zoom knows when the water covers the screen
export function pondInnerRadii() {
  let rx = Infinity, ry = Infinity;
  for (const [x, y] of pondPoints()) {
    const dx = Math.abs(x - POND.cx), dy = Math.abs(y - POND.cy);
    if (dy < POND.ry * 0.3) rx = Math.min(rx, dx);
    if (dx < POND.rx * 0.3) ry = Math.min(ry, dy);
  }
  return { rx: Math.floor(rx * 0.95), ry: Math.floor(ry * 0.95) };
}

// a bamboo fence (yotsume-gaki): posts, three rails with nodes, black rope ties
function fence(y) {
  let o = "";
  for (let x = -20; x < W + 40; x += 74) {
    o += `<rect x="${x}" y="${y - 54}" width="8" height="${78}" rx="3" fill="url(#post)"/>`;
  }
  for (const [ry, t] of [[y - 44, 6], [y - 22, 6], [y, 6]]) {
    o += `<rect x="-20" y="${ry}" width="${W + 40}" height="${t}" rx="3" fill="url(#rail)"/>`;
    for (let x = 30; x < W; x += 148) o += `<rect x="${x}" y="${ry - 0.5}" width="2.4" height="${t + 1}" fill="#a68d69"/>`;
  }
  for (let x = -20; x < W + 40; x += 74) for (const ry of [y - 44, y - 22, y]) o += `<path d="M${x - 1} ${ry + 1}l10 4M${x - 1} ${ry + 5}l10 -4" stroke="#3e3a36" stroke-width="1.6" stroke-linecap="round"/>`;
  return o;
}

export function gardenSvg() {
  const r = rng(73);
  const pts = pondPoints();
  const pond = closed(pts);

  // faint bamboo beyond the fence, fading into the mist
  let bamboo = "";
  for (let i = 0; i < 22; i++) {
    const x = (i / 22) * W + r() * 40, w = 6 + r() * 6;
    bamboo += `<rect x="${f(x)}" y="20" width="${f(w)}" height="230" rx="2" fill="#c3cabb" fill-opacity="${(0.35 + r() * 0.3).toFixed(2)}"/>`;
    for (let y = 60 + r() * 40; y < 240; y += 70 + r() * 30) bamboo += `<rect x="${f(x - 1)}" y="${f(y)}" width="${f(w + 2)}" height="2" fill="#aab3a2" fill-opacity=".5"/>`;
  }

  // hedge behind the fence
  let hedge = "";
  for (let x = -40; x < W + 60; x += 46 + r() * 30) hedge += `<circle cx="${f(x)}" cy="${f(255 + r() * 10)}" r="${f(34 + r() * 22)}"/>`;

  // watercolour moss
  let moss = "";
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = 300 + r() * (H - 300);
    const dx = (x - POND.cx) / (POND.rx + 30), dy = (y - POND.cy) / (POND.ry + 30);
    if (dx * dx + dy * dy < 1) continue;
    moss += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(10 + r() * 34)}" ry="${f(4 + r() * 9)}" fill="${r() < 0.5 ? "#c4d2ae" : "#e6ecda"}" fill-opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`;
  }

  // stones around the rim (skipping the front, where the stepping stones arrive)
  let rim = "";
  for (let i = 0; i < pts.length; i++) {
    const a = (i / pts.length) * Math.PI * 2;
    if (a > 1.15 && a < 1.95) continue;
    const [x, y] = pts[i];
    const big = r() < 0.3;
    const w = big ? 46 + r() * 30 : 22 + r() * 22, h = w * (0.36 + r() * 0.12);
    rim += rock(r, x + (r() - 0.5) * 12, y + h * 0.35, w, h, big && r() < 0.6);
  }

  // stepping stones (tobi-ishi) from the front edge up to the pond
  let steps = "";
  for (const [x, y, rx] of [[770, 1080, 40], [826, 1010, 37], [782, 944, 34], [826, 884, 30], [796, 830, 27]]) {
    steps += `<ellipse cx="${x + 2}" cy="${y + 5}" rx="${rx}" ry="${f(rx * 0.4)}" fill="#a2b28f" fill-opacity=".55"/>`;
    steps += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.4)}" fill="url(#stone)"/>`;
    steps += `<ellipse cx="${f(x - rx * 0.2)}" cy="${f(y - rx * 0.1)}" rx="${f(rx * 0.55)}" ry="${f(rx * 0.17)}" fill="#f3f0ea" fill-opacity=".6"/>`;
  }

  const shrubs = [
    [210, 470, 210, 0], [520, 452, 150, 22], [690, 430, 104, 0], [1000, 440, 170, 28], [1180, 462, 120, 0], [1420, 476, 220, 24],
    [180, 900, 240, 26], [1440, 930, 260, 0],
  ].map(([x, y, w, b], i) => shrub(r, x, y, w, b, `gs${i}`)).join("");

  let grasses = "";
  for (let i = 0; i < pts.length; i += 2) grasses += grass(r, pts[i][0] + (r() - 0.5) * 30, pts[i][1] + 10 + r() * 14);
  for (const [x, y] of [[420, 640], [1210, 700], [600, 980], [1000, 1000], [330, 760], [1300, 820]]) grasses += grass(r, x, y);

  let petals = "";
  for (let i = 0; i < 26; i++) {
    const x = 300 + r() * 1000, y = 380 + r() * 680;
    const dx = (x - POND.cx) / (POND.rx + 20), dy = (y - POND.cy) / (POND.ry + 20);
    if (dx * dx + dy * dy < 1) continue;
    petals += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="3.2" ry="2" transform="rotate(${Math.round(r() * 180)} ${f(x)} ${f(y)})" fill="${r() < 0.5 ? "#f2b9c3" : "#f6ccd3"}"/>`;
  }

  const lx = 1010, lb = 700; // lantern standing at the right edge of the water

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efebe2"/><stop offset=".2" stop-color="#ebebdf"/><stop offset=".32" stop-color="#e2e9d4"/><stop offset=".65" stop-color="#d6e1c4"/><stop offset="1" stop-color="#c8d6b2"/></linearGradient>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efebe2"/><stop offset="1" stop-color="#efebe2" stop-opacity="0"/></linearGradient>
  <linearGradient id="post" x1="0" x2="1"><stop offset="0" stop-color="#c7b08c"/><stop offset="1" stop-color="#a48a66"/></linearGradient>
  <linearGradient id="rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ddc9a6"/><stop offset="1" stop-color="#b79d78"/></linearGradient>
  <radialGradient id="leafy" cx=".4" cy=".25" r=".85"><stop offset="0" stop-color="#c6d6b0"/><stop offset=".55" stop-color="#9fb68a"/><stop offset="1" stop-color="#7f9a6e"/></radialGradient>
  <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e2da"/><stop offset=".5" stop-color="#c9c4ba"/><stop offset="1" stop-color="#a9a397"/></linearGradient>
  <linearGradient id="lant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4cfc5"/><stop offset=".55" stop-color="#bdb7ab"/><stop offset="1" stop-color="#9f998d"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#fbe3a8"/><stop offset="1" stop-color="#f0c27a"/></radialGradient>
  <radialGradient id="refl"><stop offset="0" stop-color="#7f9799" stop-opacity=".35"/><stop offset="1" stop-color="#7f9799" stop-opacity="0"/></radialGradient>
  <clipPath id="water"><path d="${pond}"/></clipPath>
</defs>
<path d="M0 0H${W}V${H}H0Z${pond}" fill="url(#ground)" fill-rule="evenodd"/>
${bamboo}
<rect width="${W}" height="140" fill="url(#mist)"/>
<g fill="#b6c6a2">${hedge}</g>
${fence(296)}
${moss}
${shrubs}
<g clip-path="url(#water)">
  <path d="${pond}" fill="none" stroke="#6f8c8c" stroke-opacity=".22" stroke-width="44"/>
  <g opacity=".08" fill="#5d7275" transform="translate(0 ${2 * lb}) scale(1 -1)">${lantern(lx, lb, 1.25)}</g>
</g>
<path d="${pond}" fill="none" stroke="#a9b99c" stroke-opacity=".6" stroke-width="5"/>
${rim}
${steps}
<g fill="#6b8763">${pine(552, 612, 2.6, 1, "#675e55")}</g>
<g fill="url(#lant)" stroke="#8d877b" stroke-opacity=".5" stroke-width="1">${lantern(lx, lb, 1.25)}</g>
${iris(r, 618, 735, 1.1)}${iris(r, 1030, 770, 0.9)}${iris(r, 560, 560, 0.85)}
<g stroke="#8fa67a" stroke-width="1.4" fill="none" stroke-linecap="round">${grasses}</g>
${petals}
</svg>`;
}
