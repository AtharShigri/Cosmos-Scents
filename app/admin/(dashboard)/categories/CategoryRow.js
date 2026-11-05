"use client";

import { useState, useTransition } from "react";
import { updateCategory, toggleCategoryActive } from "@/lib/actions/categories";

export default function CategoryRow({ category }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [savePending, startSave] = useTransition();
  const [togglePending, startToggle] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError("");
    startSave(async () => {
      const result = await updateCategory(category._id, null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="p-4 bg-paper/40 flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
              Collection Name
            </label>
            <input
              name="name"
              required
              defaultValue={category.name}
              className="w-full border border-line bg-paper-raised rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1">
              Description
            </label>
            <input
              name="description"
              defaultValue={category.description}
              placeholder="Olfactive notes / family description"
              className="w-full border border-line bg-paper-raised rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        {error ? <p className="text-xs text-rose-700">{error}</p> : null}

        <div className="flex items-center gap-2 mt-1">
          <button
            type="submit"
            disabled={savePending}
            className="px-3 py-1.5 rounded bg-ink text-paper hover:bg-ink/85 text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            {savePending ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            className="px-3 py-1.5 rounded border border-line bg-paper hover:bg-stone-100 text-xs font-medium text-muted hover:text-ink cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/50 transition-colors">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span className="font-heading font-semibold text-sm text-ink">{category.name}</span>
          <span
            className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium border ${
              category.active
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-stone-100 text-stone-600 border-stone-200"
            }`}
          >
            {category.active ? "Active Collection" : "Hidden"}
          </span>
        </div>
        {category.description ? (
          <p className="text-xs text-muted leading-relaxed max-w-lg">{category.description}</p>
        ) : (
          <p className="text-xs text-muted/60 italic">No description provided</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="px-3 py-1 rounded border border-line bg-paper hover:bg-paper-raised text-xs font-medium text-ink transition-colors shadow-2xs cursor-pointer"
        >
          Edit
        </button>

        <button
          type="button"
          disabled={togglePending}
          onClick={() => startToggle(() => toggleCategoryActive(category._id, !category.active))}
          className={`px-3 py-1 rounded border text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
            category.active
              ? "border-line bg-paper text-muted hover:text-ink hover:bg-stone-100"
              : "border-gold/30 bg-gold-soft text-gold hover:bg-gold hover:text-ink font-semibold"
          }`}
        >
          {togglePending ? "..." : category.active ? "Hide" : "Activate"}
        </button>
      </div>
    </div>
  );
}