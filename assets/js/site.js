/* Home & events pages: header state, map on demand, party enquiry → WhatsApp. */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  if (header) {
    let on = null;
    const onScroll = () => {
      const s = window.scrollY > 40;
      if (s !== on) { on = s; header.classList.toggle("is-scrolled", s); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // The Google map loads by itself as you scroll near it (it's heavy, so not with the
  // page); the "Show map" button is a fallback for older browsers or a tap before then.
  const map = document.getElementById("map");
  if (map) {
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      const f = document.createElement("iframe");
      f.title = "Map showing Love Asia in Kothanur, Hennur, Bengaluru";
      f.src = map.dataset.src;
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.loading = "lazy";
      map.replaceChildren(f);
    };
    map.querySelector(".map__load").addEventListener("click", load);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: "600px 0px" });
      io.observe(map);
    }
  }

  // signature dishes slider: arrow buttons step one card at a time
  const slider = document.getElementById("sig-slider");
  if (slider) {
    const btns = document.querySelectorAll(".sig-nav__btn");
    const step = () => { const c = slider.querySelector(".sig"); return c ? c.offsetWidth + 12 : slider.clientWidth * 0.8; };
    const sync = () => {
      const max = slider.scrollWidth - slider.clientWidth - 2;
      btns.forEach((b) => { b.disabled = b.dataset.dir === "-1" ? slider.scrollLeft <= 2 : slider.scrollLeft >= max; });
    };
    btns.forEach((b) => b.addEventListener("click", () => slider.scrollBy({ left: step() * +b.dataset.dir, behavior: "smooth" })));
    slider.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  // party enquiry: compose a WhatsApp message from the form
  const form = document.getElementById("enquiry");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const date = f.get("date") ? new Date(f.get("date") + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "flexible";
      const lines = [
        "Hi Love Asia! I'd like to plan a party.",
        `Name: ${f.get("name")}`,
        `Occasion: ${f.get("occasion")}`,
        `Date: ${date}`,
        `Guests: ${f.get("guests") || "not sure yet"}`,
        `Food: ${f.get("food")}`,
      ];
      if ((f.get("notes") || "").trim()) lines.push(`Notes: ${f.get("notes").trim()}`);
      const base = form.getAttribute("action").split("?")[0];
      window.open(`${base}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
    });
  }
})();
