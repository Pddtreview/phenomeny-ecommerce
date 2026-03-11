import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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

function stepIndex(status: string | null | undefined) {
  const idx = steps.indexOf((status ?? "") as Step);
  return idx === -1 ? 0 : idx;
}

async function getOrder(orderNumber: string) {
  const supabase = await createServerSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, order_status, payment_status, total, awb_number, courier_name, tracking_url, customer_id, address_id"
    )
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, email")
    .eq("id", order.customer_id)
    .single();

  const { data: address } = await supabase
    .from("addresses")
    .select("id, name, phone, line1, line2, city, state, pincode")
    .eq("id", order.address_id)
    .single();

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, sku, quantity, unit_price, total_price, item_type")
    .eq("order_id", order.id);

  return { order, customer, address, items: items ?? [] };
}

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ "order-number": string }>;
}) {
  const { "order-number": orderNumberRaw } = await params;
  const orderNumber = decodeURIComponent(orderNumberRaw || "").trim();

  const data = orderNumber ? await getOrder(orderNumber) : null;

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-bold text-zinc-900">Track your order</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Order not found. Please enter your order number and phone.
          </p>
          <form action="/track" className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Order number
              </label>
              <input
                name="order_number"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="NV..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Phone
              </label>
              <input
                name="phone"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="10 digit phone"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              Search
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-500">
            Tip: You can also open the link from your order confirmation page.
          </p>
        </div>
      </div>
    );
  }

  const { order, address, items } = data;
  const idx = stepIndex(order.order_status);
  const progressPct = (idx / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="w-full px-4 py-10 text-white" style={{ backgroundColor: PRIMARY }}>
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
            ← Back to Home
          </Link>
          <h1 className="mt-3 text-2xl font-bold">Order Tracking</h1>
          <p className="mt-1 text-sm text-white/70">
            Order <span className="font-semibold text-white">{order.order_number}</span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Current status
              </p>
              <p className="mt-1 text-lg font-bold text-zinc-900">
                {String(order.order_status || "confirmed")
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (m: string) => m.toUpperCase())}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Total</p>
              <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                ₹{Number(order.total).toLocaleString("en-IN")}
              </p>
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
                        backgroundColor: isDone || isCurrent ? GOLD : "#e5e7eb",
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
                        ? "OFD"
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
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Shipping</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">AWB</span>
                <span className="font-medium text-zinc-900">
                  {order.awb_number || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Courier</span>
                <span className="font-medium text-zinc-900">
                  {order.courier_name || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Tracking</span>
                {order.tracking_url ? (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                    style={{ color: PRIMARY }}
                  >
                    Open link
                  </a>
                ) : (
                  <span className="font-medium text-zinc-900">—</span>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Payment: {order.payment_status || "pending"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              Delivery address
            </h2>
            {address ? (
              <div className="mt-3 text-sm text-zinc-700">
                <p className="font-semibold text-zinc-900">{address.name}</p>
                <p className="text-xs text-zinc-500">{address.phone}</p>
                <p className="mt-2">{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p className="mt-2">
                  {address.city}, {address.state} {address.pincode}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">—</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Items ordered</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">—</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((it: any) => (
                <li
                  key={it.id}
                  className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                      {it.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {it.sku} • Qty {it.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold" style={{ color: PRIMARY }}>
                    ₹{Number(it.total_price).toLocaleString("en-IN")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

