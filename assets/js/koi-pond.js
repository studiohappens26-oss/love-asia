/*
 * Koi pond — light, ink-and-watercolour style, on one <canvas>.
 *   - koi swim softly *under* the water (drawn to an offscreen layer, then washed out)
 *   - every few seconds one koi leaps out of the water: it rises toward the viewer,
 *     its shadow separates, droplets trail, and it dives back with a splash
 *   - watercolour lily pads and lotus flowers drift on the surface
 *   - tap the water to drop food; nearby koi swim over to it
 * Pauses when hidden or stopped. No dependencies.
 */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Koi varieties tuned for a light, paper-like pond
  const VARIETIES = [
    { body: "#fffaf3", patches: ["#e0472a", "#e0472a", "#d23c22"] },  // Kohaku
    { body: "#fffaf3", patches: ["#e0472a", "#2a2a2c", "#e0472a"] },  // Sanke
    { body: "#2c2c2f", patches: ["#e4532a", "#fffaf3", "#e4532a"] },  // Showa
    { body: "#f0a63a", patches: ["#f7c766"] },                          // Yamabuki
    { body: "#ec6b2d", patches: ["#fffaf3", "#ec6b2d"] },               // Orange
    { body: "#fffaf3", patches: ["#e0472a"] },                          // Tancho-ish
  ];

  const profile = (t) => Math.max(0.05, (Math.pow(1 - t, 1.2) * (0.55 + 1.8 * t)) / 0.72);

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
        img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255;
        img.data[o + 3] = Math.pow(v, 2.4) * 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* ------------------------------ Koi ------------------------------ */
  class Koi {
    constructor(W, H, unit) {
      this.len = rand(0.75, 1.15) * unit;
      this.n = 12;
      this.seg = this.len / this.n;
      this.width = this.len * 0.13;
      this.x = rand(0, W); this.y = rand(0, H);
      this.a = rand(0, TAU);
      this.turn = 0;
      this.baseSpeed = rand(0.45, 0.75) * (unit / 100);
      this.speed = this.baseSpeed;
      this.phase = rand(0, TAU);
      this.v = pick(VARIETIES);
      this.dark = this.v.body === "#2c2c2f";
      this.fin = this.dark ? "rgba(70,70,76,0.55)" : "rgba(255,250,243,0.8)";
      this.leap = null;
      this.pts = [];
      for (let i = 0; i < this.n; i++) {
        this.pts.push({ x: this.x - Math.cos(this.a) * this.seg * i, y: this.y - Math.sin(this.a) * this.seg * i });
      }
      this.patches = [];
      const count = 3 + ((Math.random() * 3) | 0);
      for (let i = 0; i < count; i++) {
        this.patches.push([rand(0.5, this.n * 0.75), rand(-0.9, 0.9), rand(0.7, 1.4), pick(this.v.patches)]);
      }
    }

    update(dt, W, H, food) {
      const margin = this.len * 0.6;
      let desired = null;

      if (this.leap) {
        // committed to the jump: straight line, fast
        this.leap.t += dt / this.leap.dur;
        this.speed += (this.baseSpeed * 3 - this.speed) * 0.1 * dt;
        this.turn *= 0.8;
      } else {
        if (food.length) {
          let best = null, bd = 1e12;
          for (const f of food) {
            const d = (f.x - this.x) ** 2 + (f.y - this.y) ** 2;
            if (d < bd) { bd = d; best = f; }
          }
          if (best && bd < (this.len * 6) ** 2) {
            desired = Math.atan2(best.y - this.y, best.x - this.x);
            if (bd < (this.width * 1.5) ** 2) best.eaten = true;
          }
        }
        if (desired === null && (this.x < margin || this.x > W - margin || this.y < margin || this.y > H - margin)) {
          desired = Math.atan2(H / 2 + rand(-H / 4, H / 4) - this.y, W / 2 + rand(-W / 4, W / 4) - this.x);
        }
        if (desired !== null) {
          let diff = desired - this.a;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          this.turn += diff * 0.004 * dt;
          this.speed += (this.baseSpeed * (food.length ? 1.9 : 1.2) - this.speed) * 0.03 * dt;
        } else {
          this.turn += rand(-0.0025, 0.0025) * dt;
          this.speed += (this.baseSpeed - this.speed) * 0.02 * dt;
        }
        this.turn *= Math.pow(0.95, dt);
        this.turn = clamp(this.turn, -0.045, 0.045);
      }

      this.phase += 0.09 * dt * (0.6 + (this.speed / this.baseSpeed) * 0.6);
      this.a += this.turn * dt + Math.sin(this.phase) * (this.leap ? 0.02 : 0.012) * dt;
      this.x += Math.cos(this.a) * this.speed * dt;
      this.y += Math.sin(this.a) * this.speed * dt;

      const p = this.pts;
      p[0].x = this.x; p[0].y = this.y;
      for (let i = 1; i < this.n; i++) {
        const dx = p[i].x - p[i - 1].x, dy = p[i].y - p[i - 1].y;
        const d = Math.hypot(dx, dy) || 1;
        p[i].x = p[i - 1].x + (dx / d) * this.seg;
        p[i].y = p[i - 1].y + (dy / d) * this.seg;
      }
    }

    // height above the water during a leap (0..1)
    height() {
      return this.leap ? Math.sin(Math.PI * clamp(this.leap.t, 0, 1)) : 0;
    }

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
      ctx.beginPath();
      const head = this.pts[0], hA = Math.atan2(this.pts[0].y - this.pts[1].y, this.pts[0].x - this.pts[1].x);
      const hw = this.width * profile(0);
      ctx.moveTo(R[0][0] + ox, R[0][1] + oy);
      ctx.arc(head.x + ox, head.y + oy, hw, hA - Math.PI / 2, hA + Math.PI / 2, false);
      for (let i = 1; i < this.n - 1; i++) {
        ctx.quadraticCurveTo(L[i][0] + ox, L[i][1] + oy, (L[i][0] + L[i + 1][0]) / 2 + ox, (L[i][1] + L[i + 1][1]) / 2 + oy);
      }
      ctx.lineTo(L[this.n - 1][0] + ox, L[this.n - 1][1] + oy);
      ctx.lineTo(R[this.n - 1][0] + ox, R[this.n - 1][1] + oy);
      for (let i = this.n - 2; i > 0; i--) {
        ctx.quadraticCurveTo(R[i][0] + ox, R[i][1] + oy, (R[i][0] + R[i - 1][0]) / 2 + ox, (R[i][1] + R[i - 1][1]) / 2 + oy);
      }
      ctx.closePath();
    }

    // Applies the leap's "closer to the viewer" scale around the fish centre
    withLift(ctx, fn) {
      const h = this.height();
      if (!h) return fn();
      const c = this.pts[(this.n / 2) | 0], s = 1 + 0.55 * h;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(s, s);
      ctx.translate(-c.x, -c.y);
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

    drawFin(ctx, x, y, ang, len, wid) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
      ctx.quadraticCurveTo(len * 0.5, wid * 0.4, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    draw(ctx, L, R) {
      const p = this.pts, n = this.n;
      const sw = Math.sin(this.phase * 1.4);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(60,58,55,0.28)";

      // fins
      ctx.fillStyle = this.fin;
      const fp = p[2], fA = Math.atan2(p[1].y - p[3].y, p[1].x - p[3].x);
      const fl = this.len * 0.17, fw = this.len * 0.065;
      const spread = this.leap ? 1.25 : 0.9;
      this.drawFin(ctx, fp.x, fp.y, fA + Math.PI - spread - sw * 0.25, fl, fw);
      this.drawFin(ctx, fp.x, fp.y, fA + Math.PI + spread + sw * 0.25, fl, -fw);
      const pp = p[6], pA = Math.atan2(p[5].y - p[7].y, p[5].x - p[7].x);
      this.drawFin(ctx, pp.x, pp.y, pA + Math.PI - 0.7 + sw * 0.2, fl * 0.55, fw * 0.6);
      this.drawFin(ctx, pp.x, pp.y, pA + Math.PI + 0.7 - sw * 0.2, fl * 0.55, -fw * 0.6);

      // flowing tail
      const tp = p[n - 1], tA = Math.atan2(p[n - 1].y - p[n - 2].y, p[n - 1].x - p[n - 2].x) + sw * 0.35;
      const tl = this.len * 0.24;
      ctx.save();
      ctx.translate(tp.x, tp.y);
      ctx.rotate(tA);
      ctx.beginPath();
      ctx.moveTo(-this.seg * 0.5, 0);
      ctx.bezierCurveTo(tl * 0.4, -tl * 0.12, tl * 0.8, -tl * 0.55, tl, -tl * 0.42);
      ctx.quadraticCurveTo(tl * 0.62, 0, tl, tl * 0.42);
      ctx.bezierCurveTo(tl * 0.8, tl * 0.55, tl * 0.4, tl * 0.12, -this.seg * 0.5, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // body
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.fillStyle = this.v.body;
      ctx.fill();

      // watercolour patches (soft halo + core), clipped to the body
      ctx.save();
      ctx.clip();
      for (const [si, lat, rf, col] of this.patches) {
        const i = Math.min(n - 2, Math.floor(si)), f = si - i;
        const x = p[i].x + (p[i + 1].x - p[i].x) * f;
        const y = p[i].y + (p[i + 1].y - p[i].y) * f;
        const ang = Math.atan2(p[i].y - p[i + 1].y, p[i].x - p[i + 1].x);
        const w = this.width * profile(si / (n - 1));
        const cx = x - Math.sin(ang) * lat * w, cy = y + Math.cos(ang) * lat * w;
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.width * rf * 1.25, this.width * rf * 0.95, ang, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.width * rf, this.width * rf * 0.72, ang, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // light along the back
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = this.width * 0.3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p[1].x, p[1].y);
      for (let i = 2; i < n - 3; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.stroke();
      ctx.restore();

      // fine ink outline
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = this.dark ? "rgba(20,20,22,0.6)" : "rgba(60,58,55,0.32)";
      ctx.stroke();

      // eyes
      const hA = Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x), ew = this.width * 0.62;
      const ex = p[0].x + Math.cos(hA) * this.width * 0.35, ey = p[0].y + Math.sin(hA) * this.width * 0.35;
      ctx.fillStyle = "#1b1b1b";
      ctx.beginPath();
      ctx.arc(ex - Math.sin(hA) * ew, ey + Math.cos(hA) * ew, this.width * 0.12, 0, TAU);
      ctx.arc(ex + Math.sin(hA) * ew, ey - Math.cos(hA) * ew, this.width * 0.12, 0, TAU);
      ctx.fill();
    }
  }

  /* ------------------- watercolour lily pads + lotus ------------------- */
  const PAD_TONES = [
    ["rgba(214,168,128,0.42)", "rgba(176,128,92,0.35)"],  // terracotta wash
    ["rgba(150,168,176,0.40)", "rgba(102,120,130,0.35)"], // blue-grey wash
    ["rgba(150,152,150,0.30)", "rgba(110,112,112,0.32)"],  // ink grey
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
      // irregular watercolour edge
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
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const s = 1 + Math.sin(this.bob) * 0.012;
      ctx.scale(s, s);
      // soft bleed, then body wash, then darker pooled edge
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
            const a = (i / k) * TAU + layer * 0.4;
            ctx.save();
            ctx.rotate(a);
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

  /* ------------------------------ Pond ------------------------------ */
  function KoiPond(canvas) {
    const ctx = canvas.getContext("2d");
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, unit = 100;
    let koi = [], pads = [], ripples = [], food = [], drops = [];
    let pattern = null;
    let running = false, raf = 0, last = 0, t = 0, nextLeap = 240;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      for (const c of [canvas, layer]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const newUnit = Math.max(80, Math.min(140, Math.min(W, H) * 0.25));
      if (!koi.length || Math.abs(newUnit - unit) > 20) {
        unit = newUnit;
        const count = W * H > 700000 ? 8 : 6;
        koi = Array.from({ length: count }, () => new Koi(W, H, unit));
        pads = Array.from({ length: W > 700 ? 6 : 4 }, () => new LilyPad(W, H, unit));
      }
      if (!reduced) frame(performance.now(), true);
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
      const dt = Math.min(3, (now - last) / 16.67 || 1);
      last = now; t += dt;
      ctx.clearRect(0, 0, W, H);

      // faint shimmering water lines
      if (pattern) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.translate((t * 0.12) % 512, (t * 0.06) % 512);
        ctx.scale(2, 2);
        ctx.fillStyle = pattern;
        ctx.fillRect(-256, -256, W / 2 + 512, H / 2 + 512);
        ctx.restore();
      }

      // food
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

      // update fish
      const outlines = [];
      for (const k of koi) {
        if (!once) k.update(dt, W, H, food);
        if (k.leap && k.leap.t >= 1) { splash(k.pts[0].x, k.pts[0].y, true); k.leap = null; }
        // droplets trailing from the tail while airborne
        if (k.leap && Math.random() < 0.35 * dt) {
          const tp = k.pts[k.n - 1];
          drops.push({ x: tp.x, y: tp.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), z: k.height() * 30, vz: rand(-0.2, 0.6), r: rand(1, 2) });
        }
        outlines.push(k.outline());
      }

      // underwater koi: painted on a separate layer, then washed into the water
      lctx.clearRect(0, 0, W, H);
      lctx.fillStyle = "rgba(70,95,105,0.16)";
      koi.forEach((k, i) => { if (!k.leap) k.drawShadow(lctx, outlines[i][0], outlines[i][1]); });
      koi.forEach((k, i) => { if (!k.leap) k.draw(lctx, outlines[i][0], outlines[i][1]); });
      lctx.save();
      lctx.globalCompositeOperation = "source-atop";
      lctx.fillStyle = "rgba(214,228,232,0.3)"; // water tint
      lctx.fillRect(0, 0, W, H);
      lctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.drawImage(layer, 0, 0, W, H);
      ctx.restore();

      // lily pads on the surface
      for (const p of pads) { if (!once) p.update(dt, W, H); p.draw(ctx); }

      // ripples
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

      // water droplets
      for (const d of drops) {
        d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; d.vz -= 0.12 * dt;
        d.vx *= 0.985; d.vy *= 0.985;
        const s = 1 + Math.max(0, d.z) * 0.03;
        ctx.fillStyle = "rgba(120,155,168,0.55)";
        ctx.beginPath(); ctx.arc(d.x, d.y - Math.max(0, d.z) * 0.6, d.r * s, 0, TAU); ctx.fill();
      }
      drops = drops.filter((d) => d.z > -2);

      if (!once && Math.random() < 0.003 * dt) addRipple(rand(0, W), rand(0, H), false);

      if (running && !once) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!pattern) pattern = ctx.createPattern(makeCausticTile(256), "repeat");
      if (!W) resize();
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

    window.addEventListener("resize", () => { if (running || reduced) resize(); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (running) { stop(); running = "paused"; } }
      else if (running === "paused") { running = false; start(); }
    });

    return { start, stop, addRipple, resize, leap: scheduleLeap };
  }

  window.KoiPond = KoiPond;
})();
