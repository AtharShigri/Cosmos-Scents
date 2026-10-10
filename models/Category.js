import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

// Reuse the compiled model across hot reloads instead of recompiling it,
// which Mongoose throws an error on.
export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
