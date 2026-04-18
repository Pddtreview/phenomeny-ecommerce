import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getDashboardData() {
  const supabase = await createServerSupabaseClient();
  const todayStart = startOfTodayUtc();

  const [
    todayOrdersRes,
    todayRevenueRows,
    pendingRes,
    totalOrdersRes,
    totalRevenueRows,
    lowStockRes,
    outOfStockRes,
    recentOrdersRes,
    lowStockAlertsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", todayStart)
      .eq("payment_status", "paid"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("order_status", "confirmed"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid"),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .lte("stock_quantity", 20)
      .gt("stock_quantity", 0),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("stock_quantity", 0),
    supabase
      .from("orders")
      .select("id, order_number, customer_id, total, order_status, payment_method, created_at, customers(name, phone)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("product_variants")
      .select("name, sku, stock_quantity, products(name)")
      .lte("stock_quantity", 20)
      .order("stock_quantity", { ascending: true })
      .limit(10),
  ]);

  const todayRevenue = (todayRevenueRows.data ?? []).reduce(
    (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
    0
  );
  const totalRevenue = (totalRevenueRows.data ?? []).reduce(
    (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
    0
  );

  const recentOrders = (recentOrdersRes.data ?? []).map((o: any) => {
    const cust = o.customers ?? o.customer;
    return {
    id: o.id,
    order_number: o.order_number,
    customer_name: cust?.name ?? "—",
    customer_phone: cust?.phone ?? "",
    total: o.total,
    order_status: o.order_status,
    payment_method: o.payment_method,
    created_at: o.created_at,
  };
  });

  const lowStockAlerts = (lowStockAlertsRes.data ?? []).map((row: any) => ({
    product_name: row.products?.name ?? "—",
    variant_name: row.name ?? "—",
    sku: row.sku ?? "",
    stock_quantity: Number(row.stock_quantity ?? 0),
  }));

  return {
    todayOrders: todayOrdersRes.count ?? 0,
    todayRevenue,
    pendingShipments: pendingRes.count ?? 0,
    totalOrders: totalOrdersRes.count ?? 0,
    totalRevenue,
    lowStockItems: lowStockRes.count ?? 0,
    outOfStockItems: outOfStockRes.count ?? 0,
    recentOrders,
    lowStockAlerts,
  };
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const cards = [
    { label: "Today's Orders", value: String(data.todayOrders) },
    {
      label: "Today's Revenue (INR)",
      value: data.todayRevenue.toLocaleString("en-IN"),
      isCurrency: true,
    },
    { label: "Pending Shipments", value: String(data.pendingShipments) },
    { label: "Total Orders", value: String(data.totalOrders) },
    {
      label: "Total Revenue (INR)",
      value: data.totalRevenue.toLocaleString("en-IN"),
      isCurrency: true,
    },
    { label: "Low Stock Items", value: String(data.lowStockItems) },
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
              {card.isCurrency ? (
                <>
                  <span className="font-inter rupee">₹</span>
                  {card.value}
                </>
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 font-medium text-zinc-600">Order #</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Customer</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Total</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Payment</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
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
                      <span className="font-inter rupee">₹</span>
                      {Number(o.total).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        {String(o.order_status ?? "").replace(/_/g, " ")}
                      </span>
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
            {data.recentOrders.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No orders yet
              </p>
            )}
          </div>
        </section>

        <section className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <h2 className="text-lg font-semibold text-zinc-900">Low Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="px-4 py-3 font-medium text-zinc-600">Product</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Variant</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">SKU</th>
                  <th className="px-4 py-3 font-medium text-zinc-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockAlerts.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-zinc-900">{row.product_name}</td>
                    <td className="px-4 py-3 text-zinc-900">{row.variant_name}</td>
                    <td className="px-4 py-3 text-zinc-600">{row.sku}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.stock_quantity === 0
                            ? "font-medium text-red-600"
                            : "font-medium text-amber-600"
                        }
                      >
                        {row.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.lowStockAlerts.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No low stock alerts
              </p>
            )}
          </div>
          <div className="border-t border-zinc-100 px-4 py-2">
            <Link
              href="/admin/inventory"
              className="text-sm font-medium hover:underline"
              style={{ color: PRIMARY }}
            >
              View inventory →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
