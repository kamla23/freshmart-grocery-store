import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

// Ensure resilient SRV DNS resolution for MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const SEED_PRODUCTS = [
  // 1. VEGETABLES
  {
    name: "Organic Baby Spinach",
    category: "Vegetables",
    price: 30,
    unit: "250g",
    stock: 25,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
    description: "Farm fresh tender organic baby spinach washed and hydro-cooled.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "2-3 Days",
    storageAdvice: "Store in refrigerator below 5°C."
  },
  {
    name: "Vine Ripe Red Tomatoes",
    category: "Vegetables",
    price: 40,
    unit: "1kg",
    stock: 30,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
    description: "Plump, juicy field-grown red tomatoes, ideal for curries and fresh salads.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "5-7 Days",
    storageAdvice: "Keep at cool room temperature."
  },
  {
    name: "Fresh Green Broccoli",
    category: "Vegetables",
    price: 65,
    unit: "500g",
    stock: 12,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=80",
    description: "Nutrient-packed crisp green broccoli florets direct from Nilgiri farms.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "4-5 Days",
    storageAdvice: "Refrigerate in a perforated bag."
  },
  {
    name: "Crunchy Orange Carrots",
    category: "Vegetables",
    price: 35,
    unit: "500g",
    stock: 20,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80",
    description: "Sweet and crunchy local carrots washed and ready to cook.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "7-10 Days",
    storageAdvice: "Store in vegetable crisper."
  },

  // 2. FRUITS
  {
    name: "Crisp Shimla Red Apples",
    category: "Fruits",
    price: 160,
    unit: "1kg",
    stock: 18,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
    description: "Crisp and juicy Himalayan royal delicious red apples.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "10-14 Days",
    storageAdvice: "Store in cool dry conditions."
  },
  {
    name: "Robusta Ripe Bananas",
    category: "Fruits",
    price: 45,
    unit: "1 dozen",
    stock: 22,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
    description: "Naturally ripened golden Robusta bananas rich in potassium and energy.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "3-4 Days",
    storageAdvice: "Do not refrigerate. Keep at room temperature."
  },
  {
    name: "Nagpur Sweet Oranges",
    category: "Fruits",
    price: 90,
    unit: "1kg",
    stock: 15,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80",
    description: "Juicy and tangy sweet oranges loaded with natural Vitamin C.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "5-7 Days",
    storageAdvice: "Keep in a cool fruit basket."
  },
  {
    name: "Fresh Green Seedless Grapes",
    category: "Fruits",
    price: 85,
    unit: "500g",
    stock: 14,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500&auto=format&fit=crop&q=80",
    description: "Sweet, crisp and refreshing seedless green table grapes from Nashik.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "4-6 Days",
    storageAdvice: "Refrigerate unwashed until consumption."
  },

  // 3. DAIRY
  {
    name: "Organic Farm Cow Milk",
    category: "Dairy",
    price: 65,
    unit: "1L",
    stock: 24,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80",
    description: "Unprocessed pure cow milk, pasteurized with zero hormones or preservatives.",
    isOrganic: true,
    dietaryTags: ["Vegetarian"],
    shelfLife: "2 Days",
    storageAdvice: "Refrigerate immediately below 4°C."
  },
  {
    name: "Fresh Malai Paneer",
    category: "Dairy",
    price: 95,
    unit: "200g",
    stock: 16,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    description: "Soft, velvety cottage cheese made from fresh whole milk.",
    isOrganic: false,
    dietaryTags: ["Vegetarian"],
    shelfLife: "4 Days",
    storageAdvice: "Keep refrigerated immersed in water."
  },
  {
    name: "Creamy Salted Table Butter",
    category: "Dairy",
    price: 56,
    unit: "100g",
    stock: 20,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
    description: "Classic golden salted butter with creamy rich taste and easy spread.",
    isOrganic: false,
    dietaryTags: ["Vegetarian"],
    shelfLife: "6 Months",
    storageAdvice: "Store in refrigerator."
  },
  {
    name: "Farm Fresh White Eggs",
    category: "Dairy",
    price: 80,
    unit: "6 pcs",
    stock: 30,
    threshold: 6,
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80",
    description: "Graded and sanitized protein-rich farm eggs.",
    isOrganic: false,
    dietaryTags: ["Non-Vegetarian"],
    shelfLife: "14 Days",
    storageAdvice: "Store in egg tray inside refrigerator."
  },

  // 4. BAKERY
  {
    name: "100% Whole Wheat Bread",
    category: "Bakery",
    price: 45,
    unit: "400g",
    stock: 12,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    description: "Soft, nutritious whole wheat sandwich loaf with zero maida.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "4 Days",
    storageAdvice: "Store in a cool and dry breadbox."
  },
  {
    name: "Artisanal Chocolate Chip Cookies",
    category: "Bakery",
    price: 120,
    unit: "250g",
    stock: 10,
    threshold: 3,
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=80",
    description: "Freshly baked crunchy butter cookies loaded with dark choco chips.",
    isOrganic: false,
    dietaryTags: ["Vegetarian"],
    shelfLife: "15 Days",
    storageAdvice: "Keep sealed in an airtight container."
  },

  // 5. SNACKS
  {
    name: "Crispy Salted Potato Wafers",
    category: "Snacks",
    price: 30,
    unit: "100g",
    stock: 25,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80",
    description: "Thinly sliced golden potato chips lightly seasoned with rock salt.",
    isOrganic: false,
    dietaryTags: ["Vegan"],
    shelfLife: "3 Months",
    storageAdvice: "Store in a cool dry place away from sunlight."
  },
  {
    name: "Roasted Salted California Almonds",
    category: "Snacks",
    price: 199,
    unit: "200g",
    stock: 15,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1508061252227-0c337e752945?w=500&auto=format&fit=crop&q=80",
    description: "Slow roasted crunchy California almonds seasoned with Himalayan pink salt.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "6 Months",
    storageAdvice: "Airtight storage recommended."
  },

  // 6. ORGANIC ESSENTIALS
  {
    name: "Pure Wild Forest Honey",
    category: "Organic",
    price: 240,
    unit: "500g",
    stock: 8,
    threshold: 4,
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
    description: "100% unfiltered raw forest honey directly sourced from organic apiaries.",
    isOrganic: true,
    dietaryTags: ["Vegetarian"],
    shelfLife: "18 Months",
    storageAdvice: "Keep at room temperature. Do not refrigerate."
  },
  {
    name: "Royal Aged Basmati Rice",
    category: "Organic",
    price: 145,
    unit: "1kg",
    stock: 18,
    threshold: 5,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    description: "Long-grain aromatic aged basmati rice, perfect for biryanis and pulao.",
    isOrganic: true,
    dietaryTags: ["Organic", "Vegan"],
    shelfLife: "24 Months",
    storageAdvice: "Store in a dry pantry."
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("Connecting to MongoDB Atlas Cloud Cluster...");
    await mongoose.connect(mongoUri);
    console.log(" Connected to MongoDB Atlas Cloud!");

    // Clear existing data
    console.log("Clearing old sample records...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // 1. Create Admin
    const admin = await User.create({
      name: "Kamla Admin",
      email: "admin@freshmart.com",
      password: "admin123",
      role: "admin",
      phone: "9876543210"
    });
    console.log(" Admin created in Atlas: admin@freshmart.com / admin123");

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
    console.log(" Sample Customer created in Atlas: customer@freshmart.in / password123");

    // 3. Seed Products
    const createdProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(` Seeded ${createdProducts.length} rich grocery items into MongoDB Atlas.`);

    // 4. Create Initial Order
    await Order.create({
      orderId: "FM-849201",
      userId: customer._id,
      items: [
        {
          productId: createdProducts[0]._id,
          name: createdProducts[0].name,
          price: createdProducts[0].price,
          quantity: 2,
          weight: createdProducts[0].unit,
          imageUrl: createdProducts[0].imageUrl
        },
        {
          productId: createdProducts[4]._id,
          name: createdProducts[4].name,
          price: createdProducts[4].price,
          quantity: 1,
          weight: createdProducts[4].unit,
          imageUrl: createdProducts[4].imageUrl
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
    console.log(" Initial Order seeded.");

    console.log("\n DATABASE SEEDING COMPLETED SUCCESSFULLY!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
