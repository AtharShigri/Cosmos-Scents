"use client";

import { Fragment, useActionState, useRef, useEffect } from "react";
import Button from "@/components/Button";
import { submitReview } from "@/lib/actions/reviews";

// Classic CSS-only star-rating trick: radios 5..1 in DOM order (so a
// later/lower-value radio is a *later* sibling), row-reverse to display
// 1..5 left to right, and Tailwind's peer-checked/peer-hover utilities
// (which compile to a `~` general-sibling selector) light up every star
// at or below whichever one is checked/hovered. No React state needed
// for this at all, which also means formRef.current?.reset() -- the
// same pattern NewCategoryForm.js uses -- is enough to clear it after a
// successful submit.
const STAR_VALUES = [5, 4, 3, 2, 1];

/**
 * Review submission form, shown on a product's page. Always lands in
 * the admin moderation queue as "pending" -- see lib/actions/reviews.js
 * -- so the success state here says "awaiting approval," not "posted."
 */
export default function ReviewForm({ productId, productSlug }) {
  const [state, formAction, pending] = useActionState(submitReview, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 max-w-md">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Your rating</span>
        <div className="flex flex-row-reverse gap-1 text-2xl leading-none w-fit">
          {STAR_VALUES.map((n) => (
            <Fragment key={n}>
              <input
                type="radio"
                name="rating"
                value={n}
                id={`rating-${n}`}
                required
                className="peer hidden"
              />
              <label
                htmlFor={`rating-${n}`}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className="peer peer-checked:text-gold peer-hover:text-gold hover:text-gold text-line cursor-pointer transition-colors"
              >
                &#9733;
              </label>
            </Fragment>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Review</span>
        <textarea
          name="comment"
          required
          rows={3}
          placeholder="What did you think of this scent?"
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink resize-none"
        />
      </label>

      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      {state?.success ? (
        <p className="text-sm text-gold">
          Thanks! Your review has been submitted and will appear once it&apos;s
          approved.
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={pending} className="w-fit">
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
