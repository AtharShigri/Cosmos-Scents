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
      title={active ? "Deactivate from customer storefront" : "Publish to customer storefront"}
      className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors border disabled:opacity-50 ${
        active
          ? "border-line bg-paper text-muted hover:text-ink hover:bg-stone-100"
          : "border-gold/30 bg-gold-soft text-gold hover:bg-gold hover:text-ink"
      }`}
    >
      {pending ? "Updating..." : active ? "Deactivate" : "Activate"}
    </button>
  );
}