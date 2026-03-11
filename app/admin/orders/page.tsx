import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

const statusColors: Record<string, string> = {
  confirmed: "#1B3A6B",
  processing: "#1B3A6B",
  shipped: "#b45309",
  out_for_delivery: "#b45309",
  delivered: "#15803d",
  cancelled: "#b91c1c",
  rto: "#c2410c",
};

async function getOrders() {
  const supabase = await createServerSupabaseClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, total, payment_method, order_status, payment_status, created_at")
    .order("created_at", { ascending: false });

  if (error || !orders?.length) return [];

  const customerIds = [...new Set(orders.map((o) => o.customer_id).filter(Boolean))];
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .in("id", customerIds);

  const customerMap = new Map(
    (customers ?? []).map((c) => [c.id, { name: c.name, phone: c.phone }])
  );

  return orders.map((o) => {
    const c = customerMap.get(o.customer_id);
    return {
      id: o.id,
      order_number: o.order_number,
      customer_name: c?.name ?? "—",
      phone: c?.phone ?? "—",
      total: o.total,
      payment_method: o.payment_method,
      order_status: o.order_status,
      payment_status: o.payment_status,
      created_at: o.created_at,
    };
  });
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Order #</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Customer</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Total</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Payment</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Order Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Payment Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
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
                  ₹{Number(o.total).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {String(o.payment_method ?? "").replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        statusColors[String(o.order_status)] ?? "#6b7280",
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
        {orders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No orders
          </p>
        )}
      </div>
    </div>
  );
}
