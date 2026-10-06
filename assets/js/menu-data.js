/*
 * LOVE ASIA — MENU DATA
 * ---------------------------------------------------------------
 * This is the only file you need to edit to change the menu.
 *
 * Category:  { id, name, note?, groups: [Group, ...] }
 *            (or put `items` / `prices` directly on the category for a single group)
 * Group:     { name?, prices?, items: [Item, ...] }
 *            prices = shared prices for every dish in the group, e.g.
 *            [{ label: "4 pcs", price: 415 }, { label: "8 pcs", price: 675 }]
 * Item:      { name, desc?, veg, price? | variants?, tags? }
 *            veg: true  -> shown in BOTH the Veg (bamboo) and Non-Veg (koi) menus
 *            veg: false -> shown only in the Non-Veg (koi) menu
 *            variants = several prices, e.g.
 *            [{ label: "Veg", price: 599, veg: true }, { label: "Chicken", price: 625, veg: false }]
 *            In the Veg menu only the veg variants / prices are shown.
 *            tags: any of "spicy", "chef", "new", "jain"
 */

(function () {
  // Common price patterns
  const vcp = (v, c, p) => [
    { label: "Veg", price: v, veg: true },
    { label: "Chicken", price: c, veg: false },
    { label: "Prawn", price: p, veg: false },
  ];
  const vc = (v, c) => [
    { label: "Veg", price: v, veg: true },
    { label: "Chicken", price: c, veg: false },
  ];
  const pcs = (a, b, na = "4 pcs", nb = "6 pcs") => [
    { label: na, price: a },
    { label: nb, price: b },
  ];

  window.LOVE_ASIA = {
    name: "Love Asia",
    tagline: "Pan-Asian Kitchen",
    currency: "₹",

    /* Photos of the printed menu, shown in the "View printed menu" viewer. */
    menuPages: [
      "assets/menu/page-01.jpg",
      "assets/menu/page-02.jpg",
      "assets/menu/page-03.jpg",
      "assets/menu/page-04.jpg",
      "assets/menu/page-05.jpg",
      "assets/menu/page-06.jpg",
      "assets/menu/page-07.jpg",
      "assets/menu/page-08.jpg",
      "assets/menu/page-09.jpg",
      "assets/menu/page-10.jpg",
    ],

    categories: [
      {
        id: "soups",
        name: "Soups",
        prices: [
          { label: "Veg", price: 259, veg: true },
          { label: "Chicken", price: 299, veg: false },
          { label: "Prawns", price: 329, veg: false },
        ],
        items: [
          { name: "Mushroom and Spinach Soup", desc: "Earthy mushrooms and fresh spinach in a soy broth with vegetables.", veg: true },
          { name: "Tom Yum Soup", desc: "Zesty and aromatic broth with vegetables, delicately balanced with lime, lemongrass and chilli heat.", veg: true, tags: ["spicy"] },
          { name: "Tom Kha Soup", desc: "A fragrant Thai coconut soup with lemongrass, lime, and chilli — it’s creamy, tangy, and lightly spicy.", veg: true },
          { name: "Jade Soup", desc: "A bright green, velvety soup made from pureed spinach & aromatic herbs — fresh flavours in every soothing spoonful.", veg: true },
          { name: "Indo Vietnamese Clear Soup", desc: "Delicate noodles and fresh vegetables swim in a light, flavourful broth with a subtle fusion twist.", veg: true },
        ],
      },
      {
        id: "salads",
        name: "Salads",
        prices: [
          { label: "Veg", price: 347, veg: true },
          { label: "Chicken", price: 380, veg: false },
          { label: "Prawns", price: 425, veg: false },
        ],
        items: [
          { name: "Raw Mango and Papaya Salad", desc: "Shredded raw mango and papaya tossed in a sweet and spicy zesty dressing, topped with roasted peanuts.", veg: true },
          { name: "Asian Mix Leaf Citrus Salad", desc: "Crisp seasonal leaves tossed Asian-style, for a fresh, vibrant crunch.", veg: true },
          { name: "Jade Ribbon Salad", desc: "Spiral crunchy cucumber, tossed in a delicate Asian dressing, offering a flavourful bite.", veg: true },
          { name: "Love Gai Salad", desc: "Minced chicken tossed with zesty lime, fresh herbs, and a hint of spice for a vibrant Thai classic.", veg: false },
        ],
      },
      {
        id: "starters",
        name: "Starters",
        groups: [
          {
            name: "Vegetarian",
            items: [
              { name: "Chilli Garlic Edamame", desc: "Steamed edamame tossed in a fiery sauce for a spicy encounter.", price: 439, veg: true, tags: ["spicy"] },
              { name: "Truffle Sea Salt Edamame", desc: "Steamed edamame lightly dusted with sea salt & finished with a drizzle of aromatic truffle oil.", price: 439, veg: true },
              { name: "Tai Pai Mushroom", desc: "Tender mushroom stir-fried in a tangy, slightly spicy sauce.", price: 385, veg: true },
              { name: "Veg Spring Roll (5 pcs)", desc: "Crispy golden rolls filled with fresh & vibrant vegetables, an all-time classic.", price: 399, veg: true },
              { name: "Thai Herb Cottage Cheese", desc: "Soft cottage cheese infused with aromatic herbs for a fragrant Indo-Thai extravaganza.", price: 449, veg: true },
              { name: "Hongkong Tofu", desc: "Crispy silken tofu, tossed in a sweet & spicy Hongkong sauce, for a flavourful surprise.", price: 495, veg: true },
              { name: "Vietnamese Summer Roll", desc: "Rice paper filled with vegetables, cooked rice noodles, rolled into spring roll like parcels.", price: 399, veg: true },
              { name: "Asian Vegetables in Sweet Chilli Sauce", desc: "Seasonal Asian vegetables flash-fried with a perfect balance of mild heat and palm sugar sweetness.", price: 395, veg: true },
              { name: "Mushroom Satay in Teriyaki Sauce", desc: "Bouncy mushroom bites with a sweet & spicy punch.", price: 425, veg: true },
              { name: "Babycorn Tempura", desc: "A popular Japanese-inspired dish, tender baby corn dipped in a light, airy, and golden-brown batter and deep-fried.", price: 425, veg: true },
            ],
          },
          {
            name: "Non-Vegetarian",
            items: [
              { name: "Black Pepper — Chicken / Prawn", desc: "Succulent chicken or prawns tossed in a bold black pepper sauce for a spicy, savory kick.", veg: false, tags: ["spicy"], variants: [{ label: "Chicken", price: 449 }, { label: "Prawn", price: 499 }] },
              { name: "Tai Chi Chicken", desc: "Tender chicken wok-tossed in a delicate, flavorful sauce for a perfectly balanced, savory bite.", price: 435, veg: false },
              { name: "Sichuan Spicy Chicken Wings", desc: "Crispy chicken wings tossed in a fiery Sichuan sauce for a bold, tongue-tingling kick.", price: 449, veg: false, tags: ["spicy"] },
              { name: "Zing Fried Chicken", desc: "Tender chicken marinated in house spices. Golden-fried and served with lemon wedges for a citrusy kick.", price: 449, veg: false },
              { name: "Chicken Spring Rolls", desc: "Crispy golden rolls filled with tender, flavorful chicken for a crunchy, savory delight.", price: 435, veg: false },
              { name: "Prawns Tempura", desc: "Large, succulent prawns hand-stretched and flash-fried in our signature ice-cold, airy batter.", price: 585, veg: false },
              { name: "Fish in XO Sauce", desc: "Tender fish fillets bathed in a rich, savory XO sauce for a bold symphony of flavours.", price: 599, veg: false },
              { name: "Steam Fish with Oyster Sauce", desc: "Delicate steamed fish drizzled with oyster sauce for the health conscious.", price: 625, veg: false },
              { name: "Honey Glazed Chicken", desc: "Crispy chicken tossed in a sweet & spicy sauce for a bold, tongue-tingling kick.", price: 449, veg: false },
            ],
          },
        ],
      },
      {
        id: "dimsum",
        name: "Dim Sum",
        groups: [
          {
            name: "Vegetarian",
            prices: pcs(347, 480),
            items: [
              { name: "Mushroom Cream Cheese", desc: "Creamy, luscious cheese mixed with earthy mushrooms for a rich bite.", veg: true },
              { name: "Jade Crunch Garden", desc: "Crisp asparagus and crunchy water chestnuts steamed in a delicate dressing for a refreshing, vibrant bite.", veg: true },
              { name: "Spinach and Broccoli Pine Nuts", desc: "Tender spinach and broccoli lightly mixed with toasted pine nuts for a delightful, nutty crunch.", veg: true },
              { name: "Mushroom in Schezwan Sauce", desc: "Steamed dumplings stuffed with succulent mushrooms in a spicy Schezwan glaze.", veg: true, tags: ["spicy"] },
            ],
          },
          {
            name: "Non-Vegetarian",
            prices: pcs(419, 549),
            items: [
              { name: "Silken Bite Chicken", desc: "Tender, melt-in-your-mouth chicken bites, delicately seasoned for a savory indulgence.", veg: false },
              { name: "Heritage Siu Mai", desc: "Classic siu mai dumplings filled with tender chicken and subtle seasonings, steamed to perfection.", veg: false },
              { name: "Hargow Prawns", desc: "Delicate prawn dumplings wrapped in a translucent skin, steamed to juicy perfection.", veg: false },
              { name: "Herb Kissed Prawn Dumplings", desc: "Succulent prawns delicately seasoned with fresh herbs, wrapped in a silky dumpling for an unforgettable bite.", veg: false },
            ],
          },
        ],
      },
      {
        id: "gyoza-bao",
        name: "Gyoza & Bao",
        groups: [
          {
            name: "Gyoza",
            items: [
              { name: "Gyoza Veg", desc: "Delicate dumplings filled with a savory mix of fresh vegetables, lightly pan-seared to perfection.", veg: true, variants: pcs(375, 449) },
              { name: "Gyoza Chicken", desc: "Tender chicken wrapped in delicate dumplings, lightly pan-seared to perfection.", veg: false, variants: pcs(429, 549) },
            ],
          },
          {
            name: "Bao",
            items: [
              { name: "Exotic Bao Veg (2 pcs)", desc: "Soft, pillowy steamed baos, topped with flavourful exotic vegetables in a mildly spicy sauce.", price: 358, veg: true },
              { name: "Tokyo Crumb Chicken Bao (2 pcs)", desc: "Crispy crumbed chicken tucked inside a soft, pillowy bao for a crunchy, savory delight.", price: 449, veg: false },
            ],
          },
        ],
      },
      {
        id: "sushi",
        name: "Sushi",
        groups: [
          {
            name: "Vegetarian",
            prices: pcs(415, 675, "4 pcs", "8 pcs"),
            items: [
              { name: "Karai Kappa Maki", desc: "Crisp cucumber rolls with a spicy kick, wrapped in seasoned rice and nori.", veg: true, tags: ["spicy"] },
              { name: "Yasai Pikurusu Roll", desc: "A refreshing sushi roll filled with crisp pickled vegetables.", veg: true },
              { name: "Asparagus Kurimuchizu Roll", desc: "Crisp asparagus paired with cream cheese, rolled to perfection.", veg: true },
              { name: "Paradise Roll", desc: "Asparagus & cucumber rolled in sushi rice, topped with sliced avocado for that delicious bite.", veg: true },
              { name: "Raw Mango Avocado Roll", desc: "Creamy avocado and tangy raw mango rolled together for a refreshing, perfectly balanced experience.", veg: true },
              { name: "Yasai Saku Futomaki", desc: "A generous futomaki roll filled with crisp vegetables & cream cheese, delivering a satisfying, crunchy explosion.", veg: true },
            ],
          },
          {
            name: "Non-Vegetarian",
            prices: pcs(469, 769, "4 pcs", "8 pcs"),
            items: [
              { name: "Karai Sake Roll", desc: "Spicy cooked salmon rolled to perfection for a bold savory kick.", veg: false, tags: ["spicy"] },
              { name: "Harmony Roll", desc: "Prawn paired with creamy avocado & cucumber on sushi rice.", veg: false },
              { name: "California Roll", desc: "A creamy, crunchy roll with avocado, cucumber, and crab stick.", veg: false },
              { name: "Katsu Spicy Roll", desc: "Crispy katsu (chicken) with a fiery kick, rolled to perfection.", veg: false, tags: ["spicy"] },
            ],
          },
          {
            name: "Signature Rolls",
            items: [
              { name: "Maguro Tokiyo Roll (8 pcs)", desc: "A refined sushi roll featuring premium tuna, crafted in Tokyo style for a clean, elegant finish.", price: 769, veg: false },
              { name: "Sake Expression Roll (8 pcs)", desc: "An expressive sushi roll showcasing salmon in a refined blend of flavours & textures.", price: 769, veg: false },
              { name: "Seafood Futomaki (8 pcs)", desc: "Crunchy Japanese roll with fresh salmon, tuna and cream cheese, delivering a satisfying, crunchy explosion.", price: 895, veg: false },
            ],
          },
        ],
      },
      {
        id: "stir-fry",
        name: "Stir-Fry",
        items: [
          { name: "Love Asia Delight", desc: "A colorful medley of vegetables or tender chicken stir-fried with classic Asian flavors.", veg: true, variants: vc(495, 520), tags: ["chef"] },
          { name: "Wok-Tossed Garlicky Broccoli", desc: "Fresh tender broccoli tossed in a butter-garlic infused sauce for a perfect fresh bite.", price: 425, veg: true },
          { name: "Bok Choy and Wild Mushrooms", desc: "Tender bok choy and a mix of exotic mushrooms lightly stir-fried.", price: 525, veg: true },
          { name: "Rainbow Stir-Fry Vegetables", desc: "Feel the crunch of exotic vegetables, for the health conscious.", price: 445, veg: true },
          { name: "Thai Herb Prawns", desc: "A quick stir-fry with onion, spices and Asian herbs.", price: 525, veg: false },
        ],
      },
      {
        id: "curries",
        name: "Curries",
        items: [
          { name: "Thai Green Curry with Jasmine Rice", desc: "A vibrant, aromatic masterpiece. Fragrant green chillies, lemongrass, and galangal pounded into a rich paste, simmered in velvety coconut milk. Finished with Thai basil for a perfect balance of spice and creaminess.", veg: true, variants: vcp(519, 599, 699) },
          { name: "Thai Red Curry with Jasmine Rice", desc: "Our house-made curry paste and aromatic Thai spices, sautéed & tempered with silky coconut cream, infused with hand-torn kaffir lime leaves with your choice of proteins and vegetables.", veg: true, variants: vcp(519, 599, 699) },
          { name: "Thai Basil Chicken with Jasmine Rice", desc: "A fragrant Malaysian-style curry with your choice of vegetables, tender chicken, or juicy prawns.", price: 525, veg: false },
          { name: "Mongolian Chicken / Prawn", desc: "Wok-tossed in a savory-sweet Mongolian sauce.", veg: false, variants: [{ label: "Chicken", price: 523 }, { label: "Prawn", price: 549 }] },
          {
            name: "Wok-Tossed in Your Choice of Sauce",
            desc: "Szechwan / Chilli Garlic / Hot Garlic / Kung Pao sauce.",
            veg: true,
            variants: [
              { label: "Veg", price: 449, veg: true },
              { label: "Tofu", price: 485, veg: true },
              { label: "Chicken", price: 525, veg: false },
              { label: "Prawns", price: 549, veg: false },
            ],
          },
          { name: "Mapo Tofu", price: 525, veg: true, tags: ["spicy"] },
        ],
      },
      {
        id: "rice",
        name: "Rice",
        note: "Option of Jasmine or Basmati rice",
        items: [
          {
            name: "Classic Fried Rice",
            desc: "Wok-tossed fragrant rice with your choice of protein or vegetables.",
            veg: true,
            variants: [
              { label: "Veg", price: 380, veg: true },
              { label: "Egg", price: 395, veg: false },
              { label: "Chicken", price: 449, veg: false },
              { label: "Prawn", price: 495, veg: false },
            ],
          },
          { name: "Kampung Fried Rice", desc: "A popular Malaysian village-style fried rice characterized by its savory, umami-rich flavour.", veg: true, variants: vcp(380, 449, 495) },
          { name: "Yang Chow Fried Rice (Mix)", desc: "From the land of Singapore. This popular Chinese-style fried rice is tossed with egg, chicken & prawns — a dish to rejoice.", price: 525, veg: false },
          { name: "Nasi Goreng — Chicken / Prawn", desc: "Fragrant Indonesian-style fried rice served with your choice of protein and crackers on the side.", veg: false, variants: [{ label: "Chicken", price: 495 }, { label: "Prawn", price: 595 }] },
        ],
      },
      {
        id: "noodles",
        name: "Noodles",
        items: [
          { name: "Mee Goreng", desc: "Wok-tossed noodles in spicy-sweet sambal sauce.", veg: true, variants: vcp(380, 425, 495), tags: ["spicy"] },
          { name: "Pad Thai Noodles", desc: "Flat rice noodles wok-tossed in a signature house-made tamarind glaze, balancing sweet, tangy, and savory flavours with a crunch of roasted peanuts and fresh lime.", veg: true, variants: vcp(380, 425, 495) },
          { name: "Penang Mee Goreng", desc: "Noodles wok-seared in a fiery sambal and dark soy glaze.", veg: true, variants: vcp(380, 425, 495), tags: ["spicy"] },
          { name: "Hakka Noodles", desc: "Wok-tossed Hakka noodles tossed with fresh vegetables.", veg: true, variants: vcp(349, 395, 439) },
          { name: "Chilli Garlic Noodles", desc: "Wok-tossed noodles in a spicy sauce with vegetables.", veg: true, variants: vcp(349, 395, 439), tags: ["spicy"] },
          { name: "Khow Suey", desc: "A comforting bowl of noodles in a rich coconut curry broth, served with your choice of protein and vegetables.", veg: true, variants: vcp(495, 549, 625) },
        ],
      },
      {
        id: "ramen",
        name: "Ramen",
        items: [
          { name: "Miso Ramen", desc: "A hearty Japanese noodle soup in rich miso broth, topped with fresh vegetables or your choice of protein.", veg: true, variants: vc(599, 625) },
          { name: "Tonkatsu Ramen", desc: "A rich, comforting ramen soup topped with fresh vegetables or your choice of protein.", veg: true, variants: vc(599, 625) },
          { name: "Spicy Korean Ramen", desc: "A fiery & authentic Korean ramen soup flavoured with fermented chilli paste, with fresh vegetables or your choice of protein.", veg: true, variants: vc(599, 625), tags: ["spicy"] },
        ],
      },
      {
        id: "sides",
        name: "Sides & Staples",
        items: [
          { name: "Jasmine Rice", price: 209, veg: true },
          { name: "Basmati Rice", price: 189, veg: true },
          { name: "Crackers", veg: true, variants: [{ label: "Veg", price: 99, veg: true }, { label: "Prawn", price: 129, veg: false }] },
        ],
      },
      {
        id: "desserts",
        name: "Desserts",
        items: [
          { name: "Penguin Chocolate Bao (2 pcs)", desc: "Delightfully playful and irresistibly decadent. Our baos are handcrafted into charming penguin characters, filled with chocolate ganache & steamed to pillowy perfection.", price: 349, veg: true, tags: ["chef"] },
          { name: "Japanese Coconut Pudding", desc: "A nod to the beloved Tokyo café classic. Our custard is slow-steamed for a dense, silky-smooth finish and topped with a dark, bittersweet caramel glaze.", price: 395, veg: true },
          { name: "Japanese Cheesecake with Caramel Sauce", price: 425, veg: true },
          { name: "Mango Sticky Rice", desc: "Subject to availability.", price: 425, veg: true },
          { name: "Asian Ice Cream (one scoop)", price: 195, veg: true },
        ],
      },
    ],
  };
})();
