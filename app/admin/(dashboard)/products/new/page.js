import { getCategoriesAdmin } from "@/lib/products";
import { createProduct } from "@/lib/actions/products";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // Admin-only listing -- includes hidden collections too, so one that's
  // been hidden from the public tabs is still assignable here.
  const categories = await getCategoriesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Add product</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
