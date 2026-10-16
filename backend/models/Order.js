import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: "500g" },
  imageUrl: { type: String }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String },
      recipientName: { type: String },
      phone: { type: String, required: true },
      house: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, default: "Bengaluru" },
      pincode: { type: String, required: true },
      type: { type: String, default: "Home" }
    },
    deliverySlot: {
      type: String,
      required: true,
      default: "Today: 5:00 PM - 7:00 PM"
    },
    substitution: {
      preference: { type: String, enum: ["replace", "refund"], default: "replace" },
      callBeforeReplace: { type: Boolean, default: true }
    },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalPrice: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Packing", "Out for Delivery", "Delivered", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
