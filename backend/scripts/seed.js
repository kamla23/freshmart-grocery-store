import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const SEED_PRODUCTS = [
  {
    name: "Organic Spinach",
    category: "Vegetables",
    price: 30,
    unit: "250g",
    stock: 3,
    threshold: 5,
    imageUrl: "../images/vagetables.jpeg",
    description: "Farm fresh organic leafy spinach washed and packed hygienically.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "2-3 Days",
    storageAdvice: "Store in refrigerator below 5°C."
  },
  {
    name: "Fresh Red Apples",
    category: "Fruits",
    price: 160,
    unit: "1kg",
    stock: 18,
    threshold: 5,
    imageUrl: "../images/fruits2.jpeg",
    description: "Sweet and crisp Shimla red apples rich in fiber and antioxidants.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "7-10 Days",
    storageAdvice: "Keep at room temperature or cool pantry."
  },
  {
    name: "Organic Whole Milk",
    category: "Dairy",
    price: 65,
    unit: "1L",
    stock: 24,
    threshold: 5,
    imageUrl: "../images/pure1.jpg",
    description: "Pure farm-fresh cow milk with 3.5% fat, pasteurized and unadulterated.",
    isOrganic: true,
    dietaryTags: ["Vegetarian"],
    shelfLife: "2 Days",
    storageAdvice: "Refrigerate immediately."
  },
  {
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 45,
    unit: "400g",
    stock: 2,
    threshold: 5,
    imageUrl: "../images/bread.jpeg",
    description: "100% whole wheat sliced loaf with no added preservatives or refined flour.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "4 Days",
    storageAdvice: "Store in a cool and dry place."
  },
  {
    name: "Fresh Oranges",
    category: "Fruits",
    price: 90,
    unit: "1kg",
    stock: 12,
    threshold: 5,
    imageUrl: "../images/fruit1.jpeg",
    description: "Juicy Nagpur sweet oranges loaded with Vitamin C.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "5-7 Days",
    storageAdvice: "Store in cool dry conditions."
  },
  {
    name: "Pure Natural Honey",
    category: "Organic",
    price: 220,
    unit: "500g",
    stock: 4,
    threshold: 5,
    imageUrl: "../images/oil.jpeg",
    description: "100% raw forest honey directly sourced from organic beekeepers.",
    isOrganic: true,
    dietaryTags: ["Vegetarian"],
    shelfLife: "12 Months",
    storageAdvice: "Store at room temperature. Do not refrigerate."
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas for seeding...");

    // Clear existing collections
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    // 1. Create Admin
    const admin = await User.create({
      name: "Kamla Admin",
      email: "admin@freshmart.com",
      password: "admin123",
      role: "admin",
      phone: "9876543210"
    });
    console.log("✅ Admin created in Atlas: admin@freshmart.com / admin123");

    // 2. Create Sample Customer
    const customer = await User.create({
      name: "Rahul Sharma",
      email: "customer@freshmart.in",
      password: "password123",
      role: "customer",
      phone: "9876543210",
      address: [
        {
          recipientName: "Rahul Sharma",
          phone: "9876543210",
          house: "Flat 402, Green Valley Apts",
          street: "100ft Road, Indiranagar",
          city: "Bengaluru",
          pincode: "560038",
          type: "Home",
          isDefault: true
        }
      ]
    });
    console.log("✅ Sample Customer created in Atlas: customer@freshmart.in / password123");

    // 3. Seed Products
    const createdProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(`✅ Seeded ${createdProducts.length} grocery items into MongoDB Atlas.`);

    // 4. Create Sample Orders
    await Order.create({
      orderId: "FM-849201",
      userId: customer._id,
      items: [
        {
          productId: createdProducts[0]._id,
          name: createdProducts[0].name,
          price: createdProducts[0].price,
          quantity: 2,
          unit: createdProducts[0].unit,
          imageUrl: createdProducts[0].imageUrl
        },
        {
          productId: createdProducts[1]._id,
          name: createdProducts[1].name,
          price: createdProducts[1].price,
          quantity: 1,
          unit: createdProducts[1].unit,
          imageUrl: createdProducts[1].imageUrl
        }
      ],
      shippingAddress: {
        fullName: "Rahul Sharma",
        phone: "9876543210",
        house: "Flat 402, Green Valley Apts",
        street: "100ft Road, Indiranagar",
        city: "Bengaluru",
        pincode: "560038",
        type: "Home"
      },
      deliverySlot: "Today: 5:00 PM - 7:00 PM",
      substitution: { preference: "replace", callBeforeReplace: true },
      subtotal: 220,
      deliveryFee: 30,
      tax: 11,
      totalPrice: 261,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Processing"
    });

    console.log("✅ Sample order created in Atlas!");
    console.log("\n🎉 MongoDB Atlas Cloud database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seedDatabase();
