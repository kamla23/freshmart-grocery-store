import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: ["Vegetables", "Fruits", "Dairy", "Bakery", "Organic", "Snacks", "Other"]
    },
    price: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: 0
    },
    unit: {
      type: String,
      required: [true, "Unit measure is required"],
      default: "500g"
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: 0,
      default: 10
    },
    threshold: {
      type: Number,
      default: 5
    },
    imageUrl: {
      type: String,
      default: "../images/vagetables.jpeg"
    },
    description: {
      type: String,
      default: "Fresh and premium quality grocery item, handpicked for you."
    },
    isOrganic: {
      type: Boolean,
      default: false
    },
    dietaryTags: {
      type: [String],
      default: []
    },
    shelfLife: {
      type: String,
      default: "3-5 Days"
    },
    storageAdvice: {
      type: String,
      default: "Keep in a cool, dry place."
    },
    rating: {
      type: Number,
      default: 4.8
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
