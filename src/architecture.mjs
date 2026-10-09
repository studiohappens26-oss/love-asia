/*
 * Japanese architecture and clouds, drawn as ink silhouettes for the grove's sky.
 * Proportions follow real buildings: a five-storey pagoda (deep upswept eaves that
 * shrink toward the top, bracket bands, balconies, wind bells and a nine-ring spire),
 * a temple hall with an irimoya (hip-and-gable) roof, a myojin torii, gassho-style
 * farmhouses and pines with flat, cloud-like foliage pads.
 * Every function returns SVG markup in the units of its caller (x = centre, base = ground).
 */
const f = (n) => (Math.round(n * 10) / 10).toString();

// A curved temple roof tier. The eave's underside sags slightly and lifts at the
// corners; the roof surface curves up concavely to the next storey.
//   y: underside of the eave at the centre, R: half-width at the corner tips,
//   top: half-width where it meets the storey above, H: rise, L: corner lift, t: eave thickness
function roofTier(x, y, R, top, H, L, t) {
  return `<path d="M${f(x - R)} ${f(y - L)}Q${f(x - R * 0.74)} ${f(y + 0.6)} ${f(x - R * 0.42)} ${f(y)}L${f(x + R * 0.42)} ${f(y)}Q${f(x + R * 0.74)} ${f(y + 0.6)} ${f(x + R)} ${f(y - L)}L${f(x + R - t * 0.3)} ${f(y - L - t)}Q${f(x + R * 0.56)} ${f(y - t * 1.15)} ${f(x + top)} ${f(y - H)}L${f(x - top)} ${f(y - H)}Q${f(x - R * 0.56)} ${f(y - t * 1.15)} ${f(x - R + t * 0.3)} ${f(y - L - t)}Z"/>`;
}

// wind bell hanging from a corner tip
const bell = (x, y, s) => `<rect x="${f(x - 0.25 * s)}" y="${f(y)}" width="${f(0.5 * s)}" height="${f(2.6 * s)}"/><path d="M${f(x - 1 * s)} ${f(y + 4.4 * s)}Q${f(x)} ${f(y + 1.6 * s)} ${f(x + 1 * s)} ${f(y + 4.4 * s)}Z"/>`;

/* Five-storey pagoda (gojunoto). About 166 units tall at s = 1. */
export function pagoda(x, base, s, light) {
  let o = "";
  // stone podium and steps
  o += `<rect x="${f(x - 34 * s)}" y="${f(base - 3 * s)}" width="${f(68 * s)}" height="${f(3 * s)}"/>`;
  o += `<rect x="${f(x - 29 * s)}" y="${f(base - 7 * s)}" width="${f(58 * s)}" height="${f(4.2 * s)}"/>`;
  let y = base - 7 * s;
  let details = "";
  for (let i = 0; i < 5; i++) {
    const b = (17 - i * 2) * s; // body half-width
    const bodyH = (i === 0 ? 15 : 7.5) * s;
    const R = (44 - i * 4.4) * s; // roof half-width at the tips
    // balcony with posts on the upper storeys
    if (i > 0) {
      o += `<rect x="${f(x - b - 3.5 * s)}" y="${f(y - 1.4 * s)}" width="${f((b + 3.5 * s) * 2)}" height="${f(1.4 * s)}"/>`;
      for (let k = -2; k <= 2; k++) o += `<rect x="${f(x + k * (b + 2.5 * s) / 2 - 0.3 * s)}" y="${f(y - 3.6 * s)}" width="${f(0.6 * s)}" height="${f(2.4 * s)}"/>`;
      o += `<rect x="${f(x - b - 3.5 * s)}" y="${f(y - 4 * s)}" width="${f((b + 3.5 * s) * 2)}" height="${f(0.7 * s)}"/>`;
    }
    o += `<rect x="${f(x - b)}" y="${f(y - bodyH)}" width="${f(b * 2)}" height="${f(bodyH)}"/>`;
    // the doors and windows read as pale slits
    const dh = bodyH * (i === 0 ? 0.62 : 0.5);
    details += `<rect x="${f(x - b * 0.22)}" y="${f(y - dh - (i === 0 ? 0 : 1.6 * s))}" width="${f(b * 0.44)}" height="${f(dh)}"/>`;
    if (i === 0) details += `<rect x="${f(x - b * 0.78)}" y="${f(y - dh * 0.9)}" width="${f(b * 0.26)}" height="${f(dh * 0.62)}"/><rect x="${f(x + b * 0.52)}" y="${f(y - dh * 0.9)}" width="${f(b * 0.26)}" height="${f(dh * 0.62)}"/>`;
    y -= bodyH;
    // stepped bracket band (tokyo) under the eave
    o += `<rect x="${f(x - b - 2.4 * s)}" y="${f(y - 2.2 * s)}" width="${f((b + 2.4 * s) * 2)}" height="${f(2.4 * s)}"/>`;
    o += `<rect x="${f(x - b - 4.8 * s)}" y="${f(y - 3.8 * s)}" width="${f((b + 4.8 * s) * 2)}" height="${f(1.8 * s)}"/>`;
    y -= 3.8 * s;
    const H = (i === 4 ? 12 : 10) * s;
    const nextB = i === 4 ? 4.5 * s : (17 - (i + 1) * 2) * s;
    o += roofTier(x, y, R, nextB + 1.5 * s, H, 7 * s, 3.4 * s);
    o += bell(x - R + 1.4 * s, y - 7 * s + 0.8 * s, s) + bell(x + R - 1.4 * s, y - 7 * s + 0.8 * s, s);
    y -= H;
  }
  // sorin: dew basin, inverted bowl, lotus, nine rings, water-flame, dragon wheel, jewel
  o += `<rect x="${f(x - 5 * s)}" y="${f(y - 3 * s)}" width="${f(10 * s)}" height="${f(3 * s)}"/>`;
  y -= 3 * s;
  o += `<path d="M${f(x - 4.4 * s)} ${f(y)}Q${f(x - 4 * s)} ${f(y - 3.6 * s)} ${f(x)} ${f(y - 3.8 * s)}Q${f(x + 4 * s)} ${f(y - 3.6 * s)} ${f(x + 4.4 * s)} ${f(y)}Z"/>`;
  y -= 3.6 * s;
  o += `<path d="M${f(x - 3.6 * s)} ${f(y - 2.2 * s)}L${f(x + 3.6 * s)} ${f(y - 2.2 * s)}L${f(x + 1.6 * s)} ${f(y + 0.2 * s)}L${f(x - 1.6 * s)} ${f(y + 0.2 * s)}Z"/>`;
  y -= 2.2 * s;
  o += `<rect x="${f(x - 0.7 * s)}" y="${f(y - 38 * s)}" width="${f(1.4 * s)}" height="${f(38 * s)}"/>`;
  for (let k = 0; k < 9; k++) {
    const w = (3.4 - k * 0.12) * s;
    o += `<rect x="${f(x - w)}" y="${f(y - 2.2 * s - k * 2.7 * s)}" width="${f(w * 2)}" height="${f(1.2 * s)}"/>`;
  }
  y -= 26.5 * s;
  // water-flame (suien): an openwork flame, drawn as a flared leaf shape
  o += `<path d="M${f(x)} ${f(y)}C${f(x - 4.6 * s)} ${f(y - 1.5 * s)} ${f(x - 4.4 * s)} ${f(y - 6 * s)} ${f(x - 1.2 * s)} ${f(y - 8.4 * s)}L${f(x)} ${f(y - 6.4 * s)}L${f(x + 1.2 * s)} ${f(y - 8.4 * s)}C${f(x + 4.4 * s)} ${f(y - 6 * s)} ${f(x + 4.6 * s)} ${f(y - 1.5 * s)} ${f(x)} ${f(y)}Z"/>`;
  y -= 9.4 * s;
  o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2.4 * s)}" ry="${f(0.8 * s)}"/>`;
  o += `<path d="M${f(x)} ${f(y - 5.4 * s)}C${f(x + 2 * s)} ${f(y - 3.4 * s)} ${f(x + 1.8 * s)} ${f(y - 1 * s)} ${f(x)} ${f(y - 0.8 * s)}C${f(x - 1.8 * s)} ${f(y - 1 * s)} ${f(x - 2 * s)} ${f(y - 3.4 * s)} ${f(x)} ${f(y - 5.4 * s)}Z"/>`;
  return o + `<g fill="${light}">${details}</g>`;
}

/* Temple hall with an irimoya roof, shibi ridge ends and an open front of pillars. */
export function templeHall(x, base, s, light) {
  let o = "", d = "";
  // stone base and front steps
  o += `<rect x="${f(x - 80 * s)}" y="${f(base - 6 * s)}" width="${f(160 * s)}" height="${f(6 * s)}"/>`;
  o += `<path d="M${f(x - 18 * s)} ${f(base)}L${f(x - 13 * s)} ${f(base - 8 * s)}L${f(x + 13 * s)} ${f(base - 8 * s)}L${f(x + 18 * s)} ${f(base)}Z"/>`;
  // veranda rail
  o += `<rect x="${f(x - 70 * s)}" y="${f(base - 10 * s)}" width="${f(140 * s)}" height="${f(1.4 * s)}"/>`;
  // hall body: dark pillars, pale lattice doors between them
  const top = base - 34 * s;
  o += `<rect x="${f(x - 60 * s)}" y="${f(top)}" width="${f(120 * s)}" height="${f(28 * s)}"/>`;
  const bays = 7, bw = 120 * s / bays;
  for (let i = 0; i < bays; i++) {
    const bx = x - 60 * s + i * bw;
    d += `<rect x="${f(bx + 1.6 * s)}" y="${f(top + 6 * s)}" width="${f(bw - 3.2 * s)}" height="${f(20 * s)}"/>`;
  }
  let lat = "";
  for (let i = 0; i < bays; i++) {
    const bx = x - 60 * s + i * bw;
    for (let k = 1; k < 3; k++) lat += `<rect x="${f(bx + 1.6 * s + k * (bw - 3.2 * s) / 3 - 0.25 * s)}" y="${f(top + 6 * s)}" width="${f(0.5 * s)}" height="${f(20 * s)}"/>`;
    lat += `<rect x="${f(bx + 1.6 * s)}" y="${f(top + 13 * s)}" width="${f(bw - 3.2 * s)}" height="${f(0.5 * s)}"/>`;
  }
  // brackets and the big hip-and-gable roof
  o += `<rect x="${f(x - 63 * s)}" y="${f(top - 3 * s)}" width="${f(126 * s)}" height="${f(3.2 * s)}"/>`;
  o += `<rect x="${f(x - 67 * s)}" y="${f(top - 5.4 * s)}" width="${f(134 * s)}" height="${f(2.6 * s)}"/>`;
  const y = top - 5.4 * s, R = 92 * s, L = 7 * s, t = 3.2 * s, H1 = 22 * s, G = 20 * s;
  o += `<path d="M${f(x - R)} ${f(y - L)}Q${f(x - R * 0.72)} ${f(y + 0.8 * s)} ${f(x - R * 0.4)} ${f(y)}L${f(x + R * 0.4)} ${f(y)}Q${f(x + R * 0.72)} ${f(y + 0.8 * s)} ${f(x + R)} ${f(y - L)}L${f(x + R - 1.2 * s)} ${f(y - L - t)}Q${f(x + R * 0.6)} ${f(y - t * 1.4)} ${f(x + 60 * s)} ${f(y - H1)}L${f(x + 47 * s)} ${f(y - H1 - 1.5 * s)}L${f(x + 41 * s)} ${f(y - H1 - G)}L${f(x - 41 * s)} ${f(y - H1 - G)}L${f(x - 47 * s)} ${f(y - H1 - 1.5 * s)}L${f(x - 60 * s)} ${f(y - H1)}Q${f(x - R * 0.6)} ${f(y - t * 1.4)} ${f(x - R + 1.2 * s)} ${f(y - L - t)}Z"/>`;
  // the gable (tsuma) face, its bargeboards and the hanging gegyo ornament
  d += `<path d="M${f(x - 34 * s)} ${f(y - H1 - 2.5 * s)}L${f(x)} ${f(y - H1 - G + 3 * s)}L${f(x + 34 * s)} ${f(y - H1 - 2.5 * s)}Z" fill-opacity=".55"/>`;
  o += `<path d="M${f(x - 46 * s)} ${f(y - H1 - 1 * s)}L${f(x)} ${f(y - H1 - G + 1 * s)}L${f(x + 46 * s)} ${f(y - H1 - 1 * s)}L${f(x + 44 * s)} ${f(y - H1 + 0.6 * s)}L${f(x)} ${f(y - H1 - G + 3.6 * s)}L${f(x - 44 * s)} ${f(y - H1 + 0.6 * s)}Z"/>`;
  o += `<path d="M${f(x)} ${f(y - H1 - G + 3 * s)}l${f(-2.6 * s)} ${f(5 * s)}h${f(5.2 * s)}Z"/>`;
  // ridge with shibi (upswept fish-tail ends)
  const ry = y - H1 - G;
  o += `<rect x="${f(x - 46 * s)}" y="${f(ry - 3.6 * s)}" width="${f(92 * s)}" height="${f(3.8 * s)}"/>`;
  for (const k of [-1, 1]) {
    const ex = x + k * 46 * s;
    o += `<path d="M${f(ex - k * 5 * s)} ${f(ry)}L${f(ex - k * 5 * s)} ${f(ry - 3.6 * s)}Q${f(ex - k * 2 * s)} ${f(ry - 9 * s)} ${f(ex + k * 3 * s)} ${f(ry - 11 * s)}Q${f(ex + k * 1 * s)} ${f(ry - 6 * s)} ${f(ex + k * 2.6 * s)} ${f(ry - 1.5 * s)}Q${f(ex)} ${f(ry)} ${f(ex - k * 5 * s)} ${f(ry)}Z"/>`;
  }
  // corner bells
  o += bell(x - R + 1.6 * s, y - L + 0.8 * s, s) + bell(x + R - 1.6 * s, y - L + 0.8 * s, s);
  return o + `<g fill="${light}">${d}</g><g>${lat}</g>`;
}

/* Myojin torii: tilted pillars, a curved kasagi over a straight shimaki, nuki and gakuzuka. */
export function torii(x, base, s) {
  let o = "";
  for (const k of [-1, 1]) {
    const bx = x + k * 20 * s, tx = x + k * 18.4 * s;
    o += `<path d="M${f(bx - 2 * s)} ${f(base)}L${f(tx - 1.6 * s)} ${f(base - 40 * s)}L${f(tx + 1.6 * s)} ${f(base - 40 * s)}L${f(bx + 2 * s)} ${f(base)}Z"/>`;
    o += `<rect x="${f(bx - 2.8 * s)}" y="${f(base - 3.4 * s)}" width="${f(5.6 * s)}" height="${f(3.4 * s)}"/>`;
  }
  o += `<rect x="${f(x - 26 * s)}" y="${f(base - 31 * s)}" width="${f(52 * s)}" height="${f(2.8 * s)}"/>`;
  o += `<rect x="${f(x - 1.6 * s)}" y="${f(base - 40 * s)}" width="${f(3.2 * s)}" height="${f(9 * s)}"/>`;
  o += `<rect x="${f(x - 28 * s)}" y="${f(base - 42.6 * s)}" width="${f(56 * s)}" height="${f(2.8 * s)}"/>`;
  o += `<path d="M${f(x - 32 * s)} ${f(base - 46.2 * s)}Q${f(x)} ${f(base - 39.4 * s)} ${f(x + 32 * s)} ${f(base - 46.2 * s)}L${f(x + 32.8 * s)} ${f(base - 50.6 * s)}Q${f(x)} ${f(base - 43 * s)} ${f(x - 32.8 * s)} ${f(base - 50.6 * s)}Z"/>`;
  return o;
}

/* Gassho-zukuri farmhouse: a steep thatched gable with small windows. */
export function minka(x, base, s, light) {
  const w = 44 * s, wallH = 10 * s, h = 34 * s;
  let o = `<rect x="${f(x - w * 0.46)}" y="${f(base - wallH)}" width="${f(w * 0.92)}" height="${f(wallH)}"/>`;
  o += `<path d="M${f(x - w * 0.62)} ${f(base - wallH + 1.6 * s)}Q${f(x - w * 0.3)} ${f(base - wallH - h * 0.42)} ${f(x - 1.2 * s)} ${f(base - wallH - h)}L${f(x + 1.2 * s)} ${f(base - wallH - h)}Q${f(x + w * 0.3)} ${f(base - wallH - h * 0.42)} ${f(x + w * 0.62)} ${f(base - wallH + 1.6 * s)}Z"/>`;
  let d = `<rect x="${f(x - 4 * s)}" y="${f(base - wallH - 11 * s)}" width="${f(8 * s)}" height="${f(4 * s)}"/>`;
  d += `<rect x="${f(x - 9 * s)}" y="${f(base - wallH - 4.4 * s)}" width="${f(6.4 * s)}" height="${f(3 * s)}"/><rect x="${f(x + 2.6 * s)}" y="${f(base - wallH - 4.4 * s)}" width="${f(6.4 * s)}" height="${f(3 * s)}"/>`;
  d += `<rect x="${f(x - 3 * s)}" y="${f(base - wallH + 2.4 * s)}" width="${f(6 * s)}" height="${f(wallH - 2.4 * s)}"/>`;
  return o + `<g fill="${light}">${d}</g>`;
}

/* Japanese black pine: a leaning, twisting trunk with flat, layered foliage pads. */
export function pine(x, base, s, lean, color) {
  const L = lean;
  // a pad: flat underside, softly lobed crown
  const pad = (cx, cy, rx) => {
    const ry = rx * 0.34;
    return `<path d="M${f(cx - rx)} ${f(cy)}C${f(cx - rx * 1.05)} ${f(cy - ry * 1.3)} ${f(cx - rx * 0.62)} ${f(cy - ry * 1.5)} ${f(cx - rx * 0.4)} ${f(cy - ry * 1.25)}C${f(cx - rx * 0.25)} ${f(cy - ry * 2.3)} ${f(cx + rx * 0.3)} ${f(cy - ry * 2.2)} ${f(cx + rx * 0.38)} ${f(cy - ry * 1.4)}C${f(cx + rx * 0.62)} ${f(cy - ry * 1.9)} ${f(cx + rx * 1.08)} ${f(cy - ry * 1.2)} ${f(cx + rx)} ${f(cy)}C${f(cx + rx * 0.5)} ${f(cy + ry * 0.5)} ${f(cx - rx * 0.5)} ${f(cy + ry * 0.5)} ${f(cx - rx)} ${f(cy)}Z"/>`;
  };
  const X = (dx) => x + L * dx * s, Y = (dy) => base - dy * s;
  let o = `<path d="M${f(X(-3.4))} ${f(Y(0))}C${f(X(-1))} ${f(Y(12))} ${f(X(8))} ${f(Y(18))} ${f(X(7))} ${f(Y(28))}C${f(X(6))} ${f(Y(36))} ${f(X(1))} ${f(Y(40))} ${f(X(3))} ${f(Y(48))}L${f(X(5.6))} ${f(Y(48))}C${f(X(4.4))} ${f(Y(40))} ${f(X(9.6))} ${f(Y(36))} ${f(X(10.4))} ${f(Y(28))}C${f(X(11))} ${f(Y(17))} ${f(X(2.6))} ${f(Y(10))} ${f(X(3.4))} ${f(Y(0))}Z"/>`;
  const branch = (x0, y0, x1, y1, w) => `<path d="M${f(X(x0))} ${f(Y(y0))}Q${f(X((x0 + x1) / 2))} ${f(Y(Math.max(y0, y1) + 3))} ${f(X(x1))} ${f(Y(y1))}" stroke="${color}" stroke-width="${f(w * s)}" stroke-linecap="round" fill="none"/>`;
  o += branch(7, 24, -16, 22, 1.8) + branch(9, 31, 26, 33, 1.6) + branch(5, 40, -10, 42, 1.3) + branch(4, 46, 16, 51, 1.2);
  o += pad(X(-18), Y(21), 13 * s) + pad(X(-7), Y(24), 9 * s);
  o += pad(X(27), Y(32), 12 * s) + pad(X(16), Y(35), 8 * s);
  o += pad(X(-11), Y(41.5), 10 * s);
  o += pad(X(17), Y(50.5), 10 * s);
  o += pad(X(4), Y(53), 12 * s) + pad(X(4), Y(58.5), 7 * s);
  return o;
}

/* ------------------------------ clouds ------------------------------ */
// Layered clouds as on Japanese folding screens: flat-bottomed bands with lobed tops,
// a fine warm outline drawn only around the outside, and a few curled tips.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spiral(cx, cy, a, dir) {
  let d = "";
  for (let i = 0; i <= 26; i++) {
    const th = (i / 26) * Math.PI * 1.7;
    const r = a * (1 - (th / (Math.PI * 2)) * 0.8);
    const px = cx + dir * r * Math.cos(th + Math.PI), py = cy - r * Math.sin(th + Math.PI);
    d += (i ? "L" : "M") + f(px) + " " + f(py);
  }
  return `<path d="${d}"/>`;
}

export function cloudSvg(variant) {
  const r = rng({ a: 3, b: 8, c: 15 }[variant]);
  const tiers = { a: [[16, 270, 64, 15], [96, 300, 100, 13]], b: [[24, 360, 88, 17]], c: [[14, 170, 58, 12], [150, 250, 80, 14], [60, 230, 108, 11]] }[variant];
  let shapes = "", curls = "", clips = "";
  tiers.forEach(([x0, len, yb, h], ti) => {
    const x1 = x0 + len;
    // lobes never hang below the flat bottom
    clips += `<clipPath id="k${ti}"><rect width="420" height="${yb}"/></clipPath>`;
    let lobeShapes = "";
    shapes += `<rect x="${f(x0)}" y="${f(yb - h)}" width="${f(len)}" height="${f(h)}" rx="${f(h / 2)}"/>`;
    let x = x0 + h * 0.6;
    const lobes = [];
    while (x < x1 - h * 0.6) {
      const mid = 1 - Math.abs((x - x0) / len - 0.5) * 1.5;
      const rad = Math.min(h * (0.7 + r() * 0.5 + Math.max(0, mid) * 1.2), x - x0, x1 - x);
      lobes.push([x, rad]);
      lobeShapes += `<circle cx="${f(x)}" cy="${f(yb - h * 0.45)}" r="${f(rad)}"/>`;
      x += rad * (1.25 + r() * 0.45);
    }
    shapes += `<g clip-path="url(#k${ti})">${lobeShapes}</g>`;
    // curled tips at both ends and a curl inside the biggest lobe
    curls += spiral(x0 + h * 0.5, yb - h * 0.5, h * 0.42, 1) + spiral(x1 - h * 0.5, yb - h * 0.5, h * 0.42, -1);
    const big = lobes.reduce((a, b) => (b[1] > a[1] ? b : a), lobes[0]);
    if (big) curls += spiral(big[0], yb - h * 0.55 - big[1] * 0.2, big[1] * 0.5, r() < 0.5 ? 1 : -1);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><defs>${clips}<linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f6efe3"/></linearGradient><g id="c">${shapes}</g></defs>` +
    `<use href="#c" fill="#d8c9b0" stroke="#d8c9b0" stroke-width="3.2" stroke-linejoin="round" opacity=".75"/><use href="#c" fill="url(#cf)"/>` +
    `<g fill="none" stroke="#d3c3a8" stroke-width="1.3" stroke-linecap="round" opacity=".8">${curls}</g></svg>`;
}
