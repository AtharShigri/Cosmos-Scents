import Link from "next/link";
import { getAllProducts, getCategories, getProductsBySlugs } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import AISearchBar from "@/components/AISearchBar";

// Product data changes independently of deploys (stock, new items), and
// this isn't a high-traffic page that needs static generation -- render
// it fresh on every request instead of at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop | Cosmos Scents",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Highest rated" },
];

export default async function ProductsPage({ searchParams }) {
  const {
    category: activeCategory = "all",
    sort = "newest",
    search = "",
    matched = "",
  } = await searchParams;

  // A search in progress (see components/AISearchBar.js + lib/actions/
  // search.js) takes over the whole page -- its ranked result replaces
  // the category/sort browsing, which comes back once it's cleared.
  const isSearching = Boolean(search);

  let products = [];
  let categories = [];
  let error = null;

  try {
    categories = await getCategories();
    products = isSearching
      ? await getProductsBySlugs(matched ? matched.split(",").filter(Boolean) : [])
      : await getAllProducts(activeCategory, sort);
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

      <AISearchBar defaultQuery={search} />

      {isSearching ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <p>
            Search results for <span className="font-medium">&ldquo;{search}&rdquo;</span>
          </p>
          <Link href="/products" className="text-muted hover:text-gold">
            Clear search
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {categories.length > 0 ? (
            <nav className="flex flex-wrap gap-2 text-sm">
              <CategoryTab
                href={`/products${sort !== "newest" ? `?sort=${sort}` : ""}`}
                active={activeCategory === "all"}
              >
                All
              </CategoryTab>
              {categories.map((cat) => (
                <CategoryTab
                  key={cat.slug}
                  href={`/products?category=${cat.slug}${
                    sort !== "newest" ? `&sort=${sort}` : ""
                  }`}
                  active={activeCategory === cat.slug}
                >
                  {cat.name}
                </CategoryTab>
              ))}
            </nav>
          ) : (
            <div />
          )}

          <SortSelect param="sort" value={sort} defaultValue="newest" options={SORT_OPTIONS} />
        </div>
      )}

      {error ? (
        <p className="text-sm text-muted border border-line rounded-md p-4">
          Couldn&apos;t load products right now -- check that MONGODB_URI is
          set in .env.local and that your Atlas cluster allows connections
          from this machine.
        </p>
      ) : products.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted border border-line rounded-md p-4">
            {isSearching
              ? "Nothing matched that search. Try browsing by collection below."
              : "No products here yet. Run npm run seed to add the catalog, or add products from the admin dashboard."}
          </p>
          {isSearching && categories.length > 0 ? (
            <nav className="flex flex-wrap gap-2 text-sm">
              <CategoryTab href="/products" active>
                All
              </CategoryTab>
              {categories.map((cat) => (
                <CategoryTab key={cat.slug} href={`/products?category=${cat.slug}`}>
                  {cat.name}
                </CategoryTab>
              ))}
            </nav>
          ) : null}
        </div>
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
