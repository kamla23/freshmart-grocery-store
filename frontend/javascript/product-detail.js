/**
 * FreshMart - Product Detail Page Logic (product-detail.js)
 * Manages Image Gallery, Pack Size Variants, and Cart Integration.
 */

// Global State for Product Detail
let selectedPrice = 30;
let selectedVariant = "250g";

document.addEventListener("DOMContentLoaded", () => {
  // Determine initial variant and price if present
  const checkedRadio = document.querySelector('input[name="variant"]:checked');
  if (checkedRadio) {
    selectedPrice = Number(checkedRadio.dataset.price) || 30;
    selectedVariant = checkedRadio.value;
  }

  // Sync Cart Badge
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }
});

/**
 * 1. Gallery Thumbnail Switcher
 */
function changeImage(src, thumbElement) {
  const mainImg = document.getElementById("mainProductImg");
  if (mainImg) {
    mainImg.src = src;
  }

  document.querySelectorAll(".thumb").forEach((thumb) => {
    thumb.classList.remove("active");
  });
  if (thumbElement) {
    thumbElement.classList.add("active");
  }
}

/**
 * 2. Unit Variant Picker & Dynamic Price Updater
 */
function updateVariant(radioInput) {
  selectedPrice = Number(radioInput.dataset.price) || 0;
  selectedVariant = radioInput.value;

  const priceDisplay = document.getElementById("displayPrice");
  if (priceDisplay) {
    priceDisplay.textContent = `₹${selectedPrice}`;
  }

  document.querySelectorAll(".variant-card").forEach((card) => {
    card.classList.remove("active");
  });
  radioInput.closest(".variant-card").classList.add("active");
}

/**
 * 3. Add to Cart Logic (Integrated with freshmart_cart)
 */
function addDetailToCart(productId) {
  const cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  const titleEl = document.querySelector(".product-title");
  const productName = titleEl ? titleEl.textContent.trim() : "Organic Fresh Spinach";

  const imgEl = document.getElementById("mainProductImg");
  const productImg = imgEl ? imgEl.getAttribute("src") : "../images/vagetables.jpeg";

  const idStr = String(productId);
  const existingItemIndex = cart.findIndex(
    (item) => String(item.id) === idStr && item.variant === selectedVariant
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    const productItem = {
      id: idStr,
      name: productName,
      price: selectedPrice,
      variant: selectedVariant,
      image: productImg,
      quantity: 1,
    };
    cart.push(productItem);
  }

  if (typeof saveCart === "function") {
    saveCart(cart);
  } else {
    localStorage.setItem("freshmart_cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
  }

  // Visual feedback
  const btn = document.querySelector(".btn-add-detail");
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-check"></i> Added (${selectedVariant})!`;
    btn.style.backgroundColor = "#059669";
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = "";
    }, 1500);
  }
}
