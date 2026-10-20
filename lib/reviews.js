import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product"; // registers "Product" for populate()

function toPlainReview(doc) {
  const obj = doc.toObject({ flattenObjectIds: true });
  return {
    ...obj,
    _id: String(obj._id),
    product:
      obj.product && typeof obj.product === "object"
        ? { ...obj.product, _id: String(obj.product._id) }
        : String(obj.product),
    createdAt: obj.createdAt?.toISOString(),
    updatedAt: obj.updatedAt?.toISOString(),
  };
}

// Public: approved reviews for one product's page, newest first.
export async function getApprovedReviewsForProduct(productId) {
  await dbConnect();
  const docs = await Review.find({ product: productId, status: "approved" }).sort({
    createdAt: -1,
  });
  return docs.map(toPlainReview);
}

// Public: a handful of approved reviews for the homepage, across every
// product, newest first -- `product` is populated just enough to link
// back to it (name + slug).
export async function getApprovedReviewsForHomepage(limit = 6) {
  await dbConnect();
  const docs = await Review.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("product", "name slug");
  return docs.map(toPlainReview).filter((r) => r.product); // drop orphans if a product was ever hard-deleted
}

// Admin: the moderation queue. `status` filters the tab being viewed
// ("pending" is the default landing tab); pending reviews sort oldest
// first so the queue gets worked through in order, the other tabs sort
// newest first.
export async function getReviewsAdmin(status = "pending") {
  await dbConnect();
  const docs = await Review.find({ status })
    .sort({ createdAt: status === "pending" ? 1 : -1 })
    .populate("product", "name slug");
  return docs.map(toPlainReview);
}

export async function getPendingReviewCount() {
  await dbConnect();
  return Review.countDocuments({ status: "pending" });
}

// Recomputes a product's cached ratingAvg/ratingCount from its approved
// reviews. Call this after any review's status changes (see
// lib/actions/reviews.js) -- it's cheap (one aggregation on an indexed
// field) and keeps /products' "highest rated" sort correct without
// touching every page load.
export async function recalcProductRating(productId) {
  await dbConnect();
  const objectId = new mongoose.Types.ObjectId(String(productId));
  const [agg] = await Review.aggregate([
    { $match: { product: objectId, status: "approved" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0,
    ratingCount: agg ? agg.count : 0,
  });
}
