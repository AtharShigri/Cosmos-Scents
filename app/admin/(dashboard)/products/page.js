import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/products";
import Button from "@/components/Button";
import ToggleActiveButton from "./ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Products</h1>
        <Button as={Link} href="/admin/products/new" variant="primary">
          Add product
        </Button>
      </div>

      <div className="border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-left text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Collection</th>
              <th className="px-4 py-2.5 font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Stock</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/products/${p._id}/edit`} className="hover:text-gold">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted">{p.category?.name ?? "--"}</td>
                <td className="px-4 py-2.5">Rs {p.price.toLocaleString()}</td>
                <td className="px-4 py-2.5">{p.stock}</td>
                <td className="px-4 py-2.5">
                  <span className={p.active ? "text-gold" : "text-muted"}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <ToggleActiveButton productId={p._id} active={p.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
