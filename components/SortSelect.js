"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Highest rated" },
];

/**
 * Updates the `sort` query param on /products without a page-reload-style
 * navigation (Next's router keeps it client-side), preserving whatever
 * `category` is already set so sort + collection filtering compose.
 */
export default function SortSelect({ value }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e) {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    router.push(`/products?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        onChange={handleChange}
        className="border border-line rounded-sm px-2 py-1.5 text-sm bg-paper focus:outline-none focus:border-ink cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
