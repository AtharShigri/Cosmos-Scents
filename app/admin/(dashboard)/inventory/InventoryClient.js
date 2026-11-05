"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { quickAdjustStock, autoReplenishAllLowStock } from "@/lib/actions/inventory";

const STATUS_BADGE = {
  healthy: "bg-emerald-50 text-emerald-800 border-emerald-200",
  low: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-orange-50 text-orange-800 border-orange-200",
  out_of_stock: "bg-rose-50 text-rose-800 border-rose-200",
};

const STATUS_LABEL = {
  healthy: "Optimal",
  low: "Low Stock",
  critical: "Critical (≤5)",
  out_of_stock: "Out of Stock",
};

export default function InventoryClient({ initialData }) {
  const [filter, setFilter] = useState("all");
  const [products, setProducts] = useState(initialData.products);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [isPending, startTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState(null);

  // Quick stock adjuster
  const handleAdjust = (productId, delta) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id !== productId) return p;
        const newStock = Math.max(0, p.stock + delta);
        let health = "healthy";
        if (newStock === 0) health = "out_of_stock";
        else if (newStock <= 5) health = "critical";
        else if (newStock <= 10) health = "low";

        return {
          ...p,
          stock: newStock,
          health,
          reorderNeeded: Math.max(0, p.parLevel - newStock),
          valuation: newStock * p.price,
        };
      })
    );

    startTransition(async () => {
      try {
        await quickAdjustStock(productId, delta);
        setActionFeedback({ type: "success", message: `Stock updated (${delta > 0 ? `+${delta}` : delta})` });
        setTimeout(() => setActionFeedback(null), 3000);
      } catch (err) {
        setActionFeedback({ type: "error", message: err.message || "Failed to update stock" });
      }
    });
  };

  // Automated Batch Replenishment
  const handleAutoReplenish = () => {
    if (!confirm("Run Automated Replenishment? This will batch-restock all items below par (10 units) to target par level (25 units).")) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await autoReplenishAllLowStock(25);
        setActionFeedback({
          type: "success",
          message: `Automated replenishment complete! Restocked ${res.updatedCount} perfume SKUs to 25 units.`,
        });
        // Optimistic refresh
        setProducts((prev) =>
          prev.map((p) =>
            p.stock < 10
              ? {
                  ...p,
                  stock: 25,
                  health: "healthy",
                  reorderNeeded: 0,
                  valuation: 25 * p.price,
                }
              : p
          )
        );
        setTimeout(() => setActionFeedback(null), 4000);
      } catch (err) {
        setActionFeedback({ type: "error", message: err.message || "Replenishment failed" });
      }
    });
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "all") return true;
    if (filter === "low") return p.health === "low" || p.health === "critical";
    if (filter === "out") return p.health === "out_of_stock";
    if (filter === "healthy") return p.health === "healthy";
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Feedback Alert Bar */}
      {actionFeedback ? (
        <div
          className={`px-4 py-3 rounded-md text-sm border flex items-center justify-between transition-all ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs uppercase font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Total Inventory Units
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-ink">
            {metrics.totalUnits.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Across {metrics.totalSKUs} artisanal SKUs</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Inventory Valuation
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-gold">
            Rs {metrics.totalValuation.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">At active retail list price</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Low Stock Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-semibold text-amber-700">
              {metrics.lowStockCount}
            </span>
            <span className="text-xs text-muted">under 10 units</span>
          </div>
          <span className="text-xs text-muted mt-1">Needs production batching</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Out of Stock (Zero)
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-heading text-2xl sm:text-3xl font-semibold ${
                metrics.outOfStockCount > 0 ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {metrics.outOfStockCount}
            </span>
            <span className="text-xs text-muted">critical</span>
          </div>
          <span className="text-xs text-muted mt-1">Direct revenue loss risk</span>
        </div>
      </div>

      {/* Automation Action Bar */}
      <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
            <h3 className="font-heading text-base font-semibold text-ink">
              Automated Batch Replenishment Engine
            </h3>
          </div>
          <p className="text-xs text-muted max-w-xl">
            Automatically calculates stock deficit against artisanal par levels (25 units) and issues single-click batch restocks to prevent out-of-stock downtime.
          </p>
        </div>

        <button
          onClick={handleAutoReplenish}
          disabled={isPending || metrics.lowStockCount === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-ink text-paper hover:bg-ink/85 disabled:opacity-50 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isPending ? "Executing Replenishment..." : `Auto-Replenish Low Stock (${metrics.lowStockCount})`}
        </button>
      </div>

      {/* Filter Tabs & Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              All SKUs ({products.length})
            </button>
            <button
              onClick={() => setFilter("low")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "low"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              Low / Critical Stock ({metrics.lowStockCount})
            </button>
            <button
              onClick={() => setFilter("out")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "out"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              Out of Stock ({metrics.outOfStockCount})
            </button>
            <button
              onClick={() => setFilter("healthy")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "healthy"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              Healthy ({metrics.healthyCount})
            </button>
          </div>

          <span className="text-xs text-muted">
            Target Par Level: <strong className="text-ink">25 units / SKU</strong>
          </span>
        </div>

        {/* Master Stock Table */}
        <div className="border border-line rounded-md overflow-hidden bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-line text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Fragrance SKU</th>
                <th className="px-4 py-3 font-semibold">Collection</th>
                <th className="px-4 py-3 font-semibold text-center">Stock Level</th>
                <th className="px-4 py-3 font-semibold">Health Status</th>
                <th className="px-4 py-3 font-semibold">Par Deficit</th>
                <th className="px-4 py-3 font-semibold text-right">Valuation</th>
                <th className="px-4 py-3 font-semibold text-right">Quick Automation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredProducts.map((p) => {
                const stockPct = Math.min(100, Math.round((p.stock / p.parLevel) * 100));

                return (
                  <tr key={p._id} className="hover:bg-paper/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="hover:text-gold transition-colors font-semibold"
                        >
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-muted">
                          {p.size} • Rs {p.price.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-muted">{p.categoryName}</td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono font-semibold text-sm">
                          {p.stock}{" "}
                          <span className="text-[10px] text-muted font-normal">/ {p.parLevel}</span>
                        </span>
                        <div className="w-20 bg-line/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.stock === 0
                                ? "bg-rose-500"
                                : p.stock <= 5
                                ? "bg-orange-500"
                                : p.stock <= 10
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_BADGE[p.health]
                        }`}
                      >
                        {STATUS_LABEL[p.health]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs font-mono">
                      {p.reorderNeeded > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          +{p.reorderNeeded} needed
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Par satisfied</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs text-muted">
                      Rs {p.valuation.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjust(p._id, -1)}
                          disabled={isPending || p.stock === 0}
                          title="Audit deduction (-1)"
                          className="w-7 h-7 rounded border border-line bg-paper hover:bg-line/40 text-xs font-semibold text-muted hover:text-ink cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjust(p._id, 5)}
                          disabled={isPending}
                          title="Quick batch (+5)"
                          className="px-2 h-7 rounded border border-line bg-paper hover:bg-gold-soft hover:border-gold/40 text-xs font-semibold text-ink cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjust(p._id, 10)}
                          disabled={isPending}
                          title="Carton restock (+10)"
                          className="px-2 h-7 rounded border border-line bg-paper hover:bg-gold-soft hover:border-gold/40 text-xs font-semibold text-ink cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjust(p._id, p.reorderNeeded || 5)}
                          disabled={isPending || p.reorderNeeded === 0}
                          title="Restock to Par (25 units)"
                          className="px-2.5 h-7 rounded bg-ink hover:bg-ink/85 text-xs font-semibold text-paper cursor-pointer disabled:opacity-30 transition-colors"
                        >
                          Par
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
