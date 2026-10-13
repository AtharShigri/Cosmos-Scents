import Link from "next/link";
import { getDashboardStats } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Orders" value={stats.orderCount} />
        <Stat label="Pending orders" value={stats.pendingCount} />
        <Stat label="Revenue" value={`Rs ${stats.revenue.toLocaleString()}`} />
        <Stat label="Active products" value={stats.productCount} />
      </div>

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
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-line rounded-md p-4 flex flex-col gap-1">
      <p className="text-2xl font-heading">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
