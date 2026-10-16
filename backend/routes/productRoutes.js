import express from "express";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering & sorting
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, isOrganic, tag } = req.query;
    let query = {};

    if (category && category !== "ALL") {
      query.category = new RegExp(`^${category}$`, "i");
    }

    if (isOrganic === "true") {
      query.isOrganic = true;
    }

    if (tag) {
      query.dietaryTags = { $in: [new RegExp(tag, "i")] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = {};
    if (sort === "price-low") sortOption.price = 1;
    else if (sort === "price-high") sortOption.price = -1;
    else if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching product details" });
  }
});

// @route   POST /api/products
// @desc    Add new product with image upload (Multer)
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, unit, stock, threshold, description, isOrganic, dietaryTags, shelfLife, storageAdvice } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    let imageUrl = req.body.imageUrl || "../images/vagetables.jpeg";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      unit: unit || "500g",
      stock: Number(stock) || 10,
      threshold: Number(threshold) || 5,
      description: description || "Fresh and premium quality grocery item.",
      imageUrl,
      isOrganic: isOrganic === "true" || isOrganic === true,
      dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : (dietaryTags ? [dietaryTags] : []),
      shelfLife: shelfLife || "3-5 Days",
      storageAdvice: storageAdvice || "Store in a cool, dry place."
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Error creating product", error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Edit existing product
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating product" });
  }
});

// @route   PATCH /api/products/:id/restock
// @desc    Quick restock product stock (+10 units)
router.patch("/:id/restock", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount) || 10;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: amount } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: `Restocked +${amount} units of ${product.name}`,
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error restocking product" });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product from catalog
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: `"${product.name}" deleted from catalog` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

export default router;
