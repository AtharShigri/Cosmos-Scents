"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="hover:text-gold transition-colors">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-gold transition-colors">
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
