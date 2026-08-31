/* Lihmil product catalog — listed prices as printed; sellPrice = ceil to next dollar unless already whole. */
(function () {
  function sell(listed) {
    var cents = Math.round(Number(listed) * 100);
    if (cents % 100 === 0) return cents / 100;
    return Math.floor(cents / 100) + 1;
  }

  function colorObjs(rows) {
    return rows.map(function (r) {
      return { name: r[0], listedPrice: r[1], sellPrice: sell(r[1]) };
    });
  }

  function item(id, name, category, listedPrice, unit, packNote, colors) {
    return {
      id: id,
      name: name,
      category: category,
      listedPrice: listedPrice,
      sellPrice: sell(listedPrice),
      unit: unit,
      packNote: packNote || "",
      colors: colors == null ? null : colors
    };
  }

  var F = "Flowers";
  var G = "Greens";
  var T = "Tropicals & Orchids";
  var GR = "Garden Roses";
  var WR = "Wedding Roses";
  var RR = "Red Roses";
  var H = "Hydrangeas";
  var bunch = "bunch";
  var stem = "stem";
  var box = "box";
  var each = "each";

  var MIX = ["White", "Cream", "Pink", "Hot Pink", "Red", "Burgundy", "Yellow", "Orange", "Peach", "Lavender", "Purple", "Green"];
  var CALLA = ["White", "Ivory", "Yellow", "Orange", "Pink", "Hot Pink", "Red", "Burgundy", "Purple", "Black", "Green"];
  var GERBERA = ["White", "Cream", "Yellow", "Orange", "Peach", "Pink", "Hot Pink", "Red", "Burgundy", "Lavender", "Purple", "Bi-color"];
  var BUTTON = ["White", "Yellow", "Pink", "Hot Pink", "Orange", "Lavender", "Purple", "Green"];
  var DAISY = ["White", "Yellow", "Pink"];
  var HYPERICUM = ["Red", "Pink", "Green", "Peach", "White", "Burgundy"];
  var KANGAROO = ["Red", "Pink", "Yellow", "Orange", "Green"];
  var LISIANTHUS = ["White", "Cream", "Pink", "Lavender", "Purple", "Green", "Bi-color"];
  var RANUNCULUS = ["White", "Cream", "Pink", "Peach", "Orange", "Red", "Burgundy", "Yellow", "Purple"];
  var SNAP = ["White", "Pink", "Yellow", "Orange", "Red", "Burgundy", "Lavender"];
  var SPRAY = ["White", "Cream", "Pink", "Hot Pink", "Peach", "Orange", "Red", "Yellow", "Lavender"];
  var STATICE = ["Purple", "White", "Yellow", "Pink", "Blue"];
  var STOCK = ["White", "Cream", "Pink", "Lavender", "Purple", "Yellow"];
  var TULIP = ["White", "Cream", "Yellow", "Orange", "Pink", "Hot Pink", "Red", "Purple", "Double"];
  var ANTHURIUM = ["Red", "White", "Pink", "Green", "Orange", "Chocolate"];

  var gardenColorRows = [
    ["Antonia", 1.55],
    ["Expression", 2.75],
    ["Heart", 2.25],
    ["Juliette", 4.95],
    ["Keira", 4.85],
    ["Mayra", 2.95],
    ["O'Hara Pink", 2.25],
    ["O'Hara White", 2.25],
    ["Patience", 4.75],
    ["Quicksand-like Veggie", 5.15],
    ["White (60 st plus)", 1.95],
    ["White jumbo", 3.75]
  ];

  var weddingColorRows = [
    ["Color rose", 27.50],
    ["Color rose (4 plus)", 24.50],
    ["Free Spirit", 35.00],
    ["Hermosa", 32.00],
    ["High Light", 35.00],
    ["Moab", 35.00],
    ["Playa Blanca", 38.00],
    ["Tinted roses", 40.00],
    ["Toffee", 37.50],
    ["Roselyn", 37.50]
  ];

  var redColorRows = [
    ["Black Magic", 34.00],
    ["Red", 26.95],
    ["Red (4 bu plus)", 25.00]
  ];

  var hydrangeaColorRows = [
    ["Antique", 14.95],
    ["Blue", 2.10],
    ["Blue (60 st plus)", 1.95],
    ["Blue shocking", 2.15],
    ["Green / Emerald / Lemon", 2.70],
    ["Mini green", 1.30],
    ["Mini green (60 st plus)", 1.40],
    ["Pink off truck", 3.25],
    ["Pink natural wedding", 4.85],
    ["Purple", 2.85],
    ["Sasha", 3.30],
    ["Tinted pink / purple", 2.50],
    ["White", 2.10],
    ["White (60 st plus)", 1.95],
    ["Novelty", 2.10]
  ];

  var catalog = [
    /* ===== FLOWERS ===== */
    item("acacia", "Acacia", F, 13.50, bunch),
    item("agapanthus-white", "Agapanthus white", F, 2.25, stem),
    item("agonis", "Agonis", F, 15.20, bunch),
    item("allium-purple", "Allium purple", F, 1.25, stem),
    item("alstroemeria", "Alstroemeria", F, 9.50, bunch),
    item("alstroemeria-3-plus", "Alstroemeria", F, 7.95, bunch, "(3 bu plus)"),
    item("amaranthus-10-stem", "Amaranthus", F, 18.50, bunch, "(10 stem)"),
    item("amaranthus-5-stem", "Amaranthus", F, 22.00, bunch, "(5 stem)"),
    item("anemone", "Anemone", F, 18.50, bunch),
    item("anemone-off-truck", "Anemone", F, 13.50, bunch, "(off truck)"),
    item("asiatic-lily", "Asiatic Lily", F, 11.25, bunch),
    item("aster", "Aster", F, 8.50, bunch),
    item("aster-3-plus", "Aster", F, 7.95, bunch, "(3 plus)"),
    item("aster-matsumoto", "Aster Matsumoto", F, 8.50, bunch),
    item("astilbe", "Astilbe", F, 24.00, bunch),
    item("astrantia-5-stem", "Astrantia", F, 11.50, bunch, "(5 stem)"),
    item("bells-of-ireland", "Bells of Ireland", F, 10.00, bunch),
    item("billy-balls", "Billy balls", F, 10.50, bunch),
    item("broom-corn", "Broom corn", F, 10.25, bunch),
    item("bupleurum", "Bupleurum", F, 5.35, bunch),
    item("button-pom", "Button pom", F, 5.35, bunch, "", BUTTON),
    item("button-pom-4-plus", "Button pom", F, 4.85, bunch, "(4 plus)", BUTTON),
    item("calla", "Calla", F, 2.50, stem, "", CALLA),
    item("campanula", "Campanula", F, 10.00, bunch),
    item("carnation", "Carnation", F, 14.45, bunch, "", MIX),
    item("carnation-4-plus", "Carnation", F, 12.65, bunch, "(4 plus)", MIX),
    item("carnation-florigene-20st", "Carnation Florigene", F, 17.25, bunch, "(20 st)"),
    item("celosia", "Celosia", F, 11.50, bunch),
    item("chamomile", "Chamomile", F, 14.50, bunch),
    item("chocolate-cosmos", "Chocolate cosmos", F, 15.50, bunch),
    item("chocolate-lace", "Chocolate lace", F, 12.50, bunch),
    item("cornflower", "Cornflower", F, 13.25, bunch),
    item("cosmos", "Cosmos", F, 18.50, bunch),
    item("cockscomb", "Cockscomb", F, 11.50, bunch),
    item("curly-willow-med", "Curly willow MED", F, 16.50, bunch),
    item("curly-willow-small", "Curly willow SMALL", F, 11.50, bunch),
    item("curly-willow-tall", "Curly willow TALL", F, 31.50, bunch),
    item("cushion-pom", "Cushion pom", F, 5.49, bunch, "", MIX),
    item("cushion-pom-4-plus", "Cushion pom", F, 4.95, bunch, "(4 plus)", MIX),
    item("cushion-florigene", "Cushion Florigene", F, 8.50, bunch, "", MIX),
    item("dahlia", "Dahlia", F, 19.50, bunch),
    item("daisy", "Daisy", F, 5.35, bunch, "", DAISY),
    item("daisy-4-plus", "Daisy", F, 4.85, bunch, "(4 bu plus)", DAISY),
    item("delphinium", "Delphinium", F, 18.50, bunch),
    item("delphinium-purple", "Delphinium PURPLE", F, 16.50, bunch),
    item("delphinium-short", "Delphinium short", F, 13.95, bunch),
    item("dianthus", "Dianthus", F, 9.50, bunch),
    item("dusty-miller", "Dusty miller", F, 12.95, bunch),
    item("echinacea-pod", "Echinacea pod", F, 15.50, bunch),
    item("freesia", "Freesia", F, 26.50, bunch),
    item("garland-gypsophila-10ft", "Garland gypsophila", F, 106.50, each, "(10 ft)"),
    item("gerbera", "Gerbera", F, 1.65, stem, "", GERBERA),
    item("gerbera-mini", "Gerbera MINI", F, 1.05, stem, "", GERBERA),
    item("ginestra-white", "Ginestra white", F, 15.50, bunch),
    item("gladiolus", "Gladiolus", F, 26.50, bunch),
    item("gladiolus-michigan", "Gladiolus Michigan", F, 7.00, bunch),
    item("gomphrena", "Gomphrena", F, 12.95, bunch),
    item("green-trick", "Green trick", F, 14.75, bunch),
    item("gypsophila-5-plus", "Gypsophila", F, 7.15, bunch, "(5 plus)"),
    item("gypsophila-xlence-million", "Gypsophila Xlence/Million", F, 8.15, bunch),
    item("helleborus", "Helleborus", F, 14.50, bunch),
    item("hypericum", "Hypericum", F, 9.25, bunch, "", HYPERICUM),
    item("iris", "Iris", F, 12.50, bunch),
    item("kangaroo-paw", "Kangaroo paw", F, 12.95, bunch, "", KANGAROO),
    item("larkspur", "Larkspur", F, 10.50, bunch),
    item("lepidium", "Lepidium", F, 12.85, bunch),
    item("liatris", "Liatris", F, 11.00, bunch),
    item("limonium-purple", "Limonium Purple", F, 11.50, bunch),
    item("limonium-white", "Limonium White", F, 12.50, bunch),
    item("lisianthus-canada", "Lisianthus Canada", F, 27.00, bunch, "", LISIANTHUS),
    item("lisianthus-sa", "Lisianthus S.A.", F, 24.00, bunch, "", LISIANTHUS),
    item("marigold", "Marigold", F, 14.50, bunch),
    item("millet", "Millet", F, 6.00, bunch),
    item("mini-calla-open-market", "Mini calla Open Market", F, 17.95, bunch, "", CALLA),
    item("mini-calla-wedding", "Mini calla Wedding", F, 23.00, bunch, "", CALLA),
    item("mini-carnation", "Mini carnation", F, 10.25, bunch, "", MIX),
    item("mini-carnation-3-plus", "Mini carnation", F, 9.95, bunch, "(3 plus)", MIX),
    item("mini-carnation-florigene", "Mini carnation Florigene", F, 7.50, bunch, "", MIX),
    item("oriental-lily", "Oriental lily", F, 15.00, bunch),
    item("oriental-lily-double", "Oriental lily DOUBLE", F, 26.00, bunch),
    item("peony", "Peony", F, 7.25, bunch),
    item("phlox", "Phlox", F, 11.95, bunch),
    item("queen-annes-lace", "Queen Anne's Lace", F, 21.50, bunch),
    item("ranunculus", "Ranunculus", F, 28.50, bunch, "", RANUNCULUS),
    item("ranunculus-cloni-hanoi", "Ranunculus Cloni/Hanoi", F, 28.00, bunch, "", RANUNCULUS),
    item("ranunculus-open-market", "Ranunculus Open Market", F, 17.00, bunch, "", RANUNCULUS),
    item("ranunculus-butterfly", "Ranunculus butterfly", F, 28.00, bunch, "", RANUNCULUS),
    item("rice-flower-calif", "Rice flower Calif", F, 13.25, bunch),
    item("safari-sunset", "Safari sunset", F, 10.25, bunch),
    item("scabiosa", "Scabiosa", F, 13.00, bunch),
    item("sedum-green", "Sedum green", F, 11.50, bunch),
    item("snapdragon", "Snapdragon", F, 15.50, bunch, "", SNAP),
    item("solidago", "Solidago", F, 8.75, bunch),
    item("solidago-spray", "Solidago spray", F, 13.25, bunch),
    item("solidago-tinted", "Solidago tinted", F, 13.50, bunch),
    item("spray-rose", "Spray rose", F, 11.75, bunch, "", SPRAY),
    item("spray-rose-3-plus", "Spray rose", F, 9.95, bunch, "(3 plus)", SPRAY),
    item("star-of-bethlehem", "Star of Bethlehem", F, 18.50, bunch, "(arabicum)"),
    item("statice", "Statice", F, 8.50, bunch, "", STATICE),
    item("stock", "Stock", F, 11.95, bunch, "", STOCK),
    item("stock-4-plus", "Stock", F, 9.95, bunch, "(4 plus)", STOCK),
    item("strawflower", "Strawflower", F, 14.50, bunch),
    item("sunflower-mahogany", "Sunflower Mahogany", F, 1.65, stem),
    item("sunflower-medium", "Sunflower MEDIUM", F, 1.40, stem),
    item("sunflower-mini", "Sunflower MINI", F, 1.40, stem),
    item("sweet-peas", "Sweet peas", F, 18.50, bunch),
    item("sweet-peas-wedding", "Sweet peas wedding", F, 25.00, bunch),
    item("thistle", "Thistle", F, 9.50, bunch),
    item("trachelium", "Trachelium", F, 25.00, bunch),
    item("tulip", "Tulip", F, 12.50, bunch, "", TULIP),
    item("tulip-wedding", "Tulip WEDDING", F, 18.00, bunch, "", TULIP),
    item("tweedia", "Tweedia", F, 15.50, bunch),
    item("veronica", "Veronica", F, 11.95, bunch),
    item("waxflower", "Waxflower", F, 10.50, bunch),
    item("wheat", "Wheat", F, 10.50, bunch),
    item("yarrow-yellow", "Yarrow Yellow", F, 10.50, bunch),
    item("zinnia", "Zinnia", F, 20.00, bunch),
    item("delistar-football", "Delistar & Football", F, 10.45, bunch),
    item("delistar-3-plus", "Delistar", F, 11.50, bunch, "(3 bu plus)"),
    item("stephanotis", "Stephanotis", F, 55.00, each),
    item("gardenia-box", "Gardenia", F, 55.00, box),

    /* ===== GREENS ===== */
    item("aralia-medium", "Aralia Medium", G, 11.95, bunch),
    item("aspidistra-green", "Aspidistra green", G, 0.85, stem),
    item("aspidistra-variegated", "Aspidistra variegated", G, 1.15, stem),
    item("baker-fern", "Baker fern", G, 3.30, bunch),
    item("bear-grass", "Bear grass", G, 3.75, bunch),
    item("boxwood", "Boxwood", G, 12.00, bunch),
    item("cocculus", "Cocculus", G, 7.25, bunch),
    item("eucalyptus-baby", "Eucalyptus baby", G, 10.50, bunch),
    item("eucalyptus-gunni", "Eucalyptus gunni", G, 13.25, bunch),
    item("eucalyptus-seeded", "Eucalyptus seeded", G, 11.00, bunch),
    item("eucalyptus-silver-dollar", "Eucalyptus silver dollar", G, 12.95, bunch),
    item("eucalyptus-willow", "Eucalyptus willow", G, 12.95, bunch),
    item("foxtail", "Foxtail", G, 7.00, bunch),
    item("grevillea", "Grevillea", G, 10.50, bunch),
    item("grevillea-tinted", "Grevillea tinted", G, 13.50, bunch),
    item("huckleberry", "Huckleberry", G, 10.50, bunch),
    item("italian-ruscus", "Italian ruscus", G, 13.50, bunch),
    item("israeli-ruscus", "Israeli ruscus", G, 13.95, bunch),
    item("jade", "Jade", G, 9.50, bunch),
    item("lily-grass", "Lily grass", G, 3.55, stem),
    item("ming-fern", "Ming fern", G, 8.25, bunch),
    item("moss-sheet-box", "Moss sheet", G, 58.65, box),
    item("moss-spanish-box", "Moss spanish", G, 28.00, box),
    item("myrtle", "Myrtle", G, 11.50, bunch),
    item("nagi-podocarpus", "Nagi / Podocarpus", G, 10.50, bunch),
    item("olive-branch", "Olive branch", G, 13.00, bunch),
    item("palmetto", "Palmetto", G, 8.00, bunch),
    item("pampas-grass", "Pampas grass", G, 15.50, bunch),
    item("pampas-grass-xl", "Pampas grass XL", G, 44.50, bunch),
    item("pittosporum-green", "Pittosporum green", G, 9.50, bunch),
    item("pittosporum-mini", "Pittosporum mini", G, 13.25, bunch),
    item("plumosa", "Plumosa", G, 9.50, bunch),
    item("robellini-70cm", "Robellini 70cm", G, 13.95, bunch),
    item("robellini-120cm", "Robellini 120cm", G, 4.95, bunch),
    item("salal", "Salal", G, 11.75, bunch),
    item("salal-tip", "Salal tip", G, 8.50, bunch),
    item("smilax-10lbs", "Smilax", G, 135.00, box, "(10 lbs)"),
    item("sprengeri", "Sprengeri", G, 8.75, bunch),
    item("sword-fern", "Sword fern", G, 12.95, bunch),
    item("sword-fern-small", "Sword fern (small)", G, 7.25, bunch),
    item("tree-fern", "Tree fern", G, 7.50, bunch),
    item("umbrella-fern", "Umbrella fern", G, 22.50, bunch),
    item("ti-leaves", "Ti leaves", G, 4.50, stem),

    /* ===== TROPICALS & ORCHIDS ===== */
    item("anthurium", "Anthurium", T, 9.75, stem, "", ANTHURIUM),
    item("alocasia", "Alocasia", T, 3.50, stem),
    item("bird-of-paradise", "Bird of Paradise", T, 3.50, stem),
    item("ginger", "Ginger", T, 3.50, stem),
    item("heliconia-small", "Heliconia small", T, 3.50, stem),
    item("mokara-orchid-bunch", "Mokara orchid", T, 32.00, bunch),
    item("monstera-medium", "Monstera medium", T, 3.75, stem),
    item("orchid-cymbidium", "Orchid Cymbidium", T, 32.00, stem),
    item("orchid-cymbidium-standard", "Orchid Cymbidium (standard)", T, 12.95, stem),
    item("orchid-dendrobium", "Orchid Dendrobium", T, 30.00, bunch),
    item("phalaenopsis", "Phalaenopsis", T, 33.50, stem),
    item("pincushion-protea", "Pincushion protea", T, 3.95, stem),
    item("protea-pink-ice", "Protea pink ice", T, 7.00, stem),
    item("shampoo-ginger", "Shampoo ginger", T, 7.95, stem),

    /* ===== GARDEN ROSES (parent + searchable varieties) ===== */
    item("garden-rose", "Garden rose", GR, 1.55, stem, "", colorObjs(gardenColorRows)),
    item("garden-rose-antonia", "Antonia", GR, 1.55, stem),
    item("garden-rose-expression", "Expression", GR, 2.75, stem),
    item("garden-rose-heart", "Heart", GR, 2.25, stem),
    item("garden-rose-juliette", "Juliette", GR, 4.95, stem),
    item("garden-rose-keira", "Keira", GR, 4.85, stem),
    item("garden-rose-mayra", "Mayra", GR, 2.95, stem),
    item("garden-rose-ohara-pink", "O'Hara Pink", GR, 2.25, stem),
    item("garden-rose-ohara-white", "O'Hara White", GR, 2.25, stem),
    item("garden-rose-patience", "Patience", GR, 4.75, stem),
    item("garden-rose-veggie", "Quicksand-like Veggie", GR, 5.15, stem),
    item("garden-rose-white-60", "Garden rose White", GR, 1.95, stem, "(60 st plus)"),
    item("garden-rose-white-jumbo", "Garden rose White jumbo", GR, 3.75, stem),

    /* ===== WEDDING / OFF-TRUCK ROSES ===== */
    item("wedding-rose", "Wedding rose", WR, 27.50, bunch, "", colorObjs(weddingColorRows)),
    item("color-rose", "Color rose", WR, 27.50, bunch),
    item("color-rose-4-plus", "Color rose", WR, 24.50, bunch, "(4 plus)"),
    item("free-spirit", "Free Spirit", WR, 35.00, bunch),
    item("hermosa", "Hermosa", WR, 32.00, bunch),
    item("high-light", "High Light", WR, 35.00, bunch),
    item("moab", "Moab", WR, 35.00, bunch),
    item("playa-blanca", "Playa Blanca", WR, 38.00, bunch),
    item("tinted-roses", "Tinted roses", WR, 40.00, bunch),
    item("toffee", "Toffee", WR, 37.50, bunch),
    item("roselyn", "Roselyn", WR, 37.50, bunch),

    /* ===== RED ROSES ===== */
    item("rose-red", "Rose red", RR, 26.95, bunch, "", colorObjs(redColorRows)),
    item("black-magic", "Black Magic", RR, 34.00, bunch),
    item("rose-red-std", "Rose Red", RR, 26.95, bunch),
    item("rose-red-4-plus", "Rose Red", RR, 25.00, bunch, "(4 bu plus)"),
    item("dozen-rainbow", "Dozen rainbow", RR, 11.00, bunch),

    /* ===== HYDRANGEAS ===== */
    item("hydrangea", "Hydrangea", H, 2.10, stem, "", colorObjs(hydrangeaColorRows)),
    item("hydrangea-antique", "Hydrangea Antique", H, 14.95, bunch),
    item("hydrangea-blue", "Hydrangea Blue", H, 2.10, stem),
    item("hydrangea-blue-60", "Hydrangea Blue", H, 1.95, stem, "(60 st plus)"),
    item("hydrangea-blue-shocking", "Hydrangea Blue shocking", H, 2.15, stem),
    item("hydrangea-green-emerald-lemon", "Hydrangea Green / Emerald / Lemon", H, 2.70, stem),
    item("hydrangea-mini-green", "Hydrangea Mini green", H, 1.30, stem),
    item("hydrangea-mini-green-60", "Hydrangea Mini green", H, 1.40, stem, "(60 st plus)"),
    item("hydrangea-pink-off-truck", "Hydrangea Pink off truck", H, 3.25, stem),
    item("hydrangea-pink-natural-wedding", "Hydrangea Pink natural wedding", H, 4.85, stem),
    item("hydrangea-purple", "Hydrangea Purple", H, 2.85, stem),
    item("hydrangea-sasha", "Hydrangea Sasha", H, 3.30, stem),
    item("hydrangea-tinted", "Hydrangea Tinted pink / purple", H, 2.50, stem),
    item("hydrangea-white", "Hydrangea White", H, 2.10, stem),
    item("hydrangea-white-60", "Hydrangea White", H, 1.95, stem, "(60 st plus)"),
    item("hydrangea-novelty", "Hydrangea Novelty", H, 2.10, stem)
  ];

  var ids = {};
  catalog.forEach(function (it) {
    if (ids[it.id]) throw new Error("Duplicate catalog id: " + it.id);
    ids[it.id] = true;
  });

  window.LIHMIL_CATALOG = catalog;
})();
