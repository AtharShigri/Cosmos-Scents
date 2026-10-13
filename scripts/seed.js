/**
 * One-time (or re-run-anytime) script to populate the real Cosmos Scents
 * catalog -- 6 products, confirmed live by Jamil on 2026-10-13.
 *
 * Usage:  npm run seed
 *
 * Safe to re-run -- it upserts by slug instead of duplicating rows.
 *
 * STILL PLACEHOLDER, pending Jamil:
 *  - price: every product is set to Rs 7,000 as a placeholder (he confirmed
 *    the real range is Rs 5,000-7,000 but hasn't given per-product prices
 *    yet). Update once those are confirmed.
 *  - category: Essence de Skardu / Essence de Hunza grouping below is the
 *    theme-based guess Jamil confirmed to go with for now (2026-10-13) --
 *    may still get corrected once he checks. Easy to fix: change
 *    `categorySlug` per product.
 *  - description/tagline: written from the product photography and
 *    Jamil's brand blurb, not his own copy. Swap in his real wording
 *    once he sends it, the same as the homepage brand-story section.
 *  - scentNotes: only filled in where the product photos show explicit
 *    ingredient props (e.g. Hunza Elite's spices). Left empty rather
 *    than guessed where there was no visual evidence either way.
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
  {
    name: "Essence de Skardu",
    slug: "essence-de-skardu",
    description: "Inspired by Skardu's orchards and the peaks that surround it.",
  },
  {
    name: "Essence de Hunza",
    slug: "essence-de-hunza",
    description: "Inspired by Hunza's valleys, blossoms, and warmth.",
  },
];

// Jamil confirmed real prices range Rs 5,000-7,000; using the top of that
// range as a flat placeholder until he gives per-product prices.
const PLACEHOLDER_PRICE = 7000;

const products = [
  {
    name: "Apricot",
    slug: "apricot",
    tagline: "Sun-ripened apricot and orchard blossom.",
    description:
      "Named for the apricot orchards that define Gilgit-Baltistan every " +
      "spring -- a bright, fruity scent layered with soft white blossom.",
    categorySlug: "essence-de-skardu",
    scentNotes: ["Apricot", "Orchard blossom"],
    images: ["/products/apricot.jpg"],
    featured: true,
  },
  {
    name: "Chogori",
    slug: "chogori",
    tagline: "Named for K2 -- known locally as Chogori.",
    description:
      "An Extrait de Parfum named after K2, the world's second-highest " +
      "peak and known locally as Chogori -- bold and long-lasting, built " +
      "for those who want a fragrance with real presence.",
    categorySlug: "essence-de-skardu",
    scentNotes: [],
    images: ["/products/chogori.jpg"],
    featured: true,
  },
  {
    name: "Siachen",
    slug: "siachen",
    tagline: "Cool, crisp air from the glacier's edge.",
    description:
      "Named after the Siachen Glacier -- a clean, cold-air scent meant " +
      "to capture the stillness of high altitude.",
    categorySlug: "essence-de-skardu",
    scentNotes: [],
    images: ["/products/siachen.jpg"],
    featured: false,
  },
  {
    name: "Hunza Elite",
    slug: "hunza-elite",
    tagline: "Warm spice against mountain air.",
    description:
      "A warm, spiced fragrance built around cinnamon, star anise, " +
      "cardamom, and pink pepper -- Hunza Valley's warmth set against " +
      "cool mountain air.",
    categorySlug: "essence-de-hunza",
    scentNotes: ["Cinnamon", "Star anise", "Cardamom", "Pink pepper"],
    images: ["/products/hunza-elite.jpg"],
    featured: true,
  },
  {
    name: "Chu Kalimal",
    slug: "chu-kalimal",
    tagline: "Soft orchid, light and romantic.",
    description:
      "A soft, romantic floral built around orchid -- light enough for " +
      "every day, worth noticing without overpowering a room.",
    categorySlug: "essence-de-hunza",
    scentNotes: ["Orchid"],
    images: ["/products/chu-kalimal.jpg"],
    featured: false,
  },
  {
    name: "Siaserofo",
    slug: "siaserofo",
    tagline: "A full wildflower bouquet in one bottle.",
    description:
      "A bright floral bouquet -- rose, ranunculus, and wildflowers " +
      "blended into one warm, feminine scent.",
    categorySlug: "essence-de-hunza",
    scentNotes: ["Rose", "Ranunculus", "Wildflower"],
    images: ["/products/siaserofo.jpg"],
    featured: true,
  },
];

// One-time cleanup: remove the Day 2 dev placeholder catalog (Desert Oud /
// Skardu Rose / Glacier Musk) now that real products exist. Scoped to
// these exact slugs -- not a general "delete anything unlisted" step.
const OLD_PLACEHOLDER_PRODUCT_SLUGS = ["desert-oud", "skardu-rose", "glacier-musk"];
const OLD_PLACEHOLDER_CATEGORY_SLUGS = ["oud", "floral", "musk"];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const { deletedCount: deletedProducts } = await Product.deleteMany({
    slug: { $in: OLD_PLACEHOLDER_PRODUCT_SLUGS },
  });
  const { deletedCount: deletedCategories } = await Category.deleteMany({
    slug: { $in: OLD_PLACEHOLDER_CATEGORY_SLUGS },
  });
  if (deletedProducts || deletedCategories) {
    console.log(
      `Removed ${deletedProducts} old placeholder product(s) and ${deletedCategories} old placeholder categor(y/ies).`
    );
  }

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
      {
        ...p,
        price: PLACEHOLDER_PRICE,
        stock: 20,
        size: "50ml",
        category: categoryIdBySlug[categorySlug],
        active: true,
      },
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
