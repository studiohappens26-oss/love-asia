/*
 * Koi pond — a single lightweight <canvas> with:
 *   - shimmering caustic light (one pre-rendered tile, drifted in two layers)
 *   - procedurally drawn koi that wander, wiggle and come to taps ("food")
 *   - floating lily pads and tap ripples
 * Pauses automatically when hidden or stopped. No dependencies.
 */
(function () {
  "use strict";

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // Koi varieties: base body colour + patch colours
  const VARIETIES = [
    { body: "#f7f3ea", patches: ["#e8481c", "#e8481c", "#d63d14"] }, // Kohaku
    { body: "#f6f2e8", patches: ["#e04a1a", "#1d1d1f", "#e04a1a"] }, // Sanke
    { body: "#1f1f22", patches: ["#e8521d", "#f5f1e6", "#e8521d"] }, // Showa
    { body: "#f2a51c", patches: ["#f8c64a"] },                         // Yamabuki ogon
    { body: "#ef6a1f", patches: ["#f7f3ea", "#ef6a1f"] },              // Orange
    { body: "#f6f3ec", patches: ["#f6f3ec"] },                         // Platinum
  ];

  // Body width along the spine (t: 0 = head, 1 = tail)
  const profile = (t) => Math.max(0.05, (Math.pow(1 - t, 1.2) * (0.55 + 1.8 * t)) / 0.72);

  /* ---------- caustics tile (Voronoi edge brightness, tileable) ---------- */
  function makeCausticTile(size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const img = g.createImageData(size, size);
    const pts = [];
    for (let i = 0; i < 18; i++) pts.push([Math.random() * size, Math.random() * size]);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let f1 = 1e9, f2 = 1e9;
        for (let i = 0; i < pts.length; i++) {
          let dx = Math.abs(x - pts[i][0]); if (dx > size / 2) dx = size - dx;
          let dy = Math.abs(y - pts[i][1]); if (dy > size / 2) dy = size - dy;
          const d = dx * dx + dy * dy;
          if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
        }
        const edge = Math.sqrt(f2) - Math.sqrt(f1);
        const v = Math.max(0, 1 - edge / 9);
        const a = Math.pow(v, 2.2) * 255;
        const o = (y * size + x) * 4;
        img.data[o] = 210; img.data[o + 1] = 255; img.data[o + 2] = 250; img.data[o + 3] = a;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* ------------------------------ Koi ------------------------------ */
  class Koi {
    constructor(W, H, unit) {
      this.len = rand(0.8, 1.25) * unit;
      this.n = 12;
      this.seg = this.len / this.n;
      this.width = this.len * 0.13;
      this.x = rand(0, W); this.y = rand(0, H);
      this.a = rand(0, TAU);
      this.turn = 0;
      this.baseSpeed = rand(0.55, 0.9) * (unit / 100);
      this.speed = this.baseSpeed;
      this.phase = rand(0, TAU);
      this.v = pick(VARIETIES);
      this.fin = this.v.body === "#1f1f22" ? "rgba(60,60,66,0.55)" : "rgba(255,246,235,0.55)";
      this.pts = [];
      for (let i = 0; i < this.n; i++) {
        this.pts.push({ x: this.x - Math.cos(this.a) * this.seg * i, y: this.y - Math.sin(this.a) * this.seg * i });
      }
      // patches: [spine index (float), lateral offset (-1..1), radius factor, colour]
      this.patches = [];
      const count = this.v.patches.length === 1 && this.v.patches[0] === this.v.body ? 0 : (3 + (Math.random() * 3) | 0);
      for (let i = 0; i < count; i++) {
        this.patches.push([rand(0.5, this.n * 0.75), rand(-0.9, 0.9), rand(0.7, 1.4), pick(this.v.patches)]);
      }
    }

    update(dt, W, H, food, t) {
      const margin = this.len * 0.6;
      let desired = null;

      // swim toward nearest food if close enough
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
      // steer back into the pond near edges
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
      this.turn = Math.max(-0.045, Math.min(0.045, this.turn));

      // gentle swimming undulation
      this.phase += 0.09 * dt * (0.6 + this.speed / this.baseSpeed * 0.6);
      this.a += this.turn * dt + Math.sin(this.phase) * 0.012 * dt;

      this.x += Math.cos(this.a) * this.speed * dt;
      this.y += Math.sin(this.a) * this.speed * dt;

      // follow-the-leader spine
      const p = this.pts;
      p[0].x = this.x; p[0].y = this.y;
      for (let i = 1; i < this.n; i++) {
        const dx = p[i].x - p[i - 1].x, dy = p[i].y - p[i - 1].y;
        const d = Math.hypot(dx, dy) || 1;
        p[i].x = p[i - 1].x + (dx / d) * this.seg;
        p[i].y = p[i - 1].y + (dy / d) * this.seg;
      }
    }

    // Returns left & right outline points
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
      ctx.arc(head.x + ox, head.y + oy, hw, hA - Math.PI / 2, hA + Math.PI / 2, true);
      // left side head -> tail
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

    drawShadow(ctx, L, R) {
      const off = this.len * 0.12;
      this.bodyPath(ctx, L, R, off * 0.6, off);
      ctx.fill();
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
      ctx.restore();
    }

    draw(ctx, L, R) {
      const p = this.pts, n = this.n;
      const sw = Math.sin(this.phase * 1.4);

      // pectoral fins
      ctx.fillStyle = this.fin;
      const fp = p[2], fA = Math.atan2(p[1].y - p[3].y, p[1].x - p[3].x);
      const fl = this.len * 0.16, fw = this.len * 0.06;
      this.drawFin(ctx, fp.x, fp.y, fA + Math.PI - 0.9 - sw * 0.25, fl, fw);
      this.drawFin(ctx, fp.x, fp.y, fA + Math.PI + 0.9 + sw * 0.25, fl, -fw);
      // pelvic fins
      const pp = p[6], pA = Math.atan2(p[5].y - p[7].y, p[5].x - p[7].x);
      this.drawFin(ctx, pp.x, pp.y, pA + Math.PI - 0.7 + sw * 0.2, fl * 0.55, fw * 0.6);
      this.drawFin(ctx, pp.x, pp.y, pA + Math.PI + 0.7 - sw * 0.2, fl * 0.55, -fw * 0.6);

      // tail fan
      const tp = p[n - 1], tA = Math.atan2(p[n - 1].y - p[n - 2].y, p[n - 1].x - p[n - 2].x) + sw * 0.35;
      const tl = this.len * 0.22;
      ctx.save();
      ctx.translate(tp.x, tp.y);
      ctx.rotate(tA);
      ctx.beginPath();
      ctx.moveTo(-this.seg * 0.5, 0);
      ctx.bezierCurveTo(tl * 0.4, -tl * 0.15, tl * 0.8, -tl * 0.55, tl, -tl * 0.45);
      ctx.quadraticCurveTo(tl * 0.65, 0, tl, tl * 0.45);
      ctx.bezierCurveTo(tl * 0.8, tl * 0.55, tl * 0.4, tl * 0.15, -this.seg * 0.5, 0);
      ctx.fill();
      ctx.restore();

      // body
      this.bodyPath(ctx, L, R, 0, 0);
      ctx.fillStyle = this.v.body;
      ctx.fill();

      // patches (clipped to the body)
      if (this.patches.length) {
        ctx.save();
        ctx.clip();
        for (const [si, lat, rf, col] of this.patches) {
          const i = Math.min(n - 2, Math.floor(si)), f = si - i;
          const x = p[i].x + (p[i + 1].x - p[i].x) * f;
          const y = p[i].y + (p[i + 1].y - p[i].y) * f;
          const ang = Math.atan2(p[i].y - p[i + 1].y, p[i].x - p[i + 1].x);
          const w = this.width * profile(si / (n - 1));
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(x - Math.sin(ang) * lat * w, y + Math.cos(ang) * lat * w, this.width * rf, this.width * rf * 0.75, ang, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }

      // soft back highlight
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = this.width * 0.35;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p[1].x, p[1].y);
      for (let i = 2; i < n - 3; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.stroke();

      // eyes
      const hA = Math.atan2(p[0].y - p[1].y, p[0].x - p[1].x), ew = this.width * 0.62;
      const ex = p[0].x + Math.cos(hA) * this.width * 0.35, ey = p[0].y + Math.sin(hA) * this.width * 0.35;
      ctx.fillStyle = "#151515";
      ctx.beginPath();
      ctx.arc(ex - Math.sin(hA) * ew, ey + Math.cos(hA) * ew, this.width * 0.13, 0, TAU);
      ctx.arc(ex + Math.sin(hA) * ew, ey - Math.cos(hA) * ew, this.width * 0.13, 0, TAU);
      ctx.fill();
    }
  }

  /* ---------------------------- Lily pads ---------------------------- */
  class LilyPad {
    constructor(W, H, unit) {
      this.r = rand(0.28, 0.45) * unit;
      this.x = rand(0, W); this.y = rand(0, H);
      this.rot = rand(0, TAU);
      this.vx = rand(-0.06, 0.06); this.vy = rand(-0.04, 0.04);
      this.vr = rand(-0.0008, 0.0008);
      this.flower = Math.random() < 0.4;
    }
    update(dt, W, H) {
      this.x += this.vx * dt; this.y += this.vy * dt; this.rot += this.vr * dt;
      const r = this.r * 1.2;
      if (this.x < -r) this.x = W + r; if (this.x > W + r) this.x = -r;
      if (this.y < -r) this.y = H + r; if (this.y > H + r) this.y = -r;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.fillStyle = "rgba(0,20,25,0.25)";
      ctx.beginPath();
      ctx.moveTo(this.r * 0.15 + 6, 8);
      ctx.arc(6, 8, this.r, 0.25, TAU - 0.25);
      ctx.closePath();
      ctx.fill();
      const g = ctx.createRadialGradient(-this.r * 0.3, -this.r * 0.3, 0, 0, 0, this.r);
      g.addColorStop(0, "#7fbf5a");
      g.addColorStop(1, "#3f8a3a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.r, 0.25, TAU - 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(30,80,30,0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const a = 0.5 + i * 0.75;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * this.r * 0.9, Math.sin(a) * this.r * 0.9);
        ctx.stroke();
      }
      if (this.flower) {
        const fr = this.r * 0.38;
        for (let layer = 0; layer < 2; layer++) {
          ctx.fillStyle = layer ? "#fff1f4" : "#f4a6bd";
          for (let i = 0; i < 8; i++) {
            const a = i * (TAU / 8) + layer * 0.4;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * fr * 0.45, Math.sin(a) * fr * 0.45 - this.r * 0.15, fr * (layer ? 0.38 : 0.5), fr * 0.2, a, 0, TAU);
            ctx.fill();
          }
        }
        ctx.fillStyle = "#f6c945";
        ctx.beginPath();
        ctx.arc(0, -this.r * 0.15, fr * 0.18, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ------------------------------ Pond ------------------------------ */
  function KoiPond(canvas) {
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1, unit = 100;
    let koi = [], pads = [], ripples = [], food = [];
    let caustic = null, pattern = null;
    let running = false, raf = 0, last = 0, t = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); // water is soft; saves fill-rate on phones
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const newUnit = Math.max(80, Math.min(150, Math.min(W, H) * 0.26));
      if (!koi.length || Math.abs(newUnit - unit) > 20) {
        unit = newUnit;
        const count = W * H > 700000 ? 9 : 6;
        koi = Array.from({ length: count }, () => new Koi(W, H, unit));
        pads = Array.from({ length: W > 700 ? 5 : 3 }, () => new LilyPad(W, H, unit));
      }
      if (!reduced) frame(performance.now(), true);
    }

    function addRipple(x, y, withFood) {
      ripples.push({ x, y, r: 2, life: 1 });
      if (withFood) {
        food.push({ x, y, life: 1, eaten: false });
        if (food.length > 4) food.shift();
      }
    }

    function frame(now, once) {
      const dt = Math.min(3, (now - last) / 16.67 || 1);
      last = now; t += dt;
      ctx.clearRect(0, 0, W, H);

      // caustics: two layers drifting in different directions
      if (pattern) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.11;
        ctx.translate((t * 0.15) % 512, (t * 0.08) % 512);
        ctx.scale(2, 2);
        ctx.fillStyle = pattern;
        ctx.fillRect(-256, -256, W / 2 + 512, H / 2 + 512);
        ctx.restore();
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.08;
        ctx.translate(-((t * 0.11) % 384), (t * 0.13) % 384);
        ctx.scale(1.5, 1.5);
        ctx.rotate(0.6);
        ctx.fillStyle = pattern;
        ctx.fillRect(-512, -512, W + 1024, H + 1024);
        ctx.restore();
      }

      // food pellets
      for (const f of food) {
        f.life -= 0.0025 * dt;
        ctx.fillStyle = `rgba(150,95,40,${Math.max(0, f.life)})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, TAU);
        ctx.arc(f.x + 6, f.y - 3, 2.5, 0, TAU);
        ctx.arc(f.x - 4, f.y + 5, 2, 0, TAU);
        ctx.fill();
      }
      food = food.filter((f) => !f.eaten && f.life > 0);

      // fish
      const outlines = [];
      for (const k of koi) {
        if (!once) k.update(dt, W, H, food, t);
        outlines.push(k.outline());
      }
      ctx.fillStyle = "rgba(0,25,35,0.22)";
      koi.forEach((k, i) => k.drawShadow(ctx, outlines[i][0], outlines[i][1]));
      koi.forEach((k, i) => k.draw(ctx, outlines[i][0], outlines[i][1]));

      // lily pads float above the fish
      for (const p of pads) { if (!once) p.update(dt, W, H); p.draw(ctx); }

      // ripples
      for (const r of ripples) {
        r.r += 1.4 * dt; r.life -= 0.012 * dt;
        ctx.strokeStyle = `rgba(220,255,255,${Math.max(0, r.life) * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
        if (r.r > 18) { ctx.beginPath(); ctx.arc(r.x, r.y, r.r - 16, 0, TAU); ctx.stroke(); }
      }
      ripples = ripples.filter((r) => r.life > 0);

      // occasional ambient ripple
      if (!once && Math.random() < 0.004 * dt) addRipple(rand(0, W), rand(0, H), false);

      if (running && !once) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!caustic) {
        caustic = makeCausticTile(256);
        pattern = ctx.createPattern(caustic, "repeat");
      }
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

    return { start, stop, addRipple, resize };
  }

  window.KoiPond = KoiPond;
})();
