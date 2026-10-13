"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function StatusSelect({ orderId, status }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="border border-line rounded-md px-3 py-1.5 text-sm bg-paper focus:outline-none focus:border-ink disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
