/**
 * FreshMart - Products Listing Page Logic (products.js)
 * Manages Filtering (Category, Price, Tags), Sorting, and URL query handling.
 */

document.addEventListener("DOMContentLoaded", () => {
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
