import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve Frontend Statically (Optional for unified preview)
app.use(express.static(path.join(__dirname, "../frontend")));

// Root redirect to homepage
app.get("/", (req, res) => {
  res.redirect("/html/index.html");
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FreshMart Grocery E-Commerce API",
    database: "MongoDB Atlas Connected",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 404 Handler for API (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FreshMart Server is running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
