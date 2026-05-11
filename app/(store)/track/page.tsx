'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

const steps = [
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

type Step = (typeof steps)[number];

type TrackOrderItem = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type TrackOrderAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

type TrackOrder = {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string | null;
  total: number;
  awb_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  address: TrackOrderAddress | null;
  items: TrackOrderItem[];
};

type TrackResponse =
  | {
      success: true;
      type: "order" | "phone";
      orders: TrackOrder[];
    }
  | {
      success: false;
      error: string;
    };

function stepIndex(status: string | null | undefined) {
  const idx = steps.indexOf((status ?? "") as Step);
  return idx === -1 ? 0 : idx;
}

function statusColors(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "pending") {
    return { bg: "#e5e7eb", text: "#4b5563" };
  }
  if (s === "confirmed") {
    return { bg: "#dbeafe", text: "#1d4ed8" };
  }
  if (s === "processing") {
    return { bg: "#fef9c3", text: "#a16207" };
  }
  if (s === "shipped") {
    return { bg: "#f3e8ff", text: "#6b21a8" };
  }
  if (s === "out_for_delivery") {
    return { bg: "#ffedd5", text: "#c05621" };
  }
  if (s === "delivered") {
    return { bg: "#dcfce7", text: "#16a34a" };
  }
  if (s === "cancelled") {
    return { bg: "#fee2e2", text: "#b91c1c" };
  }
  if (s === "rto") {
    return { bg: "#fee2e2", text: "#b91c1c" };
  }
  if (s === "ndr") {
    return { bg: "#ffedd5", text: "#c05621" };
  }
  return { bg: "#e5e7eb", text: "#4b5563" };
}

function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "Pending";
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("en-IN");
  } catch {
    return value;
  }
}

function formatCurrency(value: number) {
  return (
    <>
      <RupeeSymbol />
      {Number(value || 0).toLocaleString("en-IN")}
    </>
  );
}

export default function PublicTrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrackResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    const trimmedOrder = orderNumber.trim();
    const normalizedPhone = phone.replace(/\D/g, "");

    if (!trimmedOrder && !normalizedPhone) {
      setError("Enter order number or phone");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: trimmedOrder || undefined,
          phone: normalizedPhone || undefined,
        }),
      });
      const json: TrackResponse = await res.json();
      if (!res.ok || !("success" in json) || !json.success) {
        setError(
          "error" in json && json.error
            ? json.error
            : "Could not find order. Please check details and try again."
        );
        return;
      }
      setData(json);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const orders =
    data && "success" in data && data.success ? data.orders : undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="w-full border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            ← Back to home
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Track Order
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-zinc-900">
            Track your order
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Enter your order number or the phone number used while placing the
            order.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-600">
                Order number
              </label>
              <input
                type="text"
                autoComplete="off"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
                placeholder="e.g. NVABC1234"
              />
              <p className="text-xs text-zinc-400">
                You can find this in your order confirmation SMS or email.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-zinc-600">
                Phone number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
                placeholder="10 digit phone"
              />
              <p className="text-xs text-zinc-400">
                Enter the number used while placing the order to see recent
                orders.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-zinc-500">
                You can fill either{" "}
                <span className="font-semibold text-zinc-700">
                  order number
                </span>{" "}
                or{" "}
                <span className="font-semibold text-zinc-700">
                  phone number
                </span>
                . If both are filled, order number will be used.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-70 md:mt-0"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? "Searching…" : "Track order"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </section>

        {orders && orders.length > 0 && (
          <section className="mt-6 space-y-4">
            {orders.map((order) => {
              const idx = stepIndex(order.order_status);
              const progressPct =
                steps.length > 1 ? (idx / (steps.length - 1)) * 100 : 0;
              const colors = statusColors(order.order_status);
              const awb = order.awb_number ?? "";

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Order
                      </p>
                      <p className="mt-1 text-base font-bold text-zinc-900">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Placed on {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Total amount</p>
                      <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {formatStatusLabel(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="relative h-2 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${progressPct}%`, backgroundColor: GOLD }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-5 text-center text-[11px]">
                      {steps.map((s, i) => {
                        const isCurrent = i === idx;
                        const isDone = i < idx;
                        return (
                          <div key={s} className="px-1">
                            <div
                              className="mx-auto mb-1 h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  isDone || isCurrent ? GOLD : "#e5e7eb",
                              }}
                            />
                            <span
                              className="block"
                              style={{
                                color: isDone || isCurrent ? GOLD : "#6b7280",
                                fontWeight: isCurrent ? 700 : 500,
                              }}
                            >
                              {s === "out_for_delivery"
                                ? "Out for delivery"
                                : s === "confirmed"
                                  ? "Confirmed"
                                  : s === "processing"
                                    ? "Processing"
                                    : s === "shipped"
                                      ? "Shipped"
                                      : "Delivered"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Shipping details
                      </h2>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">AWB</span>
                          <span className="font-medium text-zinc-900">
                            {awb || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Courier</span>
                          <span className="font-medium text-zinc-900">
                            {order.courier_name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Tracking link</span>
                          {order.tracking_url ? (
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium hover:underline"
                              style={{ color: PRIMARY }}
                            >
                              Open
                            </a>
                          ) : awb ? (
                            <a
                              href={`https://shiprocket.co/tracking/${encodeURIComponent(
                                awb
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium hover:underline"
                              style={{ color: PRIMARY }}
                            >
                              Track on Shiprocket
                            </a>
                          ) : (
                            <span className="font-medium text-zinc-900">—</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Delivery address
                      </h2>
                      {order.address ? (
                        <div className="mt-3 text-sm text-zinc-700">
                          <p className="font-semibold text-zinc-900">
                            {order.address.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {order.address.phone}
                          </p>
                          <p className="mt-2">{order.address.line1}</p>
                          {order.address.line2 && <p>{order.address.line2}</p>}
                          <p className="mt-2">
                            {order.address.city}, {order.address.state}{" "}
                            {order.address.pincode}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-500">—</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-100 pt-4">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Items ordered
                    </h2>
                    {order.items.length === 0 ? (
                      <p className="mt-3 text-sm text-zinc-500">—</p>
                    ) : (
                      <ul className="mt-3 space-y-3 text-sm">
                        {order.items.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div>
                              <p className="font-medium text-zinc-900">
                                {it.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Qty {it.quantity}
                                {it.sku ? ` • ${it.sku}` : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-zinc-500">Price</p>
                              <p className="font-semibold text-zinc-900">
                                {formatCurrency(it.total_price)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {orders && orders.length === 0 && !error && (
          <p className="mt-6 text-sm text-zinc-600">
            No orders found for the details entered. Please check the order
            number or phone and try again.
          </p>
        )}
      </main>
    </div>
  );
}

