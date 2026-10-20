import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot, in case product changes later
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      email: { type: String, default: "" },
    },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    // Stripe doesn't support Pakistan-based merchants -- cash-on-delivery
    // and direct bank transfer are the realistic options for launch.
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer"],
      default: "cod",
    },
    // Expanded from the original 5 statuses per Jamil's request for more
    // granularity -- "processing" (being prepared/packed, between an
    // admin confirming it and it actually shipping) and "returned"
    // (a COD/bank-transfer order that came back after delivery). This is
    // a reasonable default fulfillment lifecycle for a small COD-based
    // local brand; easy to trim or extend further in lib/actions/orders.js
    // and components/StatusSelect.js if Jamil's real process differs.
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
