import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Order #{order._id.slice(-6).toUpperCase()}</h1>
        <StatusSelect orderId={order._id} status={order.status} />
      </div>

      <section className="border border-line rounded-md p-4 flex flex-col gap-1 text-sm">
        <p className="font-medium mb-1">Customer</p>
        <p>{order.customer.name}</p>
        <p className="text-muted">{order.customer.phone}</p>
        {order.customer.email ? <p className="text-muted">{order.customer.email}</p> : null}
        <p className="text-muted">
          {order.customer.address}, {order.customer.city}
        </p>
      </section>

      <section className="border border-line rounded-md p-4 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.name} &times; {item.quantity}
            </span>
            <span className="text-muted">Rs {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between font-medium border-t border-line pt-2 mt-1">
          <span>Total</span>
          <span>Rs {order.total.toLocaleString()}</span>
        </div>
        <p className="text-sm text-muted mt-1">
          Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}
        </p>
        {order.notes ? (
          <p className="text-sm text-muted mt-1">Notes: {order.notes}</p>
        ) : null}
      </section>

      <p className="text-xs text-muted">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
