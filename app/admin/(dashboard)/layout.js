import { getPendingReviewCount } from "@/lib/reviews";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const pendingReviews = await getPendingReviewCount().catch(() => 0);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col lg:flex-row antialiased selection:bg-gold/20 selection:text-ink">
      <AdminSidebar pendingReviews={pendingReviews} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full">{children}</main>
      </div>
    </div>
  );
}