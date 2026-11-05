import { getCategoriesAdmin } from "@/lib/products";
import NewCategoryForm from "./NewCategoryForm";
import CategoryRow from "./CategoryRow";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-heading text-lg font-semibold text-ink">
          Collections & Olfactive Families ({categories.length})
        </h2>
        <p className="text-xs text-muted">
          Organize Cosmos Scents perfumes into thematic mountain series, extraction tiers, and limited editions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active Collections Table (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="border border-line rounded-md overflow-hidden bg-paper-raised divide-y divide-line shadow-2xs">
            {categories.length === 0 ? (
              <p className="px-6 py-8 text-xs text-muted text-center">
                No collections defined yet. Create your first collection using the form.
              </p>
            ) : (
              categories.map((c) => <CategoryRow key={c._id} category={c} />)
            )}
          </div>
        </div>

        {/* Right: New Collection Form (1 col) */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs h-fit">
          <div className="border-b border-line pb-3">
            <h3 className="font-heading text-base font-semibold text-ink">
              New Collection Tier
            </h3>
            <p className="text-xs text-muted">
              Define a new olfactive category for the catalog
            </p>
          </div>
          <NewCategoryForm />
        </div>
      </div>
    </div>
  );
}