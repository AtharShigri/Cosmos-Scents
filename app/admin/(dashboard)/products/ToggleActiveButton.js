"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/lib/actions/products";

export default function ToggleActiveButton({ productId, active }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => toggleProductActive(productId, !active))}
      className="text-sm text-muted hover:text-ink cursor-pointer disabled:opacity-50"
    >
      {active ? "Hide" : "Unhide"}
    </button>
  );
}
