"use client";

import { useTransition } from "react";
import { setReviewStatus } from "@/lib/actions/reviews";

/**
 * Approve/reject (or revert) buttons for one review row in the admin
 * moderation queue -- same pattern as ToggleActiveButton.js in
 * app/admin/(dashboard)/products/.
 */
export default function ReviewActions({ reviewId, status, productSlug }) {
  const [pending, startTransition] = useTransition();

  function set(next) {
    startTransition(() => setReviewStatus(reviewId, next, productSlug));
  }

  return (
    <div className="flex gap-3 text-sm">
      {status !== "approved" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("approved")}
          className="text-gold hover:underline cursor-pointer disabled:opacity-50"
        >
          Approve
        </button>
      ) : null}
      {status !== "rejected" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("rejected")}
          className="text-muted hover:text-ink cursor-pointer disabled:opacity-50"
        >
          Reject
        </button>
      ) : null}
      {status !== "pending" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => set("pending")}
          className="text-muted hover:text-ink cursor-pointer disabled:opacity-50"
        >
          Move to pending
        </button>
      ) : null}
    </div>
  );
}
