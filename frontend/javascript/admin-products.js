/**
 * FreshMart - Product Inventory Manager Logic (admin-products.js)
 * Manages Product Table, Filters, Quick Restock, Multer-Ready Image Upload, and Add/Edit Modals.
 */

// Admin Security Route Guard
if (localStorage.getItem("freshmart_admin_logged_in") !== "true") {
  window.location.href = "admin-login.html";
}

// Default Rich Product Inventory Catalog
const INITIAL_CATALOG = [
  { id: "201", name: "Organic Spinach", category: "Vegetables", price: 30, unit: "250g", stock: 3, threshold: 5, image: "../images/vagetables.jpeg" },
  { id: "202", name: "Fresh Red Apples", category: "Fruits", price: 160, unit: "1kg", stock: 18, threshold: 5, image: "../images/fruits2.jpeg" },
  { id: "203", name: "Organic Whole Milk", category: "Dairy", price: 65, unit: "1L", stock: 24, threshold: 5, image: "../images/pure1.jpg" },
  { id: "204", name: "Whole Wheat Bread", category: "Bakery", price: 45, unit: "400g", stock: 2, threshold: 5, image: "../images/bread.jpeg" },
  { id: "205", name: "Fresh Oranges", category: "Fruits", price: 90, unit: "1kg", stock: 12, threshold: 5, image: "../images/fruit1.jpeg" },
  { id: "206", name: "Pure Natural Honey", category: "Organic", price: 220, unit: "500g", stock: 4, threshold: 5, image: "../images/oil.jpeg" }
];

document.addEventListener("DOMContentLoaded", () => {
  renderInventoryTable();
});

// ================= 1. INVENTORY STORAGE HELPERS ================= //
function getProductsInventory() {
  let inventory = JSON.parse(localStorage.getItem("freshmart_inventory"));
  if (!inventory || inventory.length === 0) {
    inventory = INITIAL_CATALOG;
    localStorage.setItem("freshmart_inventory", JSON.stringify(inventory));
  } else {
    // Ensure existing items have category, unit, threshold fields
    let updated = false;
    inventory.forEach(item => {
      if (!item.category) {
        const match = INITIAL_CATALOG.find(c => String(c.id) === String(item.id));
        item.category = match ? match.category : "Vegetables";
        item.unit = match ? match.unit : "pack";
        item.price = match ? match.price : 40;
        item.threshold = 5;
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem("freshmart_inventory", JSON.stringify(inventory));
    }
  }
  return inventory;
}

function saveProductsInventory(inventory) {
  localStorage.setItem("freshmart_inventory", JSON.stringify(inventory));
  renderInventoryTable();
}

// ================= 2. TABLE RENDERING & FILTERING ================= //
function renderInventoryTable() {
  const inventory = getProductsInventory();
  const tbody = document.getElementById("inventoryTableBody");
  const noResultsEl = document.getElementById("noInventoryMsg");
  const countBadge = document.getElementById("totalProductCount");

  if (!tbody) return;

  const searchQuery = document.getElementById("adminSearchInput")?.value.trim().toLowerCase() || "";
  const catFilter = document.getElementById("catFilterSelect")?.value || "ALL";
  const stockFilter = document.getElementById("stockFilterSelect")?.value || "ALL";

  const filtered = inventory.filter(item => {
    // 1. Search Query
    const nameMatch = (item.name || "").toLowerCase().includes(searchQuery);
    const catMatch = (item.category || "").toLowerCase().includes(searchQuery);
    const matchesSearch = !searchQuery || nameMatch || catMatch;

    // 2. Category Filter
    const matchesCat = catFilter === "ALL" || (item.category || "").toLowerCase() === catFilter.toLowerCase();

    // 3. Stock Status Filter
    const stockNum = Number(item.stock) || 0;
    const thresh = Number(item.threshold || 5);
    let matchesStock = true;
    if (stockFilter === "IN_STOCK") matchesStock = stockNum > thresh;
    else if (stockFilter === "LOW_STOCK") matchesStock = stockNum > 0 && stockNum <= thresh;
    else if (stockFilter === "OUT_OF_STOCK") matchesStock = stockNum <= 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  if (countBadge) countBadge.textContent = inventory.length;

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    if (noResultsEl) noResultsEl.classList.remove("hidden");
    return;
  }

  if (noResultsEl) noResultsEl.classList.add("hidden");
  tbody.innerHTML = "";

  filtered.forEach(item => {
    const tr = document.createElement("tr");

    const stock = Number(item.stock) || 0;
    const thresh = Number(item.threshold || 5);

    let stockClass = "in-stock";
    let stockLabel = "In Stock";
    if (stock === 0) {
      stockClass = "out-of-stock";
      stockLabel = "Out of Stock";
    } else if (stock <= thresh) {
      stockClass = "low-stock";
      stockLabel = "Low Stock";
    }

    const catClass = (item.category || "vegetables").toLowerCase().replace(/\s+/g, "");

    tr.innerHTML = `
      <td>
        <img src="${item.image || '../images/vagetables.jpeg'}" alt="${item.name}" class="product-cell-img" />
      </td>
      <td>
        <strong style="color: #111827; font-size: 14px;">${item.name}</strong>
      </td>
      <td>
        <span class="cat-badge ${catClass}">${item.category || 'Grocery'}</span>
      </td>
      <td>
        <strong>₹${item.price || 0}</strong> <span style="font-size: 12px; color: #6b7280;">/ ${item.unit || 'pack'}</span>
      </td>
      <td>
        <strong>${stock}</strong> units
      </td>
      <td>
        <span class="stock-pill ${stockClass}">
          <span class="stock-dot"></span> ${stockLabel}
        </span>
      </td>
      <td>
        <button type="button" class="btn-restock-sm" onclick="handleQuickRestock('${item.id}')" title="Add 10 units">
          <i class="fa-solid fa-plus"></i> 10 Stock
        </button>
      </td>
      <td>
        <div class="prod-actions-group">
          <button type="button" class="btn-edit-prod" onclick="openEditProductModal('${item.id}')" title="Edit Product">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button type="button" class="btn-delete-prod" onclick="handleDeleteProduct('${item.id}')" title="Delete Product">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function handleFilterProducts() {
  renderInventoryTable();
}

// ================= 3. QUICK RESTOCK ================= //
function handleQuickRestock(productId) {
  let inventory = getProductsInventory();
  const item = inventory.find(i => String(i.id) === String(productId));
  if (item) {
    item.stock = (Number(item.stock) || 0) + 10;
    saveProductsInventory(inventory);
    showAdminToast(`Restocked +10 units of ${item.name}!`);
  }
}

// ================= 4. ADD / EDIT PRODUCT MODAL ================= //
function openAddProductModal() {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const editIdInput = document.getElementById("editProductId");
  const form = document.getElementById("productForm");
  const preview = document.getElementById("imagePreview");

  if (form) form.reset();
  if (editIdInput) editIdInput.value = "";
  if (title) title.textContent = "Add New Grocery Product";
  if (preview) preview.src = "../images/vagetables.jpeg";

  // Reset preset active border
  document.querySelectorAll(".preset-thumb").forEach((t, i) => {
    t.classList.toggle("active", i === 0);
  });

  if (modal) modal.style.display = "flex";
}

function openEditProductModal(productId) {
  const inventory = getProductsInventory();
  const item = inventory.find(i => String(i.id) === String(productId));
  if (!item) return;

  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  const editIdInput = document.getElementById("editProductId");
  const preview = document.getElementById("imagePreview");

  if (title) title.textContent = `Edit Product: ${item.name}`;
  if (editIdInput) editIdInput.value = item.id;

  document.getElementById("prodTitle").value = item.name || "";
  document.getElementById("prodCategory").value = item.category || "Vegetables";
  document.getElementById("prodUnit").value = item.unit || "500g";
  document.getElementById("prodPrice").value = item.price || 0;
  document.getElementById("prodStock").value = item.stock || 0;
  document.getElementById("prodThreshold").value = item.threshold || 5;

  if (preview) preview.src = item.image || "../images/vagetables.jpeg";

  // Highlight preset if matches
  document.querySelectorAll(".preset-thumb").forEach(t => {
    t.classList.toggle("active", t.getAttribute("src") === item.image);
  });

  if (modal) modal.style.display = "flex";
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "none";
}

// Multer-Ready Image Upload Reader (FileReader converts file to DataURL)
function handleImageFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // File size validation (max 4MB)
  if (file.size > 4 * 1024 * 1024) {
    alert("Image file is too large! Please choose an image under 4MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.getElementById("imagePreview");
    if (preview) {
      preview.src = e.target.result;
    }
    // Deselect preset buttons
    document.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
  };
  reader.readAsDataURL(file);
}

function selectPresetImage(thumbEl) {
  document.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
  thumbEl.classList.add("active");

  const preview = document.getElementById("imagePreview");
  if (preview) {
    preview.src = thumbEl.getAttribute("src");
  }

  // Clear file input
  const fileInput = document.getElementById("productImageFile");
  if (fileInput) fileInput.value = "";
}

// Save Product (Add or Edit)
function handleSaveProduct(event) {
  event.preventDefault();

  const editId = document.getElementById("editProductId").value.trim();
  const name = document.getElementById("prodTitle").value.trim();
  const category = document.getElementById("prodCategory").value;
  const unit = document.getElementById("prodUnit").value.trim();
  const price = parseFloat(document.getElementById("prodPrice").value) || 0;
  const stock = parseInt(document.getElementById("prodStock").value) || 0;
  const threshold = parseInt(document.getElementById("prodThreshold").value) || 5;
  const image = document.getElementById("imagePreview")?.getAttribute("src") || "../images/vagetables.jpeg";

  if (!name || price <= 0) {
    alert("Please enter a valid product name and price.");
    return;
  }

  let inventory = getProductsInventory();

  if (editId) {
    // Update existing product
    const index = inventory.findIndex(i => String(i.id) === String(editId));
    if (index > -1) {
      inventory[index] = {
        ...inventory[index],
        name,
        category,
        unit,
        price,
        stock,
        threshold,
        image
      };
      showAdminToast(`Updated "${name}" successfully!`);
    }
  } else {
    // Add new product
    const newId = String(300 + Math.floor(Math.random() * 900));
    const newProduct = {
      id: newId,
      name,
      category,
      unit,
      price,
      stock,
      threshold,
      image
    };
    inventory.push(newProduct);
    showAdminToast(`Added "${name}" to product catalog!`);
  }

  saveProductsInventory(inventory);
  closeProductModal();
}

// ================= 5. DELETE PRODUCT ================= //
function handleDeleteProduct(productId) {
  let inventory = getProductsInventory();
  const item = inventory.find(i => String(i.id) === String(productId));
  const itemName = item ? item.name : "this item";

  if (!confirm(`Are you sure you want to delete "${itemName}" from the inventory?`)) {
    return;
  }

  inventory = inventory.filter(i => String(i.id) !== String(productId));
  saveProductsInventory(inventory);
  showAdminToast(`"${itemName}" deleted successfully.`);
}

// ================= 6. TOAST & LOGOUT ================= //
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

// Close modal when clicking outside modal-card
window.addEventListener("click", (e) => {
  const modal = document.getElementById("productModal");
  if (e.target === modal) closeProductModal();
});
