import Link from "next/link";
import { getAnalyticsData } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();
  const { metrics, topProducts, topCities, pipeline, categoryBreakdown, insights } = data;

  const totalCatRevenue = categoryBreakdown.reduce((s, c) => s + c.revenue, 0) || 1;
  const pipelineTotal =
    pipeline.pending +
      pipeline.confirmed +
      pipeline.processing +
      pipeline.shipped +
      pipeline.delivered +
      pipeline.cancelled || 1;

  return (
    <div className="flex flex-col gap-10">
      {/* Executive KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Total Gross Sales
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-ink">
            Rs {metrics.totalRevenue.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Across all confirmed customer orders</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Fulfillment Completion Rate
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-emerald-700">
            {metrics.fulfillmentRate}%
          </span>
          <span className="text-xs text-muted mt-1">
            {metrics.completedOrders} of {metrics.totalOrders} orders successfully delivered
          </span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Average Order Value (AOV)
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-gold">
            Rs {metrics.aov.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Net customer basket size</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Regional Footprint
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-ink">
            {topCities.length} Cities
          </span>
          <span className="text-xs text-muted mt-1">Gilgit-Baltistan to metropolitan centers</span>
        </div>
      </div>

      {/* Primary Analytics Grid: Collection Share & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Breakdown */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-ink">
                Revenue by Fragrance Collection
              </h3>
              <p className="text-xs text-muted">
                Contribution breakdown across artisanal scent families
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs text-gold hover:underline font-medium"
            >
              Collections &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-muted py-4">No collection revenue registered yet.</p>
            ) : (
              categoryBreakdown.map((cat) => {
                const pct = Math.round((cat.revenue / totalCatRevenue) * 100);
                return (
                  <div key={cat.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-ink">{cat.name}</span>
                      <span className="font-mono text-muted">
                        Rs {cat.revenue.toLocaleString()}{" "}
                        <span className="text-ink font-semibold">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                      <div
                        className="bg-gold h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>{cat.units} bottles sold</span>
                      <span>Share: {pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fulfillment Pipeline Funnel */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-ink">
                Order Pipeline & Velocity Funnel
              </h3>
              <p className="text-xs text-muted">
                Active status distribution across courier fulfillment stages
              </p>
            </div>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline font-medium">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Pending Verification
              </span>
              <span className="font-heading text-xl font-semibold text-ink">{pipeline.pending}</span>
              <span className="text-[10px] text-muted font-mono">
                {Math.round((pipeline.pending / pipelineTotal) * 100)}% of queue
              </span>
            </div>

            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Confirmed
              </span>
              <span className="font-heading text-xl font-semibold text-gold">
                {pipeline.confirmed}
              </span>
              <span className="text-[10px] text-muted font-mono">
                {Math.round((pipeline.confirmed / pipelineTotal) * 100)}% of queue
              </span>
            </div>

            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                In Production
              </span>
              <span className="font-heading text-xl font-semibold text-ink">
                {pipeline.processing}
              </span>
              <span className="text-[10px] text-muted font-mono">
                {Math.round((pipeline.processing / pipelineTotal) * 100)}% of queue
              </span>
            </div>

            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Dispatched / Courier
              </span>
              <span className="font-heading text-xl font-semibold text-blue-700">
                {pipeline.shipped}
              </span>
              <span className="text-[10px] text-muted font-mono">In transit</span>
            </div>

            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Delivered
              </span>
              <span className="font-heading text-xl font-semibold text-emerald-700">
                {pipeline.delivered}
              </span>
              <span className="text-[10px] text-muted font-mono">Completed</span>
            </div>

            <div className="p-3.5 rounded border border-line bg-paper flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Cancelled / Void
              </span>
              <span className="font-heading text-xl font-semibold text-rose-700">
                {pipeline.cancelled}
              </span>
              <span className="text-[10px] text-muted font-mono">Returns & cancellations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Analytics Grid: Geographic Demand & Top Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional City Distribution */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4">
          <div>
            <h3 className="font-heading text-base font-semibold text-ink">
              Geographic Demand & Regional Distribution
            </h3>
            <p className="text-xs text-muted">
              Top customer delivery destinations across Pakistan
            </p>
          </div>

          <div className="border border-line rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-line text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">City / Region</th>
                  <th className="px-3.5 py-2.5 font-semibold text-center">Orders</th>
                  <th className="px-3.5 py-2.5 font-semibold text-right">Revenue (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topCities.slice(0, 6).map((city) => (
                  <tr key={city.city} className="hover:bg-paper/60 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-ink flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      {city.city}
                    </td>
                    <td className="px-3.5 py-2 text-center font-mono text-muted">{city.count}</td>
                    <td className="px-3.5 py-2 text-right font-mono font-semibold text-ink">
                      Rs {city.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Fragrance Formulations */}
        <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-ink">
                Best-Selling Fragrance Leaderboard
              </h3>
              <p className="text-xs text-muted">
                Ranked by volume velocity and total customer revenue
              </p>
            </div>
            <Link href="/admin/products" className="text-xs text-gold hover:underline font-medium">
              Catalog &rarr;
            </Link>
          </div>

          <div className="border border-line rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-line text-muted uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2.5 font-semibold">Fragrance SKU</th>
                  <th className="px-3.5 py-2.5 font-semibold text-center">Bottles</th>
                  <th className="px-3.5 py-2.5 font-semibold text-right">Revenue (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topProducts.slice(0, 6).map((prod, idx) => (
                  <tr key={prod.name} className="hover:bg-paper/60 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-ink">
                      <span className="font-mono text-gold mr-2">#{idx + 1}</span>
                      {prod.name}
                    </td>
                    <td className="px-3.5 py-2 text-center font-mono text-muted">
                      {prod.unitsSold} units
                    </td>
                    <td className="px-3.5 py-2 text-right font-mono font-semibold text-ink">
                      Rs {prod.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actionable Data-Driven Executive Directives */}
      <div className="p-6 rounded-md border border-line bg-paper-raised flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <h3 className="font-heading text-base font-semibold text-ink">
              Data-Driven Operational Directives
            </h3>
          </div>
          <p className="text-xs text-muted">
            Automated intelligence synthesized from real sales velocity, stock levels, and regional demand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights && insights.length > 0 ? (
            insights.map((ins, i) => (
              <div
                key={i}
                className="p-4 rounded-md border border-line bg-paper flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded w-fit bg-gold-soft text-gold border border-gold/30">
                    {ins.type}
                  </span>
                  <h4 className="font-heading text-sm font-semibold text-ink">{ins.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{ins.message}</p>
                </div>
                {ins.actionHref ? (
                  <Link
                    href={ins.actionHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:text-ink transition-colors"
                  >
                    {ins.actionText || "View Detail"} &rarr;
                  </Link>
                ) : null}
              </div>
            ))
          ) : (
            <div className="p-4 rounded-md border border-line bg-paper text-xs text-muted col-span-3">
              Catalog and transaction metrics are operating within baseline thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}