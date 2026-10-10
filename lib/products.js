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

export async function getAllProducts() {
  await dbConnect();
  const docs = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .populate("category");
  return docs.map(toPlainProduct);
}

export async function getProductBySlug(slug) {
  await dbConnect();
  const doc = await Product.findOne({ slug, active: true }).populate("category");
  return doc ? toPlainProduct(doc) : null;
}
