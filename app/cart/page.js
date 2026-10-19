"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import BottlePlaceholder from "@/components/BottlePlaceholder";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl">Your cart is empty</h1>
        <p className="text-muted">Nothing here yet.</p>
        <Button as={Link} href="/products" variant="primary">
          Shop the collection
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 flex flex-col gap-8">
      <h1 className="text-2xl">Your cart</h1>

      <div className="flex flex-col divide-y divide-line">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-wrap items-center gap-4 py-4">
            <div className="w-16 shrink-0">
              {item.image ? (
                <div className="relative aspect-[2/3] rounded-sm overflow-hidden border border-line">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <BottlePlaceholder className="aspect-[2/3]" label={item.name} />
              )}
            </div>

            <div className="flex-1 min-w-[140px]">
              <Link href={`/products/${item.slug}`} className="font-medium hover:text-gold">
                {item.name}
              </Link>
              <p className="text-sm text-muted">Rs {item.price.toLocaleString()}</p>
            </div>

            {/* Wraps onto its own row on narrow screens (flex-wrap on the
                parent) instead of squeezing/overflowing next to the name. */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-7 h-7 border border-line rounded-sm hover:border-ink cursor-pointer"
                >
                  &minus;
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-7 h-7 border border-line rounded-sm hover:border-ink cursor-pointer"
                >
                  +
                </button>
              </div>

              <p className="w-20 text-right text-sm font-medium">
                Rs {(item.price * item.quantity).toLocaleString()}
              </p>

              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => removeItem(item.productId)}
                className="text-muted hover:text-ink text-sm cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <p className="text-muted">Subtotal</p>
        <p className="text-xl font-medium">Rs {subtotal.toLocaleString()}</p>
      </div>

      <Button as={Link} href="/checkout" variant="primary" className="w-full justify-center">
        Checkout
      </Button>
    </div>
  );
}
