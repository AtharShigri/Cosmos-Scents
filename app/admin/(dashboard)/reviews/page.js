import Link from "next/link";
import { getReviewsAdmin, getReviewCountsAdmin } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "pending", label: "Awaiting Moderation" },
  { value: "approved", label: "Approved & Live" },
  { value: "rejected", label: "Rejected / Spam" },
];

export default async function AdminReviewsPage({ searchParams }) {
  const { status: activeStatus = "pending" } = await searchParams;
  const status = TABS.some((t) => t.value === activeStatus) ? activeStatus : "pending";

  const [reviews, counts] = await Promise.all([
    getReviewsAdmin(status),
    getReviewCountsAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h2 className="font-heading text-lg font-semibold text-ink">
          Authenticity & Review Moderation
        </h2>
        <p className="text-xs text-muted mt-0.5">
          Verify genuine client testimonials from Gilgit-Baltistan and nationwide before publishing to public formulation pages.
        </p>
      </div>

      {/* Tabs with Live Badges */}
      <nav className="flex flex-wrap gap-2 text-xs font-medium">
        {TABS.map((tab) => {
          const isActive = status === tab.value;
          const count = counts[tab.value] || 0;

          return (
            <Link
              key={tab.value}
              href={`/admin/reviews?status=${tab.value}`}
              className={`px-3.5 py-1.5 rounded-md border transition-all flex items-center gap-2 ${
                isActive
                  ? "border-ink bg-ink text-paper shadow-xs"
                  : "border-line bg-paper text-muted hover:border-ink hover:text-ink hover:bg-paper-raised"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? "bg-paper/20 text-paper font-semibold"
                    : tab.value === "pending" && count > 0
                    ? "bg-gold text-ink font-bold"
                    : "bg-line text-muted"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Reviews Stream */}
      {reviews.length === 0 ? (
        <div className="p-12 rounded-md border border-dashed border-line bg-paper-raised text-center flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-ink">
            {status === "pending"
              ? "All caught up! No reviews waiting for approval."
              : `No ${status} reviews in the archive.`}
          </p>
          <p className="text-xs text-muted">
            New customer submissions will automatically appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-3 shadow-2xs hover:border-gold/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center font-heading font-semibold text-xs text-ink uppercase">
                    {review.name?.slice(0, 2) || "CS"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink leading-tight">{review.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating value={review.rating} size="text-xs" />
                      <span className="text-[11px] text-muted font-mono">
                        {review.rating}.0 / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {review.product ? (
                    <Link
                      href={`/products/${review.product.slug}`}
                      target="_blank"
                      className="font-medium text-gold hover:underline flex items-center gap-1"
                    >
                      {review.product.name}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="text-muted italic">(Archived Fragrance)</span>
                  )}
                  <span className="text-muted text-[11px]">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Review Text Body */}
              <p className="text-xs text-ink/90 leading-relaxed font-sans bg-paper/40 p-3 rounded border border-line/60">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Moderation Actions Row */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted font-mono">
                  ID: #{String(review._id).slice(-6).toUpperCase()}
                </span>
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