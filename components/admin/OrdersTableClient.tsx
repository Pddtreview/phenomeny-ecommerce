'use client'

import { useMemo, useState } from "react";
import Link from "next/link";

const PRIMARY = "#1B3A6B";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  total: number;
  payment_method: string | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#6b7280",
  confirmed: "#1B3A6B",
  processing: "#1B3A6B",
  shipped: "#b45309",
  out_for_delivery: "#b45309",
  delivered: "#15803d",
  cancelled: "#b91c1c",
  rto: "#b91c1c",
};

const STATUS_OPTIONS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "rto",
] as const;

const PAYMENT_OPTIONS = ["all", "prepaid", "cod"] as const;

export function OrdersTableClient({ orders }: { orders: OrderRow[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");

    return orders.filter((o) => {
      if (statusFilter !== "all") {
        if ((o.order_status ?? "") !== statusFilter) return false;
      }
      if (paymentFilter !== "all") {
        if ((o.payment_method ?? "") !== paymentFilter) return false;
      }
      if (!q) return true;

      const orderMatch = o.order_number.toLowerCase().includes(q);
      const phoneMatch = (o.phone ?? "").replace(/\D/g, "").includes(qDigits);
      return orderMatch || phoneMatch;
    });
  }, [orders, statusFilter, paymentFilter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Search (order # or phone)
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. NVABC123 or 98765…"
            className="w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Order status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full max-w-[180px] rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All" : s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Payment method
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full max-w-[160px] rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All" : p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Order #</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Customer</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Total</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Payment</th>
              <th className="px-4 py-3 font-medium text-zinc-600">
                Order Status
              </th>
              <th className="px-4 py-3 font-medium text-zinc-600">
                Payment Status
              </th>
              <th className="px-4 py-3 font-medium text-zinc-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium hover:underline"
                    style={{ color: PRIMARY }}
                  >
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-900">{o.customer_name}</td>
                <td className="px-4 py-3 text-zinc-600">{o.phone}</td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <span className="font-inter rupee">₹</span>
                  {Number(o.total).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {String(o.payment_method ?? "").replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[String(o.order_status)] ?? "#6b7280",
                    }}
                  >
                    {String(o.order_status ?? "").replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {String(o.payment_status ?? "").replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(o.created_at).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No orders match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}

