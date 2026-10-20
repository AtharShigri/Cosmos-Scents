"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { aiSearchProducts } from "@/lib/actions/search";

/**
 * Natural-language search for /products -- "something woody for winter
 * evenings" rather than keyword matching (see lib/actions/search.js for
 * how that's grounded against the real catalog). On a successful match,
 * navigates to /products?search=...&matched=... so the ranked result is
 * a shareable URL and Gemini isn't re-called on every re-render/back
 * button (see app/products/page.js).
 */
export default function AISearchBar({ defaultQuery = "" }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(aiSearchProducts, null);

  useEffect(() => {
    if (!state?.success) return;
    const params = new URLSearchParams();
    params.set("search", state.query);
    if (state.slugs.length > 0) params.set("matched", state.slugs.join(","));
    router.push(`/products?${params.toString()}`);
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="query"
          defaultValue={defaultQuery}
          placeholder='Describe what you want -- e.g. "something woody for winter evenings"'
          className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
        <Button type="submit" variant="secondary" disabled={pending} className="shrink-0">
          {pending ? "Searching..." : "Search"}
        </Button>
      </div>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
