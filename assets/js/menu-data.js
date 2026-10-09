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
          { name: "Tom Yum Soup", desc: "Hot and sour broth with vegetables, lime, lemongrass and chilli.", veg: true, tags: ["spicy"] },
          { name: "Tom Kha Soup", desc: "Thai coconut soup with lemongrass, lime and chilli. Creamy, tangy and a little spicy.", veg: true },
          { name: "Jade Soup", desc: "A smooth green soup of blended spinach and herbs. Light and soothing.", veg: true },
          { name: "Indo Vietnamese Clear Soup", desc: "Noodles and fresh vegetables in a light, clear broth with an Indo-Vietnamese twist.", veg: true },
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
          { name: "Raw Mango and Papaya Salad", desc: "Shredded raw mango and papaya in a sweet and spicy dressing, with roasted peanuts on top.", veg: true },
          { name: "Asian Mix Leaf Citrus Salad", desc: "Crisp seasonal leaves, tossed Asian-style. Simple and fresh.", veg: true },
          { name: "Jade Ribbon Salad", desc: "Spiralised cucumber tossed in a light Asian dressing. Cool and crunchy.", veg: true },
          { name: "Love Gai Salad", desc: "Minced chicken tossed with lime, fresh herbs and a bit of spice. A Thai classic.", veg: false },
        ],
      },
      {
        id: "starters",
        name: "Starters",
        groups: [
          {
            name: "Vegetarian",
            items: [
              { name: "Chilli Garlic Edamame", desc: "Steamed edamame tossed in a hot chilli garlic sauce.", price: 439, veg: true, tags: ["spicy"] },
              { name: "Truffle Sea Salt Edamame", desc: "Steamed edamame with sea salt and a drizzle of truffle oil.", price: 439, veg: true },
              { name: "Tai Pai Mushroom", desc: "Mushrooms stir-fried in a tangy, slightly spicy sauce.", price: 385, veg: true },
              { name: "Veg Spring Roll (5 pcs)", desc: "Crisp golden rolls filled with fresh vegetables. An old favourite.", price: 399, veg: true },
              { name: "Thai Herb Cottage Cheese", desc: "Soft cottage cheese cooked with fragrant herbs, Indo-Thai style.", price: 449, veg: true },
              { name: "Hongkong Tofu", desc: "Crispy silken tofu tossed in our sweet and spicy Hongkong sauce.", price: 495, veg: true },
              { name: "Vietnamese Summer Roll", desc: "Rice paper wrapped around vegetables and rice noodles, rolled up like a spring roll.", price: 399, veg: true },
              { name: "Asian Vegetables in Sweet Chilli Sauce", desc: "Seasonal Asian vegetables, flash-fried with a little heat and some palm sugar sweetness.", price: 395, veg: true },
              { name: "Mushroom Satay in Teriyaki Sauce", desc: "Bouncy mushroom bites in a sweet and spicy glaze.", price: 425, veg: true },
              { name: "Babycorn Tempura", desc: "Baby corn dipped in a light tempura batter and deep-fried till golden.", price: 425, veg: true },
            ],
          },
          {
            name: "Non-Vegetarian",
            items: [
              { name: "Black Pepper Chicken / Prawn", desc: "Chicken or prawns tossed in a punchy black pepper sauce.", veg: false, tags: ["spicy"], variants: [{ label: "Chicken", price: 449 }, { label: "Prawn", price: 499 }] },
              { name: "Tai Chi Chicken", desc: "Chicken wok-tossed in a light, savoury sauce.", price: 435, veg: false },
              { name: "Sichuan Spicy Chicken Wings", desc: "Crispy chicken wings in a hot Sichuan sauce. Expect a bit of tingle.", price: 449, veg: false, tags: ["spicy"] },
              { name: "Zing Fried Chicken", desc: "Chicken marinated in our house spices, fried golden and served with lemon wedges.", price: 449, veg: false },
              { name: "Chicken Spring Rolls", desc: "Crisp golden rolls stuffed with spiced chicken.", price: 435, veg: false },
              { name: "Prawns Tempura", desc: "Large prawns, stretched by hand and flash-fried in our light, ice-cold batter.", price: 585, veg: false },
              { name: "Fish in XO Sauce", desc: "Fish fillets in a rich, savoury XO sauce.", price: 599, veg: false },
              { name: "Steam Fish with Oyster Sauce", desc: "Steamed fish with oyster sauce. A lighter pick.", price: 625, veg: false },
              { name: "Honey Glazed Chicken", desc: "Crispy chicken tossed in a sweet and spicy honey glaze.", price: 449, veg: false },
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
              { name: "Mushroom Cream Cheese", desc: "Cream cheese mixed with earthy mushrooms. A rich one.", veg: true },
              { name: "Jade Crunch Garden", desc: "Asparagus and water chestnuts steamed in a light dressing. Fresh and crunchy.", veg: true },
              { name: "Spinach and Broccoli Pine Nuts", desc: "Spinach, broccoli and toasted pine nuts. Soft, with a nutty crunch.", veg: true },
              { name: "Mushroom in Schezwan Sauce", desc: "Steamed dumplings stuffed with mushrooms in a spicy Schezwan glaze.", veg: true, tags: ["spicy"] },
            ],
          },
          {
            name: "Non-Vegetarian",
            prices: pcs(419, 549),
            items: [
              { name: "Silken Bite Chicken", desc: "Soft chicken dumplings, lightly seasoned.", veg: false },
              { name: "Heritage Siu Mai", desc: "Classic siu mai filled with chicken, lightly seasoned and steamed.", veg: false },
              { name: "Hargow Prawns", desc: "Prawn dumplings in a thin, see-through wrapper. Steamed and juicy.", veg: false },
              { name: "Herb Kissed Prawn Dumplings", desc: "Prawns seasoned with fresh herbs, wrapped in a soft, silky dumpling.", veg: false },
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
              { name: "Gyoza Veg", desc: "Dumplings filled with seasoned vegetables and lightly pan-seared.", veg: true, variants: pcs(375, 449) },
              { name: "Gyoza Chicken", desc: "Chicken-filled dumplings, lightly pan-seared.", veg: false, variants: pcs(429, 549) },
            ],
          },
          {
            name: "Bao",
            items: [
              { name: "Exotic Bao Veg (2 pcs)", desc: "Soft steamed baos topped with exotic vegetables in a mildly spicy sauce.", price: 358, veg: true },
              { name: "Tokyo Crumb Chicken Bao (2 pcs)", desc: "Crispy crumbed chicken tucked into a soft bao.", price: 449, veg: false },
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
              { name: "Karai Kappa Maki", desc: "Cucumber rolls with a bit of spice, wrapped in seasoned rice and nori.", veg: true, tags: ["spicy"] },
              { name: "Yasai Pikurusu Roll", desc: "A light roll filled with crunchy pickled vegetables.", veg: true },
              { name: "Asparagus Kurimuchizu Roll", desc: "Crisp asparagus with cream cheese in a sushi roll.", veg: true },
              { name: "Paradise Roll", desc: "Asparagus and cucumber in sushi rice, topped with slices of avocado.", veg: true },
              { name: "Raw Mango Avocado Roll", desc: "Avocado and tangy raw mango, rolled together. Fresh and light.", veg: true },
              { name: "Yasai Saku Futomaki", desc: "A big futomaki roll packed with crunchy vegetables and cream cheese.", veg: true },
            ],
          },
          {
            name: "Non-Vegetarian",
            prices: pcs(469, 769, "4 pcs", "8 pcs"),
            items: [
              { name: "Karai Sake Roll", desc: "Spicy cooked salmon in a sushi roll.", veg: false, tags: ["spicy"] },
              { name: "Harmony Roll", desc: "Prawn with creamy avocado and cucumber on sushi rice.", veg: false },
              { name: "California Roll", desc: "Avocado, cucumber and crab stick. Creamy and crunchy.", veg: false },
              { name: "Katsu Spicy Roll", desc: "Crispy chicken katsu with a good amount of heat, rolled into sushi.", veg: false, tags: ["spicy"] },
            ],
          },
          {
            name: "Signature Rolls",
            items: [
              { name: "Maguro Tokiyo Roll (8 pcs)", desc: "A Tokyo-style roll made with premium tuna. Clean and simple.", price: 769, veg: false },
              { name: "Sake Expression Roll (8 pcs)", desc: "A salmon roll that plays with a few different flavours and textures.", price: 769, veg: false },
              { name: "Seafood Futomaki (8 pcs)", desc: "A thick, crunchy roll with fresh salmon, tuna and cream cheese.", price: 895, veg: false },
            ],
          },
        ],
      },
      {
        id: "stir-fry",
        name: "Stir-Fry",
        items: [
          { name: "Love Asia Delight", desc: "Mixed vegetables or chicken, stir-fried with classic Asian flavours.", veg: true, variants: vc(495, 520), tags: ["chef"] },
          { name: "Wok-Tossed Garlicky Broccoli", desc: "Fresh broccoli tossed in a butter garlic sauce.", price: 425, veg: true },
          { name: "Bok Choy and Wild Mushrooms", desc: "Bok choy and a mix of exotic mushrooms, lightly stir-fried.", price: 525, veg: true },
          { name: "Rainbow Stir-Fry Vegetables", desc: "Crunchy exotic vegetables, stir-fried. A good one if you're eating light.", price: 445, veg: true },
          { name: "Thai Herb Prawns", desc: "A quick stir-fry with onion, spices and Asian herbs.", price: 525, veg: false },
        ],
      },
      {
        id: "curries",
        name: "Curries",
        items: [
          { name: "Thai Green Curry with Jasmine Rice", desc: "Green chillies, lemongrass and galangal pounded into a paste and simmered in coconut milk. Finished with Thai basil.", veg: true, variants: vcp(519, 599, 699) },
          { name: "Thai Red Curry with Jasmine Rice", desc: "Our house-made red curry paste cooked with coconut cream and torn kaffir lime leaves. Pick your vegetables or protein.", veg: true, variants: vcp(519, 599, 699) },
          { name: "Thai Basil Chicken with Jasmine Rice", desc: "A fragrant Malaysian-style curry with your choice of vegetables, chicken or prawns.", price: 525, veg: false },
          { name: "Mongolian Chicken / Prawn", desc: "Wok-tossed in a savoury-sweet Mongolian sauce.", veg: false, variants: [{ label: "Chicken", price: 523 }, { label: "Prawn", price: 549 }] },
          {
            name: "Wok-Tossed in Your Choice of Sauce",
            desc: "Pick from Szechwan, Chilli Garlic, Hot Garlic or Kung Pao sauce.",
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
          { name: "Kampung Fried Rice", desc: "Malaysian village-style fried rice. Savoury and full of umami.", veg: true, variants: vcp(380, 449, 495) },
          { name: "Yang Chow Fried Rice (Mix)", desc: "A Chinese-style fried rice loved in Singapore, tossed with egg, chicken and prawns.", price: 525, veg: false },
          { name: "Nasi Goreng, Chicken / Prawn", desc: "Indonesian-style fried rice with your choice of protein, and crackers on the side.", veg: false, variants: [{ label: "Chicken", price: 495 }, { label: "Prawn", price: 595 }] },
        ],
      },
      {
        id: "noodles",
        name: "Noodles",
        items: [
          { name: "Mee Goreng", desc: "Wok-tossed noodles in spicy-sweet sambal sauce.", veg: true, variants: vcp(380, 425, 495), tags: ["spicy"] },
          { name: "Pad Thai Noodles", desc: "Flat rice noodles wok-tossed in our house-made tamarind sauce, with roasted peanuts and a squeeze of lime.", veg: true, variants: vcp(380, 425, 495) },
          { name: "Penang Mee Goreng", desc: "Noodles wok-seared in a fiery sambal and dark soy glaze.", veg: true, variants: vcp(380, 425, 495), tags: ["spicy"] },
          { name: "Hakka Noodles", desc: "Hakka noodles wok-tossed with fresh vegetables.", veg: true, variants: vcp(349, 395, 439) },
          { name: "Chilli Garlic Noodles", desc: "Wok-tossed noodles in a spicy sauce with vegetables.", veg: true, variants: vcp(349, 395, 439), tags: ["spicy"] },
          { name: "Khow Suey", desc: "Noodles in a rich coconut curry broth, with your choice of vegetables or protein. Proper comfort food.", veg: true, variants: vcp(495, 549, 625) },
        ],
      },
      {
        id: "ramen",
        name: "Ramen",
        items: [
          { name: "Miso Ramen", desc: "Japanese noodle soup in a rich miso broth, topped with vegetables or your choice of protein.", veg: true, variants: vc(599, 625) },
          { name: "Tonkatsu Ramen", desc: "A rich, hearty ramen topped with fresh vegetables or your choice of protein.", veg: true, variants: vc(599, 625) },
          { name: "Spicy Korean Ramen", desc: "Korean-style ramen made spicy with fermented chilli paste. Comes with vegetables or your choice of protein.", veg: true, variants: vc(599, 625), tags: ["spicy"] },
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
          { name: "Penguin Chocolate Bao (2 pcs)", desc: "Baos shaped by hand into little penguins, filled with chocolate ganache and steamed till soft.", price: 349, veg: true, tags: ["chef"] },
          { name: "Japanese Coconut Pudding", desc: "Our take on a Tokyo café favourite. Slow-steamed custard, dense and silky, with a dark, bittersweet caramel on top.", price: 395, veg: true },
          { name: "Japanese Cheesecake with Caramel Sauce", price: 425, veg: true },
          { name: "Mango Sticky Rice", desc: "Subject to availability.", price: 425, veg: true },
          { name: "Asian Ice Cream (one scoop)", price: 195, veg: true },
        ],
      },
    ],
  };
})();
