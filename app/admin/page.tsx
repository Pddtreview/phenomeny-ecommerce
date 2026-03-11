import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

async function getDashboardStats() {
  const supabase = await createServerSupabaseClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [
    todayOrdersRes,
    todayRevenueRes,
    pendingRes,
    totalOrdersRes,
    totalRevenueRes,
    lowStockRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso),
    supabase.from("orders").select("total").gte("created_at", todayIso),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "confirmed"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total"),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .lt("stock_quantity", 20),
  ]);

  const todayRevenue =
    (todayRevenueRes.data ?? []).reduce(
      (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
      0
    ) ?? 0;
  const totalRevenue =
    (totalRevenueRes.data ?? []).reduce(
      (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
      0
    ) ?? 0;

  return {
    todayOrders: todayOrdersRes.count ?? 0,
    todayRevenue,
    pendingShipments: pendingRes.count ?? 0,
    totalOrders: totalOrdersRes.count ?? 0,
    totalRevenue,
    lowStock: lowStockRes.count ?? 0,
  };
}

async function getRecentOrders() {
  const supabase = await createServerSupabaseClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_id, total, order_status, payment_method, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !orders?.length) return [];

  const customerIds = [...new Set(orders.map((o) => o.customer_id).filter(Boolean))];
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .in("id", customerIds);

  const customerMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

  return orders.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    customer_name: customerMap.get(o.customer_id) ?? "—",
    total: o.total,
    order_status: o.order_status,
    payment_method: o.payment_method,
    created_at: o.created_at,
  }));
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
  ]);

  const cards = [
    { label: "Today's Orders", value: String(stats.todayOrders) },
    {
      label: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString("en-IN")}`,
    },
    { label: "Pending Shipments", value: String(stats.pendingShipments) },
    { label: "Total Orders", value: String(stats.totalOrders) },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
    },
    { label: "Low Stock Items", value: String(stats.lowStock) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">{card.label}</p>
            <p
              className="mt-2 text-2xl font-bold"
              style={{ color: PRIMARY }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-4 py-3 font-medium text-zinc-600">
                  Order #
                </th>
                <th className="px-4 py-3 font-medium text-zinc-600">Customer</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Total</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Payment</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-zinc-100 last:border-0"
                >
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
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {String(o.order_status ?? "").replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {String(o.payment_method ?? "").replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(o.created_at).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentOrders.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No orders yet
          </p>
        )}
      </section>
    </div>
  );
}
