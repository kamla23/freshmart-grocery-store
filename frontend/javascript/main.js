/**
 * FreshMart - Global Common JavaScript (main.js)
 * Manages Cart Synchronization (freshmart_cart), Navigation, Pincode Modal, and Search.
 */

// ================= 1. CART STORAGE HELPERS ================= //
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("freshmart_cart")) || [];
  } catch (e) {
    console.error("Error reading freshmart_cart from localStorage:", e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("freshmart_cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving freshmart_cart to localStorage:", e);
  }
  updateCartBadge();
}

// Update Cart Badge Icon Across All Pages
function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = totalItems;
  }
}

// Extract product metadata from a DOM .product-card
function getProductDataFromCard(card, productId) {
  if (!card) {
    return {
      id: String(productId),
      name: "Fresh Grocery Item",
      price: 30,
      variant: "Standard",
      image: "../images/vagetables.jpeg",
      quantity: 1
    };
  }

  const titleEl = card.querySelector(".product-title");
  const priceEl = card.querySelector(".current-price");
  const imgEl = card.querySelector("img");
  const unitEl = card.querySelector(".unit") || card.querySelector(".weight-tag");

  let name = "Fresh Grocery Item";
  if (titleEl) {
    // Clone node to safely remove badge/weight-tag if nested
    const clone = titleEl.cloneNode(true);
    const nestedTags = clone.querySelectorAll(".weight-tag, .unit");
    nestedTags.forEach(tag => tag.remove());
    name = clone.textContent.trim() || titleEl.textContent.trim();
  }

  let price = 0;
  if (priceEl) {
    const numericStr = priceEl.textContent.replace(/[^0-9.]/g, "");
    price = parseFloat(numericStr) || 0;
  }

  let image = imgEl ? imgEl.getAttribute("src") : "../images/vagetables.jpeg";
  let variant = unitEl ? unitEl.textContent.replace("/", "").trim() : "Standard";

  return {
    id: String(productId),
    name: name,
    price: price,
    variant: variant,
    image: image,
    quantity: 1
  };
}

// ================= 2. CART ACTIONS (ADD & QTY CHANGE) ================= //

// User clicks initial "Add" button on a product card
function handleAddInitial(btnElement, productId) {
  const container = btnElement.closest(".cart-action-container") || btnElement.parentElement;
  const card = btnElement.closest(".product-card");
  const counterBox = container.querySelector(".qty-counter-box");
  const qtySpan = container.querySelector(".qty-value");

  const cart = getCart();
  const idStr = String(productId);
  const existingIndex = cart.findIndex(item => String(item.id) === idStr);

  let newQty = 1;
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
    newQty = cart[existingIndex].quantity;
  } else {
    const newItem = getProductDataFromCard(card, productId);
    newItem.quantity = 1;
    cart.push(newItem);
    newQty = 1;
  }

  saveCart(cart);

  btnElement.classList.add("hidden");
  if (btnElement.style) btnElement.style.display = "none";

  if (counterBox) {
    counterBox.classList.remove("hidden");
    counterBox.style.display = "flex";
  }
  if (qtySpan) {
    qtySpan.textContent = newQty;
  }
}

// User clicks "+" or "-" buttons on a product card
function updateQty(productId, change, btnElement) {
  const container = btnElement.closest(".cart-action-container") || btnElement.parentElement;
  const card = btnElement.closest(".product-card");
  const qtySpan = container.querySelector(".qty-value");
  const addBtn = container.querySelector(".btn-add-cart");
  const counterBox = container.querySelector(".qty-counter-box");

  const cart = getCart();
  const idStr = String(productId);
  const existingIndex = cart.findIndex(item => String(item.id) === idStr);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += change;

    if (cart[existingIndex].quantity <= 0) {
      cart.splice(existingIndex, 1);

      if (counterBox) {
        counterBox.classList.add("hidden");
        counterBox.style.display = "none";
      }
      if (addBtn) {
        addBtn.classList.remove("hidden");
        addBtn.style.display = "flex";
      }
    } else {
      if (qtySpan) qtySpan.textContent = cart[existingIndex].quantity;
    }
  } else if (change > 0) {
    // If not in cart yet, add it
    const newItem = getProductDataFromCard(card, productId);
    newItem.quantity = 1;
    cart.push(newItem);
    if (qtySpan) qtySpan.textContent = 1;
  }

  saveCart(cart);

  // Sync if on cart page table
  if (typeof renderCartTable === "function") {
    renderCartTable();
  }
}

// Restore Card UI counters from saved cart state on page load
function restoreCartUI() {
  const cart = getCart();
  const cartMap = {};
  cart.forEach(item => {
    cartMap[String(item.id)] = item.quantity;
  });

  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    const pid = card.getAttribute("data-id");
    if (!pid) return;

    const addBtn = card.querySelector(".btn-add-cart");
    const counterBox = card.querySelector(".qty-counter-box");
    const qtySpan = card.querySelector(".qty-value");

    if (cartMap[pid] && cartMap[pid] > 0) {
      if (addBtn) {
        addBtn.classList.add("hidden");
        addBtn.style.display = "none";
      }
      if (counterBox) {
        counterBox.classList.remove("hidden");
        counterBox.style.display = "flex";
      }
      if (qtySpan) {
        qtySpan.textContent = cartMap[pid];
      }
    } else {
      if (addBtn) {
        addBtn.classList.remove("hidden");
        addBtn.style.display = "flex";
      }
      if (counterBox) {
        counterBox.classList.add("hidden");
        counterBox.style.display = "none";
      }
    }
  });
}

// ================= 3. PINCODE MODAL FUNCTIONS ================= //
function openPincodeModal() {
  const modal = document.getElementById("pincodeModal");
  if (modal) {
    modal.style.display = "flex";
    const input = document.getElementById("pincodeInput") || document.getElementById("modalPincodeInput");
    if (input) input.focus();
  }
}

function closePincodeModal() {
  const modal = document.getElementById("pincodeModal");
  if (modal) {
    modal.style.display = "none";
    const msg = document.getElementById("pincodeMsg") || document.getElementById("modalErrorMsg");
    if (msg) msg.textContent = "";
  }
}

function savePincode() {
  const input = document.getElementById("pincodeInput") || document.getElementById("modalPincodeInput");
  const msg = document.getElementById("pincodeMsg") || document.getElementById("modalErrorMsg");
  if (!input) return;

  const pincode = input.value.trim();
  if (/^[1-9][0-9]{5}$/.test(pincode)) {
    localStorage.setItem("user_pincode", pincode);
    const display = document.getElementById("currentPincode");
    if (display) display.textContent = pincode;
    if (msg) {
      msg.style.color = "#10b981";
      msg.textContent = "Pincode updated successfully!";
    }
    setTimeout(() => {
      closePincodeModal();
    }, 600);
  } else {
    if (msg) {
      msg.style.color = "#ef4444";
      msg.style.display = "block";
      msg.textContent = "Please enter a valid 6-digit Indian Pincode.";
    }
  }
}

function savePincodeFromModal() {
  savePincode();
}

// Close modal when clicking outside modal-content
window.addEventListener("click", (event) => {
  const modal = document.getElementById("pincodeModal");
  if (event.target === modal) {
    closePincodeModal();
  }
});

// ================= 4. LIVE SEARCH & FILTERING ================= //
function filterProducts() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const filter = input.value.toLowerCase().trim();
  const productCards = document.querySelectorAll(".products-grid .product-card, #listingGrid .product-card");

  if (productCards.length === 0) {
    // If not on listing page and user presses Enter, redirect to products.html
    return;
  }

  let hasMatches = false;

  productCards.forEach(card => {
    const title = card.querySelector(".product-title")?.textContent.toLowerCase() || "";
    const category = card.querySelector(".product-cat")?.textContent.toLowerCase() || "";

    if (title.includes(filter) || category.includes(filter)) {
      card.style.display = "flex";
      hasMatches = true;
    } else {
      card.style.display = "none";
    }
  });

  // Handle count and empty state if present
  const grid = document.getElementById("listingGrid") || document.querySelector(".products-grid");
  let noResultsMsg = document.getElementById("noResultsMsg");

  if (!hasMatches && grid) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("p");
      noResultsMsg.id = "noResultsMsg";
      noResultsMsg.style.cssText = "grid-column: 1/-1; text-align: center; font-weight: 700; color: #6b7280; padding: 30px;";
      noResultsMsg.textContent = "No matching products found!";
      grid.appendChild(noResultsMsg);
    }
  } else if (noResultsMsg) {
    noResultsMsg.remove();
  }

  if (typeof updateProductCount === "function") {
    updateProductCount();
  }
}

function handleSearchSubmit() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const query = input.value.trim();
  const productCards = document.querySelectorAll("#listingGrid .product-card");

  if (productCards.length === 0) {
    // On homepage or other page -> navigate to products.html
    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
  } else {
    filterProducts();
  }
}

// ================= 5. CAROUSEL SCROLL FUNCTIONS ================= //
function scrollCarousel(direction) {
  const container = document.getElementById("trendingCarousel");
  if (container) {
    container.scrollBy({ left: 240 * direction, behavior: "smooth" });
  }
}

function scrollCategories(direction) {
  const container = document.querySelector(".categories-container");
  if (container) {
    container.scrollBy({ left: 200 * direction, behavior: "smooth" });
  }
}

// ================= 6. DOM CONTENT LOADED INITIALIZER ================= //
document.addEventListener("DOMContentLoaded", () => {
  // Update badge and card counters
  restoreCartUI();
  updateCartBadge();

  // Restore saved pincode
  const savedPincode = localStorage.getItem("user_pincode");
  if (savedPincode) {
    const pincodeDisplay = document.getElementById("currentPincode");
    if (pincodeDisplay) pincodeDisplay.textContent = savedPincode;
  }

  // Attach Search listeners
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const listingGrid = document.getElementById("listingGrid");
      if (listingGrid) {
        filterProducts();
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleSearchSubmit();
    });
  }

  // Attach Category arrow buttons if present
  const catArrows = document.querySelectorAll(".categories-header .arrow-btn");
  if (catArrows.length >= 2) {
    catArrows[0].addEventListener("click", () => scrollCategories(-1));
    catArrows[1].addEventListener("click", () => scrollCategories(1));
  }

  // Sync user authentication status in navbar
  const userAuthBtn = document.getElementById("userAuthBtn");
  if (userAuthBtn) {
    const isLoggedIn = localStorage.getItem("freshmart_user_logged_in") === "true";
    let profile = null;
    try {
      profile = JSON.parse(localStorage.getItem("freshmart_user_profile"));
    } catch(e) {}

    if (isLoggedIn && profile && profile.name) {
      userAuthBtn.href = "profile.html";
      const firstName = profile.name.split(" ")[0];
      userAuthBtn.innerHTML = `<i class="fa-solid fa-circle-user"></i> <span>${firstName}</span>`;
    }
  }
});
