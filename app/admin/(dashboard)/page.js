import Link from "next/link";
import { getDashboardStats } from "@/lib/orders";
import { getPendingReviewCount } from "@/lib/reviews";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  pending: "bg-stone-100 text-stone-700 border-stone-300",
  confirmed: "bg-gold-soft text-gold border-gold/30",
  processing: "bg-blue-50 text-blue-800 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
  returned: "bg-rose-50 text-rose-800 border-rose-200",
};

export default async function AdminDashboard() {
  const [stats, pendingReviews] = await Promise.all([
    getDashboardStats(),
    getPendingReviewCount().catch(() => 0),
  ]);

  return (
    <div className="flex flex-col gap-10">
      {/* Top Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Total Revenue
          </span>
          <span className="font-heading text-2xl font-semibold text-gold">
            Rs {stats.revenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-muted">Net realized orders</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Total Orders
          </span>
          <span className="font-heading text-2xl font-semibold text-ink">
            {stats.orderCount}
          </span>
          <span className="text-[11px] text-muted">Lifetime transactions</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Pending Dispatch
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-semibold text-amber-700">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-muted">orders</span>
          </div>
          <span className="text-[11px] text-muted">Awaiting confirmation</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Active Catalog
          </span>
          <span className="font-heading text-2xl font-semibold text-ink">
            {stats.productCount} SKUs
          </span>
          <span className="text-[11px] text-muted">Visible in storefront</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Review Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-heading text-2xl font-semibold ${
                pendingReviews > 0 ? "text-gold" : "text-muted"
              }`}
            >
              {pendingReviews}
            </span>
            <span className="text-[11px] text-muted">pending</span>
          </div>
          <span className="text-[11px] text-muted">Authenticity audit</span>
        </div>
      </div>

      {/* Operational Control Hub - Replacing plain text links with executive buttons */}
      <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-semibold text-ink">
              Executive Operations & Automation Hub
            </h2>
            <p className="text-xs text-muted">
              Direct access to enterprise modules, automated inventory engines, and financial reconciliation
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted uppercase">ERP Suite v2.0</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/inventory"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-gold-soft flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Inventory Engine
            </span>
            <span className="text-[10px] text-muted mt-0.5">Par replenishment</span>
          </Link>

          <Link
            href="/admin/finance"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Finance & Ledger
            </span>
            <span className="text-[10px] text-muted mt-0.5">COD & Wire settlements</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Analytics Hub
            </span>
            <span className="text-[10px] text-muted mt-0.5">Demographics & velocity</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Add Fragrance
            </span>
            <span className="text-[10px] text-muted mt-0.5">New formulation</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Dispatch Queue
            </span>
            <span className="text-[10px] text-muted mt-0.5">Fulfillment & slips</span>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex flex-col items-center justify-center p-3.5 rounded-md border border-line bg-paper hover:bg-paper-raised hover:border-gold/50 transition-all group text-center"
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              Reviews & Trust
            </span>
            <span className="text-[10px] text-muted mt-0.5">Customer feedback</span>
          </Link>
        </div>
      </div>

      {/* Operational Two-Column Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-ink">Recent Order Inflow</h3>
              <p className="text-xs text-muted">Latest customer acquisitions awaiting dispatch</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-ink transition-colors"
            >
              All Orders ({stats.orderCount}) &rarr;
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center border border-dashed border-line rounded">
              No orders registered in the system yet.
            </p>
          ) : (
            <div className="border border-line rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-paper border-b border-line text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold">Order</th>
                    <th className="px-3.5 py-2.5 font-semibold">Client</th>
                    <th className="px-3.5 py-2.5 font-semibold">Status</th>
                    <th className="px-3.5 py-2.5 font-semibold text-right">Amount</th>
                    <th className="px-3.5 py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-paper/60 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-medium text-ink">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-3.5 py-2.5 text-ink font-medium">{o.customerName}</td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${
                            STATUS_BADGE[o.status] || "border-line"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-ink">
                        Rs {o.total.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link
                          href={`/admin/orders/${o._id}`}
                          className="px-2 py-1 rounded bg-paper border border-line hover:border-gold/50 text-[11px] font-medium text-ink hover:text-gold transition-colors"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Inventory Attention & Critical Stock */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-ink">Stock Attention</h3>
              <p className="text-xs text-muted">SKUs at critical levels (≤ 5 units)</p>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-gold hover:underline font-medium"
            >
              Automation &rarr;
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <div className="p-6 border border-line rounded-md bg-paper flex flex-col items-center text-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                ✓
              </span>
              <p className="text-xs font-medium text-ink">All Stock Levels Optimal</p>
              <p className="text-[11px] text-muted">No formulations running below par.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.lowStock.map((p) => (
                <div
                  key={p._id}
                  className="p-3 rounded border border-line bg-paper flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-ink">{p.name}</span>
                    <span
                      className={`text-[11px] font-mono font-semibold ${
                        p.stock === 0 ? "text-rose-700" : "text-amber-700"
                      }`}
                    >
                      {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} units remaining`}
                    </span>
                  </div>

                  <Link
                    href="/admin/inventory"
                    className="px-2.5 py-1 rounded bg-ink text-paper hover:bg-ink/85 text-[11px] font-medium transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-line flex items-center justify-between text-[11px] text-muted font-mono">
            <span>Warehouse: Skardu, GB</span>
            <span className="text-emerald-700 font-semibold">● Par Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}