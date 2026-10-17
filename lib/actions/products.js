"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/requireAdmin";
import { slugify } from "@/lib/slugify";
import { uploadProductImage } from "@/lib/blob";

// Async because it may upload files to Blob storage -- callers must await it
// and should expect it to throw (a bad/missing BLOB_READ_WRITE_TOKEN, an
// oversized file, or a network error uploading).
async function readProductForm(formData) {
  const name = String(formData.get("name") || "").trim();
  const explicitSlug = String(formData.get("slug") || "").trim();
  const imagesRaw = String(formData.get("images") || "").trim();
  const notesRaw = String(formData.get("scentNotes") || "").trim();
  const slug = slugify(explicitSlug || name);

  const pastedImages = imagesRaw
    ? imagesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Real uploads from the "Upload photos" file field. Browsers submit an
  // empty File entry when the field is left untouched -- filter those out.
  const files = formData
    .getAll("imageFiles")
    .filter((f) => f instanceof File && f.size > 0);
  const uploadedUrls = [];
  for (const file of files) {
    uploadedUrls.push(await uploadProductImage(file, slug));
  }

  return {
    name,
    slug,
    description: String(formData.get("description") || "").trim(),
    tagline: String(formData.get("tagline") || "").trim(),
    price: Number(formData.get("price")) || 0,
    category: String(formData.get("category") || "") || null,
    size: String(formData.get("size") || "50ml").trim(),
    stock: Number(formData.get("stock")) || 0,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    // Pasted URLs first, then freshly-uploaded ones -- matches the order
    // the fields appear in on the form.
    images: [...pastedImages, ...uploadedUrls],
    scentNotes: notesRaw
      ? notesRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

export async function createProduct(prevState, formData) {
  await requireAdmin();
  await dbConnect();

  let data;
  try {
    data = await readProductForm(formData);
  } catch (err) {
    console.error("Image upload error:", err);
    return { error: err.message || "Couldn't upload one of the images. Please try again." };
  }

  if (!data.name || !data.description || data.price <= 0) {
    return { error: "Name, description, and a price above 0 are required." };
  }

  try {
    await Product.create(data);
  } catch (err) {
    if (err.code === 11000) {
      return { error: `A product with the slug "${data.slug}" already exists.` };
    }
    return { error: "Couldn't save the product. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id, prevState, formData) {
  await requireAdmin();
  await dbConnect();

  let data;
  try {
    data = await readProductForm(formData);
  } catch (err) {
    console.error("Image upload error:", err);
    return { error: err.message || "Couldn't upload one of the images. Please try again." };
  }

  if (!data.name || !data.description || data.price <= 0) {
    return { error: "Name, description, and a price above 0 are required." };
  }

  try {
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return { error: "Product not found." };
  } catch (err) {
    if (err.code === 11000) {
      return { error: `A product with the slug "${data.slug}" already exists.` };
    }
    return { error: "Couldn't save the product. Please try again." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/");
  redirect("/admin/products");
}

// Soft delete only -- keeps order history (which snapshots name/price,
// but still references the product id) intact, and is reversible.
export async function toggleProductActive(id, nextActive) {
  await requireAdmin();
  await dbConnect();
  await Product.findByIdAndUpdate(id, { active: nextActive });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}
