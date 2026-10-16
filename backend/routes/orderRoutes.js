import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

const generateOrderId = () => {
  return "FM-" + Math.floor(100000 + Math.random() * 900000);
};

// @route   POST /api/orders
// @desc    Place a new grocery order
router.post("/", async (req, res) => {
  try {
    const { items, shippingAddress, deliverySlot, substitution, subtotal, deliveryFee, tax, totalPrice, paymentMethod, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    if (!shippingAddress || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: "Valid shipping address is required" });
    }

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      userId: userId || null,
      items,
      shippingAddress,
      deliverySlot: deliverySlot || "Today: 5:00 PM - 7:00 PM",
      substitution: substitution || { preference: "replace", callBeforeReplace: true },
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      tax: Number(tax) || 0,
      totalPrice: Number(totalPrice) || 0,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending"
    });

    // Decrement stock if item has productId
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -Number(item.quantity || 1) }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Error placing order", error: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get order history for logged-in user
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
});

// @route   GET /api/orders/all
// @desc    Get all orders for Admin Fulfillment Center
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== "ALL") {
      query.orderStatus = new RegExp(`^${status}$`, "i");
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching fulfillment orders" });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order fulfillment status (Pending -> Packing -> Out for Delivery -> Completed)
router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Processing", "Packing", "Out for Delivery", "Delivered", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid order status value" });
    }

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderId: req.params.id }] },
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: `Order #${order.orderId} moved to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
});

// @route   GET /api/orders/metrics
// @desc    Get admin dashboard metrics summary
router.get("/metrics", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
    const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = await Order.countDocuments();
    const registeredUsers = await User.countDocuments({ role: "customer" });
    const lowStockCount = await Product.countDocuments({ $expr: { $lte: ["$stock", "$threshold"] } });

    res.json({
      success: true,
      metrics: {
        totalSales,
        totalOrders,
        registeredUsers: 42 + registeredUsers,
        lowStockCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching metrics" });
  }
});

export default router;
