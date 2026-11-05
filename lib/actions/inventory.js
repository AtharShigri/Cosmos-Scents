"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/requireAdmin";

/**
 * Real-time quick stock adjustment for inventory automation.
 * Supports increments/decrements (+5, +10, -1, etc.) or absolute set.
 */
export async function quickAdjustStock(productId, delta) {
  await requireAdmin();
  await dbConnect();

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const nextStock = Math.max(0, (product.stock || 0) + Number(delta));
  await Product.findByIdAndUpdate(productId, { stock: nextStock });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, stock: nextStock };
}

/**
 * Automated batch replenishment: sets all low-stock items (< 10 units)
 * back up to the optimal par level (25 units).
 */
export async function autoReplenishAllLowStock(targetStock = 25) {
  await requireAdmin();
  await dbConnect();

  const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
  let updatedCount = 0;

  for (const product of lowStockProducts) {
    await Product.findByIdAndUpdate(product._id, { stock: targetStock });
    updatedCount++;
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");

  return { success: true, updatedCount };
}

