# FreshMart - Full-Stack Grocery E-Commerce Platform 🛒🥦

A production-ready, full-stack online supermarket web platform built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MongoDB**. Features end-to-end customer shopping, slot-based checkout, real-time inventory management, and an administrative order fulfillment dashboard.

---

## 🌟 Key Features

### 🛒 Customer Storefront (Public & Buyer Area)
1. **Homepage (`index.html`)**:
   - Location/Pincode picker with persistent validation.
   - Live search bar with instant filtering.
   - Category shortcut navigation (Vegetables, Fruits, Dairy, Bakery, Organic).
   - "Trending Fresh Goods" & "Buy Again" carousels with instant `+` / `-` cart increment buttons.
2. **Product Catalog & Search (`products.html`)**:
   - Multi-attribute sidebar filtering (Categories, Price range slider, Dietary tags: Organic, Vegan).
   - Sorting dropdown (Price: Low to High, High to Low, Newest).
   - Dynamic product cards with pack weight tags and responsive layout.
3. **Product Detail View (`product-detail.html`)**:
   - Interactive image gallery with preview thumbnail switcher.
   - Pack size variant picker (250g, 500g, 1kg, 1L).
   - Metadata display (Shelf life, storage advice, temperature, real-time stock status).
   - Customer review ratings and comments.
4. **Shopping Cart (`cart.html`)**:
   - Itemized list with quantity controls and instant bill recalculation.
   - Coupon codes engine (`FRESH10` for 10% off, `FRESH50` for ₹50 off).
   - Free delivery threshold calculation (Orders > ₹500 get free shipping) and 5% GST breakdown.
5. **Checkout & Slot Booking (`checkout.html`)**:
   - Real-time address form validation (10-digit phone, 6-digit pincode).
   - Delivery Slot Picker: Date tabs (Today, Tomorrow, Day After) and time window slots (e.g. 5 PM - 7 PM).
   - Item Substitution preference (Replace with nearest brand vs Refund directly).
   - Payment method selection (Cash on Delivery, Simulated UPI, Card).
6. **User Account & Order History (`profile.html`)**:
   - Personal information & saved delivery addresses manager (CRUD).
   - Order history with live delivery stages (`Processing`, `Out for Delivery`, `Delivered`).
   - Printable tax invoice receipt popup with full itemized breakdown.
7. **Customer Authentication (`login.html`)**:
   - Tab switcher for Sign In & Account Creation.
   - Form validation & password visibility eye toggle.
   - Discreet Store Staff Gateway link.

---

### 🛠️ Admin Panel (Store Operations Dashboard)
1. **Admin Security Gateway (`admin-login.html`)**:
   - Dark slate security gateway with 2FA/PIN protection and route guards.
   - Demo Auto-Fill credentials button for quick evaluations.
2. **Dashboard Overview (`admin-dashboard.html`)**:
   - Key Metrics Summary: Total Sales Amount (₹), Total Orders Count, Total Registered Users, and Low-Stock Alert Badge.
   - Low-Stock Alert Drawer with quick "+10 Restock" buttons.
   - Recent 5 Orders table with real-time status update dropdowns and customer inspector modal.
3. **Product Inventory Manager (`admin-products.html`)**:
   - Comprehensive inventory table with category badges, unit prices, and stock indicators.
   - Multer-ready Add/Edit Product Modal with live image file upload reader and preset selectors.
   - Category & stock level filters (`In Stock`, `Low Stock`, `Out of Stock`).
4. **Order Fulfillment Center (`admin-orders.html`)**:
   - Stage filter tabs (`All`, `Pending`, `Packing`, `Out for Delivery`, `Completed`) with dynamic counter badges.
   - Live stage updater dropdown with instant two-way synchronization.
   - Printable Warehouse Packing Slip modal with pick-and-pack checklist.

---

## 🏗️ Project Folder Structure

```text
freshmart-grocery-store/
├── backend/                      # Server-side Application
│   ├── config/
│   │   └── db.js                 # MongoDB connection & configuration
│   ├── models/                   # Mongoose Database Schemas
│   │   ├── User.js               # Customer & Admin user schema
│   │   ├── Product.js            # Grocery item catalog schema
│   │   └── Order.js              # Order details & fulfillment schema
│   ├── routes/                   # REST API Endpoints
│   │   ├── authRoutes.js         # /api/auth (Login, Register, Profile)
│   │   ├── productRoutes.js      # /api/products (CRUD & Multer upload)
│   │   └── orderRoutes.js        # /api/orders (Orders & Metrics)
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   ├── adminMiddleware.js    # Role-based admin guard
│   │   └── uploadMiddleware.js   # Multer file upload configuration
│   ├── uploads/                  # Uploaded grocery product images
│   ├── scripts/
│   │   └── seed.js               # Database seeder script
│   └── server.js                 # Express server entry point
│
├── frontend/                     # Client-side Application
│   ├── html/                     # Semantic HTML5 pages (11 pages)
│   ├── css/                      # Modular CSS3 styling (12 files)
│   ├── javascript/               # Interactive Vanilla JS scripts (11 files)
│   └── images/                   # High-res grocery assets & banners
│
├── .env                          # Environment variables
├── .env.example                  # Template for environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # NPM dependencies & scripts
└── README.md                     # Project documentation
```

---

## 💻 Tech Stack & Architecture

- **Frontend**: HTML5, CSS3 (Flexbox & CSS Grid), Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage, Fetch API).
- **Backend**: Node.js, Express.js (RESTful API architecture).
- **Database**: MongoDB with Mongoose ORM.
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt.js (Password hashing).
- **File Storage**: Multer disk storage for product image uploads.

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [MongoDB](https://www.mongodb.com/) (Local mongod service or MongoDB Atlas cluster URI)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/kamla23/freshmart-grocery-store.git
cd freshmart-grocery-store
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/freshmart
JWT_SECRET=freshmart_super_secure_jwt_secret_key_2026_kamla
NODE_ENV=development
```

### 4. Seed the Database
Populate initial grocery catalog, default admin, and sample customers:
```bash
npm run seed
```

### 5. Start the Server
```bash
npm start
```
The server will start on `http://localhost:5000`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@freshmart.com` | `admin123` | Full Admin Dashboard & Inventory Manager |
| **Customer** | `customer@freshmart.in` | `password123` | Storefront Shopping & Order Tracking |

---

## 📡 Core API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Login user/admin and obtain JWT | No |
| `GET` | `/api/auth/profile` | Get current user profile | Yes (JWT) |
| `GET` | `/api/products` | Get products (supports search, category, sort) | No |
| `GET` | `/api/products/:id` | Get single product details | No |
| `POST` | `/api/products` | Create new product with image upload | Yes (Admin) |
| `PUT` | `/api/products/:id` | Update product details | Yes (Admin) |
| `DELETE`| `/api/products/:id` | Delete product from catalog | Yes (Admin) |
| `POST` | `/api/orders` | Place new grocery order | Optional |
| `GET` | `/api/orders/my-orders`| Fetch logged-in user order history | Yes (JWT) |
| `GET` | `/api/orders/all` | Fetch all orders for fulfillment center | Yes (Admin) |
| `PATCH`| `/api/orders/:id/status`| Update order status (`Pending` -> `Completed`)| Yes (Admin) |
| `GET` | `/api/orders/metrics` | Retrieve live admin metrics & revenue | Yes (Admin) |

---

## 📄 License
This project is open-source and available under the ISC License.
