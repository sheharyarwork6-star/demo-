/**
 * CERIS product catalog
 * Designed for future admin/backend integration.
 * Replace this array (or load from an API) to add, edit, or remove products.
 */
window.CERIS = window.CERIS || {};

CERIS.STORAGE_KEYS = {
  cart: "ceris_cart_v1",
  orders: "ceris_orders_v1",
  admin: "ceris_admin_session",
  newsletter: "ceris_newsletter"
};

CERIS.SHIPPING = {
  flat: 12,
  freeThreshold: 90,
  label: "Complimentary shipping on orders over $90"
};

CERIS.PRODUCTS = [
  {
    id: "marshmallow-skin-cleanser",
    sku: "CER-CLN-001",
    name: "Marshmallow Skin Cleanser",
    category: "cleanser",
    categoryLabel: "Cleanser",
    price: 42,
    size: "150 ml",
    shortDescription:
      "A gentle daily cleanser designed to refresh and purify the skin while maintaining natural moisture.",
    description:
      "A gentle cleanser formulated to remove impurities, excess oil, and daily buildup while leaving the skin feeling soft and refreshed. Marshmallow Skin Cleanser is the first step in the CERIS ritual — a quiet cleanse that respects the skin barrier and prepares the complexion for care.",
    longDescription:
      "Created for morning and evening use, this cleanser lifts away the day without tightness or residue. Marshmallow root extract supports a cushioned, comfortable cleanse, while aloe vera and glycerin help the skin feel calm and comfortably hydrated. The texture is light, the finish is clean, and the experience is unhurried.",
    benefits: [
      "Gently cleanses the skin",
      "Removes daily impurities",
      "Helps maintain natural moisture",
      "Leaves skin feeling soft",
      "Suitable for daily use"
    ],
    ingredients: [
      { name: "Marshmallow Root Extract", note: "Known for its soothing, cushioning feel on the skin." },
      { name: "Aloe Vera", note: "Helps the complexion feel calm and refreshed after cleansing." },
      { name: "Glycerin", note: "A trusted humectant that supports comfortable hydration." }
    ],
    howToUse: [
      "Apply a small amount to damp skin.",
      "Massage gently in circular motions.",
      "Rinse thoroughly with water.",
      "Use morning and evening."
    ],
    images: [
      "assets/images/cleanser-1.jpg",
      "assets/images/cleanser-2.jpg",
      "assets/images/insta-4.jpg"
    ],
    featured: true
  },
  {
    id: "ceris-brightening-cream",
    sku: "CER-CRM-001",
    name: "CERIS Brightening Cream",
    category: "cream",
    categoryLabel: "Cream",
    price: 68,
    size: "50 ml",
    shortDescription:
      "A lightweight brightening cream formulated to support a radiant and healthy-looking complexion.",
    description:
      "A lightweight daily cream designed to hydrate the skin and promote a brighter, more radiant appearance. CERIS Brightening Cream is a modern essential — simple enough for every day, considered enough for a luxury ritual.",
    longDescription:
      "This cream layers easily under the rest of a routine and settles into a refined, non-greasy finish. Niacinamide and a vitamin C derivative work together to support a more even, luminous look, while hyaluronic acid helps the skin feel plump and comfortably hydrated. Designed for morning and evening, it is the second chapter of the CERIS collection.",
    benefits: [
      "Supports radiant-looking skin",
      "Provides hydration",
      "Lightweight texture",
      "Suitable for daily skincare routines"
    ],
    ingredients: [
      { name: "Niacinamide", note: "Helps the complexion appear more refined and balanced." },
      { name: "Vitamin C derivative", note: "Supports a brighter, more luminous-looking finish." },
      { name: "Hyaluronic Acid", note: "Attracts moisture for a comfortably hydrated feel." }
    ],
    howToUse: [
      "Apply a small amount to clean skin.",
      "Massage gently until fully absorbed.",
      "Use morning and evening."
    ],
    images: [
      "assets/images/cream-1.jpg",
      "assets/images/cream-2.jpg",
      "assets/images/insta-2.jpg"
    ],
    featured: true
  }
];

CERIS.getProductById = function (id) {
  return CERIS.PRODUCTS.find(function (product) {
    return product.id === id;
  });
};

CERIS.getRelatedProducts = function (id) {
  return CERIS.PRODUCTS.filter(function (product) {
    return product.id !== id;
  });
};

CERIS.formatPrice = function (value) {
  return "$" + Number(value).toFixed(2);
};

CERIS.getQueryParam = function (name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name);
};

CERIS.assetPath = function (path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.charAt(0) === "/") return path;
  var depth = window.location.pathname.split("/").filter(Boolean).length;
  var inSubfolder = depth > 1;
  if (inSubfolder && path.indexOf("assets/") === 0) {
    return "../" + path;
  }
  return path;
};
