/**
 * CERIS shared UI: navigation, search, forms, gallery, accordion, motion.
 */
(function () {
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-drawer");
  var searchOpen = document.querySelectorAll("[data-open-search]");
  var searchModal = document.querySelector(".search-modal");
  var yearEl = document.querySelector("[data-year]");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = !mobileNav.classList.contains("is-open");
      mobileNav.classList.toggle("is-open", open);
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  function openSearch() {
    if (!searchModal) return;
    searchModal.hidden = false;
    searchModal.style.display = "grid";
    searchModal.style.pointerEvents = "auto";
    searchModal.style.opacity = "1";
    searchModal.style.visibility = "visible";
    requestAnimationFrame(function () {
      searchModal.classList.add("is-open");
    });
    var field = searchModal.querySelector("input");
    if (field) field.focus();
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove("is-open");
    searchModal.style.opacity = "0";
    searchModal.style.visibility = "hidden";
    searchModal.style.pointerEvents = "none";
    setTimeout(function () {
      searchModal.hidden = true;
      searchModal.style.display = "none";
    }, 260);
  }

  searchOpen.forEach(function (btn) {
    btn.addEventListener("click", openSearch);
  });

  if (searchModal) {
    searchModal.addEventListener("click", function (event) {
      if (event.target === searchModal || event.target.closest("[data-close-search]")) {
        closeSearch();
      }
    });

    var searchForm = searchModal.querySelector("form");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = (searchModal.querySelector("input").value || "").trim().toLowerCase();
      if (!query) return;
      var match = CERIS.PRODUCTS.find(function (product) {
        return (
          product.name.toLowerCase().indexOf(query) !== -1 ||
          product.category.toLowerCase().indexOf(query) !== -1
        );
      });
        window.location.href = match ? "product.html?id=" + match.id : "products.html";
      });
    }
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
      if (mobileNav) {
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      var id = anchor.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });

  document.querySelectorAll("[data-accordion]").forEach(function (item) {
    var trigger = item.querySelector("button");
    var panel = item.querySelector(".accordion__panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      var group = item.closest("[data-accordion-group]");
      var open = item.classList.contains("is-open");
      if (!group) return;

      group.querySelectorAll("[data-accordion]").forEach(function (other) {
        other.classList.remove("is-open");
        var otherBtn = other.querySelector("button");
        var otherPanel = other.querySelector(".accordion__panel");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherPanel) otherPanel.style.maxHeight = null;
      });

      if (!open) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  var galleryMain = document.querySelector("[data-gallery-main]");
  if (galleryMain) {
    document.querySelectorAll("[data-gallery-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        galleryMain.src = thumb.getAttribute("data-src") || thumb.src;
        galleryMain.alt = thumb.alt;
        document.querySelectorAll("[data-gallery-thumb]").forEach(function (el) {
          el.classList.toggle("is-active", el === thumb);
        });
      });
    });
  }

  var qtyGroups = document.querySelectorAll(".qty[data-local-qty]");
  qtyGroups.forEach(function (group) {
    var input = group.querySelector("input");
    group.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = parseInt(btn.getAttribute("data-delta"), 10);
        var next = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
        input.value = next;
      });
    });
  });

  function setFieldError(field, message) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    var error = wrap.querySelector(".field-error");
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message || "";
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (!email.value.trim()) {
        setFieldError(email, "Please enter your email address.");
        return;
      }
      if (!isEmail(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        return;
      }
      setFieldError(email, "");
      localStorage.setItem(CERIS.STORAGE_KEYS.newsletter, email.value.trim());
      form.reset();
      CERIS.toast("Welcome to the CERIS list.");
    });
  });

  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = contactForm.querySelector("#contact-name");
      var email = contactForm.querySelector("#contact-email");
      var subject = contactForm.querySelector("#contact-subject");
      var message = contactForm.querySelector("#contact-message");
      var valid = true;

      if (!name.value.trim()) {
        setFieldError(name, "Please share your name.");
        valid = false;
      } else setFieldError(name, "");

      if (!isEmail(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        valid = false;
      } else setFieldError(email, "");

      if (!subject.value.trim()) {
        setFieldError(subject, "Please add a subject.");
        valid = false;
      } else setFieldError(subject, "");

      if (message.value.trim().length < 12) {
        setFieldError(message, "Please write a short message (at least 12 characters).");
        valid = false;
      } else setFieldError(message, "");

      if (!valid) return;

      contactForm.reset();
      CERIS.toast("Message sent. We will be in touch shortly.");
    });
  }

  var checkoutForm = document.querySelector("[data-checkout-form]");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!CERIS.Cart.lines().length) {
        CERIS.toast("Your bag is empty.");
        return;
      }

      var fields = [
        ["#full-name", "Please enter your full name."],
        ["#checkout-email", "email"],
        ["#phone", "Please enter a phone number."],
        ["#address", "Please enter a shipping address."],
        ["#city", "Please enter your city."],
        ["#postal", "Please enter a postal code."]
      ];

      var valid = true;
      fields.forEach(function (pair) {
        var field = checkoutForm.querySelector(pair[0]);
        if (pair[1] === "email") {
          if (!isEmail(field.value.trim())) {
            setFieldError(field, "Please enter a valid email address.");
            valid = false;
          } else setFieldError(field, "");
        } else if (!field.value.trim()) {
          setFieldError(field, pair[1]);
          valid = false;
        } else setFieldError(field, "");
      });

      var payment = checkoutForm.querySelector('input[name="payment"]:checked');
      if (!payment) {
        CERIS.toast("Please select a payment method.");
        valid = false;
      }

      if (!valid) return;

      var order = {
        id: "CERIS-" + Date.now().toString().slice(-8),
        createdAt: new Date().toISOString(),
        customer: {
          name: checkoutForm.querySelector("#full-name").value.trim(),
          email: checkoutForm.querySelector("#checkout-email").value.trim(),
          phone: checkoutForm.querySelector("#phone").value.trim(),
          address: checkoutForm.querySelector("#address").value.trim(),
          city: checkoutForm.querySelector("#city").value.trim(),
          postal: checkoutForm.querySelector("#postal").value.trim()
        },
        payment: payment.value,
        items: CERIS.Cart.lines().map(function (line) {
          return { id: line.product.id, name: line.product.name, qty: line.qty, price: line.product.price };
        }),
        totals: {
          subtotal: CERIS.Cart.subtotal(),
          shipping: CERIS.Cart.shipping(),
          total: CERIS.Cart.total()
        }
      };

      var orders = [];
      try {
        orders = JSON.parse(localStorage.getItem(CERIS.STORAGE_KEYS.orders) || "[]");
      } catch (err) {
        orders = [];
      }
      orders.unshift(order);
      localStorage.setItem(CERIS.STORAGE_KEYS.orders, JSON.stringify(orders));
      CERIS.Cart.clear();

      var confirm = document.querySelector("[data-order-confirm]");
      if (confirm) {
        confirm.hidden = false;
        confirm.querySelector("[data-order-id]").textContent = order.id;
        checkoutForm.hidden = true;
        var layout = document.querySelector(".checkout-layout");
        if (layout) layout.hidden = true;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function renderProductCards(target, products, options) {
    if (!target) return;
    var opts = options || {};
    if (!products.length) {
      target.innerHTML = '<p class="empty-note">No products in this collection yet.</p>';
      return;
    }

    target.innerHTML = products
      .map(function (product) {
        return (
          '<article class="product-card reveal">' +
          '<a class="product-card__media" href="product.html?id=' +
          product.id +
          '">' +
          '<img src="' +
          product.images[0] +
          '" alt="' +
          product.name +
          '">' +
          "</a>" +
          '<div class="product-card__body">' +
          '<p class="eyebrow">' +
          product.categoryLabel +
          " · " +
          product.size +
          "</p>" +
          "<h3><a href=\"product.html?id=" +
          product.id +
          '">' +
          product.name +
          "</a></h3>" +
          "<p>" +
          product.shortDescription +
          "</p>" +
          '<div class="product-card__footer">' +
          "<span>" +
          CERIS.formatPrice(product.price) +
          "</span>" +
          '<div class="product-card__actions">' +
          (opts.addToCart
            ? '<button type="button" class="btn btn--ghost btn--small" data-add-to-cart="' +
              product.id +
              '">Add to Cart</button>'
            : "") +
          '<a class="btn btn--dark btn--small" href="product.html?id=' +
          product.id +
          '">View Product</a>' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    document.querySelectorAll(".product-grid .reveal").forEach(function (el) {
      observer.observe(el);
    });
    CERIS.bindAddToCart(target);
  }

  var featuredGrid = document.querySelector("[data-featured-grid]");
  if (featuredGrid) {
    renderProductCards(
      featuredGrid,
      CERIS.PRODUCTS.filter(function (p) {
        return p.featured;
      }),
      { addToCart: false }
    );
  }

  var shopGrid = document.querySelector("[data-shop-grid]");
  if (shopGrid) {
    var activeFilter = "all";
    function applyFilter() {
      var items =
        activeFilter === "all"
          ? CERIS.PRODUCTS
          : CERIS.PRODUCTS.filter(function (p) {
              return p.category === activeFilter;
            });
      renderProductCards(shopGrid, items, { addToCart: true });
    }
    applyFilter();

    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeFilter = btn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (el) {
          el.classList.toggle("is-active", el === btn);
          el.setAttribute("aria-pressed", String(el === btn));
        });
        applyFilter();
      });
    });
  }

  var pdp = document.querySelector("[data-product-page]");
  if (pdp) {
    var id = CERIS.getQueryParam("id") || "marshmallow-skin-cleanser";
    var product = CERIS.getProductById(id) || CERIS.PRODUCTS[0];
    renderProductDetail(product);
  }

  function renderProductDetail(product) {
    document.title = product.name + " — CERIS by Gamians";
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", product.shortDescription);

    document.querySelector("[data-pdp-eyebrow]").textContent = product.categoryLabel + " · " + product.size;
    document.querySelector("[data-pdp-name]").textContent = product.name;
    document.querySelector("[data-pdp-price]").textContent = CERIS.formatPrice(product.price);
    document.querySelector("[data-pdp-short]").textContent = product.shortDescription;
    document.querySelectorAll("[data-pdp-long]").forEach(function (el) {
      el.textContent = product.longDescription;
    });
    document.querySelector("[data-add-to-cart]").setAttribute("data-add-to-cart", product.id);

    var buyNow = document.querySelector("[data-buy-now]");
    buyNow.addEventListener("click", function () {
      var qty = document.querySelector("[data-qty]").value;
      CERIS.Cart.add(product.id, qty);
      window.location.href = "checkout.html";
    });

    var mainImg = document.querySelector("[data-gallery-main]");
    mainImg.src = product.images[0];
    mainImg.alt = product.name;

    var thumbs = document.querySelector("[data-gallery-thumbs]");
    thumbs.innerHTML = product.images
      .map(function (src, index) {
        return (
          '<button type="button" class="' +
          (index === 0 ? "is-active" : "") +
          '" data-gallery-thumb data-src="' +
          src +
          '">' +
          '<img src="' +
          src +
          '" alt="' +
          product.name +
          " view " +
          (index + 1) +
          '">' +
          "</button>"
        );
      })
      .join("");

    thumbs.querySelectorAll("[data-gallery-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        mainImg.src = thumb.getAttribute("data-src");
        thumbs.querySelectorAll("[data-gallery-thumb]").forEach(function (el) {
          el.classList.toggle("is-active", el === thumb);
        });
      });
    });

    document.querySelector("[data-benefits]").innerHTML = product.benefits
      .map(function (b) {
        return "<li>" + b + "</li>";
      })
      .join("");

    document.querySelector("[data-ingredients]").innerHTML = product.ingredients
      .map(function (ing) {
        return "<li><strong>" + ing.name + "</strong> — " + ing.note + "</li>";
      })
      .join("");

    document.querySelector("[data-how-to-use]").innerHTML = product.howToUse
      .map(function (step) {
        return "<li>" + step + "</li>";
      })
      .join("");

    var related = document.querySelector("[data-related]");
    renderProductCards(related, CERIS.getRelatedProducts(product.id), { addToCart: false });

    var openPanel = document.querySelector(".accordion__item.is-open .accordion__panel");
    if (openPanel) openPanel.style.maxHeight = openPanel.scrollHeight + "px";
  }

  var adminLogin = document.querySelector("[data-admin-login]");
  var adminApp = document.querySelector("[data-admin-app]");
  if (adminLogin) {
    var session = localStorage.getItem(CERIS.STORAGE_KEYS.admin);
    if (session && adminApp) {
      adminLogin.hidden = true;
      adminApp.hidden = false;
      renderAdmin();
    }

    adminLogin.addEventListener("submit", function (event) {
      event.preventDefault();
      var user = adminLogin.querySelector("#admin-user").value.trim();
      var pass = adminLogin.querySelector("#admin-pass").value;
      if (user === "admin" && pass === "ceris") {
        localStorage.setItem(CERIS.STORAGE_KEYS.admin, "1");
        adminLogin.hidden = true;
        adminApp.hidden = false;
        renderAdmin();
      } else {
        setFieldError(adminLogin.querySelector("#admin-pass"), "Invalid credentials. Use the demo access below.");
      }
    });

    var logout = document.querySelector("[data-admin-logout]");
    if (logout) {
      logout.addEventListener("click", function () {
        localStorage.removeItem(CERIS.STORAGE_KEYS.admin);
        window.location.reload();
      });
    }

    document.querySelectorAll("[data-admin-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var view = btn.getAttribute("data-admin-view");
        document.querySelectorAll("[data-admin-view]").forEach(function (el) {
          el.classList.toggle("is-active", el === btn);
        });
        document.querySelectorAll("[data-panel]").forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-panel") !== view;
        });
      });
    });
  }

  function renderAdmin() {
    var productTable = document.querySelector("[data-admin-products]");
    if (productTable) {
      productTable.innerHTML = CERIS.PRODUCTS.map(function (p) {
        return (
          "<tr><td>" +
          p.sku +
          "</td><td>" +
          p.name +
          "</td><td>" +
          p.categoryLabel +
          "</td><td>" +
          CERIS.formatPrice(p.price) +
          '</td><td><span class="pill">Ready for CMS</span></td></tr>'
        );
      }).join("");
    }

    var orders = [];
    try {
      orders = JSON.parse(localStorage.getItem(CERIS.STORAGE_KEYS.orders) || "[]");
    } catch (err) {
      orders = [];
    }

    var orderTable = document.querySelector("[data-admin-orders]");
    if (orderTable) {
      orderTable.innerHTML = orders.length
        ? orders
            .map(function (o) {
              return (
                "<tr><td>" +
                o.id +
                "</td><td>" +
                o.customer.name +
                "</td><td>" +
                CERIS.formatPrice(o.totals.total) +
                "</td><td>" +
                o.payment +
                "</td></tr>"
              );
            })
            .join("")
        : '<tr><td colspan="4">No stored orders yet.</td></tr>';
    }

    var statProducts = document.querySelector("[data-stat-products]");
    var statOrders = document.querySelector("[data-stat-orders]");
    if (statProducts) statProducts.textContent = String(CERIS.PRODUCTS.length);
    if (statOrders) statOrders.textContent = String(orders.length);
  }
})();
