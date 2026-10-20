import { notFound } from "next/navigation";
import { getCategoriesAdmin, getProductByIdAdmin } from "@/lib/products";
import { updateProduct } from "@/lib/actions/products";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  // Admin-only listing -- includes hidden collections too, so a product
  // already assigned to one doesn't lose that option when editing.
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getCategoriesAdmin(),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Edit {product.name}</h1>
      <ProductForm action={updateWithId} categories={categories} product={product} />
    </div>
  );
}
