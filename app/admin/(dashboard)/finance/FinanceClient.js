"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reconcileTransaction } from "@/lib/actions/finance";

const FINANCIAL_BADGE = {
  settled: "bg-emerald-50 text-emerald-800 border-emerald-200",
  in_transit: "bg-blue-50 text-blue-800 border-blue-200",
  verification_required: "bg-amber-50 text-amber-800 border-amber-200 animate-pulse",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const FINANCIAL_LABEL = {
  settled: "Settled / Realized",
  in_transit: "COD Escrow (In-Transit)",
  verification_required: "Bank Slip Verification",
  cancelled: "Voided / Cancelled",
};

export default function FinanceClient({ initialData }) {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState(initialData.transactions);
  const [metrics, setMetrics] = useState(initialData.metrics);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(null);

  const handleReconcile = (orderId, targetStatus) => {
    startTransition(async () => {
      try {
        await reconcileTransaction(orderId, targetStatus);
        setToast({ type: "success", message: `Transaction reconciled to ${targetStatus}` });
        setTransactions((prev) =>
          prev.map((t) => {
            if (t.orderId !== orderId) return p;
            let finStatus = "in_transit";
            if (targetStatus === "delivered") finStatus = "settled";
            else if (targetStatus === "cancelled") finStatus = "cancelled";
            return { ...t, orderStatus: targetStatus, financialStatus: finStatus };
          })
        );
        setTimeout(() => setToast(null), 3500);
      } catch (err) {
        setToast({ type: "error", message: err.message || "Reconciliation failed" });
      }
    });
  };

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "settled") return t.financialStatus === "settled";
    if (filter === "in_transit") return t.financialStatus === "in_transit";
    if (filter === "verification") return t.financialStatus === "verification_required";
    return true;
  });

  const totalPaymentVol = (metrics.codTotal || 0) + (metrics.bankTotal || 0);
  const codPct = totalPaymentVol > 0 ? Math.round((metrics.codTotal / totalPaymentVol) * 100) : 0;
  const bankPct = totalPaymentVol > 0 ? 100 - codPct : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Toast Notification */}
      {toast ? (
        <div
          className={`px-4 py-3 rounded-md text-sm border flex items-center justify-between transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs uppercase font-semibold opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* KPI Inflow Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Gross Transaction Volume
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-ink">
            Rs {metrics.grossRevenue.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Across all order inflows</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Settled Cash (Realized)
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-emerald-700">
            Rs {metrics.settledCash.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Successfully delivered & remitted</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            COD In-Transit Escrow
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-blue-700">
            Rs {metrics.inTransitCash.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Held by courier dispatch partners</span>
        </div>

        <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-1 shadow-2xs">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Average Order Value (AOV)
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-semibold text-gold">
            Rs {metrics.aov.toLocaleString()}
          </span>
          <span className="text-xs text-muted mt-1">Average basket spend</span>
        </div>
      </div>

      {/* Payment Gateway Split Module */}
      <div className="p-5 rounded-md border border-line bg-paper-raised flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-semibold text-ink">
              Payment Rail Distribution & Settlement Matrix
            </h3>
            <p className="text-xs text-muted">
              Live split between Cash on Delivery (COD) and Direct Bank Wire transfers
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-ink" />
              COD: {codPct}% (Rs {metrics.codTotal.toLocaleString()})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gold" />
              Bank Transfer: {bankPct}% (Rs {metrics.bankTotal.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-line rounded-full overflow-hidden flex">
          <div
            className="bg-ink h-full transition-all"
            style={{ width: `${codPct}%` }}
            title={`COD: ${codPct}%`}
          />
          <div
            className="bg-gold h-full transition-all"
            style={{ width: `${bankPct}%` }}
            title={`Bank Transfer: ${bankPct}%`}
          />
        </div>
      </div>

      {/* Transaction Ledger Table */}
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
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setFilter("settled")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "settled"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              Settled
            </button>
            <button
              onClick={() => setFilter("in_transit")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "in_transit"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              In-Transit Escrow
            </button>
            <button
              onClick={() => setFilter("verification")}
              className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                filter === "verification"
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-muted border-line hover:text-ink"
              }`}
            >
              Bank Verification Required
            </button>
          </div>

          <span className="text-xs text-muted font-mono">
            Audit Ledger • Real-time MongoDB Stream
          </span>
        </div>

        <div className="border border-line rounded-md overflow-hidden bg-paper-raised">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-line text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">TXN ID</th>
                <th className="px-4 py-3 font-semibold">Customer / Location</th>
                <th className="px-4 py-3 font-semibold">Channel</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Settlement Status</th>
                <th className="px-4 py-3 font-semibold">Order Stage</th>
                <th className="px-4 py-3 font-semibold text-right">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((t) => (
                <tr key={t.txnId} className="hover:bg-paper/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-xs text-ink">{t.txnId}</span>
                      <Link
                        href={`/admin/orders/${t.orderId}`}
                        className="text-[11px] text-gold hover:underline font-mono"
                      >
                        Order #{t.orderId.slice(-6).toUpperCase()}
                      </Link>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-ink">{t.customerName}</span>
                      <span className="text-xs text-muted">
                        {t.customerCity} • {t.customerPhone}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        t.paymentMethodRaw === "cod"
                          ? "bg-stone-100 text-stone-800 border border-stone-300"
                          : "bg-gold-soft text-gold border border-gold/30 font-semibold"
                      }`}
                    >
                      {t.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-xs text-ink">
                    Rs {t.total.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        FINANCIAL_BADGE[t.financialStatus]
                      }`}
                    >
                      {FINANCIAL_LABEL[t.financialStatus]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs capitalize text-muted">
                    {t.orderStatus}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {t.financialStatus === "verification_required" ? (
                        <button
                          onClick={() => handleReconcile(t.orderId, "confirmed")}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded bg-gold text-ink font-semibold text-xs hover:bg-gold/85 cursor-pointer shadow-xs transition-colors"
                        >
                          Verify Payment
                        </button>
                      ) : t.financialStatus === "in_transit" ? (
                        <button
                          onClick={() => handleReconcile(t.orderId, "delivered")}
                          disabled={isPending}
                          className="px-2.5 py-1 rounded border border-line bg-paper hover:bg-emerald-50 hover:text-emerald-800 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Mark Settled
                        </button>
                      ) : (
                        <Link
                          href={`/admin/orders/${t.orderId}`}
                          className="text-xs text-muted hover:text-gold transition-colors font-medium"
                        >
                          View Order &rarr;
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}