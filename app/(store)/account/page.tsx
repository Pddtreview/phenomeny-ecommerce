"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

type OrderSummary = {
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
};

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhone = useMemo(
    () => phone.replace(/\D/g, "").slice(-10),
    [phone]
  );

  const onLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrders([]);

    if (normalizedPhone.length !== 10) {
      setError("Please enter a valid 10 digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error("Could not fetch orders. Please try again.");
      }
      setOrders((json?.orders ?? []) as OrderSummary[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            Nauvarah
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Your Orders
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Enter your phone number to view your order history.
          </p>

          <form onSubmit={onLookup} className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Phone number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                maxLength={14}
                placeholder="10 digit phone"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  outlineColor: PRIMARY,
                }}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Looking up..." : "Find Orders"}
            </button>
          </form>
        </div>

        <div className="mt-6">
          {orders.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              {loading ? "" : "No orders to show yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.order_number}
                  href={`/track/${encodeURIComponent(o.order_number)}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {o.order_number}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(o.created_at).toLocaleDateString("en-IN")} •{" "}
                        {String(o.order_status).replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Payment: {String(o.payment_status).replaceAll("_", " ")}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-sm font-bold"
                      style={{ color: PRIMARY }}
                    >
                      ₹{Number(o.total).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

