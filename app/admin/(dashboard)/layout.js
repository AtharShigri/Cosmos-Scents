import Link from "next/link";
import { logoutAdmin } from "@/lib/actions/auth";
import { getPendingReviewCount } from "@/lib/reviews";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default async function AdminLayout({ children }) {
  // Best-effort -- a DB hiccup here shouldn't take down the whole admin
  // shell, just the little badge.
  const pendingReviews = await getPendingReviewCount().catch(() => 0);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-line p-6 flex sm:flex-col gap-6 justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-lg mb-3">Cosmos Scents</p>
          <nav className="flex sm:flex-col gap-1 flex-wrap">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted hover:text-ink px-2 py-1.5 rounded-sm hover:bg-paper-raised transition-colors flex items-center gap-2"
              >
                {item.label}
                {item.href === "/admin/reviews" && pendingReviews > 0 ? (
                  <span className="text-xs bg-gold-soft text-gold rounded-full px-1.5 py-0.5 leading-none">
                    {pendingReviews}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-ink cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
