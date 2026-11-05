import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import Carousel from "@/components/Carousel";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import StarRating from "@/components/StarRating";
import { getFeaturedProducts, getAllProducts, getCategories } from "@/lib/products";
import { getCarouselImages } from "@/lib/carousel";
import { getApprovedReviewsForHomepage } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, allProducts, categories, reviews] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getAllProducts().catch(() => []),
    getCategories().catch(() => []),
    getApprovedReviewsForHomepage().catch(() => []),
  ]);
  const carouselImages = getCarouselImages();

  return (
    <main className="flex flex-col">
      {/* Hero -- large-scale artisanal fragrance carousel and brand showcase */}
      {carouselImages.length > 0 ? (
        <Carousel images={carouselImages} />
      ) : (
        <section className="flex flex-col items-center justify-center px-6 py-16 sm:py-24 text-center gap-6 border-b border-line">
          <Logo size="lg" />
          <h1 className="text-3xl sm:text-4xl max-w-xl">
            Gilgit-Baltistan&apos;s first local fragrance brand.
          </h1>
          <p className="max-w-md text-muted">
            Born in the heart of Shigar Valley -- authentic, premium
            fragrances inspired by the landscapes and traditions of
            Baltistan and beyond.
          </p>
          <div className="flex gap-3">
            <Button as={Link} href="/products" variant="primary">
              Shop the collection
            </Button>
          </div>
        </section>
      )}

      {/* Featured Scents -- Single Horizontal Row in a Carousel with Hover Arrows */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 w-full flex flex-col gap-6">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-heading text-ink">
                Featured Scents
              </h2>
              <p className="text-sm text-muted">
                Handpicked highlights from our artisanal collection.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-muted hover:text-gold transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          <FeaturedCarousel products={featured} />
        </section>
      ) : null}

      {/* All Fragrances -- Same as All Fragrances Page (Only Image Cards) */}
      {allProducts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 w-full flex flex-col gap-8 border-t border-line">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-heading text-ink">
                All Fragrances
              </h2>
              <p className="text-sm text-muted">
                Gilgit-Baltistan&apos;s complete signature fragrance lineup.
              </p>
            </div>
            <span className="text-xs font-mono text-muted">
              {allProducts.length} Fragrances
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {allProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Collections */}
      {categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 w-full flex flex-col gap-8 border-t border-line">
          <h2 className="text-2xl sm:text-3xl font-heading text-ink">
            Shop by Collection
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group border border-line rounded-lg p-6 flex flex-col gap-1 hover:border-ink bg-paper-raised transition-colors shadow-2xs"
              >
                <p className="text-lg font-heading group-hover:text-gold transition-colors">
                  {cat.name}
                </p>
                {cat.description ? (
                  <p className="text-sm text-muted">{cat.description}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Customer reviews */}
      {reviews.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 w-full flex flex-col gap-8 border-t border-line">
          <h2 className="text-2xl sm:text-3xl font-heading text-ink">
            What customers are saying
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-line rounded-lg p-5 flex flex-col gap-2 bg-paper-raised shadow-2xs"
              >
                <StarRating value={review.rating} size="text-xs" />
                <p className="text-sm leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                <p className="text-sm text-muted mt-1">
                  {review.name}
                  {review.product ? (
                    <>
                      {" "}
                      &middot;{" "}
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="hover:text-gold font-medium"
                      >
                        {review.product.name}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
