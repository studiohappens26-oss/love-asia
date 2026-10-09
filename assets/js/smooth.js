/*
 * Smooth wheel scrolling (Lenis) for mouse and trackpad users on bigger screens.
 * Phones and tablets keep their native touch scrolling, and people who ask for
 * reduced motion keep normal scrolling, so the library isn't even downloaded for them.
 */
(function () {
  "use strict";
  const mq = (q) => window.matchMedia(q).matches;
  if (!mq("(hover: hover) and (pointer: fine)") || mq("(prefers-reduced-motion: reduce)")) return;

  const me = document.currentScript;
  const s = document.createElement("script");
  s.src = me.src.replace(/js\/smooth\.js.*$/, "vendor/lenis.min.js");
  s.onload = () => {
    if (!window.Lenis) return;
    const header = document.querySelector(".site-header, .topbar");
    const lenis = new window.Lenis({
      lerp: 0.1,
      autoRaf: true,
      // in-page links (#menu, #visit…) glide too, stopping below the fixed header
      anchors: { offset: -((header && header.offsetHeight) || 64) - 12 },
      // the section sheet, map and form fields scroll on their own
      prevent: (node) => !!(node.closest && node.closest(".sheet, iframe, textarea, select")),
    });
    // Lenis does the smoothing, so the browser's own smooth scroll must be off
    document.documentElement.style.scrollBehavior = "auto";
    window.smoothScroll = lenis;
  };
  document.head.appendChild(s);
})();
