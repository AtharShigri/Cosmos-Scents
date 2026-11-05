"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { useCart } from "@/context/CartContext";

const ANNOUNCEMENTS = [
  " Complimentary express shipping across Pakistan on orders over Rs. 3,500",
  " Handcrafted & bottled in Gilgit-Baltistan — Artisanal luxury Extrait De Parfum",
  " Special Launch Privilege: Enjoy 10% off your first order with code COSMOS10",
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Fragrances" },
  { href: "/products?sort=rating_desc", label: "Best Sellers" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQs" },
];

function SearchIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function CartIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.19-.578-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}

function SparklesIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams?.get("sort") || "";
  const currentSearch = searchParams?.get("search") || "";

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Announcement bar state
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Search input state (universal AI search)
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Sync search input if URL changes
  useEffect(() => {
    if (currentSearch !== searchQuery) {
      setSearchQuery(currentSearch);
    }
  }, [currentSearch]);

  // Auto-rotate announcement bar
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setIsFading(false);
      }, 300);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Don't render public header in admin dashboard
  if (pathname?.startsWith("/admin")) return null;

  function handleNextAnnouncement() {
    setIsFading(true);
    setTimeout(() => {
      setActiveAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
      setIsFading(false);
    }, 200);
  }

  function handlePrevAnnouncement() {
    setIsFading(true);
    setTimeout(() => {
      setActiveAnnouncement((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
      setIsFading(false);
    }, 200);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  }

  function handleOpenChat() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cosmos-chat"));
    }
  }

  function isLinkActive(linkHref) {
    if (linkHref === "/") {
      return pathname === "/";
    }
    if (linkHref === "/products?sort=rating_desc") {
      return pathname === "/products" && currentSort === "rating_desc";
    }
    if (linkHref === "/products") {
      return pathname === "/products" && currentSort !== "rating_desc";
    }
    const cleanHref = linkHref.split("?")[0];
    return pathname === cleanHref || pathname?.startsWith(cleanHref + "/");
  }

  return (
    <header className="w-full bg-paper sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* =========================================================
          BAR 1: Rotating Promotional & Announcement Bar (Thin Bar)
          ========================================================= */}
      <div
        className="w-full bg-paper border-b border-line text-muted py-2 px-4 transition-colors select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs">
          {/* Previous Announcement */}
          <button
            type="button"
            onClick={handlePrevAnnouncement}
            aria-label="Previous announcement"
            className="p-1 hover:text-ink transition-colors cursor-pointer rounded"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>

          {/* Dynamic Announcement Text with Smooth Crossfade */}
          <div className="flex-1 text-center px-4 overflow-hidden">
            <p
              className={`transition-opacity duration-300 font-medium tracking-wide text-[11px] sm:text-xs text-ink/80 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {ANNOUNCEMENTS[activeAnnouncement]}
            </p>
          </div>

          {/* Next Announcement */}
          <button
            type="button"
            onClick={handleNextAnnouncement}
            aria-label="Next announcement"
            className="p-1 hover:text-ink transition-colors cursor-pointer rounded"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================
          BAR 2: Brand, Universal Search, & Actions Bar (Middle Bar)
          ========================================================= */}
      <div className="w-full border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile hamburger toggle (left side on mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 -ml-2 text-ink hover:text-gold transition-colors cursor-pointer"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all ${
                    menuOpen ? "translate-y-[7.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all ${
                    menuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all ${
                    menuOpen ? "-translate-y-[7.5px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          {/* LEFT: Universal Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search with AI (e.g. 'sia serfo', 'woody')..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-paper-raised border border-line rounded-full placeholder:text-muted/70 text-ink focus:outline-none focus:border-ink/70 focus:ring-1 focus:ring-gold/30 transition-all"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-gold transition-colors cursor-pointer"
              >
                <SearchIcon className="w-3.5 h-3.5" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search text"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs leading-none"
                >
                  &times;
                </button>
              )}
            </form>
          </div>

          {/* CENTER: Cosmos Scents Brand Logo */}
          <div className="flex-1 md:flex-initial text-center flex flex-col items-center justify-center shrink-0">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="inline-flex flex-col items-center group py-0.5"
            >
              <Logo size="md" className="group-hover:opacity-90 transition-opacity" />
              <span className="block text-[10px] tracking-[0.28em] uppercase text-muted font-sans font-medium mt-1">
                Gilgit-Baltistan
              </span>
            </Link>
          </div>

          {/* RIGHT: Cart & AI Assistant Actions */}
          <div className="flex-1 md:flex-initial flex items-center justify-end gap-3 sm:gap-4">
            {/* Ask Cosmos AI Button */}
            <button
              type="button"
              onClick={handleOpenChat}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-line hover:border-gold/60 text-ink bg-gold-soft/30 hover:bg-gold-soft/70 rounded-full transition-all cursor-pointer shadow-xs"
              title="Chat with our Cosmos AI Fragrance Advisor"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-gold" />
              <span>Ask Cosmos AI</span>
            </button>

            {/* Shopping Cart Icon with Counter Badge */}
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="relative p-2 text-ink hover:text-gold transition-colors group flex items-center"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <CartIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
              {itemCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-ink text-paper text-[10px] font-bold flex items-center justify-center border border-paper shadow-xs animate-in fade-in zoom-in-75">
                  {itemCount}
                </span>
              ) : (
                <span className="sr-only">0 items in cart</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          BAR 3: Navigation Menu Bar (Full Width & Balanced Spacing)
          ========================================================= */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:block w-full border-b border-line bg-paper"
      >
        <div className="mx-auto max-w-7xl px-6">
          <ul className="flex items-center justify-center gap-8 lg:gap-12 py-3 text-[12px] lg:text-[13px] tracking-[0.14em] uppercase font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative py-1 transition-colors duration-200 group ${
                      isActive ? "text-ink font-semibold" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span>{link.label}</span>
                    {/* Subtle Luxury Underline */}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-gold transition-all duration-300 ${
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}

            {/* Quick Link to AI Assistant in Navigation Bar */}
            <li>
              <button
                type="button"
                onClick={handleOpenChat}
                className="py-1 tracking-[0.14em] uppercase text-muted hover:text-gold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Cosmos AI</span>
                <span className="text-gold text-[10px]">&#10022;</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* =========================================================
          MOBILE DRAWER / MENU PANEL
          ========================================================= */}
      {menuOpen ? (
        <div className="md:hidden border-b border-line bg-paper px-6 py-5 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200 shadow-md">
          {/* Universal Search in Mobile Drawer */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search with AI (e.g. 'sia serfo', 'woody')..."
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-paper-raised border border-line rounded-md placeholder:text-muted/70 text-ink focus:outline-none focus:border-ink"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            >
              <SearchIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-3.5 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-1 transition-colors flex items-center justify-between border-b border-line/40 pb-2.5 ${
                    isActive ? "text-ink font-semibold" : "text-muted hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive ? <span className="text-gold text-xs">&#10022;</span> : null}
                    <span>{link.label}</span>
                  </span>
                  <span className="text-muted text-xs">&rarr;</span>
                </Link>
              );
            })}

            {/* Ask Cosmos AI in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleOpenChat();
              }}
              className="mt-2 w-full py-2.5 px-4 bg-gold-soft/50 border border-gold/40 text-ink rounded-md flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
            >
              <SparklesIcon className="w-4 h-4 text-gold" />
              <span>Ask Cosmos AI Assistant</span>
            </button>
          </nav>

          {/* Quick Info in Mobile Menu */}
          <div className="pt-2 text-xs text-muted flex flex-col gap-1 border-t border-line">
            <p className="font-medium text-ink">Cosmos Scents Pakistan</p>
            <p>Handcrafted Artisanal Fragrances · Gilgit-Baltistan</p>
          </div>
        </div>
      ) : null}
    </header>
  );
}