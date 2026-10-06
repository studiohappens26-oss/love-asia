/*
 * Bamboo grove — inline SVG stalks that sway with CSS transforms only
 * (GPU-composited, no per-frame JavaScript), plus drifting leaves.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  const LEAF = "M0 0 C 14 -7, 46 -8, 78 0 C 46 6, 14 6, 0 0 Z";

  function leafCluster(g, x, y, dir, scale, tone) {
    const c = el("g", { class: "leaf-cluster", transform: `translate(${x} ${y})` });
    const inner = el("g", { class: "leaf-flutter" });
    inner.style.animationDelay = `${-rand(0, 4).toFixed(2)}s`;
    inner.style.animationDuration = `${rand(2.6, 4.2).toFixed(2)}s`;
    const count = 3 + ((Math.random() * 3) | 0);
    for (let i = 0; i < count; i++) {
      const ang = dir * (rand(10, 55)) + (dir < 0 ? 180 : 0) + rand(-8, 8);
      const s = scale * rand(0.75, 1.15);
      inner.appendChild(el("path", {
        d: LEAF,
        fill: tone[(Math.random() * tone.length) | 0],
        transform: `rotate(${ang.toFixed(1)}) scale(${s.toFixed(2)})`,
      }));
    }
    c.appendChild(inner);
    g.appendChild(c);
  }

  /* One stalk = its own <svg>, anchored at the bottom, swaying from its base. */
  function stalk(opts) {
    const { height, width, left, depth } = opts;
    const svgW = 260;
    const svg = el("svg", {
      class: `bamboo-stalk depth-${depth}`,
      viewBox: `0 0 ${svgW} ${height}`,
      width: svgW,
      height,
      "aria-hidden": "true",
    });
    svg.style.left = `${left}px`;
    svg.style.animationDuration = `${rand(5, 8).toFixed(2)}s`;
    svg.style.animationDelay = `${-rand(0, 6).toFixed(2)}s`;
    svg.style.setProperty("--sway", `${rand(1.4, 3).toFixed(2)}deg`);

    const tones = {
      1: { stem: ["#4f8a3c", "#7cb35b", "#3e6f2f"], node: "#35602a", leaves: ["#4c8f3a", "#5fa646", "#3d7a2e"] },
      2: { stem: ["#7fae6a", "#a7cf8c", "#6a9b57"], node: "#5d8a4c", leaves: ["#86b96b", "#9ccb80", "#76a95c"] },
      3: { stem: ["#b7d3a6", "#d1e6c3", "#a5c592"], node: "#98b886", leaves: ["#b9d7a7", "#c8e2b8"] },
    }[depth];

    const gid = `bg${Math.random().toString(36).slice(2, 8)}`;
    const defs = el("defs", {});
    const grad = el("linearGradient", { id: gid, x1: "0", x2: "1", y1: "0", y2: "0" });
    grad.appendChild(el("stop", { offset: "0", "stop-color": tones.stem[2] }));
    grad.appendChild(el("stop", { offset: "0.45", "stop-color": tones.stem[1] }));
    grad.appendChild(el("stop", { offset: "1", "stop-color": tones.stem[0] }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    const cx = svgW / 2;
    const g = el("g", {});
    svg.appendChild(g);

    // stem segments with nodes
    let y = height;
    const segH = rand(95, 140) * (width / 22);
    while (y > 30) {
      const h = Math.min(segH * rand(0.85, 1.1), y - 10);
      g.appendChild(el("rect", { x: cx - width / 2, y: y - h, width, height: h - 3, rx: width * 0.25, fill: `url(#${gid})` }));
      g.appendChild(el("rect", { x: cx - width / 2 - 2, y: y - h - 3, width: width + 4, height: 6, rx: 3, fill: tones.node }));
      // little highlight
      g.appendChild(el("rect", { x: cx - width * 0.22, y: y - h + 8, width: width * 0.12, height: h - 22, rx: 2, fill: "rgba(255,255,255,0.18)" }));
      y -= h;
      // branches + leaves on upper portion
      if (y < height * 0.72 && Math.random() < 0.75) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        const bx = cx + dir * width * 0.5, by = y;
        const ex = bx + dir * rand(28, 60), ey = by - rand(18, 50);
        g.appendChild(el("path", { d: `M${bx} ${by} Q ${(bx + ex) / 2} ${by - 6} ${ex} ${ey}`, stroke: tones.node, "stroke-width": 2.5, fill: "none", "stroke-linecap": "round" }));
        leafCluster(g, ex, ey, dir, width / 22, tones.leaves);
      }
    }
    // crown
    leafCluster(g, cx, y + 6, -1, width / 22, tones.leaves);
    leafCluster(g, cx, y + 6, 1, width / 22, tones.leaves);
    return svg;
  }

  function fallingLeaves(container, n) {
    for (let i = 0; i < n; i++) {
      const wrap = document.createElement("div");
      wrap.className = "falling-leaf";
      wrap.style.left = `${rand(0, 100).toFixed(1)}%`;
      wrap.style.animationDuration = `${rand(11, 19).toFixed(1)}s`;
      wrap.style.animationDelay = `${-rand(0, 18).toFixed(1)}s`;
      const leaf = document.createElement("div");
      leaf.className = "falling-leaf__inner";
      leaf.style.animationDuration = `${rand(2.4, 4).toFixed(1)}s`;
      leaf.innerHTML = `<svg viewBox="-2 -10 82 20" width="${rand(22, 34).toFixed(0)}" aria-hidden="true"><path d="${LEAF}" fill="${["#6aa84f", "#8cc06b", "#a9c86a"][i % 3]}"/></svg>`;
      wrap.appendChild(leaf);
      container.appendChild(wrap);
    }
  }

  function BambooGrove(root) {
    let built = false;
    let lastW = 0;

    function build() {
      const W = window.innerWidth, H = window.innerHeight;
      if (built && Math.abs(W - lastW) < 80) return;
      lastW = W;
      root.innerHTML = "";
      const tall = H * 1.08;

      const far = document.createElement("div"); far.className = "bamboo-layer bamboo-far";
      const mid = document.createElement("div"); mid.className = "bamboo-layer bamboo-mid";
      const near = document.createElement("div"); near.className = "bamboo-layer bamboo-near";

      // distant grove across the whole width
      const farCount = Math.max(5, Math.round(W / 70));
      for (let i = 0; i < farCount; i++) {
        far.appendChild(stalk({ height: tall * rand(0.85, 1), width: rand(9, 13), left: (i / farCount) * W - 130 + rand(-15, 15), depth: 3 }));
      }
      // mid layer, framing the sides
      const midSpots = W < 600 ? [-0.06, 0.04, 0.9, 1.0] : [-0.04, 0.05, 0.14, 0.83, 0.93, 1.02];
      midSpots.forEach((p) => mid.appendChild(stalk({ height: tall * rand(0.9, 1), width: rand(14, 18), left: p * W - 130, depth: 2 })));
      // near layer: big stalks at the edges
      const nearSpots = W < 600 ? [-0.11, 1.06] : [-0.05, 0.08, 0.95, 1.07];
      nearSpots.forEach((p) => near.appendChild(stalk({ height: tall, width: rand(22, 28), left: p * W - 130, depth: 1 })));

      const leaves = document.createElement("div"); leaves.className = "bamboo-layer bamboo-leaves";
      fallingLeaves(leaves, W < 600 ? 7 : 12);

      root.append(far, mid, near, leaves);
      built = true;
    }

    let t = 0;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => { if (built) build(); }, 200);
    });

    return { build };
  }

  window.BambooGrove = BambooGrove;
})();
