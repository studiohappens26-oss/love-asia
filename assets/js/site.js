/* Home & events pages: sticky header state, events background, enquiry → WhatsApp. */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // events page: the bamboo grove from the veg menu as a fixed backdrop
  const grove = document.getElementById("grove");
  if (grove && window.BambooGrove && document.body.classList.contains("page-events")) window.BambooGrove(grove).build();

  // paper grain on the backgrounds
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 140;
    const g = c.getContext("2d");
    const img = g.createImageData(140, 140);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() < 0.5 ? 60 : 255;
      img.data[i + 3] = Math.random() * 22;
    }
    g.putImageData(img, 0, 0);
    document.documentElement.style.setProperty("--grain", `url(${c.toDataURL()})`);
  } catch (e) { /* decorative */ }

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
