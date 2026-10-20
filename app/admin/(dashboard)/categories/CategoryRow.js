"use client";

import { useState, useTransition } from "react";
import { updateCategory, toggleCategoryActive } from "@/lib/actions/categories";

/**
 * One collection row in the admin list -- inline edit (name/description)
 * plus a hide/unhide toggle, same soft-delete convention as
 * ToggleActiveButton.js in app/admin/(dashboard)/products/.
 *
 * Calls the server action directly inside startTransition (like
 * ToggleActiveButton) rather than via useActionState, so the result can
 * be handled right where the submit happens -- closing the edit form on
 * success -- without reacting to it from a useEffect.
 */
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
      <form onSubmit={handleSubmit} className="px-4 py-3 flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="name"
            required
            defaultValue={category.name}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
          <input
            name="description"
            defaultValue={category.description}
            placeholder="Description (optional)"
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex gap-4 text-sm">
          <button
            type="submit"
            disabled={savePending}
            className="text-gold hover:underline cursor-pointer disabled:opacity-50"
          >
            {savePending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            className="text-muted hover:text-ink cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <p className={`font-medium ${category.active ? "" : "text-muted"}`}>
          {category.name}
          {!category.active ? <span className="text-xs text-muted ml-2">(hidden)</span> : null}
        </p>
        {category.description ? (
          <p className="text-sm text-muted">{category.description}</p>
        ) : null}
      </div>
      <div className="flex gap-4 text-sm shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-muted hover:text-ink cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={togglePending}
          onClick={() => startToggle(() => toggleCategoryActive(category._id, !category.active))}
          className="text-muted hover:text-ink cursor-pointer disabled:opacity-50"
        >
          {category.active ? "Hide" : "Unhide"}
        </button>
      </div>
    </div>
  );
}
