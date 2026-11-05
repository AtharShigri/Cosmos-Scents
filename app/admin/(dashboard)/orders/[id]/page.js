import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-medium w-fit"
        >
          &larr; Back to Order Stream
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-md border border-line bg-paper-raised shadow-2xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-ink">
                #{order._id.slice(-6).toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  order.paymentMethod === "cod"
                    ? "bg-stone-100 text-stone-800 border border-stone-300"
                    : "bg-gold-soft text-gold border border-gold/40"
                }`}
              >
                {order.paymentMethod === "cod" ? "COD Order" : "Direct Wire Transfer"}
              </span>
            </div>
            <p className="text-xs text-muted">Placed on {formattedDate}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Fulfillment Status:
            </span>
            <StatusSelect orderId={order._id} status={order.status} />
          </div>
        </div>
      </div>

      {/* Two Column Customer & Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Dossier */}
        <section className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-heading text-sm font-semibold text-ink uppercase tracking-wider">
              Customer Dossier
            </h2>
            <span className="text-xs text-gold font-medium">Verified Delivery</span>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Client Name</span>
              <span className="font-semibold text-ink text-sm">{order.customer.name}</span>
            </div>

            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Contact Phone</span>
              <a
                href={`tel:${order.customer.phone}`}
                className="font-mono text-gold hover:underline font-semibold"
              >
                {order.customer.phone}
              </a>
            </div>

            {order.customer.email ? (
              <div>
                <span className="text-muted block text-[11px] uppercase tracking-wider">Email Address</span>
                <span className="text-ink">{order.customer.email}</span>
              </div>
            ) : null}

            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Destination Address</span>
              <span className="text-ink leading-relaxed">
                {order.customer.address}, <strong className="font-semibold">{order.customer.city}</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Payment & Ledger Dossier */}
        <section className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="font-heading text-sm font-semibold text-ink uppercase tracking-wider">
              Settlement & Courier
            </h2>
            <Link
              href="/admin/finance"
              className="text-xs text-gold hover:underline font-medium"
            >
              Finance Ledger &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Payment Method</span>
              <span className="font-semibold text-ink">
                {order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Direct Bank Wire Transfer"}
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Courier Dispatch</span>
              <span className="text-ink">
                Standard Insured Courier (Skardu / Gilgit Hub &rarr; {order.customer.city})
              </span>
            </div>

            <div>
              <span className="text-muted block text-[11px] uppercase tracking-wider">Invoice Subtotal</span>
              <span className="font-mono font-bold text-ink text-base">
                Rs {order.total.toLocaleString()}
              </span>
            </div>

            {order.notes ? (
              <div className="mt-1 p-2.5 rounded bg-paper border border-line">
                <span className="text-muted block text-[11px] uppercase tracking-wider mb-0.5">Customer Delivery Notes</span>
                <span className="text-ink italic">&quot;{order.notes}&quot;</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {/* Fragrance Line Items Table */}
      <section className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4 shadow-2xs">
        <h2 className="font-heading text-sm font-semibold text-ink uppercase tracking-wider border-b border-line pb-3">
          Artisanal Fragrance Line Items ({order.items.length} unique)
        </h2>

        <div className="border border-line rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper border-b border-line text-muted uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Fragrance Formulation</th>
                <th className="px-4 py-2.5 font-semibold text-center">Unit Price</th>
                <th className="px-4 py-2.5 font-semibold text-center">Quantity</th>
                <th className="px-4 py-2.5 font-semibold text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((item, i) => (
                <tr key={i} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink text-sm">{item.name}</td>
                  <td className="px-4 py-3 text-center font-mono text-muted">
                    Rs {item.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-ink">
                    &times; {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-ink text-sm">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-paper border-t border-line">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-ink uppercase tracking-wider text-xs">
                  Gross Invoiced Total
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-ink text-base">
                  Rs {order.total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}