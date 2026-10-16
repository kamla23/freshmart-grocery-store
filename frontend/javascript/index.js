/**
 * FreshMart - Home Page Specific Logic (index.js)
 * Enhances Hero Banner, Carousel Interactions, and Category Navigation.
 */

document.addEventListener("DOMContentLoaded", () => {
  initHeroBanner();
  initCategoryCards();
});

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
