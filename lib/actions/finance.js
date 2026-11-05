"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Reconciles bank transfer payments or confirms COD payouts.
 */
export async function reconcileTransaction(orderId, targetStatus) {
  await requireAdmin();
  await dbConnect();

  const validStatuses = ["confirmed", "delivered", "processing", "cancelled"];
  if (!validStatuses.includes(targetStatus)) {
    throw new Error("Invalid reconciliation status");
  }

  await Order.findByIdAndUpdate(orderId, { status: targetStatus });

  revalidatePath("/admin/finance");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  return { success: true };
}

