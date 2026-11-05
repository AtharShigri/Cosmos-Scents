"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Collection Title <span className="text-rose-600">*</span>
        </label>
        <input
          name="name"
          required
          placeholder="e.g. Karakoram Woods, Celestial Oud"
          className="w-full border border-line bg-paper-raised rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-ink font-medium"
        />
        <span className="text-[11px] text-muted">
          Artisanal tier or olfactive family name for fragrance grouping.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          Editorial Description
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Notes on alpine botanical terroir, cold-distilled conifers, or amber accords..."
          className="w-full border border-line bg-paper-raised rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-ink leading-relaxed"
        />
      </div>

      {state?.error ? (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {state.error}
        </div>
      ) : null}

      {state?.success ? (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <span>✓</span> Collection created successfully and available in formulation catalog.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-fit px-5 py-2.5 rounded-md bg-ink text-paper hover:bg-ink/85 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs transition-colors disabled:opacity-50"
      >
        {pending ? "Creating Collection..." : "Create Collection"}
      </button>
    </form>
  );
}