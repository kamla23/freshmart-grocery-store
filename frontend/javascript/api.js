/**
 * FreshMart - Centralized API Service Layer (api.js)
 * Handles communication with Node.js Express REST APIs & MongoDB Atlas.
 */

const FreshMartAPI = (() => {
  // Determine API base URL dynamically
  const isServerHost = window.location.origin.includes(":5000");
  const API_BASE = isServerHost ? "/api" : "http://localhost:5000/api";
  const UPLOADS_BASE = isServerHost ? "/uploads" : "http://localhost:5000/uploads";

  // Token & User helpers
  const getToken = () => localStorage.getItem("freshmart_token") || "";
  const setToken = (token) => localStorage.setItem("freshmart_token", token);
  const removeToken = () => localStorage.removeItem("freshmart_token");

  const getAdminToken = () => 
    localStorage.getItem("freshmart_admin_token") || localStorage.getItem("freshmart_token") || "";
  const setAdminToken = (token) => localStorage.setItem("freshmart_admin_token", token);
  const removeAdminToken = () => localStorage.removeItem("freshmart_admin_token");

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("freshmart_user_profile")) || null;
    } catch {
      return null;
    }
  };

  const setUser = (user) => {
    localStorage.setItem("freshmart_user_profile", JSON.stringify(user));
  };

  const logout = () => {
    removeToken();
    removeAdminToken();
    localStorage.removeItem("freshmart_user_logged_in");
    localStorage.removeItem("freshmart_admin_logged_in");
  };

  /**
   * Core request handler
   */
  async function request(endpoint, options = {}, requiresAuth = false, isAdmin = false) {
    const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers = options.headers ? { ...options.headers } : {};

    // Attach Authorization header if required
    if (requiresAuth || isAdmin) {
      const token = isAdmin ? getAdminToken() : getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Default to application/json if not sending FormData
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: (data && data.message) ? data.message : `Request failed with status ${response.status}`,
          data: data
        };
      }

      return {
        success: true,
        status: response.status,
        ...data
      };
    } catch (err) {
      console.warn(`[FreshMart API] Offline/Unreachable at ${url}:`, err.message);
      return {
        success: false,
        offline: true,
        message: "Server is unreachable. Please ensure the backend is running on port 5000."
      };
    }
  }

  // HTTP Method Shortcuts
  return {
    API_BASE,
    UPLOADS_BASE,
    getToken,
    setToken,
    removeToken,
    getAdminToken,
    setAdminToken,
    removeAdminToken,
    getUser,
    setUser,
    logout,

    get: (endpoint, requiresAuth = false, isAdmin = false) => 
      request(endpoint, { method: "GET" }, requiresAuth, isAdmin),

    post: (endpoint, body, requiresAuth = false, isAdmin = false) => 
      request(endpoint, {
        method: "POST",
        body: (body instanceof FormData) ? body : JSON.stringify(body)
      }, requiresAuth, isAdmin),

    put: (endpoint, body, requiresAuth = false, isAdmin = false) => 
      request(endpoint, {
        method: "PUT",
        body: (body instanceof FormData) ? body : JSON.stringify(body)
      }, requiresAuth, isAdmin),

    patch: (endpoint, body, requiresAuth = false, isAdmin = false) => 
      request(endpoint, {
        method: "PATCH",
        body: (body instanceof FormData) ? body : JSON.stringify(body)
      }, requiresAuth, isAdmin),

    delete: (endpoint, requiresAuth = false, isAdmin = false) => 
      request(endpoint, { method: "DELETE" }, requiresAuth, isAdmin)
  };
})();

// Export globally for browser window
window.FreshMartAPI = FreshMartAPI;

