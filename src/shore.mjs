/*
 * The bank between the bamboo grove and the koi pond, as a Japanese garden edge:
 * moss, clipped azalea shrubs (karikomi), a pine leaning over the water, a snow-viewing
 * stone lantern (yukimi-doro), natural rocks, a pebble beach (suhama), irises and grasses.
 * Nothing is painted below the waterline except soft reflections and ripples, so the
 * live koi pond behind the page shows straight through and there is no seam.
 *
 * viewBox 1600×480. The band above SHORE_TOP is transparent and overlaps the bottom of the
 * grove, so there's no seam there either. Phones see roughly the middle 800 units
 * (x 400–1200), so the lantern, pine, beach, rocks and irises sit there.
 */
import { pine } from "./architecture.mjs";

const f = (n) => (Math.round(n * 10) / 10).toString();

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// smooth curve through points (Catmull-Rom → cubic Bézier)
function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

const W = 1600, H = 480;
// the land starts this far down; the band above is transparent and overlaps the grove's ground
export const SHORE_TOP = 90;
// the waterline, with a shallow cove for the pebble beach (x 640–880)
const SHORE = [[-20, 250], [80, 258], [180, 246], [280, 260], [380, 254], [470, 262], [560, 262], [640, 274], [700, 296], [760, 306], [820, 302], [880, 284], [940, 266], [1020, 262], [1100, 270], [1180, 258], [1280, 252], [1380, 262], [1480, 250], [1560, 256], [1620, 252]];
// the soft top edge of the bank
const TOPLINE = [[-20, 96], [140, 88], [320, 100], [520, 90], [720, 98], [900, 86], [1100, 96], [1300, 88], [1480, 98], [1620, 92]];
function waterY(x) {
  for (let i = 0; i < SHORE.length - 1; i++) {
    const [x0, y0] = SHORE[i], [x1, y1] = SHORE[i + 1];
    if (x >= x0 && x <= x1) { const t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * (t * t * (3 - 2 * t)); }
  }
  return 260;
}

// a natural rock: irregular, flat-bottomed, lit from the upper left
function rock(r, cx, base, w, h, moss) {
  const pts = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI; // left → over the top → right
    const jr = 0.82 + r() * 0.3;
    pts.push([cx + Math.cos(a) * w / 2 * (i === 0 || i === n ? 1 : jr), base + Math.sin(a) * h * jr * (i === 0 || i === n ? 0.25 : 1)]);
  }
  const top = smooth(pts) + `L${f(cx + w / 2)} ${f(base + 3)}Q${f(cx)} ${f(base + 7)} ${f(cx - w / 2)} ${f(base + 3)}Z`;
  let o = `<ellipse cx="${f(cx + w * 0.04)}" cy="${f(base + 10)}" rx="${f(w * 0.52)}" ry="${f(Math.max(4, h * 0.22))}" fill="url(#refl)"/>`;
  o += `<path d="${top}" fill="url(#stone)" stroke="#8f8a80" stroke-opacity=".45" stroke-width="1.2"/>`;
  // lit top facet
  const fp = pts.slice(2, n - 1).map(([x, y]) => [cx + (x - cx) * 0.62 - w * 0.06, base - (base - y) * 0.86 - 1]);
  o += `<path d="${smooth(fp)}Q${f(cx)} ${f(base - h * 0.3)} ${f(fp[0][0])} ${f(fp[0][1])}Z" fill="#f3f0ea" fill-opacity=".55"/>`;
  if (moss) o += `<path d="${smooth(pts.slice(3, n - 2).map(([x, y]) => [x, y + 1]))}Q${f(cx)} ${f(base - h * 0.55)} ${f(pts[3][0])} ${f(pts[3][1] + 1)}Z" fill="#b5c69c" fill-opacity=".85"/>`;
  // where it meets the water
  o += `<ellipse cx="${f(cx)}" cy="${f(base + 4)}" rx="${f(w * 0.6)}" ry="4.5" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.6"/>`;
  o += `<ellipse cx="${f(cx)}" cy="${f(base + 7)}" rx="${f(w * 0.85)}" ry="7" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>`;
  return o;
}

// clipped azalea shrub: overlapping domes with a fine ink outline, optional blossoms
function shrub(r, cx, base, w, blossoms, id) {
  const h = w * 0.42;
  let shapes = "";
  const n = 4 + Math.floor(w / 60);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = cx - w / 2 + w * (0.14 + t * 0.72) + (r() - 0.5) * 10;
    const rad = h * (0.5 + Math.sin(t * Math.PI) * 0.45) * (0.85 + r() * 0.2);
    shapes += `<circle cx="${f(x)}" cy="${f(base - rad * 0.7)}" r="${f(rad)}"/>`;
  }
  let o = `<clipPath id="${id}"><rect x="${f(cx - w)}" y="-500" width="${f(w * 2)}" height="${f(base + 500)}"/></clipPath>`;
  o += `<g clip-path="url(#${id})"><g id="${id}s">${shapes}</g></g>`;
  // outline behind, fill on top (only the outer edge shows a line)
  o = `<g clip-path="url(#${id})"><use href="#${id}s" fill="#6f8a60" stroke="#6f8a60" stroke-width="3" stroke-opacity=".6"/></g>` + o.replace(`<g id="${id}s">`, `<g id="${id}s" fill="url(#leafy)">`);
  o = `<ellipse cx="${f(cx)}" cy="${f(base)}" rx="${f(w * 0.55)}" ry="${f(h * 0.12)}" fill="#8fa37c" fill-opacity=".5"/>` + o;
  // a few lighter leaf-mass highlights
  for (let i = 0; i < 3; i++) o += `<ellipse cx="${f(cx - w * 0.25 + i * w * 0.22 + (r() - 0.5) * 8)}" cy="${f(base - h * (0.95 + r() * 0.3))}" rx="${f(w * 0.08)}" ry="${f(h * 0.08)}" fill="#e2ecd3" fill-opacity=".55"/>`;
  if (blossoms) {
    for (let i = 0; i < blossoms; i++) {
      const a = Math.PI + r() * Math.PI, d = Math.sqrt(r());
      const x = cx + Math.cos(a) * w * 0.42 * d, y = base - h * 0.55 + Math.sin(a) * h * 0.85 * d;
      o += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2 + r() * 1.8)}" fill="${r() < 0.5 ? "#f1b3c2" : "#e892a8"}"/>`;
    }
  }
  return o;
}

// snow-viewing stone lantern (yukimi-doro): curved legs, platform, fire box with a warm
// window, a very wide umbrella roof and a jewel on top
function lantern(x, base, s) {
  const S = (n) => n * s;
  let o = "";
  // three curved legs
  o += `<path d="M${f(x - S(30))} ${f(base)}Q${f(x - S(26))} ${f(base - S(26))} ${f(x - S(13))} ${f(base - S(38))}L${f(x - S(8))} ${f(base - S(35))}Q${f(x - S(19))} ${f(base - S(22))} ${f(x - S(22))} ${f(base)}Z"/>`;
  o += `<path d="M${f(x + S(30))} ${f(base)}Q${f(x + S(26))} ${f(base - S(26))} ${f(x + S(13))} ${f(base - S(38))}L${f(x + S(8))} ${f(base - S(35))}Q${f(x + S(19))} ${f(base - S(22))} ${f(x + S(22))} ${f(base)}Z"/>`;
  o += `<path d="M${f(x + S(3))} ${f(base - S(2))}Q${f(x + S(4))} ${f(base - S(22))} ${f(x + S(1))} ${f(base - S(36))}L${f(x - S(4))} ${f(base - S(36))}Q${f(x - S(2))} ${f(base - S(20))} ${f(x - S(4))} ${f(base - S(2))}Z" fill-opacity=".8"/>`;
  // platform (nakadai)
  o += `<path d="M${f(x - S(24))} ${f(base - S(36))}L${f(x - S(18))} ${f(base - S(44))}L${f(x + S(18))} ${f(base - S(44))}L${f(x + S(24))} ${f(base - S(36))}Z"/>`;
  // fire box (hibukuro) with a glowing window
  o += `<path d="M${f(x - S(14))} ${f(base - S(44))}L${f(x - S(12))} ${f(base - S(68))}L${f(x + S(12))} ${f(base - S(68))}L${f(x + S(14))} ${f(base - S(44))}Z"/>`;
  o += `<rect x="${f(x - S(6))}" y="${f(base - S(64))}" width="${f(S(12))}" height="${f(S(14))}" rx="${f(S(1.5))}" fill="url(#glow)"/>`;
  o += `<rect x="${f(x - S(0.6))}" y="${f(base - S(64))}" width="${f(S(1.2))}" height="${f(S(14))}" fill="#8d877b" fill-opacity=".6"/>`;
  // umbrella roof (kasa)
  o += `<path d="M${f(x - S(56))} ${f(base - S(70))}Q${f(x - S(50))} ${f(base - S(68))} ${f(x - S(40))} ${f(base - S(69))}L${f(x + S(40))} ${f(base - S(69))}Q${f(x + S(50))} ${f(base - S(68))} ${f(x + S(56))} ${f(base - S(70))}Q${f(x + S(44))} ${f(base - S(80))} ${f(x + S(12))} ${f(base - S(90))}L${f(x - S(12))} ${f(base - S(90))}Q${f(x - S(44))} ${f(base - S(80))} ${f(x - S(56))} ${f(base - S(70))}Z"/>`;
  o += `<path d="M${f(x - S(46))} ${f(base - S(74))}Q${f(x)} ${f(base - S(92))} ${f(x + S(46))} ${f(base - S(74))}" fill="none" stroke="#f3f0ea" stroke-opacity=".55" stroke-width="${f(S(1.4))}"/>`;
  // jewel (hoju)
  o += `<rect x="${f(x - S(7))}" y="${f(base - S(94))}" width="${f(S(14))}" height="${f(S(4))}" rx="${f(S(1.5))}"/>`;
  o += `<path d="M${f(x)} ${f(base - S(110))}C${f(x + S(7))} ${f(base - S(104))} ${f(x + S(8))} ${f(base - S(96))} ${f(x)} ${f(base - S(94))}C${f(x - S(8))} ${f(base - S(96))} ${f(x - S(7))} ${f(base - S(104))} ${f(x)} ${f(base - S(110))}Z"/>`;
  return o;
}

// Japanese iris clump: slender blades and a few violet flowers
function iris(r, x, base, s) {
  let o = "";
  for (let i = 0; i < 9; i++) {
    const lean = (i - 4) * 4 + (r() - 0.5) * 6, len = (34 + r() * 26) * s, w = 2.4 * s;
    const tx = x + lean * s, ty = base - len;
    o += `<path d="M${f(x - w + (i - 4) * 1.2)} ${f(base)}Q${f(x + lean * 0.3 * s)} ${f(base - len * 0.5)} ${f(tx)} ${f(ty)}Q${f(x + lean * 0.3 * s + w)} ${f(base - len * 0.5)} ${f(x + w + (i - 4) * 1.2)} ${f(base)}Z" fill="${i % 3 ? "#7f9a6c" : "#6c875c"}"/>`;
  }
  for (let i = 0; i < 3; i++) {
    const fx = x + (i - 1) * 14 * s + (r() - 0.5) * 6, fy = base - (40 + r() * 16) * s;
    o += `<path d="M${f(fx)} ${f(base - 6)}Q${f(fx + 1)} ${f((fy + base) / 2)} ${f(fx)} ${f(fy)}" stroke="#6c875c" stroke-width="${f(1.3 * s)}" fill="none"/>`;
    const p = (rot, len, col) => `<path d="M0 0C${f(-3 * s)} ${f(-len * 0.4)} ${f(-2 * s)} ${f(-len)} 0 ${f(-len)}C${f(2 * s)} ${f(-len)} ${f(3 * s)} ${f(-len * 0.4)} 0 0Z" transform="translate(${f(fx)} ${f(fy)}) rotate(${rot})" fill="${col}"/>`;
    o += p(-130, 9 * s, "#7a70b6") + p(130, 9 * s, "#7a70b6") + p(180, 8 * s, "#857cc0");
    o += p(-25, 8 * s, "#a097d6") + p(25, 8 * s, "#a097d6") + p(0, 9 * s, "#b1a9e0");
    o += `<circle cx="${f(fx)}" cy="${f(fy + 2 * s)}" r="${f(1.3 * s)}" fill="#f0c95c"/>`;
  }
  return o;
}

function grass(r, x, base) {
  let o = "";
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - 0.5) * 1.3 + (r() - 0.5) * 0.2, len = 10 + r() * 14;
    o += `<path d="M${f(x)} ${f(base)}Q${f(x + Math.sin(a) * len * 0.4)} ${f(base - len * 0.6)} ${f(x + Math.sin(a) * len)} ${f(base - Math.cos(a) * len)}"/>`;
  }
  return o;
}

export function shoreSvg() {
  const r = rng(41);
  const bankEdge = smooth(SHORE);
  const bank = smooth(TOPLINE) + `L${W + 20} ${SHORE[SHORE.length - 1][1]}` + smooth([...SHORE].reverse()).replace(/^M[^C]+/, "") + "Z";

  // watercolour moss texture on the bank
  let moss = "";
  for (let i = 0; i < 70; i++) {
    const x = r() * W, yMax = waterY(x) - 14, y = 112 + r() * (yMax - 112);
    moss += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 26)}" ry="${f(3 + r() * 7)}" fill="${r() < 0.5 ? "#c7d4b2" : "#e7eddc"}" fill-opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`;
  }

  // pebble beach in the cove, a few continuing under the water
  let pebbles = "";
  const tones = ["#ece8e0", "#dcd7cd", "#cfcac0", "#f4f1eb", "#c4bfb5"];
  for (let i = 0; i < 150; i++) {
    const x = 680 + r() * 220;
    const wy = waterY(x);
    const y = wy - 34 + Math.pow(r(), 0.7) * 50;
    const under = y > wy - 1;
    const rx = 2.6 + r() * 4.2;
    pebbles += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * (0.55 + r() * 0.2))}" fill="${tones[Math.floor(r() * tones.length)]}"${under ? ' fill-opacity=".38"' : ""}/>`;
  }

  // shrubs along the back of the bank
  const shrubs = [
    [60, 166, 150, 0], [250, 152, 124, 22], [600, 160, 112, 0], [880, 150, 160, 26], [1150, 162, 128, 0], [1340, 152, 170, 28], [1545, 164, 120, 0],
  ].map(([x, y, w, b], i) => shrub(r, x, y, w, b, `sh${i}`)).join("");

  // reflections of the lantern and the shrubs, very faint
  const reflections = `<g opacity=".14" fill="#5d7275">` +
    `<g transform="translate(0 ${f(2 * 284)}) scale(1 -1)">${lantern(1010, 284, 1.18)}</g>` +
    `</g>`;

  const rocks = [
    [470, 266, 92, 40, true], [548, 268, 44, 20, false], [935, 276, 58, 26, false], [1050, 284, 116, 30, true], [1150, 276, 66, 30, false], [1395, 266, 104, 44, true], [1460, 270, 40, 18, false], [255, 264, 52, 22, false],
  ].map(([x, b, w, h, m]) => rock(r, x, b, w, h, m)).join("");

  let grasses = "";
  for (const x of [150, 210, 360, 420, 600, 1180, 1260, 1300, 1340, 1500, 1560]) grasses += grass(r, x, waterY(x) - 2);
  // a few tufts out on the moss
  for (const [x, y] of [[120, 214], [330, 200], [980, 214], [1250, 206], [1470, 210]]) grasses += grass(r, x, y);

  // stepping stones (tobi-ishi) across the moss down to the pebble beach
  let steps = "";
  for (const [x, y, rx] of [[330, 186], [392, 204], [448, 222], [512, 236], [584, 248], [652, 262]].map(([x, y], i) => [x, y, 19 - i * 0.8])) {
    steps += `<ellipse cx="${f(x + 1)}" cy="${f(y + 2.4)}" rx="${f(rx)}" ry="${f(rx * 0.36)}" fill="#a4b392" fill-opacity=".6"/>`;
    steps += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.36)}" fill="url(#stone)"/>`;
    steps += `<ellipse cx="${f(x - rx * 0.2)}" cy="${f(y - rx * 0.08)}" rx="${f(rx * 0.55)}" ry="${f(rx * 0.16)}" fill="#f3f0ea" fill-opacity=".6"/>`;
  }

  let ripples = "";
  for (let i = 0; i < 9; i++) {
    const x = r() * W, y = waterY(x) + 30 + r() * 140, w = 20 + r() * 50;
    ripples += `<path d="M${f(x - w)} ${f(y)}Q${f(x)} ${f(y - 3)} ${f(x + w)} ${f(y)}" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice">
<defs>
  <linearGradient id="bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecdc"/><stop offset=".35" stop-color="#e0e8d1"/><stop offset=".8" stop-color="#d3dfc1"/><stop offset="1" stop-color="#c8d6b3"/></linearGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ebeee0" stop-opacity="0"/><stop offset="1" stop-color="#e8ecdc"/></linearGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa7a8" stop-opacity=".34"/><stop offset="1" stop-color="#8fa7a8" stop-opacity="0"/></linearGradient>
  <radialGradient id="leafy" cx=".4" cy=".25" r=".85"><stop offset="0" stop-color="#c6d6b0"/><stop offset=".55" stop-color="#9fb68a"/><stop offset="1" stop-color="#7f9a6e"/></radialGradient>
  <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6e2da"/><stop offset=".5" stop-color="#c9c4ba"/><stop offset="1" stop-color="#a9a397"/></linearGradient>
  <linearGradient id="lant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4cfc5"/><stop offset=".55" stop-color="#bdb7ab"/><stop offset="1" stop-color="#9f998d"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#fbe3a8"/><stop offset="1" stop-color="#f0c27a"/></radialGradient>
  <radialGradient id="refl"><stop offset="0" stop-color="#7f9799" stop-opacity=".35"/><stop offset="1" stop-color="#7f9799" stop-opacity="0"/></radialGradient>
</defs>
<path d="${bankEdge}L${W + 20} ${H}H-20Z" fill="url(#shade)" transform="translate(0 2)"/>
${reflections}
<rect x="-20" y="${SHORE_TOP - 50}" width="${W + 40}" height="70" fill="url(#haze)"/>
<path d="${bank}" fill="url(#bank)"/>
${moss}
${steps}
<g fill="#6b8763">${pine(560, 212, 2.5, 1, "#675e55")}</g>
${shrubs}
<path d="${bankEdge}" fill="none" stroke="#a9b99c" stroke-opacity=".55" stroke-width="5"/>
<path d="${bankEdge}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" transform="translate(0 4)"/>
${pebbles}
${rocks}
<g fill="url(#lant)" stroke="#8d877b" stroke-opacity=".5" stroke-width="1">${lantern(1010, 284, 1.18)}</g>
${iris(r, 640, 266, 1.05)}${iris(r, 1225, 262, 0.95)}
<g stroke="#8fa67a" stroke-width="1.4" fill="none" stroke-linecap="round">${grasses}</g>
${ripples}
</svg>`;
}
