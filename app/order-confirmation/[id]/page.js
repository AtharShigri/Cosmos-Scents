import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { BANK_DETAILS } from "@/lib/bankDetails";
import Button from "@/components/Button";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id).catch(() => null);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl px-6 py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl">Thank you, {order.customer.name.split(" ")[0]}!</h1>
        <p className="text-muted">
          Your order has been received. Order #{order._id.slice(-6).toUpperCase()}
        </p>
      </div>

      <div className="border border-line rounded-md p-4 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {item.name} &times; {item.quantity}
            </span>
            <span className="text-muted">
              Rs {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex justify-between font-medium border-t border-line pt-2 mt-1">
          <span>Total</span>
          <span>Rs {order.total.toLocaleString()}</span>
        </div>
      </div>

      {order.paymentMethod === "cod" ? (
        <p className="text-sm text-muted border border-line rounded-md p-4">
          You chose <strong className="text-ink">cash on delivery</strong> --
          please have Rs {order.total.toLocaleString()} ready when your order
          arrives at {order.customer.address}, {order.customer.city}.
        </p>
      ) : (
        <div className="text-sm border border-line rounded-md p-4 flex flex-col gap-1">
          <p className="font-medium">Bank transfer details</p>
          <p className="text-muted">Bank: {BANK_DETAILS.bankName}</p>
          <p className="text-muted">Account title: {BANK_DETAILS.accountTitle}</p>
          <p className="text-muted">Account number: {BANK_DETAILS.accountNumber}</p>
          <p className="text-muted">IBAN: {BANK_DETAILS.iban}</p>
          <p className="text-muted mt-2">
            Please transfer Rs {order.total.toLocaleString()} and share your
            payment screenshot via WhatsApp so we can confirm your order.
          </p>
        </div>
      )}

      <Button as={Link} href="/products" variant="secondary" className="w-full justify-center">
        Continue shopping
      </Button>
    </div>
  );
}
