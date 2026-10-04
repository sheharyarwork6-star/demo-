/**
 * CERIS cart — LocalStorage persistence for future checkout/admin integration.
 */
window.CERIS = window.CERIS || {};

CERIS.Cart = {
  get: function () {
    try {
      var raw = localStorage.getItem(CERIS.STORAGE_KEYS.cart);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  },

  save: function (items) {
    try {
      localStorage.setItem(CERIS.STORAGE_KEYS.cart, JSON.stringify(items));
      CERIS.Cart.updateBadge();
      document.dispatchEvent(new CustomEvent("ceris:cart-updated"));
    } catch (err) {
      CERIS.toast("Your browser storage is unavailable right now.");
    }
  },

  add: function (productId, quantity) {
    var qty = Math.max(1, parseInt(quantity, 10) || 1);
    var product = CERIS.getProductById(productId);
    if (!product) return false;

    var items = CERIS.Cart.get();
    var existing = items.find(function (item) {
      return item.id === productId;
    });

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: productId, qty: qty });
    }

    CERIS.Cart.save(items);
    return true;
  },

  setQty: function (productId, quantity) {
    var qty = parseInt(quantity, 10);
    var items = CERIS.Cart.get();

    if (!qty || qty < 1) {
      items = items.filter(function (item) {
        return item.id !== productId;
      });
    } else {
      items.forEach(function (item) {
        if (item.id === productId) item.qty = qty;
      });
    }

    CERIS.Cart.save(items);
  },

  remove: function (productId) {
    var items = CERIS.Cart.get().filter(function (item) {
      return item.id !== productId;
    });
    CERIS.Cart.save(items);
  },

  clear: function () {
    CERIS.Cart.save([]);
  },

  count: function () {
    return CERIS.Cart.get().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  },

  lines: function () {
    return CERIS.Cart.get()
      .map(function (item) {
        var product = CERIS.getProductById(item.id);
        if (!product) return null;
        return {
          product: product,
          qty: item.qty,
          lineTotal: product.price * item.qty
        };
      })
      .filter(Boolean);
  },

  subtotal: function () {
    return CERIS.Cart.lines().reduce(function (sum, line) {
      return sum + line.lineTotal;
    }, 0);
  },

  shipping: function () {
    var sub = CERIS.Cart.subtotal();
    if (sub === 0) return 0;
    if (sub >= CERIS.SHIPPING.freeThreshold) return 0;
    return CERIS.SHIPPING.flat;
  },

  total: function () {
    return CERIS.Cart.subtotal() + CERIS.Cart.shipping();
  },

  updateBadge: function () {
    var count = CERIS.Cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }
};

CERIS.toast = function (message) {
  var existing = document.querySelector(".toast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add("is-visible");
  });

  setTimeout(function () {
    toast.classList.remove("is-visible");
    setTimeout(function () {
      toast.remove();
    }, 400);
  }, 2600);
};

CERIS.bindAddToCart = function (root) {
  var scope = root || document;
  scope.querySelectorAll("[data-add-to-cart]").forEach(function (button) {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-add-to-cart");
      var qtyInput = button.closest("form, .product-actions, .product-card")
        ? button.closest("form, .product-actions, .product-card").querySelector("[data-qty]")
        : null;
      var qty = qtyInput ? qtyInput.value : 1;
      var added = CERIS.Cart.add(id, qty);
      if (added) {
        var product = CERIS.getProductById(id);
        CERIS.toast((product ? product.name : "Product") + " added to bag");
      }
    });
  });
};

CERIS.renderCartPage = function () {
  var list = document.querySelector("[data-cart-list]");
  var empty = document.querySelector("[data-cart-empty]");
  var summary = document.querySelector("[data-cart-summary]");
  if (!list) return;

  var lines = CERIS.Cart.lines();

  if (!lines.length) {
    list.innerHTML = "";
    if (empty) empty.hidden = false;
    if (summary) summary.hidden = true;
    return;
  }

  if (empty) empty.hidden = true;
  if (summary) summary.hidden = false;

  list.innerHTML = lines
    .map(function (line) {
      var p = line.product;
      return (
        '<article class="cart-line">' +
        '<a class="cart-line__media" href="product.html?id=' +
        p.id +
        '">' +
        '<img src="' +
        p.images[0] +
        '" alt="' +
        p.name +
        '">' +
        "</a>" +
        '<div class="cart-line__body">' +
        '<p class="eyebrow">' +
        p.categoryLabel +
        "</p>" +
        '<h3><a href="product.html?id=' +
        p.id +
        '">' +
        p.name +
        "</a></h3>" +
        '<p class="cart-line__meta">' +
        p.size +
        " · " +
        CERIS.formatPrice(p.price) +
        "</p>" +
        '<div class="qty-row">' +
        '<div class="qty" role="group" aria-label="Quantity for ' +
        p.name +
        '">' +
        '<button type="button" data-qty-change="' +
        p.id +
        '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
        '<input type="number" min="1" value="' +
        line.qty +
        '" data-qty-input="' +
        p.id +
        '" aria-label="Quantity">' +
        '<button type="button" data-qty-change="' +
        p.id +
        '" data-delta="1" aria-label="Increase quantity">+</button>' +
        "</div>" +
        '<button type="button" class="link-btn" data-remove="' +
        p.id +
        '">Remove</button>' +
        "</div>" +
        "</div>" +
        '<p class="cart-line__total">' +
        CERIS.formatPrice(line.lineTotal) +
        "</p>" +
        "</article>"
      );
    })
    .join("");

  var subtotalEl = document.querySelector("[data-subtotal]");
  var shippingEl = document.querySelector("[data-shipping]");
  var totalEl = document.querySelector("[data-total]");
  var shippingNote = document.querySelector("[data-shipping-note]");

  if (subtotalEl) subtotalEl.textContent = CERIS.formatPrice(CERIS.Cart.subtotal());
  if (shippingEl) {
    shippingEl.textContent =
      CERIS.Cart.shipping() === 0 ? "Complimentary" : CERIS.formatPrice(CERIS.Cart.shipping());
  }
  if (totalEl) totalEl.textContent = CERIS.formatPrice(CERIS.Cart.total());
  if (shippingNote) {
    var remaining = CERIS.SHIPPING.freeThreshold - CERIS.Cart.subtotal();
    shippingNote.textContent =
      remaining > 0
        ? "Add " + CERIS.formatPrice(remaining) + " for complimentary shipping."
        : "Your order includes complimentary shipping.";
  }
};

CERIS.renderCheckoutSummary = function () {
  var mount = document.querySelector("[data-checkout-lines]");
  if (!mount) return;

  var lines = CERIS.Cart.lines();
  if (!lines.length) {
    mount.innerHTML = '<p class="empty-note">Your bag is empty. <a href="products.html">Shop the collection</a>.</p>';
    document.querySelectorAll("[data-place-order]").forEach(function (btn) {
      btn.disabled = true;
    });
  } else {
    mount.innerHTML = lines
      .map(function (line) {
        return (
          '<div class="summary-line">' +
          '<img src="' +
          line.product.images[0] +
          '" alt="">' +
          "<div><p>" +
          line.product.name +
          "</p><span>Qty " +
          line.qty +
          "</span></div>" +
          "<strong>" +
          CERIS.formatPrice(line.lineTotal) +
          "</strong>" +
          "</div>"
        );
      })
      .join("");
  }

  var subtotalEl = document.querySelector("[data-subtotal]");
  var shippingEl = document.querySelector("[data-shipping]");
  var totalEl = document.querySelector("[data-total]");
  if (subtotalEl) subtotalEl.textContent = CERIS.formatPrice(CERIS.Cart.subtotal());
  if (shippingEl)
    shippingEl.textContent =
      CERIS.Cart.shipping() === 0 && CERIS.Cart.subtotal() > 0
        ? "Complimentary"
        : CERIS.Cart.subtotal() === 0
          ? "—"
          : CERIS.formatPrice(CERIS.Cart.shipping());
  if (totalEl) totalEl.textContent = CERIS.formatPrice(CERIS.Cart.total());
};

document.addEventListener("click", function (event) {
  var qtyBtn = event.target.closest("[data-qty-change]");
  if (qtyBtn) {
    var id = qtyBtn.getAttribute("data-qty-change");
    var delta = parseInt(qtyBtn.getAttribute("data-delta"), 10);
    var current = CERIS.Cart.get().find(function (item) {
      return item.id === id;
    });
    var next = (current ? current.qty : 1) + delta;
    CERIS.Cart.setQty(id, next);
    CERIS.renderCartPage();
    CERIS.renderCheckoutSummary();
  }

  var removeBtn = event.target.closest("[data-remove]");
  if (removeBtn) {
    CERIS.Cart.remove(removeBtn.getAttribute("data-remove"));
    CERIS.toast("Item removed from bag");
    CERIS.renderCartPage();
    CERIS.renderCheckoutSummary();
  }
});

document.addEventListener("change", function (event) {
  var input = event.target.closest("[data-qty-input]");
  if (!input) return;
  CERIS.Cart.setQty(input.getAttribute("data-qty-input"), input.value);
  CERIS.renderCartPage();
});

document.addEventListener("DOMContentLoaded", function () {
  CERIS.Cart.updateBadge();
  CERIS.bindAddToCart(document);
  CERIS.renderCartPage();
  CERIS.renderCheckoutSummary();
});
