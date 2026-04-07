import type { SupabaseClient } from "@supabase/supabase-js";

export type WeeklyPlTopProduct = { name: string; revenue: number };

export type WeeklyPlReport = {
  periodStartIso: string;
  periodEndIso: string;
  totalOrders: number;
  grossRevenueInr: number;
  codOrders: number;
  prepaidOrders: number;
  rtoCount: number;
  newCustomers: number;
  repeatCustomers: number;
  topProducts: WeeklyPlTopProduct[];
  couponDiscountInr: number;
};

function isCancelled(status: string | null | undefined): boolean {
  return String(status ?? "").toLowerCase() === "cancelled";
}

/**
 * Rolling last 7 days from `now` (server UTC). All order metrics exclude cancelled.
 * New vs repeat: among customers who ordered in the window, "new" had no prior
 * non-cancelled order before the window; "repeat" had at least one.
 * Gross revenue: sum of `total` for orders with payment_status === paid.
 * RTO: orders in the window with order_status rto (by order created_at).
 * Top products: revenue from order lines on paid orders in the window.
 */
export async function gatherWeeklyPlReport(
  supabase: SupabaseClient,
  now: Date = new Date()
): Promise<WeeklyPlReport> {
  const periodEndIso = now.toISOString();
  const start = new Date(now.getTime());
  start.setUTCDate(start.getUTCDate() - 7);
  const periodStartIso = start.toISOString();

  const { data: ordersRaw, error: ordErr } = await supabase
    .from("orders")
    .select(
      "id, customer_id, total, payment_method, payment_status, order_status, discount_amount, coupon_code, created_at"
    )
    .gte("created_at", periodStartIso)
    .lt("created_at", periodEndIso)
    .order("created_at", { ascending: true });

  if (ordErr) {
    console.error("weekly-pl orders:", ordErr.message);
  }

  const orders = (ordersRaw ?? []).filter((o) => !isCancelled(o.order_status));

  const totalOrders = orders.length;

  const grossRevenueInr = orders
    .filter((o) => String(o.payment_status ?? "").toLowerCase() === "paid")
    .reduce((s, o) => s + Number(o.total ?? 0), 0);

  let codOrders = 0;
  let prepaidOrders = 0;
  for (const o of orders) {
    const m = String(o.payment_method ?? "").toLowerCase();
    if (m === "cod") codOrders++;
    else if (m === "prepaid") prepaidOrders++;
  }

  const rtoCount = orders.filter(
    (o) => String(o.order_status ?? "").toLowerCase() === "rto"
  ).length;

  const couponDiscountInr = orders.reduce((s, o) => {
    const code = o.coupon_code;
    const hasCoupon =
      code != null && String(code).trim().length > 0;
    if (!hasCoupon) return s;
    return s + Number(o.discount_amount ?? 0);
  }, 0);

  const windowCustomerIds = [
    ...new Set(
      orders
        .map((o) => o.customer_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];

  let newCustomers = 0;
  let repeatCustomers = 0;

  const hadPriorCustomer = new Set<string>();
  if (windowCustomerIds.length > 0) {
    const { data: priorNonCancelled, error: priorErr } = await supabase
      .from("orders")
      .select("customer_id, order_status")
      .in("customer_id", windowCustomerIds)
      .lt("created_at", periodStartIso);

    if (priorErr) {
      console.error("weekly-pl prior orders:", priorErr.message);
    }
    for (const r of priorNonCancelled ?? []) {
      if (isCancelled(r.order_status)) continue;
      const cid = r.customer_id as string | null;
      if (cid) hadPriorCustomer.add(cid);
    }
  }

  const customersInWindow = new Set<string>();
  for (const o of orders) {
    const cid = o.customer_id as string | null;
    if (cid) customersInWindow.add(cid);
  }

  for (const cid of customersInWindow) {
    if (hadPriorCustomer.has(cid)) repeatCustomers++;
    else newCustomers++;
  }

  const paidOrderIds = orders
    .filter((o) => String(o.payment_status ?? "").toLowerCase() === "paid")
    .map((o) => o.id as string);

  const topProducts: WeeklyPlTopProduct[] = [];
  if (paidOrderIds.length > 0) {
    const { data: itemRows, error: itemErr } = await supabase
      .from("order_items")
      .select(
        "name, total_price, order_id, product_variants(name, products(name))"
      )
      .in("order_id", paidOrderIds);

    if (itemErr) {
      console.error("weekly-pl order_items:", itemErr.message);
    }

    const revenueByProduct: Record<string, number> = {};
    for (const row of itemRows ?? []) {
      const anyRow = row as {
        name?: string;
        total_price?: number;
        order_id?: string;
        product_variants?: {
          name?: string;
          products?: { name?: string };
        } | null;
      };
      const lineProduct =
        anyRow.product_variants?.products?.name ??
        anyRow.product_variants?.name ??
        anyRow.name;
      const name = String(lineProduct ?? "").trim() || "Other";
      revenueByProduct[name] =
        (revenueByProduct[name] ?? 0) + Number(anyRow.total_price ?? 0);
    }

    topProducts.push(
      ...Object.entries(revenueByProduct)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3)
    );
  }

  return {
    periodStartIso,
    periodEndIso,
    totalOrders,
    grossRevenueInr,
    codOrders,
    prepaidOrders,
    rtoCount,
    newCustomers,
    repeatCustomers,
    topProducts,
    couponDiscountInr,
  };
}
