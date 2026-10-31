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

async function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim().toLowerCase();
  const password = document.getElementById("adminPassword").value.trim();
  const pin = document.getElementById("adminPin").value.trim();
  const errorBox = document.getElementById("adminErrorMsg");

  if (errorBox) {
    errorBox.classList.remove("show");
    errorBox.textContent = "";
  }

  const btn = document.getElementById("btnAdminLogin");
  const originalBtn = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating Admin...`;

  try {
    // 1. Live Admin Authentication via MongoDB Atlas
    if (window.FreshMartAPI) {
      const res = await FreshMartAPI.post("/auth/login", {
        email: email,
        password: password
      });

      if (res.success) {
        if (res.user && res.user.role === "admin") {
          FreshMartAPI.setAdminToken(res.token);
          localStorage.setItem("freshmart_admin_logged_in", "true");
          localStorage.setItem("freshmart_admin_name", res.user.name || "Store Admin");
          window.location.href = "admin-dashboard.html";
          return;
        } else {
          btn.disabled = false;
          btn.innerHTML = originalBtn;
          if (errorBox) {
            errorBox.textContent = "Access Denied: This account does not have Admin privileges.";
            errorBox.classList.add("show");
          }
          return;
        }
      } else if (!res.offline) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
        if (errorBox) {
          errorBox.textContent = res.message || "Invalid Admin Email or Password!";
          errorBox.classList.add("show");
        }
        return;
      }
    }

    // 2. Offline / Demo Fallback
    const isValidAdmin = (
      (email === "admin@freshmart.com" || email === "kamla@freshmart.com" || email === "admin") &&
      (password === "admin123" || password === "password" || pin === "9999")
    );

    if (!isValidAdmin) {
      btn.disabled = false;
      btn.innerHTML = originalBtn;
      if (errorBox) {
        errorBox.textContent = "Invalid Admin Email or Password! (Hint: use admin@freshmart.com / admin123)";
        errorBox.classList.add("show");
      }
      return;
    }

    localStorage.setItem("freshmart_admin_logged_in", "true");
    localStorage.setItem("freshmart_admin_name", "Kamla");
    window.location.href = "admin-dashboard.html";
  } catch (err) {
    console.error("Admin login error:", err);
    btn.disabled = false;
    btn.innerHTML = originalBtn;
    if (errorBox) {
      errorBox.textContent = "An error occurred during authentication. Please retry.";
      errorBox.classList.add("show");
    }
  }
}
