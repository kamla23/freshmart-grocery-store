/**
 * FreshMart - User Account & Orders Page Logic (profile.js)
 * Manages Profile details, Saved Addresses, Order History, and Order Receipt Modal.
 */

// Default seed data if storage is empty
const DEFAULT_PROFILE = {
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  phone: "9876543210",
  gender: "Male"
};

const DEFAULT_ADDRESSES = [
  {
    recipientName: "Rahul Sharma",
    phone: "9876543210",
    house: "Flat 402, Green Valley Apartments",
    street: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    pincode: "560038",
    type: "Home",
    isDefault: true
  }
];

const DEFAULT_SEED_ORDERS = [
  {
    orderId: "FM-749210",
    orderDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    formattedDate: "01 Sep 2026, 11:30 AM",
    items: [
      { id: "201", name: "Organic Spinach", price: 30, variant: "250g", quantity: 2, image: "../images/vagetables.jpeg" },
      { id: "203", name: "Organic Whole Milk", price: 65, variant: "1L", quantity: 2, image: "../images/pure1.jpg" },
      { id: "204", name: "Whole Wheat Bread", price: 45, variant: "400g", quantity: 1, image: "../images/bread.jpeg" }
    ],
    subtotal: 235,
    deliveryFee: 30,
    tax: 12,
    totalAmount: 277,
    deliverySlot: "Delivered on 01 Sep (5:00 PM - 7:00 PM)",
    shippingAddress: {
      fullName: "Rahul Sharma",
      phone: "9876543210",
      house: "Flat 402, Green Valley Apartments",
      street: "100 Feet Road, Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      type: "Home"
    },
    substitution: { preference: "replace", callBeforeReplace: true },
    paymentMethod: "COD",
    paymentStatus: "Paid (Cash on Delivery)",
    orderStatus: "Delivered"
  }
];

let currentOrderFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  initProfileData();
  renderOrders();
  renderAddresses();
  updateStats();
});

// ================= 1. INITIALIZATION & TAB SWITCHING ================= //
function initProfileData() {
  let profile = JSON.parse(localStorage.getItem("freshmart_user_profile"));
  if (!profile) {
    profile = DEFAULT_PROFILE;
    localStorage.setItem("freshmart_user_profile", JSON.stringify(profile));
  }

  // Update Sidebar
  const avatarInitial = document.getElementById("avatarInitial");
  const sideName = document.getElementById("sideUserName");
  const sideEmail = document.getElementById("sideUserEmail");

  if (avatarInitial) avatarInitial.textContent = profile.name ? profile.name.charAt(0).toUpperCase() : "U";
  if (sideName) sideName.textContent = profile.name;
  if (sideEmail) sideEmail.textContent = profile.email;

  // Populate Form Fields
  const nameInput = document.getElementById("profFullName");
  const emailInput = document.getElementById("profEmail");
  const phoneInput = document.getElementById("profPhone");
  const genderInput = document.getElementById("profGender");

  if (nameInput) nameInput.value = profile.name || "";
  if (emailInput) emailInput.value = profile.email || "";
  if (phoneInput) phoneInput.value = profile.phone || "";
  if (genderInput && profile.gender) genderInput.value = profile.gender;
}

function switchTab(tabId) {
  // Navigation buttons toggle
  document.querySelectorAll(".profile-nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
  });

  // Tab Panes toggle
  const paneOrders = document.getElementById("paneOrders");
  const paneProfile = document.getElementById("paneProfile");
  const paneAddresses = document.getElementById("paneAddresses");

  if (paneOrders) paneOrders.classList.toggle("active", tabId === "orders");
  if (paneProfile) paneProfile.classList.toggle("active", tabId === "profile");
  if (paneAddresses) paneAddresses.classList.toggle("active", tabId === "addresses");
}

function updateStats() {
  const orders = getOrders();
  const addresses = getAddresses();

  const ordersCountEl = document.getElementById("statsOrdersCount");
  const addrCountEl = document.getElementById("statsAddressesCount");

  if (ordersCountEl) ordersCountEl.textContent = orders.length;
  if (addrCountEl) addrCountEl.textContent = addresses.length;
}

// ================= 2. ORDER HISTORY ================= //
function getOrders() {
  let orders = JSON.parse(localStorage.getItem("freshmart_orders"));
  if (!orders || orders.length === 0) {
    orders = DEFAULT_SEED_ORDERS;
    localStorage.setItem("freshmart_orders", JSON.stringify(orders));
  }
  return orders;
}

function renderOrders(statusFilter = "ALL") {
  const orders = getOrders();
  const container = document.getElementById("ordersListContainer");
  const emptyBox = document.getElementById("emptyOrdersState");

  if (!container) return;

  const filteredOrders = statusFilter === "ALL" 
    ? orders 
    : orders.filter(o => o.orderStatus?.toLowerCase() === statusFilter.toLowerCase());

  if (filteredOrders.length === 0) {
    container.innerHTML = "";
    if (emptyBox) emptyBox.classList.remove("hidden");
    return;
  }

  if (emptyBox) emptyBox.classList.add("hidden");
  container.innerHTML = "";

  filteredOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    // Status formatting
    let badgeClass = "processing";
    let statusText = order.orderStatus || "Processing";
    if (statusText.toLowerCase() === "delivered") {
      badgeClass = "delivered";
    } else if (statusText.toLowerCase() === "out for delivery") {
      badgeClass = "out-for-delivery";
    }

    // Item thumbnails preview
    let thumbsHTML = "";
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        thumbsHTML += `
          <div class="order-item-thumb" title="${item.name}">
            <img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name}">
            <span class="item-qty-tag">&times;${item.quantity || 1}</span>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <div class="order-card-header">
        <div class="order-header-left">
          <span class="order-id">#${order.orderId}</span>
          <span class="order-date">${order.formattedDate || new Date(order.orderDate).toLocaleDateString()}</span>
        </div>
        <span class="status-badge ${badgeClass}">
          <i class="fa-solid fa-circle-dot"></i> ${statusText}
        </span>
      </div>

      <div class="order-card-body">
        <div class="order-slot-info">
          <i class="fa-regular fa-clock"></i>
          <span><strong>Slot:</strong> ${order.deliverySlot || 'Standard Delivery'}</span>
        </div>

        <div class="order-items-preview">
          ${thumbsHTML}
        </div>
      </div>

      <div class="order-card-footer">
        <div class="order-total-display">
          Total: <strong>₹${order.totalAmount || order.total || 0}</strong> 
          <small style="color: #6b7280;">(${order.items?.length || 0} items)</small>
        </div>
        <div class="order-actions">
          <button type="button" class="btn-order-action btn-receipt" onclick="openReceiptModal('${order.orderId}')">
            <i class="fa-solid fa-receipt"></i> View Receipt
          </button>
          <button type="button" class="btn-order-action btn-reorder" onclick="reorderItems('${order.orderId}')">
            <i class="fa-solid fa-rotate-right"></i> Reorder
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterOrderList(status, chipBtn) {
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
  chipBtn.classList.add("active");
  currentOrderFilter = status;
  renderOrders(status);
}

// Reorder Items: Copy items back into freshmart_cart
function reorderItems(orderId) {
  const orders = getOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));
  if (!order || !order.items) return;

  const cart = typeof getCart === "function" 
    ? getCart() 
    : (JSON.parse(localStorage.getItem("freshmart_cart")) || []);

  order.items.forEach(orderItem => {
    const existingIndex = cart.findIndex(c => String(c.id) === String(orderItem.id) && c.variant === orderItem.variant);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += (orderItem.quantity || 1);
    } else {
      cart.push({ ...orderItem });
    }
  });

  if (typeof saveCart === "function") {
    saveCart(cart);
  } else {
    localStorage.setItem("freshmart_cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
  }

  alert("Items added to your cart! Redirecting to Cart...");
  window.location.href = "cart.html";
}

// ================= 3. ORDER RECEIPT MODAL ================= //
function openReceiptModal(orderId) {
  const orders = getOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));
  if (!order) return;

  const modal = document.getElementById("orderReceiptModal");
  const idEl = document.getElementById("recOrderId");
  const dateEl = document.getElementById("recOrderDate");
  const statusEl = document.getElementById("recStatusBadge");
  const payEl = document.getElementById("recPayment");
  const slotEl = document.getElementById("recSlot");
  const addrEl = document.getElementById("recAddress");
  const tbody = document.getElementById("receiptTableBody");
  const subtotalEl = document.getElementById("recSubtotal");
  const feeEl = document.getElementById("recDeliveryFee");
  const taxEl = document.getElementById("recTax");
  const totalEl = document.getElementById("recTotal");

  if (idEl) idEl.textContent = `#${order.orderId}`;
  if (dateEl) dateEl.textContent = order.formattedDate || new Date(order.orderDate).toLocaleDateString();
  
  if (statusEl) {
    statusEl.textContent = order.orderStatus || "Confirmed";
    statusEl.className = `status-badge ${(order.orderStatus || 'processing').toLowerCase().replace(/\s+/g, '-')}`;
  }

  if (payEl) payEl.textContent = order.paymentMethod === "COD" ? "Cash on Delivery" : `Online (${order.paymentMethod})`;
  if (slotEl) slotEl.textContent = order.deliverySlot || "Standard Delivery";

  if (addrEl && order.shippingAddress) {
    addrEl.textContent = `${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode} (${order.shippingAddress.fullName}, ${order.shippingAddress.phone})`;
  }

  // Populate item rows
  if (tbody) {
    tbody.innerHTML = "";
    (order.items || []).forEach(item => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.variant || 'Standard'}</td>
        <td>${qty}</td>
        <td>₹${price}</td>
        <td><strong>₹${price * qty}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (subtotalEl) subtotalEl.textContent = order.subtotal || 0;
  if (feeEl) feeEl.textContent = order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`;
  if (taxEl) taxEl.textContent = order.tax || 0;
  if (totalEl) totalEl.textContent = order.totalAmount || order.total || 0;

  if (modal) modal.style.display = "flex";
}

function closeReceiptModal() {
  const modal = document.getElementById("orderReceiptModal");
  if (modal) modal.style.display = "none";
}

// ================= 4. PERSONAL INFO SAVE ================= //
function handleSaveProfile(event) {
  event.preventDefault();

  const name = document.getElementById("profFullName").value.trim();
  const email = document.getElementById("profEmail").value.trim();
  const phone = document.getElementById("profPhone").value.trim();
  const gender = document.getElementById("profGender").value;

  if (!name || !email || !phone) {
    alert("Please fill in all required profile fields.");
    return;
  }

  const profile = { name, email, phone, gender };
  localStorage.setItem("freshmart_user_profile", JSON.stringify(profile));

  // Sync sidebar
  initProfileData();

  // Show success alert
  const msg = document.getElementById("profileMsg");
  if (msg) {
    msg.classList.add("success");
    setTimeout(() => {
      msg.classList.remove("success");
    }, 2500);
  }
}

// ================= 5. SAVED ADDRESSES MANAGEMENT ================= //
function getAddresses() {
  let addresses = JSON.parse(localStorage.getItem("freshmart_saved_addresses"));
  if (!addresses || addresses.length === 0) {
    addresses = DEFAULT_ADDRESSES;
    localStorage.setItem("freshmart_saved_addresses", JSON.stringify(addresses));
  }
  return addresses;
}

function renderAddresses() {
  const addresses = getAddresses();
  const grid = document.getElementById("addressesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  addresses.forEach((addr, index) => {
    const card = document.createElement("div");
    card.className = `address-card ${addr.isDefault ? 'is-default' : ''}`;

    card.innerHTML = `
      <div class="address-card-header">
        <span class="addr-type-tag"><i class="fa-solid fa-location-dot"></i> ${addr.type || 'Home'}</span>
        ${addr.isDefault ? '<span class="default-badge"><i class="fa-solid fa-check"></i> Default</span>' : ''}
      </div>
      <div class="addr-name">${addr.recipientName}</div>
      <div class="addr-text">${addr.house}, ${addr.street}, ${addr.city} - <strong>${addr.pincode}</strong></div>
      <div class="addr-phone"><i class="fa-solid fa-phone"></i> +91 ${addr.phone}</div>

      <div class="addr-actions">
        <button type="button" class="addr-action-link" onclick="openAddressModal(${index})">Edit</button>
        ${!addr.isDefault ? `<button type="button" class="addr-action-link" onclick="setDefaultAddress(${index})">Set as Default</button>` : ''}
        ${addresses.length > 1 ? `<button type="button" class="addr-action-link delete-link" onclick="deleteAddress(${index})">Delete</button>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });

  updateStats();
}

function openAddressModal(editIndex = -1) {
  const modal = document.getElementById("addressModal");
  const title = document.getElementById("addressModalTitle");
  const editIndexInput = document.getElementById("editAddressIndex");

  if (editIndexInput) editIndexInput.value = editIndex;

  if (editIndex > -1) {
    const addresses = getAddresses();
    const addr = addresses[editIndex];
    if (title) title.textContent = "Edit Delivery Address";

    document.getElementById("addrRecipientName").value = addr.recipientName || "";
    document.getElementById("addrPhone").value = addr.phone || "";
    document.getElementById("addrHouse").value = addr.house || "";
    document.getElementById("addrStreet").value = addr.street || "";
    document.getElementById("addrCity").value = addr.city || "";
    document.getElementById("addrPincode").value = addr.pincode || "";
    document.getElementById("addrType").value = addr.type || "Home";
    document.getElementById("addrIsDefault").checked = !!addr.isDefault;
  } else {
    if (title) title.textContent = "Add Delivery Address";
    document.getElementById("addressForm").reset();
  }

  if (modal) modal.style.display = "flex";
}

function closeAddressModal() {
  const modal = document.getElementById("addressModal");
  if (modal) modal.style.display = "none";
}

function handleSaveAddress(event) {
  event.preventDefault();

  const editIndex = parseInt(document.getElementById("editAddressIndex").value);
  const recipientName = document.getElementById("addrRecipientName").value.trim();
  const phone = document.getElementById("addrPhone").value.trim();
  const house = document.getElementById("addrHouse").value.trim();
  const street = document.getElementById("addrStreet").value.trim();
  const city = document.getElementById("addrCity").value.trim();
  const pincode = document.getElementById("addrPincode").value.trim();
  const type = document.getElementById("addrType").value;
  const isDefault = document.getElementById("addrIsDefault").checked;

  let addresses = getAddresses();

  if (isDefault) {
    addresses.forEach(a => a.isDefault = false);
  }

  const addressData = {
    recipientName,
    phone,
    house,
    street,
    city,
    pincode,
    type,
    isDefault: isDefault || addresses.length === 0
  };

  if (editIndex > -1) {
    addresses[editIndex] = addressData;
  } else {
    addresses.push(addressData);
  }

  localStorage.setItem("freshmart_saved_addresses", JSON.stringify(addresses));
  closeAddressModal();
  renderAddresses();
}

function deleteAddress(index) {
  if (!confirm("Are you sure you want to delete this address?")) return;
  let addresses = getAddresses();
  addresses.splice(index, 1);
  if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
    addresses[0].isDefault = true;
  }
  localStorage.setItem("freshmart_saved_addresses", JSON.stringify(addresses));
  renderAddresses();
}

function setDefaultAddress(index) {
  let addresses = getAddresses();
  addresses.forEach((a, i) => a.isDefault = (i === index));
  localStorage.setItem("freshmart_saved_addresses", JSON.stringify(addresses));
  renderAddresses();
}

// ================= 6. LOGOUT ================= //
function handleLogout() {
  if (confirm("Are you sure you want to log out of FreshMart?")) {
    localStorage.removeItem("freshmart_user_logged_in");
    alert("You have been logged out successfully.");
    window.location.href = "index.html";
  }
}

// Close modals when clicking backdrop
window.addEventListener("click", (e) => {
  const receiptModal = document.getElementById("orderReceiptModal");
  const addressModal = document.getElementById("addressModal");

  if (e.target === receiptModal) closeReceiptModal();
  if (e.target === addressModal) closeAddressModal();
});
