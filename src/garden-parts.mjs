/*
 * Garden pieces drawn as SVG markup: natural rocks with ripple rings, clipped azalea
 * shrubs (karikomi), a snow-viewing stone lantern (yukimi-doro), irises and grasses.
 * Used by the garden pond scene (src/garden-pond.mjs).
 */
import { pine } from "./architecture.mjs";

export const f = (n) => (Math.round(n * 10) / 10).toString();

export function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// smooth curve through points (Catmull-Rom → cubic Bézier)
export function smooth(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

export function rock(r, cx, base, w, h, moss) {
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
export function shrub(r, cx, base, w, blossoms, id) {
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
export function lantern(x, base, s) {
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
export function iris(r, x, base, s) {
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

export function grass(r, x, base) {
  let o = "";
  const n = 5 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - 0.5) * 1.3 + (r() - 0.5) * 0.2, len = 10 + r() * 14;
    o += `<path d="M${f(x)} ${f(base)}Q${f(x + Math.sin(a) * len * 0.4)} ${f(base - len * 0.6)} ${f(x + Math.sin(a) * len)} ${f(base - Math.cos(a) * len)}"/>`;
  }
  return o;
}
