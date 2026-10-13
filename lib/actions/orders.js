"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/requireAdmin";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId, status) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  await dbConnect();
  await Order.findByIdAndUpdate(orderId, { status });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
