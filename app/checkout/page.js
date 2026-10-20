"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    email: "",
    paymentMethod: "cod",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl">Your cart is empty</h1>
        <Button as={Link} href="/products" variant="primary">
          Shop the collection
        </Button>
      </div>
    );
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            email: form.email,
          },
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-2xl">Checkout</h1>

      <div className="border border-line rounded-md p-4 flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
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
          <span>Rs {subtotal.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </Field>
        </div>

        <Field label="Delivery address">
          <textarea
            required
            rows={2}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="City">
            <input
              required
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </Field>
          <Field label="Email (optional -- we'll send order updates here)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </Field>
        </div>

        <Field label="Payment method">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={form.paymentMethod === "cod"}
                onChange={() => update("paymentMethod", "cod")}
              />
              Cash on delivery
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                checked={form.paymentMethod === "bank_transfer"}
                onChange={() => update("paymentMethod", "bank_transfer")}
              />
              Bank transfer
            </label>
          </div>
        </Field>

        <Field label="Order notes (optional)">
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
        </Field>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className="w-full justify-center"
        >
          {submitting ? "Placing order..." : "Place order"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
