import { getCategories } from "@/lib/products";
import { createProduct } from "@/lib/actions/products";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Add product</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
