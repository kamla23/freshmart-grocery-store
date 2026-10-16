/**
 * FreshMart - Cart Page Logic (cart.js)
 * Interacts with freshmart_cart stored in localStorage.
 */

let appliedDiscountRate = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderCartTable();
});

/**
 * 1. Render Table & Update Order Summary
 */
function renderCartTable() {
  const cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  const tableBody = document.getElementById("cartTableBody");
  const emptyCartMsg = document.getElementById("emptyCartMsg");
  const cartTotalItems = document.getElementById("cartTotalItems");
  const cartTable = document.querySelector(".cart-table");

  const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  if (cartTotalItems) cartTotalItems.textContent = totalCount;

  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (cart.length === 0) {
    if (emptyCartMsg) emptyCartMsg.classList.remove("hidden");
    if (cartTable) cartTable.style.display = "none";
    updateBillDetails(0);
    return;
  }

  if (emptyCartMsg) emptyCartMsg.classList.add("hidden");
  if (cartTable) cartTable.style.display = "table";

  let subtotal = 0;

  cart.forEach((item, index) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    const itemTotal = price * qty;
    subtotal += itemTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="cart-product-cell">
          <img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name || 'Product'}">
          <span class="cart-product-title">${item.name || 'Grocery Item'}</span>
        </div>
      </td>
      <td><span class="badge-variant">${item.variant || 'Standard'}</span></td>
      <td>₹${price}</td>
      <td>
        <div class="table-qty-box">
          <button type="button" class="table-qty-btn" onclick="changeCartQty(${index}, -1)">-</button>
          <span class="table-qty-val">${qty}</span>
          <button type="button" class="table-qty-btn" onclick="changeCartQty(${index}, 1)">+</button>
        </div>
      </td>
      <td><strong>₹${itemTotal}</strong></td>
      <td>
        <button type="button" class="btn-delete-item" onclick="removeCartItem(${index})" title="Delete Item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateBillDetails(subtotal);
}

/**
 * 2. Quantity Change & Remove Item
 */
function changeCartQty(index, change) {
  let cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    if (typeof saveCart === "function") {
      saveCart(cart);
    } else {
      localStorage.setItem("freshmart_cart", JSON.stringify(cart));
      if (typeof updateCartBadge === "function") updateCartBadge();
    }
    renderCartTable();
  }
}

function removeCartItem(index) {
  let cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  if (cart[index]) {
    cart.splice(index, 1);
    if (typeof saveCart === "function") {
      saveCart(cart);
    } else {
      localStorage.setItem("freshmart_cart", JSON.stringify(cart));
      if (typeof updateCartBadge === "function") updateCartBadge();
    }
    renderCartTable();
  }
}

/**
 * 3. Calculation Logic (Subtotal, Tax, Delivery, Coupon)
 */
function updateBillDetails(subtotal) {
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : 30) : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discount = Math.round(subtotal * appliedDiscountRate);
  const finalTotal = Math.max(0, subtotal + deliveryFee + tax - discount);

  const subtotalEl = document.getElementById("subtotalAmount");
  const taxEl = document.getElementById("taxAmount");
  const deliveryFeeEl = document.getElementById("deliveryFeeText");
  const discountAmountEl = document.getElementById("discountAmount");
  const discountRowEl = document.getElementById("discountRow");
  const finalPayEl = document.getElementById("finalPayAmount");

  if (subtotalEl) subtotalEl.textContent = subtotal;
  if (taxEl) taxEl.textContent = tax;
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee === 0 && subtotal > 0 ? "FREE" : `₹${deliveryFee}`;
  }
  
  if (discountAmountEl && discountRowEl) {
    if (discount > 0) {
      discountAmountEl.textContent = discount;
      discountRowEl.classList.remove("hidden");
    } else {
      discountRowEl.classList.add("hidden");
    }
  }

  if (finalPayEl) finalPayEl.textContent = finalTotal;
}

/**
 * 4. Coupon Code Logic
 */
function applyCoupon() {
  const couponInput = document.getElementById("couponInput");
  const msg = document.getElementById("couponMsg");
  if (!couponInput || !msg) return;

  const input = couponInput.value.trim().toUpperCase();

  if (input === "FRESH10") {
    appliedDiscountRate = 0.10; // 10% Off
    msg.textContent = "Coupon applied! 10% Discount given.";
    msg.className = "coupon-message success";
  } else if (input === "FRESH50") {
    appliedDiscountRate = 0.15; // 15% Off
    msg.textContent = "Special Coupon applied! 15% Discount given.";
    msg.className = "coupon-message success";
  } else {
    appliedDiscountRate = 0;
    msg.textContent = "Invalid Coupon Code! Try FRESH10 or FRESH50";
    msg.className = "coupon-message error";
  }

  renderCartTable();
}

/**
 * 5. Checkout Authentication Redirect Logic
 */
function handleCheckout() {
  const cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  if (cart.length === 0) {
    alert("Your cart is empty! Please add items before checking out.");
    return;
  }

  // Navigate directly to Checkout & Slot booking
  window.location.href = "checkout.html";
}
