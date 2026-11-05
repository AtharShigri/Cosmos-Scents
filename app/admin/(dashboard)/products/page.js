import Link from "next/link";
import Image from "next/image";
import { getAllProductsAdmin } from "@/lib/products";
import ToggleActiveButton from "./ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  const totalSKUs = products.length;
  const activeSKUs = products.filter((p) => p.active).length;
  const hiddenSKUs = totalSKUs - activeSKUs;
  const lowStockSKUs = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">
            Artisanal Fragrance Inventory ({totalSKUs} SKUs)
          </h2>
          <p className="text-xs text-muted">
            Manage olfactive formulations, batch pricing, visibility, and direct store presentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-line bg-paper hover:bg-paper-raised text-ink transition-colors shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Automated Restock
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md bg-ink text-paper hover:bg-ink/85 transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Fragrance
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-md border border-line bg-paper-raised flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Total Formulations</span>
          <span className="font-heading text-xl font-semibold text-ink">{totalSKUs}</span>
        </div>
        <div className="p-3.5 rounded-md border border-line bg-paper-raised flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Active in Store</span>
          <span className="font-heading text-xl font-semibold text-emerald-700">{activeSKUs}</span>
        </div>
        <div className="p-3.5 rounded-md border border-line bg-paper-raised flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Hidden / Draft</span>
          <span className="font-heading text-xl font-semibold text-muted">{hiddenSKUs}</span>
        </div>
        <div className="p-3.5 rounded-md border border-line bg-paper-raised flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Low Stock (&le; 10)</span>
          <span className="font-heading text-xl font-semibold text-amber-700">{lowStockSKUs}</span>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="border border-line rounded-md overflow-hidden bg-paper-raised shadow-2xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper border-b border-line text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-semibold">Fragrance</th>
              <th className="px-4 py-3 font-semibold">Collection</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold text-center">Stock</th>
              <th className="px-4 py-3 font-semibold">Store Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const mainImg = p.images?.[0] || "/images/placeholder_bottle.jpeg";

              return (
                <tr key={p._id} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded border border-line bg-paper shrink-0 overflow-hidden">
                        <Image
                          src={mainImg}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="font-medium text-ink hover:text-gold transition-colors font-semibold text-sm"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-muted">
                          {p.size || "50ml"} • {p.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-paper border border-line text-muted">
                      {p.category?.name ?? "General"}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-xs text-ink">
                    Rs {p.price.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                        p.stock === 0
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : p.stock <= 5
                          ? "bg-orange-50 text-orange-800 border border-orange-200"
                          : p.stock <= 10
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.active
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.active ? "bg-emerald-500" : "bg-stone-400"
                        }`}
                      />
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p._id}/edit`}
                        className="px-2.5 py-1 rounded border border-line bg-paper hover:bg-stone-100 text-xs font-medium text-ink transition-colors"
                      >
                        Edit
                      </Link>

                      <ToggleActiveButton productId={p._id} active={p.active} />

                      {p.active ? (
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="View on public storefront"
                          className="p-1 rounded text-muted hover:text-gold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}