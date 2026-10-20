import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/products";
import { getApprovedReviewsForProduct } from "@/lib/reviews";
import { getAiRecommendations } from "@/lib/recommendations";
import BottlePlaceholder from "@/components/BottlePlaceholder";
import AddToCartButton from "@/components/AddToCartButton";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";

export const dynamic = "force-dynamic";

const REVIEW_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  return { title: product ? `${product.name} | Cosmos Scents` : "Cosmos Scents" };
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const { reviewSort = "newest" } = await searchParams;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  const image = product.images?.[0];
  const [reviews, recommendations] = await Promise.all([
    getApprovedReviewsForProduct(product._id, reviewSort).catch(() => []),
    getAiRecommendations(product).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-16">
      <div className="grid sm:grid-cols-2 gap-10">
        {image ? (
          // 2:3 matches the real product photos' actual ratio -- see the
          // same note in components/ProductCard.js.
          <div className="relative w-full aspect-[2/3] rounded-md border border-line overflow-hidden bg-paper-raised">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <BottlePlaceholder className="aspect-[2/3]" label={product.name} />
        )}

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl">{product.name}</h1>
            {product.tagline ? (
              <p className="text-muted mt-1">{product.tagline}</p>
            ) : null}
          </div>

          {product.ratingCount > 0 ? (
            <StarRating value={product.ratingAvg} count={product.ratingCount} />
          ) : (
            <p className="text-sm text-muted">No reviews yet</p>
          )}

          <p className="text-xl font-medium">Rs {product.price.toLocaleString()}</p>

          <p className="text-sm leading-relaxed">{product.description}</p>

          {product.scentNotes?.length ? (
            <div className="flex flex-wrap gap-2">
              {product.scentNotes.map((note) => (
                <span
                  key={note}
                  className="text-xs font-medium border border-line text-muted px-2 py-1 rounded-sm"
                >
                  {note}
                </span>
              ))}
            </div>
          ) : null}

          <p className="text-sm text-muted">{product.size}</p>

          <AddToCartButton product={product} />
        </div>
      </div>

      {/* "You might also like" -- Gemini reasoning over scent notes/mood
          against the live catalog (there's no purchase history to drive
          a real recommendation engine), with a same-collection fallback
          if that call fails. See lib/recommendations.js. */}
      {recommendations.length > 0 ? (
        <section className="flex flex-col gap-6 border-t border-line pt-12">
          <h2 className="text-2xl">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {recommendations.map((rec) => (
              <ProductCard key={rec._id} product={rec} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Reviews -- only ones an admin has approved show up here (see
          lib/actions/reviews.js). */}
      <section className="flex flex-col gap-8 border-t border-line pt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl">Reviews</h2>
          {reviews.length > 1 ? (
            <SortSelect
              param="reviewSort"
              value={reviewSort}
              defaultValue="newest"
              options={REVIEW_SORT_OPTIONS}
            />
          ) : null}
        </div>

        {reviews.length > 0 ? (
          <div className="flex flex-col gap-6 divide-y divide-line">
            {reviews.map((review) => (
              <div key={review._id} className="flex flex-col gap-1.5 pt-6 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{review.name}</p>
                  <StarRating value={review.rating} size="text-xs" />
                </div>
                <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            No reviews yet -- be the first to share what you think.
          </p>
        )}

        <div className="flex flex-col gap-4 pt-4 border-t border-line">
          <h3 className="text-lg font-heading">Write a review</h3>
          <ReviewForm productId={product._id} productSlug={product.slug} />
        </div>
      </section>
    </div>
  );
}
