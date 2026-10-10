"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <Button variant="primary" disabled className="w-fit mt-2">
        Sold Out
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-2">
      <Button
        variant="primary"
        className="w-fit"
        onClick={() => {
          addItem(product, 1);
          setAdded(true);
        }}
      >
        Add to Cart
      </Button>
      {added ? (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-sm text-gold hover:underline cursor-pointer"
        >
          Added -- view cart &rarr;
        </button>
      ) : null}
    </div>
  );
}
