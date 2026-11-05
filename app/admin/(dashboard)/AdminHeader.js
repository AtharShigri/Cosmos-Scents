"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TITLE_MAP = {
  "/admin": { title: "Executive Overview", subtitle: "Operational metrics & live inventory signals" },
  "/admin/analytics": { title: "Analytics & Intelligence", subtitle: "Data-driven decisions, category mix & regional demand" },
  "/admin/finance": { title: "Finance & Reconciliation", subtitle: "Payment ledger, COD cash in transit & settlement tracking" },
  "/admin/inventory": { title: "Inventory Automation", subtitle: "Real-time stock monitoring & automated batch replenishment" },
  "/admin/products": { title: "Fragrance Catalog", subtitle: "Formulations, pricing, volumes & active visibility" },
  "/admin/products/new": { title: "Add Fragrance Formulation", subtitle: "New perfume profile, notes, and pricing" },
  "/admin/categories": { title: "Collections", subtitle: "Artisanal olfactive families and curated tiers" },
  "/admin/orders": { title: "Orders & Fulfillment", subtitle: "Customer shipments, courier status & dispatch pipeline" },
  "/admin/reviews": { title: "Review Moderation", subtitle: "Customer testimonials awaiting authenticity verification" },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString("en-US", {
          timeZone: "Asia/Karachi",
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Karachi",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) +
          " PKT"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Match title for dynamic routes like /admin/orders/[id] or /admin/products/[id]/edit
  let matchedMeta = TITLE_MAP[pathname];
  if (!matchedMeta) {
    if (pathname.startsWith("/admin/orders/")) {
      matchedMeta = { title: "Order Details", subtitle: "Order fulfillment and delivery tracking" };
    } else if (pathname.startsWith("/admin/products/")) {
      matchedMeta = { title: "Edit Fragrance", subtitle: "Update formulation details, stock and pricing" };
    } else {
      matchedMeta = { title: "Operations Console", subtitle: "Cosmos Scents Executive Portal" };
    }
  }

  return (
    <header className="border-b border-line bg-paper px-6 sm:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted mb-1 font-mono">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-gold uppercase tracking-wider font-semibold">
            {pathname.replace("/admin", "").replace("/", "") || "OVERVIEW"}
          </span>
        </div>
        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-ink leading-tight">
          {matchedMeta.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-0.5">{matchedMeta.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {timeStr ? (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md border border-line bg-paper-raised text-xs text-muted font-mono">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>{timeStr}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-line bg-paper hover:bg-paper-raised hover:text-gold text-ink transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Stock Health
          </Link>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-ink text-paper hover:bg-ink/85 transition-colors shadow-xs"
          >
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Fragrance
          </Link>
        </div>
      </div>
    </header>
  );
}
