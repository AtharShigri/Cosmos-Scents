import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getCategories } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center gap-6 border-b border-line">
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

      {/* Collections */}
      {categories.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16 w-full flex flex-col gap-8 border-t border-line">
          <h2 className="text-2xl">Shop by collection</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group border border-line rounded-md p-6 flex flex-col gap-1 hover:border-ink transition-colors"
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

      {/* Brand story */}
      <section className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-6 border-t border-line text-center">
        <h2 className="text-2xl">Our story</h2>
        <p className="text-muted leading-relaxed">
          Cosmos Scents is the first local fragrance brand from
          Gilgit-Baltistan. Born in the heart of Shigar Valley, we craft
          authentic, premium fragrances inspired by the majestic
          landscapes, vibrant traditions, and timeless elegance of
          Baltistan and beyond.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          <div className="flex flex-col gap-1">
            <p className="font-medium">Our mission</p>
            <p className="text-sm text-muted leading-relaxed">
              To celebrate the unique essence of Gilgit-Baltistan through
              exquisite fragrances, and to bring the heritage of our
              valleys to the world through premium, handcrafted products.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">What we offer</p>
            <p className="text-sm text-muted leading-relaxed">
              Signature collections -- Essence de Skardu and Essence de
              Hunza -- designed to evoke the spirit and charm of our land,
              offering a sensory connection to the region&apos;s beauty
              and craftsmanship.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
