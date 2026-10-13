import Link from "next/link";
import { getAllOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

const STATUS_COLOR = {
  pending: "text-muted",
  confirmed: "text-gold",
  shipped: "text-gold",
  delivered: "text-ink",
  cancelled: "text-red-700",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="border border-line rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-raised text-left text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Total</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/orders/${o._id}`} className="hover:text-gold font-mono text-xs">
                      #{o._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{o.customer.name}</td>
                  <td className="px-4 py-2.5">Rs {o.total.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {o.paymentMethod === "cod" ? "COD" : "Bank transfer"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={STATUS_COLOR[o.status] || "text-muted"}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
