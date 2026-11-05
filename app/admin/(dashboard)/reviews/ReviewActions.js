"use client";

import { useTransition } from "react";
import { setReviewStatus } from "@/lib/actions/reviews";

export default function ReviewActions({ reviewId, status, productSlug }) {
  const [pending, startTransition] = useTransition();

  function set(next) {
    startTransition(() => setReviewStatus(reviewId, next, productSlug));
  }

  return (
    <div className="inline-flex items-center gap-2">
      {status !== "approved" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("approved")}
          className="px-3 py-1 rounded bg-ink text-paper hover:bg-ink/85 text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
        >
          {pending ? "..." : "Approve & Publish"}
        </button>
      ) : null}

      {status !== "rejected" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("rejected")}
          className="px-3 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium cursor-pointer disabled:opacity-50 transition-colors"
        >
          {pending ? "..." : "Reject"}
        </button>
      ) : null}

      {status !== "pending" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("pending")}
          className="px-3 py-1 rounded border border-line bg-paper hover:bg-paper-raised text-xs font-medium text-muted hover:text-ink cursor-pointer disabled:opacity-50 transition-colors"
        >
          {pending ? "..." : "Hold for Review"}
        </button>
      ) : null}
    </div>
  );
}