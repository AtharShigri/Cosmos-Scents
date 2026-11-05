"use client";

import { useActionState, useState, useEffect } from "react";
import Button from "@/components/Button";

export default function ProductForm({ action, categories = [], product }) {
  const [state, formAction, pending] = useActionState(action, null);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    tagline: product?.tagline || "",
    description: product?.description || "",
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    size: product?.size || "50ml",
    category: product?.category?._id || "",
    scentNotes: product?.scentNotes?.join(", ") || "",
    images: product?.images?.join(", ") || "",
    featured: product?.featured ?? true,
    active: product?.active ?? true,
  });

  // Whenever the server action returns an error with preserved fields,
  // sync them into state so the user's edits are 100% preserved.
  useEffect(() => {
    if (state?.fields) {
      setForm((prev) => ({
        ...prev,
        ...state.fields,
      }));
    }
  }, [state]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Siaserofo"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
          />
        </Field>
        <Field label="Slug (optional -- auto-generated from name)">
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="e.g. apricot"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
          />
        </Field>
      </div>

      <Field label="Tagline">
        <input
          name="tagline"
          value={form.tagline}
          onChange={handleChange}
          placeholder="Short highlight for cards / chatbot"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          required
          rows={4}
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed fragrance notes, inspiration, and characteristics..."
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Price (Rs)">
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            required
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 4500"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
          />
        </Field>
        <Field label="Stock">
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
          />
        </Field>
        <Field label="Size">
          <input
            name="size"
            value={form.size}
            onChange={handleChange}
            placeholder="e.g. 50ml"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
          />
        </Field>
      </div>

      <Field label="Collection">
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper"
        >
          <option value="">-- None --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Scent notes (comma-separated)">
        <input
          name="scentNotes"
          value={form.scentNotes}
          onChange={handleChange}
          placeholder="e.g. Rose, Musk, Amber"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
        />
      </Field>

      <Field label="Upload photos">
        <input
          type="file"
          name="imageFiles"
          accept="image/*"
          multiple
          className="w-full text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-sm file:cursor-pointer cursor-pointer"
        />
        <span className="text-xs text-muted">
          Uploads straight to cloud storage (Vercel Blob) when you save --
          no need to add the file to the project yourself. Up to 8MB each.
        </span>
      </Field>

      <Field label="Existing / extra image URLs (comma-separated, optional)">
        <input
          name="images"
          value={form.images}
          onChange={handleChange}
          placeholder="/products/example.jpg or a full https:// URL"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink bg-paper-raised"
        />
        <span className="text-xs text-muted">
          Already-uploaded photos show up here after saving -- remove one by
          deleting it from this list. You can also paste a hosted image URL
          directly. Uploads above get added to whatever&apos;s here. Leave
          both blank to use the placeholder bottle illustration.
        </span>
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            name="featured"
            checked={Boolean(form.featured)}
            onChange={handleChange}
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            name="active"
            checked={Boolean(form.active)}
            onChange={handleChange}
          />
          Visible on the site
        </label>
      </div>

      {state?.error ? (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md flex items-center gap-2">
          <span className="text-red-600 font-bold">✕</span>
          <span>{state.error}</span>
        </div>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
