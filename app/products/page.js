import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

// Product data changes independently of deploys (stock, new items), and
// this isn't a high-traffic page that needs static generation -- render
// it fresh on every request instead of at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop | Cosmos Scents",
};

export default async function ProductsPage({ searchParams }) {
  const { category: activeCategory = "all" } = await searchParams;

  let products = [];
  let categories = [];
  let error = null;

  try {
    [products, categories] = await Promise.all([
      getAllProducts(activeCategory),
      getCategories(),
    ]);
  } catch (err) {
    error = err;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Shop</h1>
        <p className="text-muted max-w-md">
          Gilgit-Baltistan&apos;s first local fragrance line. Every scent is
          blended and bottled locally.
        </p>
      </header>

      {categories.length > 0 ? (
        <nav className="flex flex-wrap gap-2 text-sm">
          <CategoryTab href="/products" active={activeCategory === "all"}>
            All
          </CategoryTab>
          {categories.map((cat) => (
            <CategoryTab
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              active={activeCategory === cat.slug}
            >
              {cat.name}
            </CategoryTab>
          ))}
        </nav>
      ) : null}

      {error ? (
        <p className="text-sm text-muted border border-line rounded-md p-4">
          Couldn&apos;t load products right now -- check that MONGODB_URI is
          set in .env.local and that your Atlas cluster allows connections
          from this machine.
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted border border-line rounded-md p-4">
          No products here yet. Run <code>npm run seed</code> to add the
          catalog, or add products from the admin dashboard once it&apos;s
          built.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTab({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-sm border transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
