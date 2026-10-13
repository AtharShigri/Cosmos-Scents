import { notFound } from "next/navigation";
import { getCategories, getProductByIdAdmin } from "@/lib/products";
import { updateProduct } from "@/lib/actions/products";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdAdmin(id),
    getCategories(),
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
