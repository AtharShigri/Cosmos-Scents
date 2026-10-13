"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/requireAdmin";
import { slugify } from "@/lib/slugify";

export async function createCategory(prevState, formData) {
  await requireAdmin();
  await dbConnect();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name) return { error: "Name is required." };

  try {
    await Category.create({ name, slug: slugify(name), description });
  } catch (err) {
    if (err.code === 11000) {
      return { error: `A collection named "${name}" already exists.` };
    }
    return { error: "Couldn't save the collection. Please try again." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}
