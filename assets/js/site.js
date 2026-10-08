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

  // the Google map is only loaded when asked for (keeps the page light)
  const map = document.getElementById("map");
  if (map) {
    map.querySelector(".map__load").addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.title = "Map showing Love Asia in Kothanur, Hennur, Bengaluru";
      f.src = map.dataset.src;
      f.referrerPolicy = "no-referrer-when-downgrade";
      map.replaceChildren(f);
    });
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
