"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Generic "update one query param via a <select>" control -- used for
 * both the shop's price/rating sort (app/products/page.js) and a
 * product's review sort (app/products/[slug]/page.js). Updates the URL
 * client-side (no full navigation) and preserves every other query
 * param already on the page (category, search, etc).
 */
export default function SortSelect({ param, value, defaultValue, options }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e) {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === defaultValue) {
      params.delete(param);
    } else {
      params.set(param, e.target.value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        onChange={handleChange}
        className="border border-line rounded-sm px-2 py-1.5 text-sm bg-paper focus:outline-none focus:border-ink cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
