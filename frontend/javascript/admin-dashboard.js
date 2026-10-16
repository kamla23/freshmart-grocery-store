/**
 * FreshMart - Admin Dashboard Overview Logic (admin-dashboard.js)
 * Computes Metrics, Manages Low-Stock Inventory Alerts, and Provides Live Order Status Updates.
 */

// Admin Security Route Guard
if (localStorage.getItem("freshmart_admin_logged_in") !== "true") {
  window.location.href = "admin-login.html";
}

// Initial Seed Inventory
const DEFAULT_INVENTORY = [
  { id: "201", name: "Organic Spinach", stock: 3, image: "../images/vagetables.jpeg", threshold: 5 },
  { id: "204", name: "Whole Wheat Bread", stock: 2, image: "../images/bread.jpeg", threshold: 5 },
  { id: "206", name: "Pure Natural Honey", stock: 4, image: "../images/oil.jpeg", threshold: 5 },
  { id: "202", name: "Fresh Red Apples", stock: 18, image: "../images/fruits2.jpeg", threshold: 5 },
  { id: "203", name: "Organic Whole Milk", stock: 24, image: "../images/pure1.jpg", threshold: 5 },
  { id: "205", name: "Fresh Oranges", stock: 12, image: "../images/fruit1.jpeg", threshold: 5 }
];

// Initial Seed Orders if none in storage
const DEFAULT_ADMIN_ORDERS = [
  {
    orderId: "FM-849201",
    orderDate: new Date().toISOString(),
    formattedDate: "Today, 12:45 PM",
    items: [
      { id: "201", name: "Organic Spinach", price: 30, variant: "250g", quantity: 2, image: "../images/vagetables.jpeg" },
      { id: "202", name: "Fresh Red Apples", price: 160, variant: "1kg", quantity: 1, image: "../images/fruits2.jpeg" }
    ],
    subtotal: 220,
    deliveryFee: 30,
    tax: 11,
    totalAmount: 261,
    deliverySlot: "Today: 5:00 PM - 7:00 PM",
    shippingAddress: {
      fullName: "Rahul Sharma",
      phone: "9876543210",
      house: "Flat 402, Green Valley Apts",
      street: "100ft Road, Indiranagar",
      city: "Bengaluru",
      pincode: "560038",
      type: "Home"
    },
    substitution: { preference: "replace", callBeforeReplace: true },
    paymentMethod: "COD",
    orderStatus: "Processing"
  },
  {
    orderId: "FM-849188",
    orderDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    formattedDate: "Today, 10:15 AM",
    items: [
      { id: "203", name: "Organic Whole Milk", price: 65, variant: "1L", quantity: 2, image: "../images/pure1.jpg" },
      { id: "204", name: "Whole Wheat Bread", price: 45, variant: "400g", quantity: 2, image: "../images/bread.jpeg" }
    ],
    subtotal: 220,
    deliveryFee: 30,
    tax: 11,
    totalAmount: 261,
    deliverySlot: "Today: 1:00 PM - 3:00 PM",
    shippingAddress: {
      fullName: "Priya Patel",
      phone: "9823456789",
      house: "Villa 12, Palm Meadows",
      street: "Whitefield Main Road",
      city: "Bengaluru",
      pincode: "560066",
      type: "Home"
    },
    substitution: { preference: "refund", callBeforeReplace: false },
    paymentMethod: "UPI",
    orderStatus: "Out for Delivery"
  },
  {
    orderId: "FM-749210",
    orderDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    formattedDate: "Yesterday, 04:30 PM",
    items: [
      { id: "206", name: "Pure Natural Honey", price: 220, variant: "500g", quantity: 1, image: "../images/oil.jpeg" },
      { id: "201", name: "Organic Spinach", price: 30, variant: "250g", quantity: 1, image: "../images/vagetables.jpeg" }
    ],
    subtotal: 250,
    deliveryFee: 30,
    tax: 13,
    totalAmount: 293,
    deliverySlot: "Yesterday: 5:00 PM - 7:00 PM",
    shippingAddress: {
      fullName: "Anand Verma",
      phone: "9845123456",
      house: "House 24, Sector 4",
      street: "HSR Layout",
      city: "Bengaluru",
      pincode: "560102",
      type: "Home"
    },
    substitution: { preference: "replace", callBeforeReplace: true },
    paymentMethod: "CARD",
    orderStatus: "Delivered"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  setupLiveDate();
  calculateAndRenderMetrics();
  renderLowStockAlerts();
  renderRecentOrders();
});

// ================= 1. LIVE DATE HEADER ================= //
function setupLiveDate() {
  const dateEl = document.getElementById("currentDateStr");
  if (dateEl) {
    const now = new Date();
    const options = { weekday: "long", day: "numeric", month: "short", year: "numeric" };
    dateEl.textContent = now.toLocaleDateString("en-IN", options);
  }
}

// ================= 2. KEY METRICS SUMMARY ================= //
function getAdminOrders() {
  let orders = JSON.parse(localStorage.getItem("freshmart_orders"));
  if (!orders || orders.length === 0) {
    orders = DEFAULT_ADMIN_ORDERS;
    localStorage.setItem("freshmart_orders", JSON.stringify(orders));
  }
  return orders;
}

function getInventory() {
  let inv = JSON.parse(localStorage.getItem("freshmart_inventory"));
  if (!inv || inv.length === 0) {
    inv = DEFAULT_INVENTORY;
    localStorage.setItem("freshmart_inventory", JSON.stringify(inv));
  }
  return inv;
}

function calculateAndRenderMetrics() {
  const orders = getAdminOrders();
  const inventory = getInventory();

  // 1. Total Sales (excluding cancelled)
  const totalSales = orders
    .filter(o => o.orderStatus?.toLowerCase() !== "cancelled")
    .reduce((sum, o) => sum + (Number(o.totalAmount || o.total) || 0), 0);

  // 2. Total Orders Count
  const totalOrders = orders.length;

  // 3. Registered Users (base 42 + additional)
  const totalUsers = 42 + Math.min(10, totalOrders);

  // 4. Low-Stock Count (< 5 units)
  const lowStockCount = inventory.filter(i => Number(i.stock) < Number(i.threshold || 5)).length;

  // Update DOM elements
  const salesEl = document.getElementById("metricSalesAmount");
  const ordersEl = document.getElementById("metricOrdersCount");
  const usersEl = document.getElementById("metricUsersCount");
  const stockEl = document.getElementById("metricLowStockCount");

  if (salesEl) salesEl.textContent = totalSales.toLocaleString("en-IN");
  if (ordersEl) ordersEl.textContent = totalOrders;
  if (usersEl) usersEl.textContent = totalUsers;
  if (stockEl) stockEl.textContent = lowStockCount;
}

// ================= 3. LOW-STOCK ALERT DRAWER ================= //
function renderLowStockAlerts() {
  const inventory = getInventory();
  const container = document.getElementById("lowStockItemsContainer");
  if (!container) return;

  const lowStockItems = inventory.filter(i => Number(i.stock) < Number(i.threshold || 5));

  if (lowStockItems.length === 0) {
    container.innerHTML = `
      <p style="font-size: 13px; color: #065f46; font-weight: 600; padding: 6px 0;">
        <i class="fa-solid fa-circle-check"></i> All grocery items are well-stocked!
      </p>
    `;
    return;
  }

  container.innerHTML = "";

  lowStockItems.forEach(item => {
    const chip = document.createElement("div");
    chip.className = "low-stock-chip";
    chip.innerHTML = `
      <img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name}">
      <div class="low-stock-info">
        <span class="low-stock-name">${item.name}</span>
        <span class="low-stock-count">${item.stock} left in stock</span>
      </div>
      <button type="button" class="btn-restock-sm" onclick="handleRestockItem('${item.id}')">
        +10 Restock
      </button>
    `;
    container.appendChild(chip);
  });
}

function handleRestockItem(productId) {
  let inventory = getInventory();
  const item = inventory.find(i => String(i.id) === String(productId));
  if (item) {
    item.stock += 10;
    localStorage.setItem("freshmart_inventory", JSON.stringify(inventory));
    calculateAndRenderMetrics();
    renderLowStockAlerts();
    showAdminToast(`Restocked +10 units of ${item.name}!`);
  }
}

function scrollToLowStock() {
  const section = document.getElementById("lowStockSection");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ================= 4. RECENT ORDERS TABLE ================= //
function renderRecentOrders() {
  const orders = getAdminOrders();
  const tbody = document.getElementById("adminOrdersTbody");
  if (!tbody) return;

  // Latest 5 orders
  const recentOrders = orders.slice(0, 5);

  tbody.innerHTML = "";

  recentOrders.forEach((order, index) => {
    const tr = document.createElement("tr");

    // Format Status Class
    const statusClass = (order.orderStatus || "Processing")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const custName = order.shippingAddress?.fullName || "Guest Customer";
    const custPhone = order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : "N/A";
    const itemCount = order.items ? order.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1;

    tr.innerHTML = `
      <td><span class="cell-order-id">#${order.orderId}</span></td>
      <td>
        <div class="cell-customer">
          <span class="cell-customer-name">${custName}</span>
          <span class="cell-customer-phone">${custPhone}</span>
        </div>
      </td>
      <td>
        <span class="cell-slot">${order.deliverySlot || 'Today'}</span>
      </td>
      <td>
        <strong>${itemCount}</strong> items
      </td>
      <td>
        <span class="cell-amount">₹${order.totalAmount || order.total || 0}</span>
      </td>
      <td>
        <span style="font-size: 12px; font-weight: 600; color: #4b5563;">
          ${order.paymentMethod || 'COD'}
        </span>
      </td>
      <td>
        <select class="status-select ${statusClass}" onchange="handleOrderStatusChange('${order.orderId}', this.value, this)">
          <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Out for Delivery" ${order.orderStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button type="button" class="btn-inspect" onclick="inspectAdminOrder('${order.orderId}')">
          <i class="fa-solid fa-eye"></i> Inspect
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Live Status Update in localStorage
function handleOrderStatusChange(orderId, newStatus, selectElement) {
  let orders = getAdminOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));

  if (order) {
    order.orderStatus = newStatus;
    localStorage.setItem("freshmart_orders", JSON.stringify(orders));

    // Update select element's CSS class
    selectElement.className = `status-select ${newStatus.toLowerCase().replace(/\s+/g, "-")}`;

    // Refresh metric totals
    calculateAndRenderMetrics();

    // Show toast
    showAdminToast(`Order #${orderId} status changed to ${newStatus}`);
  }
}

// ================= 5. ORDER INSPECTION MODAL ================= //
function inspectAdminOrder(orderId) {
  const orders = getAdminOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));
  if (!order) return;

  const modal = document.getElementById("adminOrderModal");
  const title = document.getElementById("inspectModalTitle");
  const idEl = document.getElementById("inspOrderId");
  const dateEl = document.getElementById("inspOrderDate");
  const custEl = document.getElementById("inspCustName");
  const statusEl = document.getElementById("inspStatus");
  const payEl = document.getElementById("inspPayment");
  const phoneEl = document.getElementById("inspPhone");
  const slotEl = document.getElementById("inspSlot");
  const addrEl = document.getElementById("inspAddress");
  const subEl = document.getElementById("inspSubstitution");
  const tbody = document.getElementById("inspItemsTbody");

  if (title) title.textContent = `Order Inspection: #${order.orderId}`;
  if (idEl) idEl.textContent = `#${order.orderId}`;
  if (dateEl) dateEl.textContent = order.formattedDate || new Date(order.orderDate).toLocaleDateString();
  if (custEl) custEl.textContent = order.shippingAddress?.fullName || "Guest Customer";
  if (statusEl) statusEl.textContent = order.orderStatus || "Processing";
  if (payEl) payEl.textContent = order.paymentMethod || "COD";
  if (phoneEl) phoneEl.textContent = order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : "N/A";
  if (slotEl) slotEl.textContent = order.deliverySlot || "Standard Delivery";

  if (addrEl && order.shippingAddress) {
    addrEl.textContent = `${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode} (${order.shippingAddress.type || 'Home'})`;
  }

  if (subEl && order.substitution) {
    subEl.textContent = order.substitution.preference === "replace"
      ? "Replace with nearest brand/alternative"
      : "Refund item directly (no replacement)";
  }

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

  if (modal) modal.style.display = "flex";
}

function closeAdminOrderModal() {
  const modal = document.getElementById("adminOrderModal");
  if (modal) modal.style.display = "none";
}

// ================= 6. TOAST NOTIFICATION & LOGOUT ================= //
function showAdminToast(msg) {
  const toast = document.getElementById("adminToast");
  const text = document.getElementById("toastText");
  if (!toast || !text) return;

  text.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function handleAdminLogout(event) {
  event.preventDefault();
  if (confirm("Are you sure you want to log out of Admin Portal?")) {
    localStorage.removeItem("freshmart_admin_logged_in");
    window.location.href = "admin-login.html";
  }
}

// Close modal when clicking backdrop
window.addEventListener("click", (e) => {
  const modal = document.getElementById("adminOrderModal");
  if (e.target === modal) closeAdminOrderModal();
});
