import mongoose from "mongoose";

/**
 * Customer reviews go into a moderation queue, not straight onto the
 * site -- `status` starts at "pending" and only an admin action (see
 * lib/actions/reviews.js) moves it to "approved" (shown on the product
 * page / homepage) or "rejected" (kept for the record, never shown).
 * There's no customer-account system in this project, so reviews are
 * anonymous (just a display name) -- no "verified purchase" check.
 */
const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
