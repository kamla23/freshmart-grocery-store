/**
 * FreshMart - Customer Login & Registration Logic (login.js)
 * Manages Sign In, Account Creation, Password Visibility, Validation, and Redirects.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check if URL has ?tab=signup or ?redirect=...
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get("tab");
  if (tabParam === "signup") {
    switchAuthTab("signup");
  }

  // Pre-fill demo identifier if empty
  const identifierInput = document.getElementById("loginIdentifier");
  const existingProfile = JSON.parse(localStorage.getItem("freshmart_user_profile") || "{}");
  if (identifierInput && existingProfile.email) {
    identifierInput.value = existingProfile.email;
  }
});

// ================= 1. TAB SWITCHING ================= //
function switchAuthTab(tab) {
  const tabSignIn = document.getElementById("tabSignIn");
  const tabSignUp = document.getElementById("tabSignUp");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const errorBanner = document.getElementById("authErrorMsg");

  if (errorBanner) {
    errorBanner.classList.remove("show");
    errorBanner.textContent = "";
  }

  if (tab === "signin") {
    tabSignIn.classList.add("active");
    tabSignUp.classList.remove("active");
    signInForm.classList.add("active");
    signUpForm.classList.remove("active");
  } else {
    tabSignUp.classList.add("active");
    tabSignIn.classList.remove("active");
    signUpForm.classList.add("active");
    signInForm.classList.remove("active");
  }
}

// ================= 2. PASSWORD TOGGLE ================= //
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.className = "fa-regular fa-eye-slash";
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.className = "fa-regular fa-eye";
    }
  }
}

// ================= 3. ERROR HELPER ================= //
function showAuthError(msg) {
  const errorBanner = document.getElementById("authErrorMsg");
  if (errorBanner) {
    errorBanner.textContent = msg;
    errorBanner.classList.add("show");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ================= 4. SIGN IN ACTION ================= //
function handleSignIn(e) {
  e.preventDefault();

  const identifier = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!identifier || !password) {
    showAuthError("Please enter both your email/phone and password.");
    return;
  }

  if (password.length < 4) {
    showAuthError("Password must be at least 4 characters.");
    return;
  }

  const btn = document.getElementById("btnSignIn");
  const originalBtn = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;

  setTimeout(() => {
    // Smart Admin Auto-Detection
    if (
      (identifier.toLowerCase() === "admin@freshmart.com" || identifier.toLowerCase() === "kamla@freshmart.com" || identifier.toLowerCase() === "admin") &&
      (password === "admin123" || password === "password")
    ) {
      localStorage.setItem("freshmart_admin_logged_in", "true");
      localStorage.setItem("freshmart_admin_name", "Kamla");
      window.location.href = "admin-dashboard.html";
      return;
    }

    // Check or create profile
    let profile = JSON.parse(localStorage.getItem("freshmart_user_profile") || "{}");
    if (!profile.name) {
      profile = {
        name: identifier.includes("@") ? identifier.split("@")[0] : "Rahul Sharma",
        email: identifier.includes("@") ? identifier : "customer@freshmart.in",
        phone: !identifier.includes("@") ? identifier : "9876543210",
        gender: "Prefer not to say"
      };
      localStorage.setItem("freshmart_user_profile", JSON.stringify(profile));
    }

    localStorage.setItem("freshmart_user_logged_in", "true");

    // Check redirect parameter
    handleAuthRedirect();
  }, 600);
}

// ================= 5. SIGN UP ACTION ================= //
function handleSignUp(e) {
  e.preventDefault();

  const fullName = document.getElementById("regFullName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

  // Validations
  if (fullName.length < 2) {
    showAuthError("Please enter a valid full name.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    showAuthError("Please enter a valid 10-digit Indian mobile number.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthError("Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    showAuthError("Passwords do not match. Please re-enter.");
    return;
  }

  const btn = document.getElementById("btnSignUp");
  const originalBtn = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;

  setTimeout(() => {
    const newProfile = {
      name: fullName,
      phone: phone,
      email: email,
      gender: "Prefer not to say"
    };

    localStorage.setItem("freshmart_user_profile", JSON.stringify(newProfile));
    localStorage.setItem("freshmart_user_logged_in", "true");

    // Add to registered users count in localStorage
    try {
      const users = JSON.parse(localStorage.getItem("freshmart_users_list") || "[]");
      users.push({ name: fullName, email, phone, joinedDate: new Date().toISOString() });
      localStorage.setItem("freshmart_users_list", JSON.stringify(users));
    } catch(err) {}

    handleAuthRedirect();
  }, 700);
}

// ================= 6. SOCIAL AUTH & FORGOT ================= //
function handleSocialAuth(provider) {
  const btn = event.currentTarget;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Connecting to ${provider}...`;

  setTimeout(() => {
    const socialProfile = {
      name: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "9876543210",
      gender: "Male"
    };

    localStorage.setItem("freshmart_user_profile", JSON.stringify(socialProfile));
    localStorage.setItem("freshmart_user_logged_in", "true");

    handleAuthRedirect();
  }, 600);
}

function handleForgotPassword() {
  const email = prompt("Enter your registered Email or Mobile to receive a password reset link:");
  if (email) {
    alert(`A password reset link / OTP has been dispatched to: ${email}`);
  }
}

// ================= 7. REDIRECT HANDLER ================= //
function handleAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect");

  if (redirect === "checkout") {
    window.location.href = "checkout.html";
  } else if (redirect === "cart") {
    window.location.href = "cart.html";
  } else {
    window.location.href = "profile.html";
  }
}
