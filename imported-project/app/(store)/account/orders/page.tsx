 'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#1B3A6B";

type AuthCustomer = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
};

type AuthMeResponse =
  | { authenticated: false }
  | { authenticated: true; customer: AuthCustomer };

type OrderSummary = {
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
};

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AccountOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("All");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const json: AuthMeResponse = await res.json();
        if (!json.authenticated) {
          if (!cancelled) router.replace("/account");
          return;
        }
        if (cancelled) return;
        setCustomer(json.customer);

        const ordersRes = await fetch("/api/orders/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: json.customer.phone }),
        });
        const ordersJson = await ordersRes.json();
        setOrders((ordersJson.orders ?? []) as OrderSummary[]);
      } catch {
        router.replace("/account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    const f = filter.toLowerCase();
    return orders.filter(
      (o) => String(o.order_status || "").toLowerCase() === f
    );
  }, [orders, filter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600">
          Loading orders...
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">My Orders</h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {STATUS_FILTERS.map((s) => {
              const isActive = filter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className="rounded-full px-3 py-1 font-medium"
                  style={
                    isActive
                      ? { backgroundColor: PRIMARY, color: "white" }
                      : { backgroundColor: "#e5e7eb", color: "#374151" }
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  Order #
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600">
                  Payment
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-zinc-500"
                  >
                    No orders found for this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.order_number}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={"/track/" + encodeURIComponent(o.order_number)}
                        className="font-semibold text-zinc-900 hover:underline"
                      >
                        {o.order_number}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {String(o.order_status).replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {String(o.payment_status).replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      <span className="font-inter rupee">₹</span>
                      {Number(o.total).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

