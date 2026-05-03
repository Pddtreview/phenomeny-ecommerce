import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

function getMonthRange(monthOffset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthOffset);
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

async function getReportsData() {
  const supabase = await createServerSupabaseClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const thisMonth = getMonthRange(0);
  const lastMonth = getMonthRange(-1);

  const [
    paidOrdersLast30Res,
    allOrdersRes,
    paymentMethodOrdersRes,
    statusOrdersRes,
    orderItemsRes,
    thisMonthRevenueRes,
    lastMonthRevenueRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total, created_at")
      .gte("created_at", thirtyDaysAgoIso)
      .eq("payment_status", "paid"),
    supabase.from("orders").select("id, order_status, payment_method"),
    supabase.from("orders").select("payment_method"),
    supabase.from("orders").select("order_status"),
    supabase
      .from("order_items")
      .select("order_id, total_price, product_variants(name, products(name))"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", thisMonth.start)
      .lte("created_at", thisMonth.end)
      .eq("payment_status", "paid"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", lastMonth.start)
      .lte("created_at", lastMonth.end)
      .eq("payment_status", "paid"),
  ]);

  const paidOrdersLast30 = paidOrdersLast30Res.data ?? [];
  const orderItems = orderItemsRes.data ?? [];

  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  paidOrdersLast30.forEach((o: any) => {
    const key = (o.created_at ?? "").slice(0, 10);
    if (dailyMap[key] !== undefined) {
      dailyMap[key] += Number(o.total ?? 0);
    }
  });
  const dailyRevenue = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));

  const paymentCount: Record<string, number> = {};
  (paymentMethodOrdersRes.data ?? []).forEach((o: any) => {
    const m = o.payment_method ?? "unknown";
    paymentCount[m] = (paymentCount[m] ?? 0) + 1;
  });
  const ordersByPayment = [
    { method: "prepaid", count: paymentCount["prepaid"] ?? 0 },
    { method: "cod", count: paymentCount["cod"] ?? 0 },
  ];

  const statusCount: Record<string, number> = {};
  (statusOrdersRes.data ?? []).forEach((o: any) => {
    const s = o.order_status ?? "pending";
    statusCount[s] = (statusCount[s] ?? 0) + 1;
  });
  const ordersByStatus = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  const productRevenue: Record<string, { revenue: number; orderIds: Set<string> }> = {};
  orderItems.forEach((row: any) => {
    const productName =
      row.product_variants?.products?.name ??
      row.product_variants?.name ??
      "Unknown";
    if (!productRevenue[productName]) {
      productRevenue[productName] = { revenue: 0, orderIds: new Set() };
    }
    productRevenue[productName].revenue += Number(row.total_price ?? 0);
    productRevenue[productName].orderIds.add(row.order_id);
  });
  const topProducts = Object.entries(productRevenue)
    .map(([product_name, { revenue, orderIds }]) => ({
      product_name,
      revenue,
      orders_count: orderIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((r, i) => ({
      rank: i + 1,
      product_name: r.product_name,
      revenue: r.revenue,
      orders_count: r.orders_count,
    }));

  const thisMonthRevenue = (thisMonthRevenueRes.data ?? []).reduce(
    (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
    0
  );
  const lastMonthRevenue = (lastMonthRevenueRes.data ?? []).reduce(
    (sum: number, r: { total?: number }) => sum + Number(r.total ?? 0),
    0
  );

  const momChange =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : (thisMonthRevenue > 0 ? 100 : 0);

  return {
    dailyRevenue,
    ordersByStatus,
    ordersByPayment,
    topProducts,
    thisMonthRevenue,
    lastMonthRevenue,
    momChange,
  };
}

export default async function AdminReportsPage() {
  const data = await getReportsData();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">This Month Revenue (INR)</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            <span className="font-inter rupee">₹</span>
            {data.thisMonthRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Last Month Revenue (INR)</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            <span className="font-inter rupee">₹</span>
            {data.lastMonthRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Month on Month change</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold">
            <span
              className={
                data.momChange >= 0 ? "text-emerald-600" : "text-red-600"
              }
            >
              {data.momChange >= 0 ? "↑" : "↓"} {Math.abs(data.momChange).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>

      <DashboardCharts
        dailyRevenue={data.dailyRevenue}
        ordersByStatus={data.ordersByStatus}
        ordersByPayment={data.ordersByPayment}
        topProducts={data.topProducts}
      />
    </div>
  );
}
