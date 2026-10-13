"use client";

import { useActionState } from "react";
import Button from "@/components/Button";

export default function ProductForm({ action, categories, product }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
        <Field label="Slug (optional -- auto-generated from name)">
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="e.g. apricot"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
      </div>

      <Field label="Tagline">
        <input
          name="tagline"
          defaultValue={product?.tagline}
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={product?.description}
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
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
            defaultValue={product?.price}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
        <Field label="Stock">
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
        <Field label="Size">
          <input
            name="size"
            defaultValue={product?.size || "50ml"}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
      </div>

      <Field label="Collection">
        <select
          name="category"
          defaultValue={product?.category?._id || ""}
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
          defaultValue={product?.scentNotes?.join(", ")}
          placeholder="e.g. Rose, Musk, Amber"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
      </Field>

      <Field label="Image URLs (comma-separated)">
        <input
          name="images"
          defaultValue={product?.images?.join(", ")}
          placeholder="/products/example.jpg or a full https:// URL"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
        <span className="text-xs text-muted">
          No image uploader yet -- paste a path under /products/ (if you&apos;ve
          added the file there) or a hosted image URL. Leave blank to use
          the placeholder bottle illustration.
        </span>
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? true} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Visible on the site
        </label>
      </div>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}

      <Button type="submit" variant="primary" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
