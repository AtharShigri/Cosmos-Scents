import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    // Short line used on cards / the chatbot's quick answers.
    tagline: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // PKR, whole rupees
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    scentNotes: { type: [String], default: [] }, // e.g. ["Oud", "Amber", "Musk"]
    size: { type: String, default: "50ml" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    // Real photos land here later -- an empty array means the UI falls
    // back to the placeholder bottle illustration.
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true }, // soft hide instead of deleting
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
