/*
 * LOVE ASIA — MENU DATA
 * ---------------------------------------------------------------
 * This is the only file you need to edit to change the menu.
 *
 *   veg:   true  -> shown in BOTH the Veg (bamboo) and Non-Veg (koi) menus
 *          false -> shown only in the Non-Veg (koi) menu
 *   price: number (currency symbol comes from CURRENCY below)
 *   desc:  optional short description
 *   tags:  optional — any of "spicy", "chef", "new", "jain"
 *
 * NOTE: The items below are SAMPLE placeholders. Replace them with the
 * items from the printed Love Asia menu.
 */

window.LOVE_ASIA = {
  name: "Love Asia",
  tagline: "Pan-Asian Kitchen",
  currency: "₹",

  /* Photos/scans of the printed menu. Put files in assets/menu/ and list
     them here — a "View printed menu" button appears automatically. */
  menuPages: [
    // "assets/menu/page-1.jpg",
  ],

  categories: [
    {
      id: "soups",
      name: "Soups",
      items: [
        { name: "Tom Yum", desc: "Hot & sour lemongrass broth, galangal, kaffir lime", price: 229, veg: true, tags: ["spicy"] },
        { name: "Tom Yum Chicken", desc: "Hot & sour lemongrass broth with chicken", price: 259, veg: false, tags: ["spicy"] },
        { name: "Manchow Soup", desc: "Dark soy broth, crispy noodles", price: 199, veg: true },
        { name: "Lemon Coriander Prawn", desc: "Clear broth, fresh coriander, lemon", price: 289, veg: false },
      ],
    },
    {
      id: "dimsum",
      name: "Dim Sum",
      items: [
        { name: "Crystal Vegetable Dumpling", desc: "Translucent wrapper, garden vegetables", price: 299, veg: true },
        { name: "Edamame Truffle Dumpling", desc: "Edamame, truffle oil, chives", price: 349, veg: true, tags: ["chef"] },
        { name: "Chicken Sui Mai", desc: "Open-faced dumpling, chicken & mushroom", price: 349, veg: false },
        { name: "Har Gow", desc: "Classic prawn dumpling", price: 399, veg: false },
      ],
    },
    {
      id: "starters",
      name: "Starters",
      items: [
        { name: "Crispy Chilli Lotus Stem", desc: "Honey chilli glaze, sesame", price: 329, veg: true, tags: ["spicy"] },
        { name: "Salt & Pepper Tofu", desc: "Crisp tofu, garlic, spring onion", price: 299, veg: true },
        { name: "Thai Chicken Satay", desc: "Grilled skewers, peanut sauce", price: 379, veg: false },
        { name: "Chilli Garlic Prawns", desc: "Wok-tossed, burnt garlic", price: 449, veg: false, tags: ["spicy"] },
        { name: "Korean Fried Chicken", desc: "Gochujang glaze, sesame", price: 399, veg: false, tags: ["new"] },
      ],
    },
    {
      id: "sushi",
      name: "Sushi",
      items: [
        { name: "Avocado Cucumber Roll", desc: "8 pcs, sesame, kewpie", price: 399, veg: true },
        { name: "Crispy Asparagus Roll", desc: "8 pcs, tempura asparagus, teriyaki", price: 429, veg: true },
        { name: "Salmon Nigiri", desc: "2 pcs", price: 499, veg: false, tags: ["chef"] },
        { name: "Spicy Tuna Roll", desc: "8 pcs, sriracha mayo", price: 549, veg: false, tags: ["spicy"] },
      ],
    },
    {
      id: "mains",
      name: "Mains",
      items: [
        { name: "Thai Green Curry — Vegetable", desc: "Coconut, basil, served with jasmine rice", price: 449, veg: true },
        { name: "Thai Green Curry — Chicken", desc: "Coconut, basil, served with jasmine rice", price: 499, veg: false },
        { name: "Mapo Tofu", desc: "Sichuan pepper, chilli bean sauce", price: 399, veg: true, tags: ["spicy"] },
        { name: "Kung Pao Chicken", desc: "Peanuts, dried chillies", price: 449, veg: false, tags: ["spicy"] },
        { name: "Black Pepper Lamb", desc: "Wok-tossed, bell peppers, onion", price: 549, veg: false },
      ],
    },
    {
      id: "noodles-rice",
      name: "Noodles & Rice",
      items: [
        { name: "Hakka Noodles", desc: "Classic wok-tossed vegetables", price: 299, veg: true },
        { name: "Pad Thai — Tofu", desc: "Rice noodles, tamarind, peanuts", price: 379, veg: true },
        { name: "Pad Thai — Prawn", desc: "Rice noodles, tamarind, peanuts", price: 449, veg: false },
        { name: "Burnt Garlic Fried Rice", desc: "Veg / Egg / Chicken", price: 279, veg: true },
        { name: "Nasi Goreng", desc: "Indonesian fried rice, fried egg, satay", price: 429, veg: false },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      items: [
        { name: "Mango Sticky Rice", desc: "Coconut cream, toasted sesame", price: 299, veg: true },
        { name: "Matcha Cheesecake", desc: "Baked, white chocolate", price: 329, veg: true, tags: ["new"] },
        { name: "Date Pancake", desc: "With vanilla ice cream", price: 279, veg: true },
      ],
    },
    {
      id: "beverages",
      name: "Beverages",
      items: [
        { name: "Thai Iced Tea", price: 179, veg: true },
        { name: "Lychee Mint Cooler", price: 199, veg: true },
        { name: "Jasmine Tea Pot", price: 149, veg: true },
      ],
    },
  ],
};
