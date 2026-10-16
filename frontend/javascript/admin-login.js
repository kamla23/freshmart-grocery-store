/**
 * FreshMart - Admin Authentication Logic (admin-login.js)
 * Validates administrative credentials, manages session, and redirects to Dashboard.
 */

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to admin-dashboard.html
  if (localStorage.getItem("freshmart_admin_logged_in") === "true") {
    // Optional: window.location.href = "admin-dashboard.html";
  }
});

function autoFillDemoAdmin() {
  document.getElementById("adminEmail").value = "admin@freshmart.com";
  document.getElementById("adminPassword").value = "admin123";
  document.getElementById("adminPin").value = "9999";
  
  const errorBox = document.getElementById("adminErrorMsg");
  if (errorBox) {
    errorBox.classList.remove("show");
    errorBox.textContent = "";
  }
}

function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim().toLowerCase();
  const password = document.getElementById("adminPassword").value.trim();
  const pin = document.getElementById("adminPin").value.trim();
  const errorBox = document.getElementById("adminErrorMsg");

  if (errorBox) {
    errorBox.classList.remove("show");
    errorBox.textContent = "";
  }

  // Admin Verification Logic
  const isValidAdmin = (
    (email === "admin@freshmart.com" || email === "kamla@freshmart.com" || email === "admin") &&
    (password === "admin123" || password === "password" || pin === "9999")
  );

  if (!isValidAdmin) {
    if (errorBox) {
      errorBox.textContent = "Invalid Admin Email or Password! (Hint: use admin@freshmart.com / admin123)";
      errorBox.classList.add("show");
    }
    return;
  }

  const btn = document.getElementById("btnAdminLogin");
  const originalBtn = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating Admin...`;

  setTimeout(() => {
    localStorage.setItem("freshmart_admin_logged_in", "true");
    localStorage.setItem("freshmart_admin_name", "Kamla");
    window.location.href = "admin-dashboard.html";
  }, 600);
}
