#!/usr/bin/env node
/*
 * Static site build — no dependencies, just Node 18+.
 *   node src/build.mjs        → writes the site into dist/
 * Menu content comes from assets/js/menu-data.js; business details from src/site.mjs.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { SITE_URL, BASE_PATH, head, logoSvg, siteHeader, siteFooter } from "./site.mjs";
import { homePage } from "./pages/home.mjs";
import { chooserPage, menuPage } from "./pages/menu.mjs";
import { eventsPage } from "./pages/events.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");

// menu-data.js is a browser script (window.LOVE_ASIA = …); run it in a sandbox
function loadMenu() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(join(ROOT, "assets/js/menu-data.js"), "utf8"), sandbox);
  return sandbox.window.LOVE_ASIA;
}

function write(path, html) {
  const file = join(OUT, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log("  " + path.padEnd(22) + (html.length / 1024).toFixed(1) + " KB");
}

function notFoundPage() {
  // served for any missing URL at any depth, so links must be absolute
  const root = BASE_PATH;
  return `${head({ title: "Page not found — Love Asia", description: "This page doesn't exist. Head back to Love Asia's home page or menu.", path: "404.html", root, css: ["assets/css/style.css", "assets/css/site.css"], noindex: true })}
<body class="page-404">
${siteHeader({ root, current: "" })}
<main id="main" class="sub-main">
  <section class="sub-hero"><div class="panel panel--hero">
    <span class="seal" aria-hidden="true">鯉</span>
    <h1>This koi swam away</h1>
    <p class="lede">We couldn't find that page. Try the menu, or head back home.</p>
    <div class="cta-row"><a class="btn btn--ink" href="${root}menu/">View the menu</a><a class="btn" href="${root}">Home</a></div>
  </div></section>
</main>
${siteFooter({ root })}
</body>
</html>`;
}

function build() {
  const DATA = loadMenu();
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  mkdirSync(OUT, { recursive: true });

  console.log("Building pages:");
  const pages = [
    ["index.html", homePage(DATA), "", "1.0", "weekly"],
    ["menu/index.html", chooserPage(DATA), "menu/", "0.9", "monthly"],
    ["non-veg/index.html", menuPage(DATA, "nonveg"), "non-veg/", "0.9", "monthly"],
    ["veg/index.html", menuPage(DATA, "veg"), "veg/", "0.9", "monthly"],
    ["events/index.html", eventsPage(), "events/", "0.8", "monthly"],
  ];
  for (const [file, html] of pages) write(file, html);
  write("404.html", notFoundPage());

  const today = new Date().toISOString().slice(0, 10);
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([, , p, pr, cf]) => `  <url><loc>${SITE_URL}/${p}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`);
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  writeFileSync(join(OUT, ".nojekyll"), "");

  cpSync(join(ROOT, "assets"), join(OUT, "assets"), { recursive: true });
  console.log(`Done → ${OUT}`);
}

build();
