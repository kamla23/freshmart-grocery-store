/**
 * FreshMart - Checkout & Slot Booking Logic (checkout.js)
 * Handles Address validation, Date & Time Slot selection, Substitution Preferences,
 * Payment Method toggles, Cart Summary calculation, and Order Placement.
 */

// Global Checkout State
let selectedAddressType = "Home";
let selectedDate = "Today";
let selectedTimeSlot = "5:00 PM - 7:00 PM";
let selectedSubstitution = "replace";
let selectedPaymentMethod = "COD";
let checkoutCart = [];
let orderTotals = {
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0
};

document.addEventListener("DOMContentLoaded", () => {
  setupDeliveryDates();
  prefillSavedAddress();
  renderOrderSummary();
  updateSlotPreview();
});

// ================= 1. DATES & TIME SLOTS ================= //
function setupDeliveryDates() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const now = new Date();
  
  // Today
  const todayLabel = document.getElementById("dateLabelToday");
  if (todayLabel) {
    todayLabel.textContent = `${now.getDate()} ${months[now.getMonth()]}`;
  }

  // Tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowLabel = document.getElementById("dateLabelTomorrow");
  if (tomorrowLabel) {
    tomorrowLabel.textContent = `${tomorrow.getDate()} ${months[tomorrow.getMonth()]}`;
  }

  // Day After Tomorrow
  const dayAfter = new Date(now);
  dayAfter.setDate(now.getDate() + 2);
  const dayAfterName = document.getElementById("dayAfterDayName");
  const dayAfterLabel = document.getElementById("dateLabelDayAfter");
  if (dayAfterName) dayAfterName.textContent = days[dayAfter.getDay()];
  if (dayAfterLabel) {
    dayAfterLabel.textContent = `${dayAfter.getDate()} ${months[dayAfter.getMonth()]}`;
  }
}

function selectDeliveryDate(pill, dateType) {
  document.querySelectorAll(".date-pill").forEach(p => p.classList.remove("active"));
  pill.classList.add("active");
  selectedDate = dateType;
  updateSlotPreview();
}

function selectTimeSlot(slotCard) {
  if (slotCard.classList.contains("disabled")) return;
  document.querySelectorAll(".slot-card").forEach(s => s.classList.remove("active"));
  slotCard.classList.add("active");
  selectedTimeSlot = slotCard.querySelector(".slot-time")?.textContent || slotCard.getAttribute("data-slot");
  updateSlotPreview();
}

function updateSlotPreview() {
  const previewEl = document.getElementById("previewSlotText");
  if (previewEl) {
    previewEl.textContent = `${selectedDate}: ${selectedTimeSlot}`;
  }
}

// ================= 2. ADDRESS TYPE & PREFILL ================= //
function selectAddressType(btn) {
  document.querySelectorAll(".address-type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  selectedAddressType = btn.getAttribute("data-type") || "Home";
}

function prefillSavedAddress() {
  const savedPincode = localStorage.getItem("user_pincode");
  const pincodeInput = document.getElementById("pincode");
  if (savedPincode && pincodeInput) {
    pincodeInput.value = savedPincode;
  }
}

// ================= 3. SUBSTITUTION & PAYMENT ================= //
function selectSubstitution(card) {
  document.querySelectorAll(".sub-option-card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");
  const radio = card.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;
    selectedSubstitution = radio.value;
  }
}

function selectPaymentMethod(method, optionEl) {
  document.querySelectorAll(".payment-method-option").forEach(o => o.classList.remove("active"));
  optionEl.classList.add("active");
  selectedPaymentMethod = method;

  const radio = optionEl.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Toggle detail sections
  const codBox = document.getElementById("codContent");
  const upiBox = document.getElementById("upiContent");
  const cardBox = document.getElementById("cardContent");

  if (codBox) codBox.classList.add("hidden");
  if (upiBox) upiBox.classList.add("hidden");
  if (cardBox) cardBox.classList.add("hidden");

  if (method === "COD" && codBox) codBox.classList.remove("hidden");
  if (method === "UPI" && upiBox) upiBox.classList.remove("hidden");
  if (method === "CARD" && cardBox) cardBox.classList.remove("hidden");
}

function fillUpiApp(app) {
  const input = document.getElementById("upiIdInput");
  if (!input) return;
  if (app === "gpay") input.value = "user@okhdfcbank";
  if (app === "phonepe") input.value = "9876543210@ybl";
  if (app === "paytm") input.value = "9876543210@paytm";
}

// ================= 4. ORDER SUMMARY RENDER ================= //
function renderOrderSummary() {
  checkoutCart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  const itemsListEl = document.getElementById("summaryItemsList");
  const itemCountEl = document.getElementById("checkoutItemCount");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const deliveryFeeEl = document.getElementById("checkoutDeliveryFee");
  const taxEl = document.getElementById("checkoutTax");
  const totalEl = document.getElementById("checkoutTotalPay");
  const btnPayAmount = document.getElementById("btnPayAmount");
  const placeOrderBtn = document.getElementById("btnPlaceOrder");

  if (!itemsListEl) return;

  const totalQty = checkoutCart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  if (itemCountEl) itemCountEl.textContent = totalQty;

  if (checkoutCart.length === 0) {
    itemsListEl.innerHTML = `
      <p style="text-align: center; color: #6b7280; padding: 20px 0;">
        Your cart is empty! <br>
        <a href="products.html" style="color: #10b981; font-weight: 700;">Browse Groceries</a>
      </p>
    `;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }

  let subtotal = 0;
  itemsListEl.innerHTML = "";

  checkoutCart.forEach(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    const itemTotal = price * qty;
    subtotal += itemTotal;

    const row = document.createElement("div");
    row.className = "summary-item-row";
    row.innerHTML = `
      <div class="summary-item-left">
        <img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name}" class="summary-item-img">
        <div>
          <div class="summary-item-title">${item.name}</div>
          <div class="summary-item-qty">${item.variant || 'Standard'} &times; ${qty}</div>
        </div>
      </div>
      <div class="summary-item-price">₹${itemTotal}</div>
    `;
    itemsListEl.appendChild(row);
  });

  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const finalTotal = subtotal + deliveryFee + tax;

  orderTotals = {
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    tax: tax,
    total: finalTotal
  };

  if (subtotalEl) subtotalEl.textContent = subtotal;
  if (deliveryFeeEl) {
    deliveryFeeEl.innerHTML = deliveryFee === 0 ? '<span class="free-tag">FREE</span>' : `₹${deliveryFee}`;
  }
  if (taxEl) taxEl.textContent = tax;
  if (totalEl) totalEl.textContent = finalTotal;
  if (btnPayAmount) btnPayAmount.textContent = finalTotal;
}

// ================= 5. FORM VALIDATION ================= //
function validateShippingForm() {
  let isValid = true;

  // 1. Full Name
  const nameInput = document.getElementById("fullName");
  const nameError = document.getElementById("nameError");
  if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
    nameError.style.display = "block";
    nameInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    nameError.style.display = "none";
    nameInput.style.borderColor = "";
  }

  // 2. Mobile Phone (10 digits, starts with 6-9)
  const phoneInput = document.getElementById("phoneNumber");
  const phoneError = document.getElementById("phoneError");
  const phoneVal = phoneInput.value.trim();
  if (!/^[6-9]\d{9}$/.test(phoneVal)) {
    phoneError.style.display = "block";
    phoneInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    phoneError.style.display = "none";
    phoneInput.style.borderColor = "";
  }

  // 3. House / Flat No
  const houseInput = document.getElementById("houseNumber");
  const houseError = document.getElementById("houseError");
  if (!houseInput.value.trim()) {
    houseError.style.display = "block";
    houseInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    houseError.style.display = "none";
    houseInput.style.borderColor = "";
  }

  // 4. Street Address
  const streetInput = document.getElementById("streetAddress");
  const streetError = document.getElementById("streetError");
  if (!streetInput.value.trim()) {
    streetError.style.display = "block";
    streetInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    streetError.style.display = "none";
    streetInput.style.borderColor = "";
  }

  // 5. City
  const cityInput = document.getElementById("city");
  const cityError = document.getElementById("cityError");
  if (!cityInput.value.trim()) {
    cityError.style.display = "block";
    cityInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    cityError.style.display = "none";
    cityInput.style.borderColor = "";
  }

  // 6. Pincode (6 digits)
  const pincodeInput = document.getElementById("pincode");
  const pincodeError = document.getElementById("pincodeFieldError");
  if (!/^[1-9][0-9]{5}$/.test(pincodeInput.value.trim())) {
    pincodeError.style.display = "block";
    pincodeInput.style.borderColor = "#ef4444";
    isValid = false;
  } else {
    pincodeError.style.display = "none";
    pincodeInput.style.borderColor = "";
  }

  return isValid;
}

// ================= 6. PLACE ORDER ACTION ================= //
function handlePlaceOrder() {
  if (checkoutCart.length === 0) {
    alert("Your cart is empty! Please add items before placing an order.");
    return;
  }

  // Validate form
  const isFormValid = validateShippingForm();
  if (!isFormValid) {
    // Scroll to the first error
    const firstError = document.querySelector(".field-error[style*='display: block']");
    if (firstError) {
      firstError.parentElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  // Optional UPI validation
  if (selectedPaymentMethod === "UPI") {
    const upiInput = document.getElementById("upiIdInput");
    if (upiInput && !upiInput.value.trim()) {
      alert("Please enter your UPI ID or choose one of the app options.");
      upiInput.focus();
      return;
    }
  }

  // Optional Card validation
  if (selectedPaymentMethod === "CARD") {
    const cardNum = document.getElementById("cardNumberInput");
    if (cardNum && cardNum.value.replace(/\s/g, "").length < 15) {
      alert("Please enter a valid 16-digit card number.");
      cardNum.focus();
      return;
    }
  }

  // Button loading state
  const placeOrderBtn = document.getElementById("btnPlaceOrder");
  const originalBtnContent = placeOrderBtn.innerHTML;
  placeOrderBtn.disabled = true;
  placeOrderBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...`;

  setTimeout(() => {
    // Generate Order ID
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const orderId = `FM-${randomId}`;

    const addressSummary = `${document.getElementById("houseNumber").value.trim()}, ${document.getElementById("streetAddress").value.trim()}, ${document.getElementById("city").value.trim()} - ${document.getElementById("pincode").value.trim()} (${selectedAddressType})`;

    // Save order object
    const newOrder = {
      orderId: orderId,
      orderDate: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      items: checkoutCart,
      subtotal: orderTotals.subtotal,
      deliveryFee: orderTotals.deliveryFee,
      tax: orderTotals.tax,
      totalAmount: orderTotals.total,
      deliverySlot: `${selectedDate}, ${selectedTimeSlot}`,
      shippingAddress: {
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phoneNumber").value.trim(),
        house: document.getElementById("houseNumber").value.trim(),
        street: document.getElementById("streetAddress").value.trim(),
        city: document.getElementById("city").value.trim(),
        pincode: document.getElementById("pincode").value.trim(),
        type: selectedAddressType
      },
      substitution: {
        preference: selectedSubstitution,
        callBeforeReplace: document.getElementById("callBeforeReplace")?.checked || false
      },
      paymentMethod: selectedPaymentMethod,
      paymentStatus: selectedPaymentMethod === "COD" ? "Pending (Cash on Delivery)" : "Paid (Online)",
      orderStatus: "Confirmed"
    };

    // Store in localStorage under freshmart_orders
    try {
      const orders = JSON.parse(localStorage.getItem("freshmart_orders")) || [];
      orders.unshift(newOrder);
      localStorage.setItem("freshmart_orders", JSON.stringify(orders));
    } catch (e) {
      console.error("Error saving order to localStorage:", e);
    }

    // Clear cart
    localStorage.removeItem("freshmart_cart");
    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }

    // Reset button
    placeOrderBtn.innerHTML = originalBtnContent;
    placeOrderBtn.disabled = false;

    // Show Confirmation Modal
    showOrderModal(newOrder, addressSummary);
  }, 900);
}

function showOrderModal(order, addressSummary) {
  const modal = document.getElementById("orderConfirmModal");
  if (!modal) return;

  const idEl = document.getElementById("modalOrderId");
  const slotEl = document.getElementById("modalSlot");
  const addrEl = document.getElementById("modalAddress");
  const payEl = document.getElementById("modalPayment");
  const amtEl = document.getElementById("modalAmount");

  if (idEl) idEl.textContent = `Order #${order.orderId}`;
  if (slotEl) slotEl.textContent = order.deliverySlot;
  if (addrEl) addrEl.textContent = addressSummary;
  if (payEl) payEl.textContent = order.paymentMethod === "COD" ? "Cash on Delivery" : `Online (${order.paymentMethod})`;
  if (amtEl) amtEl.textContent = order.totalAmount;

  modal.style.display = "flex";
}
