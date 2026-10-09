/*
 * Koi pond — light, ink-and-watercolour style, on one <canvas>.
 *   - koi swim with a travelling body wave (stronger toward the tail), burst-and-glide
 *     strokes, paddling pectoral fins and long flowing tails
 *   - they stay soft *under* the water; every few seconds one leaps out of the water
 *   - watercolour lily pads, lotus, drifting sakura petals and a visiting dragonfly
 *   - tap the water to drop food; nearby koi swim over to it
 * Pauses when hidden or stopped. No dependencies.
 */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  const VARIETIES = [
    { body: "#fffaf3", patches: ["#e0472a", "#e0472a", "#d23c22"], fin: "255,250,243" },        // Kohaku
    { body: "#fffaf3", patches: ["#e0472a", "#2a2a2c", "#e0472a"], fin: "255,250,243" },        // Sanke
    { body: "#2c2c2f", patches: ["#e4532a", "#fffaf3", "#e4532a"], fin: "90,90,96", dark: true }, // Showa
    { body: "#f0a63a", patches: ["#f7c766", "#f7c766"], fin: "250,214,140" },                   // Yamabuki ogon
    { body: "#ec6b2d", patches: ["#fffaf3", "#f58a4a"], fin: "250,190,150" },                   // Orange
    { body: "#fffaf3", patches: [], head: "#e0472a", fin: "255,250,243" },                      // Tancho
  ];

  // body half-width along the spine (t: 0 head → 1 tail root)
  function profile(t) {
    if (t < 0.32) return 0.64 + 0.36 * Math.sin((t / 0.32) * Math.PI / 2);
    return 0.16 + 0.84 * 0.5 * (1 + Math.cos((Math.PI * (t - 0.32)) / 0.68));
  }

  /* ---------- faint water texture (tileable Voronoi edges) ---------- */
  function makeCausticTile(size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const img = g.createImageData(size, size);
    const pts = [];
    for (let i = 0; i < 16; i++) pts.push([Math.random() * size, Math.random() * size]);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let f1 = 1e9, f2 = 1e9;
        for (let i = 0; i < pts.length; i++) {
          let dx = Math.abs(x - pts[i][0]); if (dx > size / 2) dx = size - dx;
          let dy = Math.abs(y - pts[i][1]); if (dy > size / 2) dy = size - dy;
          const d = dx * dx + dy * dy;
          if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
        }
        const v = Math.max(0, 1 - (Math.sqrt(f2) - Math.sqrt(f1)) / 7);
        const o = (y * size + x) * 4;
        img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
        img.data[o + 3] = Math.pow(v, 2.4) * 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* ------------------------------ Koi ------------------------------ */
  class Koi {
    constructor(W, H, unit) {
      this.len = rand(0.8, 1.15) * unit;
      this.n = 14;
      this.seg = this.len / (this.n - 1);
      this.width = this.len * 0.12;
      this.x = rand(0, W); this.y = rand(0, H);
      this.a = rand(0, TAU);
      this.turn = 0; this.turnTarget = 0; this.turnTimer = 0;
      this.unitSpeed = unit / 100;
      this.speed = rand(0.4, 0.6) * this.unitSpeed;
      this.phase = rand(0, TAU);
      this.beat = 0.5;                 // tail-beat intensity (burst ↔ glide)
      this.bursting = false;
      this.burstTimer = rand(60, 200);
      this.v = pick(VARIETIES);
      this.leap = null;
      this.base = [];                  // follow-the-leader centreline
      for (let i = 0; i < this.n; i++) this.base.push({ x: this.x - Math.cos(this.a) * this.seg * i, y: this.y - Math.sin(this.a) * this.seg * i });
      this.pts = this.base.map((p) => ({ x: p.x, y: p.y }));
      this.tailLag = this.a;
      this.patches = [];
      const pc = this.v.patches.length ? 3 + ((Math.random() * 3) | 0) : 0;
      for (let i = 0; i < pc; i++) {
        this.patches.push({
          s: rand(0.12, 0.72), lat: rand(-0.8, 0.8), r: rand(0.8, 1.5), col: pick(this.v.patches),
          blobs: Array.from({ length: 3 }, () => [rand(-0.6, 0.6), rand(-0.5, 0.5), rand(0.55, 0.9)]),
        });
      }
    }

    update(dt, W, H, food) {
      const margin = this.len * 0.7;
      let desired = null, hungry = false;

      if (this.leap) {
        this.leap.t += dt / this.leap.dur;
        this.speed += (this.unitSpeed * 2.2 - this.speed) * 0.1 * dt;
        this.beat += (1.4 - this.beat) * 0.2 * dt;
        this.turn *= 0.9;
      } else {
        if (food.length) {
          let best = null, bd = 1e12;
          for (const f of food) {
            const d = (f.x - this.x) ** 2 + (f.y - this.y) ** 2;
            if (d < bd) { bd = d; best = f; }
          }
          if (best && bd < (this.len * 6) ** 2) {
            desired = Math.atan2(best.y - this.y, best.x - this.x);
            hungry = true;
            if (bd < (this.width * 1.6) ** 2) best.eaten = true;
          }
        }
        if (desired === null && (this.x < margin || this.x > W - margin || this.y < margin || this.y > H - margin)) {
          desired = Math.atan2(H / 2 - this.y, W / 2 - this.x);
        }

        // smooth, lazy wandering: a new gentle curve every 1.5–4 s
        this.turnTimer -= dt;
        if (this.turnTimer <= 0) {
          this.turnTarget = Math.random() < 0.35 ? 0 : rand(-0.018, 0.018);
          this.turnTimer = rand(90, 240);
        }
        let target = this.turnTarget;
        if (desired !== null) target = clamp(wrapAngle(desired - this.a) * 0.05, -0.035, 0.035);
        this.turn += (target - this.turn) * 0.04 * dt;

        // burst-and-glide
        this.burstTimer -= dt;
        if (this.burstTimer <= 0) {
          this.bursting = !this.bursting;
          this.burstTimer = this.bursting ? rand(40, 90) : rand(90, 260);
        }
        const wantBeat = hungry ? 1.2 : this.bursting ? 1 : 0.35;
        const wantSpeed = (hungry ? 1.3 : this.bursting ? 0.8 : 0.42) * this.unitSpeed;
        this.beat += (wantBeat - this.beat) * 0.03 * dt;
        this.speed += (wantSpeed - this.speed) * (wantSpeed > this.speed ? 0.03 : 0.008) * dt;
      }

      this.a += this.turn * dt;
      this.x += Math.cos(this.a) * this.speed * dt;
      this.y += Math.sin(this.a) * this.speed * dt;
      this.phase += (0.05 + 0.11 * this.beat) * dt; // tail-beat frequency follows effort

      // follow-the-leader centreline
      const b = this.base;
      b[0].x = this.x; b[0].y = this.y;
      for (let i = 1; i < this.n; i++) {
        const dx = b[i].x - b[i - 1].x, dy = b[i].y - b[i - 1].y;
        const d = Math.hypot(dx, dy) || 1;
        b[i].x = b[i - 1].x + (dx / d) * this.seg;
        b[i].y = b[i - 1].y + (dy / d) * this.seg;
      }

      // travelling wave on top of the centreline — this is what makes them supple
      const amp = this.len * 0.075 * (0.35 + 0.65 * Math.min(1.3, this.beat));
      for (let i = 0; i < this.n; i++) {
        const s = i / (this.n - 1);
        const a = b[Math.max(0, i - 1)], c = b[Math.min(this.n - 1, i + 1)];
        const ang = Math.atan2(a.y - c.y, a.x - c.x);
        const off = amp * (0.12 + 0.88 * s * s) * Math.sin(this.phase - s * 4.6);
        this.pts[i].x = b[i].x - Math.sin(ang) * off;
        this.pts[i].y = b[i].y + Math.cos(ang) * off;
      }
      // the tail fin lags behind the body's swing and flows
      const p = this.pts, n = this.n;
      const tailDir = Math.atan2(p[n - 1].y - p[n - 2].y, p[n - 1].x - p[n - 2].x);
      this.tailLag += wrapAngle(tailDir - this.tailLag) * Math.min(1, 0.18 * dt);
    }

    height() { return this.leap ? Math.sin(Math.PI * clamp(this.leap.t, 0, 1)) : 0; }

    outline() {
      const p = this.pts, L = [], R = [];
      for (let i = 0; i < this.n; i++) {
        const a = p[Math.max(0, i - 1)], b = p[Math.min(this.n - 1, i + 1)];
        const ang = Math.atan2(a.y - b.y, a.x - b.x);
        const w = this.width * profile(i / (this.n - 1));
        const nx = -Math.sin(ang) * w, ny = Math.cos(ang) * w;
        L.push([p[i].x + nx, p[i].y + ny]);
        R.push([p[i].x - nx, p[i].y - ny]);
      }
      return [L, R];
    }

    bodyPath(ctx, L, R, ox, oy) {
      const p = this.pts, n = this.n;
      ctx.beginPath();
      const hA = Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x);
      ctx.moveTo(R[0][0] + ox, R[0][1] + oy);
      ctx.arc(p[0].x + ox, p[0].y + oy, this.width * profile(0), hA - Math.PI / 2, hA + Math.PI / 2, false);
      for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(L[i][0] + ox, L[i][1] + oy, (L[i][0] + L[i + 1][0]) / 2 + ox, (L[i][1] + L[i + 1][1]) / 2 + oy);
      ctx.lineTo(L[n - 1][0] + ox, L[n - 1][1] + oy);
      ctx.lineTo(R[n - 1][0] + ox, R[n - 1][1] + oy);
      for (let i = n - 2; i > 0; i--) ctx.quadraticCurveTo(R[i][0] + ox, R[i][1] + oy, (R[i][0] + R[i - 1][0]) / 2 + ox, (R[i][1] + R[i - 1][1]) / 2 + oy);
      ctx.closePath();
    }

    withLift(ctx, fn) {
      const h = this.height();
      if (!h) return fn();
      const c = this.pts[(this.n / 2) | 0], s = 1 + 0.55 * h;
      ctx.save();
      ctx.translate(c.x, c.y); ctx.scale(s, s); ctx.translate(-c.x, -c.y);
      fn();
      ctx.restore();
    }

    drawShadow(ctx, L, R) {
      const h = this.height();
      const off = this.len * 0.1 + h * this.len * 0.7;
      ctx.save();
      ctx.globalAlpha = 1 - h * 0.6;
      this.bodyPath(ctx, L, R, off * 0.5, off);
      ctx.fill();
      ctx.restore();
    }

    // translucent fan-shaped fin with a few fine rays
    fin(ctx, x, y, ang, len, wid) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(len * 0.35, -wid * 1.1, len * 0.95, -wid * 0.9, len, -wid * 0.1);
      ctx.bezierCurveTo(len * 0.9, wid * 0.35, len * 0.4, wid * 0.35, 0, 0);
      ctx.fillStyle = `rgba(${this.v.fin},0.62)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(70,62,55,0.22)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
      if (this.leap) {
        ctx.beginPath();
        for (let k = 1; k <= 3; k++) { ctx.moveTo(len * 0.06, 0); ctx.lineTo(len * 0.92, -wid * (0.85 - k * 0.32)); }
        ctx.strokeStyle = "rgba(70,62,55,0.12)";
        ctx.stroke();
      }
      ctx.restore();
    }

    draw(ctx, L, R) {
      const p = this.pts, n = this.n;
      const dirAt = (i) => Math.atan2(p[i].y - p[i + 1].y, p[i].x - p[i + 1].x);
      const paddle = Math.sin(this.phase * 0.55);

      // pectoral fins — paddle slowly; they fold with the turn
      const fA = dirAt(2), fl = this.len * 0.2, fw = this.len * 0.075;
      const turnFold = clamp(this.turn * 18, -0.5, 0.5);
      const spread = this.leap ? 1.35 : 0.95;
      this.fin(ctx, p[3].x, p[3].y, fA + Math.PI - spread - paddle * 0.22 + turnFold, fl, fw);
      this.fin(ctx, p[3].x, p[3].y, fA + Math.PI + spread + paddle * 0.22 + turnFold, fl, -fw);
      // pelvic fins
      const pA = dirAt(7);
      this.fin(ctx, p[8].x, p[8].y, pA + Math.PI - 0.6 - paddle * 0.15, fl * 0.55, fw * 0.6);
      this.fin(ctx, p[8].x, p[8].y, pA + Math.PI + 0.6 + paddle * 0.15, fl * 0.55, -fw * 0.6);

      // long flowing tail: two lobes that trail behind the body's swing
      const tp = p[n - 1], tl = this.len * 0.3;
      const swing = wrapAngle(this.tailLag - Math.atan2(p[n - 1].y - p[n - 2].y, p[n - 1].x - p[n - 2].x));
      const bend = clamp(swing * 1.4, -0.6, 0.6) * tl;
      ctx.save();
      ctx.translate(tp.x, tp.y);
      ctx.rotate(this.tailLag);
      ctx.beginPath();
      ctx.moveTo(-this.seg * 0.6, 0);
      ctx.bezierCurveTo(tl * 0.3, -tl * 0.18, tl * 0.75, -tl * 0.62 + bend * 0.4, tl * 1.02, -tl * 0.5 + bend);
      ctx.quadraticCurveTo(tl * 0.62, bend * 0.6, tl * 1.02, tl * 0.5 + bend);
      ctx.bezierCurveTo(tl * 0.75, tl * 0.62 + bend * 0.4, tl * 0.3, tl * 0.18, -this.seg * 0.6, 0);
      ctx.fillStyle = `rgba(${this.v.fin},0.6)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(70,62,55,0.22)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
      if (this.leap) {
        ctx.beginPath();
        for (let k = -2; k <= 2; k++) { ctx.moveTo(0, 0); ctx.quadraticCurveTo(tl * 0.5, k * tl * 0.1 + bend * 0.3, tl * 0.92, k * tl * 0.2 + bend * 0.9); }
        ctx.strokeStyle = "rgba(70,62,55,0.1)";
        ctx.stroke();
      }
      ctx.restore();

      // body
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.fillStyle = this.v.body;
      ctx.fill();

      ctx.save();
      ctx.clip();
      // watercolour patches made of a few soft blobs that ride the body's wave
      for (const pt of this.patches) {
        const fi = pt.s * (n - 1), i = Math.min(n - 2, Math.floor(fi)), f = fi - i;
        const x = p[i].x + (p[i + 1].x - p[i].x) * f, y = p[i].y + (p[i + 1].y - p[i].y) * f;
        const ang = dirAt(i), w = this.width * profile(pt.s);
        const cx = x - Math.sin(ang) * pt.lat * w, cy = y + Math.cos(ang) * pt.lat * w;
        ctx.fillStyle = pt.col;
        for (const [scale, alpha] of [[1.25, 0.3], [1, 0.88]]) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          for (const [bx, by, br] of pt.blobs) {
            const ox = (Math.cos(ang) * bx - Math.sin(ang) * by) * this.width * pt.r;
            const oy = (Math.sin(ang) * bx + Math.cos(ang) * by) * this.width * pt.r;
            const rr = this.width * pt.r * br * scale;
            ctx.moveTo(cx + ox + rr, cy + oy);
            ctx.arc(cx + ox, cy + oy, rr, 0, TAU);
          }
          ctx.fill();
        }
      }
      if (this.v.head) { // tancho: a red crown
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = this.v.head;
        ctx.beginPath(); ctx.arc(p[1].x, p[1].y, this.width * 0.45, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // edge shading for volume
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.lineWidth = this.width * 0.7;
      ctx.strokeStyle = this.v.dark ? "rgba(0,0,0,0.25)" : "rgba(90,60,40,0.1)";
      ctx.stroke();
      // soft light along the back
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,0.32)";
      ctx.lineWidth = this.width * 0.34;
      ctx.beginPath();
      ctx.moveTo(p[1].x, p[1].y);
      for (let i = 2; i < n - 4; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.stroke();
      ctx.restore();

      // dorsal fin ridge
      ctx.strokeStyle = `rgba(${this.v.fin},0.7)`;
      ctx.lineWidth = this.width * 0.16;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p[3].x, p[3].y);
      for (let i = 4; i < 9; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.stroke();

      // fine ink outline
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = this.v.dark ? "rgba(20,20,22,0.55)" : "rgba(60,58,55,0.3)";
      ctx.stroke();

      // eyes + barbels
      const hA = dirAt(0), ew = this.width * 0.55;
      const ex = p[0].x + Math.cos(hA) * this.width * 0.2, ey = p[0].y + Math.sin(hA) * this.width * 0.2;
      ctx.fillStyle = "#1b1b1b";
      ctx.beginPath();
      ctx.arc(ex - Math.sin(hA) * ew, ey + Math.cos(hA) * ew, this.width * 0.11, 0, TAU);
      ctx.arc(ex + Math.sin(hA) * ew, ey - Math.cos(hA) * ew, this.width * 0.11, 0, TAU);
      ctx.fill();
      if (!this.leap) return;
      const mx = p[0].x + Math.cos(hA) * this.width * 0.6, my = p[0].y + Math.sin(hA) * this.width * 0.6;
      ctx.strokeStyle = "rgba(70,60,50,0.35)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (const sgn of [-1, 1]) {
        ctx.moveTo(mx, my);
        ctx.quadraticCurveTo(mx + Math.cos(hA + sgn * 0.9) * this.width * 0.5, my + Math.sin(hA + sgn * 0.9) * this.width * 0.5,
          mx + Math.cos(hA + sgn * 1.6 + paddle * 0.2) * this.width * 0.8, my + Math.sin(hA + sgn * 1.6 + paddle * 0.2) * this.width * 0.8);
      }
      ctx.stroke();
    }
  }

  /* ------------------- watercolour lily pads + lotus ------------------- */
  const SPRITE_SCALE = 1.5;
  const PAD_TONES = [
    ["rgba(214,168,128,0.42)", "rgba(176,128,92,0.35)"],
    ["rgba(150,168,176,0.40)", "rgba(102,120,130,0.35)"],
    ["rgba(150,152,150,0.30)", "rgba(110,112,112,0.32)"],
  ];

  class LilyPad {
    constructor(W, H, unit) {
      this.r = rand(0.26, 0.42) * unit;
      this.x = rand(0, W); this.y = rand(0, H);
      this.rot = rand(0, TAU);
      this.vx = rand(-0.05, 0.05); this.vy = rand(-0.035, 0.035);
      this.vr = rand(-0.0006, 0.0006);
      this.tone = pick(PAD_TONES);
      this.flower = Math.random() < 0.45;
      this.bob = rand(0, TAU);
      this.edge = Array.from({ length: 28 }, () => rand(0.9, 1.05));
    }
    update(dt, W, H) {
      this.x += this.vx * dt; this.y += this.vy * dt; this.rot += this.vr * dt; this.bob += 0.02 * dt;
      const r = this.r * 1.3;
      if (this.x < -r) this.x = W + r; if (this.x > W + r) this.x = -r;
      if (this.y < -r) this.y = H + r; if (this.y > H + r) this.y = -r;
    }
    shape(ctx, r) {
      const n = this.edge.length, gap = 0.22;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i <= n; i++) {
        const a = gap + (i / n) * (TAU - gap * 2);
        const rr = r * this.edge[i % n];
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
    }
    // drawn once into a sprite; each frame is a single drawImage
    draw(ctx) {
      if (!this.sprite) {
        const R = this.r * 1.12, k = SPRITE_SCALE;
        const c = document.createElement("canvas");
        c.width = c.height = Math.ceil(R * 2 * k);
        const g = c.getContext("2d");
        g.scale(k, k);
        g.translate(R, R);
        this.paint(g);
        this.sprite = c; this.R = R;
      }
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const s = 1 + Math.sin(this.bob) * 0.012;
      ctx.scale(s, s);
      ctx.drawImage(this.sprite, -this.R, -this.R, this.R * 2, this.R * 2);
      ctx.restore();
    }
    paint(ctx) {
      ctx.save();
      ctx.fillStyle = this.tone[0];
      this.shape(ctx, this.r * 1.04); ctx.fill();
      this.shape(ctx, this.r * 0.9); ctx.fill();
      ctx.strokeStyle = this.tone[1];
      ctx.lineWidth = 1.4;
      this.shape(ctx, this.r); ctx.stroke();
      ctx.strokeStyle = "rgba(90,90,90,0.18)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) {
        const a = 0.6 + i * 0.95;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * this.r * 0.85, Math.sin(a) * this.r * 0.85); ctx.stroke();
      }
      if (this.flower) {
        const fr = this.r * 0.5;
        ctx.translate(this.r * 0.1, -this.r * 0.1);
        for (let layer = 0; layer < 3; layer++) {
          const k = 8 - layer * 2, len = fr * (1 - layer * 0.25);
          for (let i = 0; i < k; i++) {
            ctx.save();
            ctx.rotate((i / k) * TAU + layer * 0.4);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(len * 0.5, -len * 0.32, len, 0);
            ctx.quadraticCurveTo(len * 0.5, len * 0.32, 0, 0);
            ctx.fillStyle = layer === 2 ? "rgba(246,214,214,0.95)" : layer === 1 ? "rgba(250,232,230,0.95)" : "rgba(255,248,244,0.95)";
            ctx.fill();
            ctx.strokeStyle = "rgba(170,120,120,0.35)";
            ctx.lineWidth = 0.7;
            ctx.stroke();
            ctx.restore();
          }
        }
        ctx.fillStyle = "#e9c46a";
        ctx.beginPath(); ctx.arc(0, 0, fr * 0.14, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ------------------------ floating sakura petals ------------------------ */
  class Petal {
    constructor(W, H) { this.reset(W, H, true); }
    reset(W, H, anywhere) {
      this.x = anywhere ? rand(0, W) : -20; this.y = rand(0, H);
      this.vx = rand(0.05, 0.18); this.vy = rand(-0.04, 0.04);
      this.rot = rand(0, TAU); this.vr = rand(-0.004, 0.004);
      this.s = rand(5, 8);
      this.col = pick(["#f4c3ca", "#efb2bc", "#f8d6db"]);
      this.bob = rand(0, TAU);
    }
    update(dt, W, H) {
      this.bob += 0.03 * dt;
      this.x += (this.vx + Math.sin(this.bob) * 0.03) * dt; this.y += this.vy * dt; this.rot += this.vr * dt;
      if (this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset(W, H, false);
    }
    draw(ctx) {
      const s = this.s;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = "rgba(90,110,120,0.12)";
      ctx.beginPath(); ctx.ellipse(2, 3, s * 0.55, s * 0.9, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.7, -s * 0.8, -s * 0.15, -s);
      ctx.lineTo(0, -s * 0.72);
      ctx.lineTo(s * 0.15, -s);
      ctx.bezierCurveTo(s * 0.7, -s * 0.8, s * 0.9, s * 0.4, 0, s);
      ctx.fillStyle = this.col;
      ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------ dragonfly ------------------------------ */
  class Dragonfly {
    constructor(W, H) {
      const fromLeft = Math.random() < 0.5;
      this.x = fromLeft ? -30 : W + 30; this.y = rand(H * 0.15, H * 0.75);
      this.vx = 0; this.vy = 0; this.a = fromLeft ? 0 : Math.PI;
      this.stops = 2 + ((Math.random() * 2) | 0);
      this.target = this.pickTarget(W, H);
      this.hover = 0; this.t = 0; this.done = false;
      this.exitX = fromLeft ? W + 60 : -60;
    }
    pickTarget(W, H) { return { x: rand(W * 0.15, W * 0.85), y: rand(H * 0.15, H * 0.8) }; }
    update(dt, W, H) {
      this.t += dt;
      if (this.hover > 0) {
        this.hover -= dt;
        this.vx *= 0.85; this.vy *= 0.85;
        if (this.hover <= 0) {
          this.stops--;
          this.target = this.stops > 0 ? this.pickTarget(W, H) : { x: this.exitX, y: rand(0, H) };
        }
      } else {
        const dx = this.target.x - this.x, dy = this.target.y - this.y, d = Math.hypot(dx, dy);
        if (d < 8 && this.stops > 0) this.hover = rand(50, 120);
        else {
          this.vx += (dx / (d || 1)) * 0.35 * dt; this.vy += (dy / (d || 1)) * 0.35 * dt;
          const sp = Math.hypot(this.vx, this.vy), max = 5.5;
          if (sp > max) { this.vx *= max / sp; this.vy *= max / sp; }
          if (d > 30) this.a += wrapAngle(Math.atan2(this.vy, this.vx) - this.a) * 0.25;
        }
        if (this.stops <= 0 && (this.x < -50 || this.x > W + 50)) this.done = true;
      }
      this.x += this.vx * dt; this.y += this.vy * dt;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x + 14, this.y + 22);
      ctx.rotate(this.a);
      ctx.fillStyle = "rgba(70,95,105,0.12)";
      ctx.fillRect(-14, -1.5, 26, 3);
      ctx.restore();

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.a);
      const flick = 0.5 + 0.5 * Math.sin(this.t * 2.4);
      ctx.fillStyle = `rgba(220,235,240,${0.35 + flick * 0.25})`;
      ctx.strokeStyle = "rgba(90,100,110,0.35)";
      ctx.lineWidth = 0.6;
      for (const [ox, sy, len] of [[4, -1, 17], [4, 1, 17], [-1, -1, 15], [-1, 1, 15]]) {
        ctx.beginPath();
        ctx.ellipse(ox, sy * (len * 0.5 + 1), 3.2, len * 0.5, sy * (0.25 + flick * 0.12), 0, TAU);
        ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = "#33545e";
      ctx.fillRect(-16, -1.1, 20, 2.2);
      ctx.beginPath(); ctx.ellipse(5, 0, 3.4, 2.4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = "#2a3f46";
      ctx.beginPath(); ctx.arc(8.4, 0, 2.2, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------ Pond ------------------------------ */
  // opts.contained: size to the canvas's parent box (e.g. a card) instead of the viewport
  // opts.maxDpr / maxKoi / petals: lighter settings (the home page pond sits behind content)
  function KoiPond(canvas, causticEl, opts = {}) {
    const contained = !!opts.contained;
    const ctx = canvas.getContext("2d");
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, unit = 100;
    let koi = [], pads = [], petals = [], ripples = [], food = [], drops = [];
    let fly = null, nextFly = 600;
    let prepared = false;
    let prevBoxes = [];
    let scrollBusyUntil = 0, skip = 0;
    let running = false, raf = 0, last = 0, t = 0, nextLeap = 240;

    function resize() {
      // big screens get a 1× canvas: the watercolour is soft anyway and it halves the fill cost
      dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr || (window.innerWidth > 900 ? 1 : 1.25));
      // size to the *large* viewport (the scene is 100lvh) so the phone's
      // address bar showing/hiding never resizes or clears the canvas
      W = contained ? canvas.parentElement.clientWidth : window.innerWidth;
      H = (canvas.parentElement && canvas.parentElement.clientHeight) || window.innerHeight;
      prevBoxes = [];
      for (const c of [canvas, layer]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const newUnit = contained ? Math.max(70, Math.min(120, Math.min(W, H) * 0.3)) : Math.max(85, Math.min(150, Math.min(W, H) * 0.27));
      if (!koi.length || Math.abs(newUnit - unit) > 20) {
        unit = newUnit;
        const area = W * H;
        koi = Array.from({ length: Math.max(3, Math.min(opts.maxKoi || 6, Math.round(area / 30000))) }, () => new Koi(W, H, unit));
        pads = Array.from({ length: contained ? 3 : W > 700 ? 6 : 4 }, () => new LilyPad(W, H, unit));
        petals = Array.from({ length: contained ? 5 : opts.petals || (W > 700 ? 12 : 8) }, () => new Petal(W, H));
      }
      if (!reduced) frame(performance.now(), true);
    }

    // generous bounds of a fish incl. fins, tail and shadow, clamped to the canvas
    function fishBox(k, [L, R]) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const q of L.concat(R)) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
      const pad = k.len * 0.42;
      x0 = Math.max(0, Math.floor(x0 - pad)); y0 = Math.max(0, Math.floor(y0 - pad));
      x1 = Math.min(W, Math.ceil(x1 + pad + k.len * 0.06)); y1 = Math.min(H, Math.ceil(y1 + pad + k.len * 0.12));
      return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
    }

    // overlapping boxes are merged so nothing is tinted or copied twice
    function mergeBoxes(list) {
      let merged = true;
      while (merged) {
        merged = false;
        outer: for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
              const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
              list[i] = { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
              list.splice(j, 1);
              merged = true;
              break outer;
            }
          }
        }
      }
      return list;
    }

    function splash(x, y, big) {
      ripples.push({ x, y, r: 3, life: 1, w: big ? 2 : 1.4 });
      if (big) {
        ripples.push({ x, y, r: 1, life: 1.25, w: 1.4 });
        for (let i = 0; i < 14; i++) {
          const a = rand(0, TAU), v = rand(0.8, 2.6);
          drops.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, z: 0, vz: rand(1.5, 3.2), r: rand(1.2, 2.6) });
        }
      }
    }

    function addRipple(x, y, withFood) {
      splash(x, y, false);
      if (withFood) {
        food.push({ x, y, life: 1, eaten: false });
        if (food.length > 4) food.shift();
      }
    }

    function scheduleLeap() {
      const inside = koi.filter((k) => !k.leap && k.x > W * 0.15 && k.x < W * 0.85 && k.y > H * 0.15 && k.y < H * 0.85);
      if (!inside.length) { nextLeap = t + 60; return; }
      const k = pick(inside);
      k.leap = { t: 0, dur: rand(95, 120) };
      splash(k.pts[0].x, k.pts[0].y, true);
      nextLeap = t + rand(420, 780); // ~7–13 s
    }

    function frame(now, once) {
      if (!once && now < scrollBusyUntil && (++skip & 1)) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(3, (now - last) / 16.67 || 1);
      last = now; t += dt;
      ctx.clearRect(0, 0, W, H);

      for (const f of food) {
        f.life -= 0.0025 * dt;
        ctx.fillStyle = `rgba(150,105,60,${Math.max(0, f.life) * 0.8})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.6, 0, TAU);
        ctx.arc(f.x + 6, f.y - 3, 2.2, 0, TAU);
        ctx.arc(f.x - 4, f.y + 5, 1.8, 0, TAU);
        ctx.fill();
      }
      food = food.filter((f) => !f.eaten && f.life > 0);

      if (!once && t > nextLeap) scheduleLeap();

      const outlines = [];
      for (const k of koi) {
        if (!once) k.update(dt, W, H, food);
        if (k.leap && k.leap.t >= 1) { splash(k.pts[0].x, k.pts[0].y, true); k.leap = null; }
        if (k.leap && Math.random() < 0.35 * dt) {
          const tp = k.pts[k.n - 1];
          drops.push({ x: tp.x, y: tp.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), z: k.height() * 30, vz: rand(-0.2, 0.6), r: rand(1, 2) });
        }
        outlines.push(k.outline());
      }

      // underwater koi, washed into the water. Only the boxes around the fish are
      // cleared, tinted and copied, instead of three full-screen passes per frame.
      const boxes = mergeBoxes(koi.map((k, i) => (k.leap ? null : fishBox(k, outlines[i]))).filter(Boolean));
      for (const b of prevBoxes.concat(boxes)) lctx.clearRect(b.x, b.y, b.w, b.h);
      lctx.fillStyle = "rgba(70,95,105,0.16)";
      koi.forEach((k, i) => { if (!k.leap) k.drawShadow(lctx, outlines[i][0], outlines[i][1]); });
      koi.forEach((k, i) => { if (!k.leap) k.draw(lctx, outlines[i][0], outlines[i][1]); });
      lctx.save();
      lctx.globalCompositeOperation = "source-atop";
      lctx.fillStyle = "rgba(214,228,232,0.28)";
      for (const b of boxes) lctx.fillRect(b.x, b.y, b.w, b.h);
      lctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.8;
      for (const b of boxes) ctx.drawImage(layer, b.x * dpr, b.y * dpr, b.w * dpr, b.h * dpr, b.x, b.y, b.w, b.h);
      ctx.restore();
      prevBoxes = boxes;

      for (const p of pads) { if (!once) p.update(dt, W, H); p.draw(ctx); }
      for (const p of petals) { if (!once) p.update(dt, W, H); p.draw(ctx); }

      for (const r of ripples) {
        r.r += 1.1 * dt; r.life -= 0.01 * dt;
        const a = Math.max(0, Math.min(1, r.life));
        ctx.strokeStyle = `rgba(110,140,152,${a * 0.5})`;
        ctx.lineWidth = r.w;
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.92, 0, 0, TAU); ctx.stroke();
        if (r.r > 14) { ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r - 12, (r.r - 12) * 0.92, 0, 0, TAU); ctx.stroke(); }
      }
      ripples = ripples.filter((r) => r.life > 0);

      // leaping koi: above the surface, in full colour
      koi.forEach((k, i) => {
        if (!k.leap) return;
        ctx.fillStyle = "rgba(70,95,105,0.18)";
        k.drawShadow(ctx, outlines[i][0], outlines[i][1]);
        k.withLift(ctx, () => k.draw(ctx, outlines[i][0], outlines[i][1]));
      });

      for (const d of drops) {
        d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; d.vz -= 0.12 * dt;
        d.vx *= 0.985; d.vy *= 0.985;
        const s = 1 + Math.max(0, d.z) * 0.03;
        ctx.fillStyle = "rgba(120,155,168,0.55)";
        ctx.beginPath(); ctx.arc(d.x, d.y - Math.max(0, d.z) * 0.6, d.r * s, 0, TAU); ctx.fill();
      }
      drops = drops.filter((d) => d.z > -2);

      // an occasional dragonfly visit
      if (!once) {
        if (!fly && t > nextFly) fly = new Dragonfly(W, H);
        if (fly) {
          fly.update(dt, W, H);
          if (fly.done) { fly = null; nextFly = t + rand(1500, 2700); }
        }
      }
      if (fly) fly.draw(ctx);

      if (!once && Math.random() < 0.003 * dt) addRipple(rand(0, W), rand(0, H), false);

      if (running && !once) raf = requestAnimationFrame(frame);
    }

    // heavy one-off setup; called while the guest is still on the landing page
    function prepare() {
      if (prepared) return;
      prepared = true;
      if (causticEl) {
        try { causticEl.style.setProperty("--caustic", `url(${makeCausticTile(160).toDataURL()})`); } catch (e) { /* decorative */ }
      }
      resize();
    }

    function start() {
      prepare();
      if (reduced) { frame(performance.now(), true); return; }
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // only real size changes (rotation, desktop resize) rebuild the canvas
    window.addEventListener("resize", () => {
      if (!prepared) return;
      const h = (canvas.parentElement && canvas.parentElement.clientHeight) || window.innerHeight;
      const w = contained ? canvas.parentElement.clientWidth : window.innerWidth;
      if (w !== W || Math.abs(h - H) > (contained ? 2 : 120)) resize();
    });
    window.addEventListener("scroll", () => { scrollBusyUntil = performance.now() + 200; }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (running) { stop(); running = "paused"; } }
      else if (running === "paused") { running = false; start(); }
    });

    return { prepare, start, stop, addRipple, resize, leap: scheduleLeap, splash: (x, y) => splash(x, y, true) };
  }

  window.KoiPond = KoiPond;
})();
