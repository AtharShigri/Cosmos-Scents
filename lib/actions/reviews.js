"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/requireAdmin";
import { recalcProductRating } from "@/lib/reviews";

// Public: anyone can submit a review for an active product -- it always
// lands as "pending" and never shows up anywhere until an admin approves
// it (see setReviewStatus below). No account system here, so this is
// intentionally anonymous (just a display name); no rate-limiting or
// spam protection yet, which is fine at this traffic level but worth
// revisiting if the site grows.
export async function submitReview(prevState, formData) {
  await dbConnect();

  const productId = String(formData.get("productId") || "");
  const productSlug = String(formData.get("productSlug") || "");
  const name = String(formData.get("name") || "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim();

  if (!name) return { error: "Please enter your name." };
  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please choose a star rating." };
  }
  if (!comment) return { error: "Please write a short review." };

  const product = await Product.findOne({ _id: productId, active: true }).select("_id");
  if (!product) return { error: "Couldn't find that product." };

  await Review.create({ product: product._id, name, rating, comment, status: "pending" });

  // Nothing public changes yet (it's pending), but the admin queue does.
  revalidatePath("/admin/reviews");
  if (productSlug) revalidatePath(`/products/${productSlug}`);

  return { success: true };
}

// Admin: move a review between pending/approved/rejected. Always
// recalculates the product's cached rating afterwards, since this can
// both add and remove a review from the "approved" set (e.g. reverting
// an approved review back to rejected).
export async function setReviewStatus(reviewId, status, productSlug) {
  await requireAdmin();
  await dbConnect();

  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid review status.");
  }

  const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
  if (!review) throw new Error("Review not found.");

  await recalcProductRating(review.product);

  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  revalidatePath("/");
  if (productSlug) revalidatePath(`/products/${productSlug}`);
}
