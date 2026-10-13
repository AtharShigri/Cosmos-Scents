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

// `categorySlug` is optional -- omit it (or pass "all") to get everything.
export async function getAllProducts(categorySlug) {
  await dbConnect();
  const filter = { active: true };

  if (categorySlug && categorySlug !== "all") {
    const category = await Category.findOne({ slug: categorySlug });
    // An unknown slug should show "no products", not "all products".
    filter.category = category ? category._id : null;
  }

  const docs = await Product.find(filter).sort({ createdAt: -1 }).populate("category");
  return docs.map(toPlainProduct);
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

export async function getCategories() {
  await dbConnect();
  const docs = await Category.find().sort({ name: 1 });
  return docs.map((doc) => ({
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
  }));
}
