import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedProducts().catch(() => []);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center gap-6 border-b border-line">
        <Logo size="lg" />
        <h1 className="text-3xl sm:text-4xl max-w-xl">
          Fragrance made in Gilgit-Baltistan, for everyday wear.
        </h1>
        <p className="max-w-md text-muted">
          Cosmos Scents is the region&apos;s first local perfume brand --
          small-batch, locally blended, and priced for every day, not just
          special occasions.
        </p>
        <div className="flex gap-3">
          <Button as={Link} href="/products" variant="primary">
            Shop the collection
          </Button>
          <Button as={Link} href="/style-guide" variant="ghost">
            View style reference
          </Button>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16 w-full flex flex-col gap-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl">Featured scents</h2>
            <Link href="/products" className="text-sm text-muted hover:text-gold">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Brand story */}
      <section className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-4 border-t border-line text-center">
        <h2 className="text-2xl">Why Gilgit-Baltistan&apos;s first local fragrance brand</h2>
        <p className="text-muted leading-relaxed">
          Perfume in Pakistan has long meant imported brands at imported
          prices. Cosmos Scents started with a simple question: why
          can&apos;t a region known for some of the country&apos;s cleanest
          air and water also make its own fragrance -- blended locally,
          priced fairly, and built around scents people here actually want
          to wear every day?
        </p>
      </section>
    </main>
  );
}
