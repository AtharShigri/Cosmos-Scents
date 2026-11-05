import Link from "next/link";
import { getAllOrders } from "@/lib/orders";

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

const STATUS_TABS = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending Verification" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "In Production" },
  { id: "shipped", label: "Dispatched / Courier" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({ searchParams }) {
  const { status: activeStatus = "all" } = await searchParams;
  const status = STATUS_TABS.some((t) => t.id === activeStatus) ? activeStatus : "all";

  // Fetch all orders to compute tab counts & active list
  const allOrders = await getAllOrders("all");
  const filteredOrders =
    status === "all" ? allOrders : allOrders.filter((o) => o.status === status);

  // Compute status counts for tab badges
  const counts = { all: allOrders.length };
  for (const o of allOrders) {
    counts[o.status] = (counts[o.status] || 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">
            Orders & Fulfillment Dispatch ({filteredOrders.length} orders)
          </h2>
          <p className="text-xs text-muted">
            Track customer shipments, reconcile payments, and manage carrier delivery pipelines
          </p>
        </div>

        <Link
          href="/admin/finance"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-line bg-paper hover:bg-paper-raised text-ink transition-colors shadow-2xs w-fit"
        >
          <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Reconcile Inflows
        </Link>
      </div>

      {/* Status Filter Tabs with Live Badges */}
      <nav className="flex flex-wrap gap-2 text-xs font-medium">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <Link
              key={tab.id}
              href={tab.id === "all" ? "/admin/orders" : `/admin/orders?status=${tab.id}`}
              className={`px-3 py-1.5 rounded-md border transition-all flex items-center gap-2 ${
                isActive
                  ? "border-ink bg-ink text-paper shadow-xs"
                  : "border-line bg-paper text-muted hover:border-ink hover:text-ink hover:bg-paper-raised"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-paper/20 text-paper" : "bg-line text-muted"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 rounded-md border border-dashed border-line bg-paper-raised text-center flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-ink">No orders matching &quot;{status}&quot;</p>
          <p className="text-xs text-muted">Orders placed by customers will automatically appear in this fulfillment stream.</p>
        </div>
      ) : (
        <div className="border border-line rounded-md overflow-hidden bg-paper-raised shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-line text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Order / Reference</th>
                <th className="px-4 py-3 font-semibold">Customer & Destination</th>
                <th className="px-4 py-3 font-semibold">Articles</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Fulfillment Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredOrders.map((o) => {
                const totalItems = (o.items || []).reduce(
                  (acc, it) => acc + (it.quantity || 1),
                  0
                );
                const orderDate = new Date(o.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={o._id} className="hover:bg-paper/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/orders/${o._id}`}
                          className="font-mono font-semibold text-xs text-ink hover:text-gold transition-colors"
                        >
                          #{o._id.slice(-6).toUpperCase()}
                        </Link>
                        <span className="text-[11px] text-muted">{orderDate}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">{o.customer.name}</span>
                        <span className="text-xs text-muted">
                          {o.customer.city} • {o.customer.phone}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-ink">
                          {totalItems} {totalItems === 1 ? "bottle" : "bottles"}
                        </span>
                        <span className="text-[11px] text-muted truncate max-w-[180px]">
                          {(o.items || []).map((it) => it.name).join(", ")}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          o.paymentMethod === "cod"
                            ? "bg-stone-100 text-stone-800 border border-stone-200"
                            : "bg-gold-soft text-gold border border-gold/30 font-semibold"
                        }`}
                      >
                        {o.paymentMethod === "cod" ? "COD" : "Bank Transfer"}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-xs text-ink">
                      Rs {o.total.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          STATUS_BADGE[o.status] || "border-line"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-paper border border-line hover:border-gold/50 text-xs font-medium text-ink hover:text-gold transition-colors shadow-2xs"
                      >
                        Manage &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}