import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; // registers the "Category" model for populate()

// Plain serializable objects only -- Server Components can't pass
// Mongoose documents (or their ObjectIds) straight to Client Components.
function toPlainProduct(doc) {
  const obj = doc.toObject({ flattenObjectIds: true });
  return {
    ...obj,
    _id: String(obj._id),
    category: obj.category
      ? { ...obj.category, _id: String(obj.category._id) }
      : null,
    createdAt: obj.createdAt?.toISOString(),
    updatedAt: obj.updatedAt?.toISOString(),
  };
}

export async function getFeaturedProducts() {
  await dbConnect();
  const docs = await Product.find({ active: true, featured: true })
    .sort({ createdAt: -1 })
    .populate("category")
    .limit(6);
  return docs.map(toPlainProduct);
}

// Keys match the <select> in components/SortSelect.js / app/products/page.js.
const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating_desc: { ratingAvg: -1, ratingCount: -1 },
};

// `categorySlug` is optional -- omit it (or pass "all") to get everything.
// `sort` is optional -- one of the keys in SORTS above, defaults to newest.
export async function getAllProducts(categorySlug, sort) {
  await dbConnect();
  const filter = { active: true };

  if (categorySlug && categorySlug !== "all") {
    const category = await Category.findOne({ slug: categorySlug });
    // An unknown slug should show "no products", not "all products".
    filter.category = category ? category._id : null;
  }

  const docs = await Product.find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .populate("category");
  return docs.map(toPlainProduct);
}

// Fetches active products by slug, preserving the given order -- used by
// /products when showing AI search results (lib/actions/search.js hands
// back a ranked slug list, and this keeps that ranking rather than
// falling back to whatever order MongoDB returns documents in).
export async function getProductsBySlugs(slugs) {
  if (!slugs?.length) return [];
  await dbConnect();
  const docs = await Product.find({ slug: { $in: slugs }, active: true }).populate("category");
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean).map(toPlainProduct);
}

export async function getProductBySlug(slug) {
  await dbConnect();
  const doc = await Product.findOne({ slug, active: true }).populate("category");
  return doc ? toPlainProduct(doc) : null;
}

// Admin-only: includes inactive products, no filtering.
export async function getAllProductsAdmin() {
  await dbConnect();
  const docs = await Product.find().sort({ createdAt: -1 }).populate("category");
  return docs.map(toPlainProduct);
}

// Admin-only: fetch by id (not slug) for the edit form, inactive included.
export async function getProductByIdAdmin(id) {
  await dbConnect();
  const doc = await Product.findById(id).populate("category");
  return doc ? toPlainProduct(doc) : null;
}

function toPlainCategory(doc) {
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    active: doc.active,
  };
}

// Public: only collections that are currently visible (category tabs,
// homepage "Shop by collection", the chatbot's grounding context).
export async function getCategories() {
  await dbConnect();
  const docs = await Category.find({ active: true }).sort({ name: 1 });
  return docs.map(toPlainCategory);
}

// Admin-only: every collection, including hidden ones -- so a hidden
// collection stays visible/manageable in the admin UI and a product
// that's still assigned to one doesn't lose its dropdown option.
export async function getCategoriesAdmin() {
  await dbConnect();
  const docs = await Category.find().sort({ name: 1 });
  return docs.map(toPlainCategory);
}
