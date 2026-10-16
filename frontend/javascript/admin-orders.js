// Admin Security Route Guard
if (localStorage.getItem("freshmart_admin_logged_in") !== "true") {
  window.location.href = "admin-login.html";
}

let currentTabStatus = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  renderFulfillmentDashboard();
});


function getAllOrders() {
  const orders = JSON.parse(localStorage.getItem("freshmart_orders")) || [];
  return orders;
}

function saveAllOrders(orders) {
  localStorage.setItem("freshmart_orders", JSON.stringify(orders));
  renderFulfillmentDashboard();
}

function normalizeStatus(status) {
  if (!status) return "Pending";
  const s = status.toLowerCase();
  if (s === "processing" || s === "pending") return "Pending";
  if (s === "packing") return "Packing";
  if (s === "out for delivery" || s === "out_for_delivery") return "Out for Delivery";
  if (s === "delivered" || s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return status;
}

function renderFulfillmentDashboard() {
  updateTabCounts();
  renderFulfillmentTable();
}

function updateTabCounts() {
  const orders = getAllOrders();

  let counts = {
    all: orders.length,
    pending: 0,
    packing: 0,
    delivery: 0,
    completed: 0
  };

  orders.forEach(order => {
    const norm = normalizeStatus(order.orderStatus);
    if (norm === "Pending") counts.pending++;
    else if (norm === "Packing") counts.packing++;
    else if (norm === "Out for Delivery") counts.delivery++;
    else if (norm === "Completed") counts.completed++;
  });

  const countAll = document.getElementById("countAll");
  const countPending = document.getElementById("countPending");
  const countPacking = document.getElementById("countPacking");
  const countDelivery = document.getElementById("countDelivery");
  const countCompleted = document.getElementById("countCompleted");

  if (countAll) countAll.textContent = counts.all;
  if (countPending) countPending.textContent = counts.pending;
  if (countPacking) countPacking.textContent = counts.packing;
  if (countDelivery) countDelivery.textContent = counts.delivery;
  if (countCompleted) countCompleted.textContent = counts.completed;
}

function filterByTab(status, tabBtn) {
  document.querySelectorAll(".status-tab-btn").forEach(btn => btn.classList.remove("active"));
  tabBtn.classList.add("active");
  currentTabStatus = status;
  renderFulfillmentTable();
}

function handleSearchOrders() {
  renderFulfillmentTable();
}

function renderFulfillmentTable() {
  const orders = getAllOrders();
  const tbody = document.getElementById("fulfillmentTableBody");
  const noOrdersMsg = document.getElementById("noOrdersMsg");

  if (!tbody) return;

  const searchQuery = document.getElementById("orderSearchInput")?.value.trim().toLowerCase() || "";
  const dateFilter = document.getElementById("dateFilterSelect")?.value || "ALL";

  const filtered = orders.filter(order => {
    const normStatus = normalizeStatus(order.orderStatus);


    if (currentTabStatus !== "ALL" && normStatus.toLowerCase() !== currentTabStatus.toLowerCase()) {
      return false;
    }

    const idMatch = (order.orderId || "").toLowerCase().includes(searchQuery);
    const nameMatch = (order.shippingAddress?.fullName || "").toLowerCase().includes(searchQuery);
    const phoneMatch = (order.shippingAddress?.phone || "").toLowerCase().includes(searchQuery);
    if (searchQuery && !idMatch && !nameMatch && !phoneMatch) {
      return false;
    }

    if (dateFilter !== "ALL") {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      if (dateFilter === "TODAY") {
        if (orderDate.toDateString() !== today.toDateString() && !order.formattedDate?.toLowerCase().includes("today")) {
          return false;
        }
      } else if (dateFilter === "YESTERDAY") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (orderDate.toDateString() !== yesterday.toDateString() && !order.formattedDate?.toLowerCase().includes("yesterday")) {
          return false;
        }
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    if (noOrdersMsg) noOrdersMsg.classList.remove("hidden");
    return;
  }

  if (noOrdersMsg) noOrdersMsg.classList.add("hidden");
  tbody.innerHTML = "";

  filtered.forEach(order => {
    const tr = document.createElement("tr");

    const norm = normalizeStatus(order.orderStatus);
    const statusClass = norm.toLowerCase().replace(/\s+/g, "-");

    const custName = order.shippingAddress?.fullName || "Customer";
    const custPhone = order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : "N/A";
    const addrType = order.shippingAddress?.type || "Home";

    let thumbsHTML = "";
    const items = order.items || [];
    items.slice(0, 3).forEach(item => {
      thumbsHTML += `<img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name}" class="items-mini-thumb" title="${item.name}">`;
    });
    if (items.length > 3) {
      thumbsHTML += `<span style="font-size: 11px; font-weight: 700; color: #6b7280;">+${items.length - 3}</span>`;
    }

    const subPref = order.substitution?.preference === "replace"
      ? '<span class="sub-rule-pill replace"><i class="fa-solid fa-arrows-rotate"></i> Replace OK</span>'
      : '<span class="sub-rule-pill refund"><i class="fa-solid fa-ban"></i> Refund Only</span>';

    tr.innerHTML = `
      <td>
        <strong style="color: #111827; font-size: 14px;">#${order.orderId}</strong>
        <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${order.formattedDate || new Date(order.orderDate).toLocaleTimeString()}</div>
      </td>

      <td>
        <div class="cell-customer">
          <span class="cell-customer-name">${custName}</span>
          <span class="cell-customer-phone">${custPhone} (${addrType})</span>
        </div>
      </td>

      <td>
        <div class="cell-slot">
          <i class="fa-regular fa-clock" style="margin-right: 4px;"></i>
          ${order.deliverySlot || 'Standard Delivery'}
        </div>
      </td>

      <td>
        <div class="table-items-cell">
          ${thumbsHTML}
          <span style="font-size: 12px; font-weight: 700; color: #374151; margin-left: 4px;">(${items.length} items)</span>
        </div>
        <div>${subPref}</div>
      </td>

      <td>
        <strong style="color: #111827; font-size: 14px;">₹${order.totalAmount || order.total || 0}</strong>
      </td>

      <td>
        <span style="font-size: 12px; font-weight: 700; color: #4b5563;">
          ${order.paymentMethod || 'COD'}
        </span>
      </td>

      <td>
        <select class="fulfillment-status-select ${statusClass}" onchange="handleStageChange('${order.orderId}', this.value, this)">
          <option value="Pending" ${norm === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Packing" ${norm === 'Packing' ? 'selected' : ''}>Packing</option>
          <option value="Out for Delivery" ${norm === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Completed" ${norm === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${norm === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>

      <td>
        <div class="order-btn-group">
          <button type="button" class="btn-slip" onclick="openPackingSlip('${order.orderId}')" title="Warehouse Pick Sheet">
            <i class="fa-solid fa-file-invoice"></i> Slip
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function handleStageChange(orderId, newStatus, selectEl) {
  let orders = getAllOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));

  if (order) {
    order.orderStatus = newStatus;
    localStorage.setItem("freshmart_orders", JSON.stringify(orders));

    const norm = normalizeStatus(newStatus);
    selectEl.className = `fulfillment-status-select ${norm.toLowerCase().replace(/\s+/g, "-")}`;


    updateTabCounts();

    showAdminToast(`Order #${orderId} moved to stage: ${newStatus}`);
  }
}

function openPackingSlip(orderId) {
  const orders = getAllOrders();
  const order = orders.find(o => String(o.orderId) === String(orderId));
  if (!order) return;

  const modal = document.getElementById("packingSlipModal");
  const idEl = document.getElementById("slipOrderId");
  const dateEl = document.getElementById("slipOrderDate");
  const nameEl = document.getElementById("slipCustName");
  const phoneEl = document.getElementById("slipPhone");
  const payEl = document.getElementById("slipPayment");
  const amtEl = document.getElementById("slipAmount");
  const slotEl = document.getElementById("slipSlot");
  const addrEl = document.getElementById("slipAddress");
  const subEl = document.getElementById("slipSubPref");
  const tbody = document.getElementById("slipItemsBody");

  if (idEl) idEl.textContent = `#${order.orderId}`;
  if (dateEl) dateEl.textContent = order.formattedDate || new Date(order.orderDate).toLocaleDateString();
  if (nameEl) nameEl.textContent = order.shippingAddress?.fullName || "Customer";
  if (phoneEl) phoneEl.textContent = order.shippingAddress?.phone ? `+91 ${order.shippingAddress.phone}` : "N/A";
  if (payEl) payEl.textContent = order.paymentMethod || "COD";
  if (amtEl) amtEl.textContent = order.totalAmount || order.total || 0;
  if (slotEl) slotEl.textContent = order.deliverySlot || "Standard Delivery";

  if (addrEl && order.shippingAddress) {
    addrEl.textContent = `${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode} (${order.shippingAddress.type || 'Home'})`;
  }

  if (subEl && order.substitution) {
    subEl.textContent = order.substitution.preference === "replace"
      ? "Replace with nearest brand (Fastest fulfillment)"
      : "Refund item directly (Do NOT substitute)";
  }

  if (tbody) {
    tbody.innerHTML = "";
    (order.items || []).forEach(item => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align: center;">
          <input type="checkbox" class="slip-checkbox" />
        </td>
        <td>
          <strong style="color: #111827;">${item.name}</strong>
        </td>
        <td>${item.variant || 'Standard'}</td>
        <td><strong>${qty}</strong></td>
        <td>₹${price}</td>
        <td><strong>₹${price * qty}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (modal) modal.style.display = "flex";
}

function closePackingSlipModal() {
  const modal = document.getElementById("packingSlipModal");
  if (modal) modal.style.display = "none";
}

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


window.addEventListener("click", (e) => {
  const modal = document.getElementById("packingSlipModal");
  if (e.target === modal) closePackingSlipModal();
});
