import { getCategoriesAdmin } from "@/lib/products";
import NewCategoryForm from "./NewCategoryForm";
import CategoryRow from "./CategoryRow";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl">Collections</h1>

      <div className="border border-line rounded-md divide-y divide-line max-w-xl">
        {categories.length === 0 ? (
          <p className="px-4 py-3 text-sm text-muted">No collections yet.</p>
        ) : (
          categories.map((c) => <CategoryRow key={c._id} category={c} />)
        )}
      </div>

      <section className="flex flex-col gap-3 max-w-xl">
        <h2 className="text-lg font-heading">Add a collection</h2>
        <NewCategoryForm />
      </section>
    </div>
  );
}
