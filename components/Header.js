"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQs" },
];

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // The admin area has its own sidebar nav -- don't stack the public
  // shop header above it.
  if (pathname?.startsWith("/admin")) return null;

  const cartLabel = `Cart${itemCount > 0 ? ` (${itemCount})` : ""}`;

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="hover:text-gold transition-colors">
            {cartLabel}
          </Link>
        </nav>

        {/* Mobile: cart + menu toggle */}
        <div className="flex items-center gap-4 sm:hidden">
          <Link href="/cart" className="text-sm font-medium hover:text-gold transition-colors">
            {cartLabel}
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 cursor-pointer p-1"
          >
            <span className={`block h-px w-5 bg-ink transition-transform ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-ink transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {menuOpen ? (
        <nav className="sm:hidden border-t border-line px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
