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

// Name/description only -- the slug stays fixed once created (changing
// it would break any existing /products?category=<slug> links people
// may have shared or bookmarked).
export async function updateCategory(id, prevState, formData) {
  await requireAdmin();
  await dbConnect();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name) return { error: "Name is required." };

  try {
    const updated = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!updated) return { error: "Collection not found." };
  } catch {
    return { error: "Couldn't save the collection. Please try again." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

// Soft hide only, same reasoning as Product's toggleActive -- existing
// products keep their reference and keep working, this just drops the
// collection from the public tabs/homepage grid.
export async function toggleCategoryActive(id, nextActive) {
  await requireAdmin();
  await dbConnect();
  await Category.findByIdAndUpdate(id, { active: nextActive });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}
