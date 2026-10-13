"use client";

import { useActionState, useRef, useEffect } from "react";
import Button from "@/components/Button";
import { createCategory } from "@/lib/actions/categories";

export default function NewCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          placeholder="e.g. Essence de Nagar"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Description (optional)</span>
        <input
          name="description"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-gold">Added.</p> : null}

      <Button type="submit" variant="secondary" disabled={pending} className="w-fit">
        {pending ? "Adding..." : "Add collection"}
      </Button>
    </form>
  );
}
