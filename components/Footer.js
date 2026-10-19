"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const SOCIALS = [
  { name: "Instagram", href: "https://instagram.com/cosmos_scents" },
  { name: "Facebook", href: "https://www.facebook.com/Cosmosscent" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/cosmos-scents/" },
];

/**
 * Site-wide footer, mounted in app/layout.js (hidden on /admin, same
 * pattern as Header.js and ChatWidget.js -- the admin area has its own
 * shell and doesn't need the storefront's chrome).
 */
export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-line mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-12 grid sm:grid-cols-3 gap-10">
        <div className="flex flex-col gap-3">
          <Logo size="sm" />
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            Gilgit-Baltistan&apos;s first local fragrance brand -- authentic,
            premium scents, blended and bottled in Shigar Valley.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Visit &amp; contact</p>
          <p className="text-muted leading-relaxed">
            Cosmos Scents
            <br />
            Near Sarina Shigar Fort
            <br />
            Shigar, Gilgit-Baltistan
          </p>
          <a href="tel:+923330685060" className="text-muted hover:text-gold transition-colors">
            +92 333 0685060
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Explore</p>
          <Link href="/products" className="text-muted hover:text-gold transition-colors">
            Shop
          </Link>
          <Link href="/about" className="text-muted hover:text-gold transition-colors">
            About us
          </Link>
          <Link href="/contact" className="text-muted hover:text-gold transition-colors">
            Contact
          </Link>
          <Link href="/faq" className="text-muted hover:text-gold transition-colors">
            FAQs
          </Link>

          <p className="font-medium mt-3">Follow</p>
          <div className="flex gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-gold transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-6 py-4">
        <p className="text-xs text-muted text-center">
          &copy; {new Date().getFullYear()} Cosmos Scents. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
