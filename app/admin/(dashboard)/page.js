import Link from "next/link";
import { getDashboardStats } from "@/lib/orders";
import { getPendingReviewCount } from "@/lib/reviews";

export const dynamic = "force-dynamic";

const STATUS_COLOR = {
  pending: "text-muted",
  confirmed: "text-gold",
  processing: "text-gold",
  shipped: "text-gold",
  delivered: "text-ink",
  cancelled: "text-red-700",
  returned: "text-red-700",
};

export default async function AdminDashboard() {
  const [stats, pendingReviews] = await Promise.all([
    getDashboardStats(),
    getPendingReviewCount().catch(() => 0),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Stat label="Orders" value={stats.orderCount} />
        <Stat label="Pending orders" value={stats.pendingCount} />
        <Stat label="Revenue" value={`Rs ${stats.revenue.toLocaleString()}`} />
        <Stat label="Active products" value={stats.productCount} />
        <Stat
          label="Reviews awaiting approval"
          value={pendingReviews}
          href={pendingReviews > 0 ? "/admin/reviews" : undefined}
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-gold hover:underline">
            View all &rarr;
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="border border-line rounded-md divide-y divide-line">
            {stats.recentOrders.map((o) => (
              <Link
                key={o._id}
                href={`/admin/orders/${o._id}`}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-paper-raised transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    #{o._id.slice(-6).toUpperCase()}
                  </span>
                  <span>{o.customerName}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className={STATUS_COLOR[o.status] || "text-muted"}>{o.status}</span>
                  <span className="text-muted">Rs {o.total.toLocaleString()}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-heading">Low stock (5 or fewer)</h2>
        {stats.lowStock.length === 0 ? (
          <p className="text-sm text-muted">Nothing running low right now.</p>
        ) : (
          <div className="border border-line rounded-md divide-y divide-line">
            {stats.lowStock.map((p) => (
              <div key={p._id} className="flex justify-between px-4 py-2.5 text-sm">
                <span>{p.name}</span>
                <span className={p.stock === 0 ? "text-red-700" : "text-gold"}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-4 text-sm">
        <Link href="/admin/products" className="text-gold hover:underline">
          Manage products &rarr;
        </Link>
        <Link href="/admin/orders" className="text-gold hover:underline">
          View orders &rarr;
        </Link>
        <Link href="/admin/reviews" className="text-gold hover:underline">
          Moderate reviews &rarr;
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, href }) {
  const content = (
    <>
      <p className="text-2xl font-heading">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="border border-line rounded-md p-4 flex flex-col gap-1 hover:border-ink transition-colors"
      >
        {content}
      </Link>
    );
  }

  return <div className="border border-line rounded-md p-4 flex flex-col gap-1">{content}</div>;
}
