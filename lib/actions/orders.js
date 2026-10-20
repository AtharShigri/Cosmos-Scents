"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendOrderStatusEmail } from "@/lib/email";

// Keep in sync with models/Order.js's enum and components/StatusSelect.js.
const VALID_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export async function updateOrderStatus(orderId, status) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  await dbConnect();
  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).lean();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  // Best-effort notification -- see lib/email.js. Never let a failed (or
  // skipped, e.g. no email on the order) send undo the status change
  // above, which has already happened and already revalidated.
  if (order) {
    await sendOrderStatusEmail(order, status).catch((err) =>
      console.error("Order status email failed:", err)
    );
  }
}
