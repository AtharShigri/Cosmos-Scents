import { put } from "@vercel/blob";

// Generous for a product photo, but keeps a mistaken multi-hundred-MB
// upload from eating into Vercel Blob's storage quota.
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

function getToken() {
  const token =
    process.env.COSMOS_BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "COSMOS_BLOB_READ_WRITE_TOKEN is not set. Pull your Vercel environment variables " +
        "or set COSMOS_BLOB_READ_WRITE_TOKEN in .env.local, and restart the dev server."
    );
  }
  return token;
}

/**
 * Uploads a single product photo to Vercel Blob storage and returns its
 * public URL. Used by the admin product form's "Upload photos" field
 * (lib/actions/products.js).
 */
export async function uploadProductImage(file, slug) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is larger than 8MB -- please use a smaller image.`);
  }

  const token = getToken();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const pathname = `products/${slug || "untitled"}-${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.COSMOS_BLOB_READ_WRITE_TOKEN || token,
    addRandomSuffix: true,
  });

  return blob.url;
}
