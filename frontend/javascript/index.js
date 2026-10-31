/**
 * FreshMart - Home Page Specific Logic (index.js)
 * Enhances Hero Banner, Carousel Interactions, and Category Navigation.
 */

document.addEventListener("DOMContentLoaded", async () => {
  initHeroBanner();
  initCategoryCards();
  await loadTrendingProducts();
  if (typeof restoreCartUI === "function") {
    restoreCartUI();
  }
});

async function loadTrendingProducts() {
  if (!window.FreshMartAPI) return;
  try {
    const res = await FreshMartAPI.get("/products");
    if (res.success && Array.isArray(res.products) && res.products.length > 0) {
      const grid = document.getElementById("trendingGrid");
      if (!grid) return;

      grid.innerHTML = res.products.slice(0, 6).map(p => {
        let imgPath = p.imageUrl || "../images/vagetables.webp";
        if (imgPath.startsWith("/uploads")) {
          const base = window.FreshMartAPI ? FreshMartAPI.UPLOADS_BASE : "http://localhost:5000/uploads";
          imgPath = `${base}${imgPath.replace("/uploads", "")}`;
        }

        return `
          <div class="product-card" data-id="${p._id}">
            ${p.isOrganic ? '<span class="badge-discount" style="background:#059669;">ORGANIC</span>' : ''}
            <div class="product-img-box">
              <a href="product-detail.html?id=${p._id}"><img src="${imgPath}" alt="${p.name}" width="200" height="200" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../images/vagetables.webp';"></a>
            </div>
            <div class="product-info">
              <span class="product-cat">${p.category}</span>
              <h3 class="product-title"><a href="product-detail.html?id=${p._id}">${p.name}</a></h3>
              <div class="product-price">
                <span class="current-price">₹${p.price}</span>
                <span class="unit">/ ${p.unit || 'pack'}</span>
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
  } catch (err) {
    console.warn("Could not load trending products from API:", err);
  }
}

function initHeroBanner() {
  const shopNowBtn = document.querySelector(".btn-shop");
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", (e) => {
      // Direct navigation to products.html
    });
  }
}

function initCategoryCards() {
  const categoryItems = document.querySelectorAll(".category-item");
  categoryItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-4px)";
    });
    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)";
    });
  });
}
