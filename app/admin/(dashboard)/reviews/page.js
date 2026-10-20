import Link from "next/link";
import { getReviewsAdmin } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminReviewsPage({ searchParams }) {
  const { status: activeStatus = "pending" } = await searchParams;
  const status = TABS.some((t) => t.value === activeStatus) ? activeStatus : "pending";
  const reviews = await getReviewsAdmin(status);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl">Reviews</h1>
        <p className="text-sm text-muted mt-1">
          Customer reviews land here first -- nothing shows on the site until
          you approve it.
        </p>
      </div>

      <nav className="flex gap-2 text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/reviews?status=${tab.value}`}
            className={`px-3 py-1.5 rounded-sm border transition-colors ${
              status === tab.value
                ? "border-ink bg-ink text-paper"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted border border-line rounded-md p-4 max-w-xl">
          {status === "pending"
            ? "No reviews waiting for approval."
            : `No ${status} reviews.`}
        </p>
      ) : (
        <div className="border border-line rounded-md divide-y divide-line max-w-2xl">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{review.name}</p>
                  <StarRating value={review.rating} size="text-xs" />
                </div>
                {review.product ? (
                  <Link
                    href={`/products/${review.product.slug}`}
                    className="text-sm text-muted hover:text-gold"
                  >
                    {review.product.name}
                  </Link>
                ) : (
                  <span className="text-sm text-muted">(product removed)</span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{review.comment}</p>
              <div className="flex items-center justify-between gap-4 mt-1">
                <p className="text-xs text-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <ReviewActions
                  reviewId={review._id}
                  status={review.status}
                  productSlug={review.product?.slug}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
