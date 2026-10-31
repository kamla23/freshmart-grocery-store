/**
 * FreshMart - Products Listing Page Logic (products.js)
 * Manages Live MongoDB Atlas Product Fetching, Filtering (Category, Price, Tags), Sorting, and URL query handling.
 */

document.addEventListener("DOMContentLoaded", async () => {
  // Load live products from MongoDB Atlas
  await loadProductsFromAPI();

  // Check URL params for deep linking (e.g. ?cat=fruits or ?search=spinach)
  handleURLParams();

  // Initial Product Count display update
  updateProductCount();

  // Restore counter state on cards
  if (typeof restoreCartUI === "function") {
    restoreCartUI();
  }
});

/**
 * Fetch products dynamically from MongoDB Atlas REST API
 */
async function loadProductsFromAPI() {
  if (!window.FreshMartAPI) return;
  try {
    const res = await FreshMartAPI.get("/products");
    if (res.success && Array.isArray(res.products) && res.products.length > 0) {
      renderProductsGrid(res.products);
    }
  } catch (err) {
    console.warn("Could not load products from API, using fallback DOM:", err);
  }
}

/**
 * Dynamically render product cards into #listingGrid
 */
function renderProductsGrid(products) {
  const grid = document.getElementById("listingGrid");
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    let imgPath = p.imageUrl || "../images/vagetables.webp";
    if (imgPath.startsWith("/uploads")) {
      const base = window.FreshMartAPI ? FreshMartAPI.UPLOADS_BASE : "http://localhost:5000/uploads";
      imgPath = `${base}${imgPath.replace("/uploads", "")}`;
    }

    return `
      <div class="product-card" data-id="${p._id}">
        ${p.isOrganic ? '<span class="badge-discount" style="background:#059669;">ORGANIC</span>' : ''}
        <div class="product-img-box">
          <a href="product-detail.html?id=${p._id}"><img src="${imgPath}" alt="${p.name}" width="220" height="220" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../images/vagetables.webp';"></a>
        </div>
        <div class="product-info">
          <span class="product-cat">${p.category}</span>
          <h3 class="product-title"><a href="product-detail.html?id=${p._id}">${p.name}</a> <span class="weight-tag">${p.unit || 'pack'}</span></h3>
          <div class="product-price">
            <span class="current-price">₹${p.price}</span>
          </div>
          <div class="cart-action-container">
            <button type="button" class="btn-add-cart" aria-label="Add ${p.name} to cart" onclick="handleAddInitial(this, '${p._id}')">
              <i class="fa-solid fa-cart-plus"></i> Add
            </button>
            <div class="qty-counter-box hidden">
              <button type="button" class="qty-btn" aria-label="Decrease quantity" onclick="updateQty('${p._id}', -1, this)">-</button>
              <span class="qty-value">1</span>
              <button type="button" class="qty-btn" aria-label="Increase quantity" onclick="updateQty('${p._id}', 1, this)">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Handle incoming query parameters from URL
 */
function handleURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get("cat");
  const searchParam = urlParams.get("search");

  if (catParam) {
    const catCheckboxes = document.querySelectorAll(".cat-filter");
    catCheckboxes.forEach((cb) => {
      if (cb.value.toLowerCase() === catParam.toLowerCase()) {
        cb.checked = true;
      }
    });
    applyFilters();
  }

  if (searchParam) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = searchParam;
    }
    if (typeof filterProducts === "function") {
      filterProducts();
    }
  }
}

/**
 * 1. Screen par visible products ka count update karta hai
 */
function updateProductCount() {
  const visibleCards = document.querySelectorAll('.product-card:not([style*="display: none"])');
  const countSpan = document.getElementById("productCount");
  if (countSpan) {
    countSpan.textContent = visibleCards.length;
  }
}

/**
 * 2. Price Range Slider ke text ko dynamic update karta hai
 */
function updatePriceLabel(val) {
  const priceSpan = document.getElementById("priceValue");
  if (priceSpan) {
    priceSpan.textContent = val;
  }
}

/**
 * 3. Sidebar Filters (Category, Price, Dietary) aur Sorting Logic
 */
function applyFilters() {
  // Selected Categories
  const selectedCats = Array.from(document.querySelectorAll(".cat-filter:checked"))
    .map(el => el.value.toLowerCase());

  // Selected Dietary Tags (Organic, Vegan)
  const selectedTags = Array.from(document.querySelectorAll(".tag-filter:checked"))
    .map(el => el.value.toLowerCase());

  // Price Range Limit
  const maxPriceInput = document.getElementById("priceRange");
  const maxPrice = maxPriceInput ? Number(maxPriceInput.value) : Infinity;

  // Selected Sort Option
  const sortSelect = document.getElementById("sortSelect");
  const sortValue = sortSelect ? sortSelect.value : "default";

  // Saare product cards select karein
  const cards = Array.from(document.querySelectorAll("#listingGrid .product-card"));

  cards.forEach(card => {
    const catEl = card.querySelector(".product-cat");
    const category = catEl ? catEl.textContent.trim().toLowerCase() : "";
    
    const priceEl = card.querySelector(".current-price");
    const priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "").trim() : "0";
    const price = Number(priceText);

    const titleEl = card.querySelector(".product-title");
    const title = titleEl ? titleEl.textContent.trim().toLowerCase() : "";

    // Matching conditions
    const matchesCat = selectedCats.length === 0 || selectedCats.includes(category);
    const matchesPrice = price <= maxPrice;
    const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => title.includes(tag));

    // Display toggle
    if (matchesCat && matchesPrice && matchesTag) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });

  // Visible cards ki Sorting
  const grid = document.getElementById("listingGrid");
  if (grid) {
    const visibleCards = cards.filter(card => card.style.display !== "none");

    if (sortValue === "low-high") {
      visibleCards.sort((a, b) => {
        const p1 = Number(a.querySelector(".current-price")?.textContent.replace(/[^0-9.]/g, "") || 0);
        const p2 = Number(b.querySelector(".current-price")?.textContent.replace(/[^0-9.]/g, "") || 0);
        return p1 - p2;
      });
    } else if (sortValue === "high-low") {
      visibleCards.sort((a, b) => {
        const p1 = Number(a.querySelector(".current-price")?.textContent.replace(/[^0-9.]/g, "") || 0);
        const p2 = Number(b.querySelector(".current-price")?.textContent.replace(/[^0-9.]/g, "") || 0);
        return p2 - p1;
      });
    }

    // Sorted list ko HTML Grid mein update karein
    visibleCards.forEach(card => grid.appendChild(card));
  }

  // Count text refresh karein
  updateProductCount();
}
