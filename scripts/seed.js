/**
 * One-time (or re-run-anytime) script to populate placeholder catalog data,
 * so the storefront has real products to render before Jamil sends the
 * actual lineup, prices, and photos.
 *
 * Usage:  npm run seed
 *
 * Safe to re-run -- it upserts by slug instead of duplicating rows.
 */

import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Make sure .env.local exists and has it filled in."
  );
  process.exit(1);
}

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    tagline: String,
    price: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    scentNotes: [String],
    size: String,
    stock: Number,
    images: [String],
    featured: Boolean,
    active: Boolean,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const categories = [
  { name: "Oud", slug: "oud", description: "Rich, resinous, and long-lasting." },
  { name: "Floral", slug: "floral", description: "Light, romantic, everyday wear." },
  { name: "Musk", slug: "musk", description: "Warm and skin-close." },
];

// Placeholder lineup -- matches the names already used on /style-guide.
// Swap for Jamil's real products, prices, and photos whenever he sends them.
const products = [
  {
    name: "Desert Oud",
    slug: "desert-oud",
    tagline: "Deep oud warmed by amber and a trace of smoke.",
    description:
      "Our signature oud, built around genuine agarwood and warmed with amber " +
      "and a whisper of smoke. Long-lasting and bold -- made for evenings.",
    price: 2400,
    categorySlug: "oud",
    scentNotes: ["Oud", "Amber", "Smoke"],
    stock: 25,
    featured: true,
  },
  {
    name: "Skardu Rose",
    slug: "skardu-rose",
    tagline: "Fresh rose with a clean, green edge.",
    description:
      "Named for the valleys it's inspired by -- a bright, true rose softened " +
      "with light green notes. Wearable day or night.",
    price: 2400,
    categorySlug: "floral",
    scentNotes: ["Rose", "Green notes", "White musk"],
    stock: 30,
    featured: true,
  },
  {
    name: "Glacier Musk",
    slug: "glacier-musk",
    tagline: "Clean, cool musk that sits close to the skin.",
    description:
      "A quiet, skin-close musk with a cool, mineral freshness -- inspired by " +
      "Gilgit-Baltistan's glacial air. Subtle enough for daily wear.",
    price: 2200,
    categorySlug: "musk",
    scentNotes: ["Musk", "Mineral accord", "Light citrus"],
    stock: 40,
    featured: true,
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const categoryIdBySlug = {};
  for (const cat of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryIdBySlug[cat.slug] = doc._id;
    console.log(`Category ready: ${doc.name}`);
  }

  for (const { categorySlug, ...p } of products) {
    const doc = await Product.findOneAndUpdate(
      { slug: p.slug },
      { ...p, category: categoryIdBySlug[categorySlug], active: true, images: [] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Product ready: ${doc.name} (Rs ${doc.price})`);
  }

  console.log("\nSeed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
