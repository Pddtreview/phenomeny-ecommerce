import type { SupabaseClient } from "@supabase/supabase-js";
import { expandOrderItemToVariantQuantities } from "@/lib/bundle-stock";

export type OrdersByDay = { date: string; count: number };

export type TopProductRow = {
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity_sold: number;
};

export type CouponBreakdownRow = {
  coupon_code: string;
  order_count: number;
};

export type MarketingInsightsPayload = {
  period_days: number;
  period_start_iso: string;
  order_count: number;
  revenue_inr: number;
  aov_inr: number;
  cod_percent: number;
  prepaid_percent: number;
  rto_count: number;
  rto_rate_percent: number;
  repeat_customer_count: number;
  first_time_customer_count: number;
  orders_with_coupon_count: number;
  coupon_order_percent: number;
  top_products: TopProductRow[];
  coupon_breakdown: CouponBreakdownRow[];
  orders_by_day: OrdersByDay[];
};

function startOfPeriodDaysUtc(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function gatherMarketingInsights(
  supabase: SupabaseClient,
  periodDays: number = 30
): Promise<MarketingInsightsPayload> {
  const sinceIso = startOfPeriodDaysUtc(periodDays);

  const { data: orders, error: ordErr } = await supabase
    .from("orders")
    .select(
      "id, customer_id, total, payment_method, payment_status, order_status, coupon_code, created_at"
    )
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true });

  if (ordErr) {
    console.error("insights orders:", ordErr);
  }

  const list = orders ?? [];
  const nonCancelled = list.filter(
    (o) => String(o.order_status ?? "").toLowerCase() !== "cancelled"
  );

  const order_count = nonCancelled.length;
  const revenue_inr = nonCancelled.reduce(
    (s, o) => s + Number(o.total ?? 0),
    0
  );
  const aov_inr = order_count > 0 ? revenue_inr / order_count : 0;

  let cod = 0;
  let prepaid = 0;
  for (const o of nonCancelled) {
    const m = String(o.payment_method ?? "").toLowerCase();
    if (m === "cod") cod++;
    else if (m === "prepaid") prepaid++;
  }
  const paidTotal = cod + prepaid;
  const cod_percent =
    paidTotal > 0 ? Math.round((cod / paidTotal) * 1000) / 10 : 0;
  const prepaid_percent =
    paidTotal > 0 ? Math.round((prepaid / paidTotal) * 1000) / 10 : 0;

  const rto_count = nonCancelled.filter(
    (o) => String(o.order_status ?? "").toLowerCase() === "rto"
  ).length;
  const rto_rate_percent =
    order_count > 0 ? Math.round((rto_count / order_count) * 1000) / 10 : 0;

  const byCustomer = new Map<string, number>();
  for (const o of nonCancelled) {
    const cid = o.customer_id as string | null;
    if (!cid) continue;
    byCustomer.set(cid, (byCustomer.get(cid) ?? 0) + 1);
  }
  let repeat_customer_count = 0;
  let first_time_customer_count = 0;
  for (const n of byCustomer.values()) {
    if (n > 1) repeat_customer_count++;
    else first_time_customer_count++;
  }

  const withCoupon = nonCancelled.filter(
    (o) =>
      o.coupon_code != null && String(o.coupon_code).trim().length > 0
  );
  const orders_with_coupon_count = withCoupon.length;
  const coupon_order_percent =
    order_count > 0
      ? Math.round((orders_with_coupon_count / order_count) * 1000) / 10
      : 0;

  const couponMap = new Map<string, number>();
  for (const o of withCoupon) {
    const code = String(o.coupon_code).trim().toUpperCase();
    couponMap.set(code, (couponMap.get(code) ?? 0) + 1);
  }
  const coupon_breakdown: CouponBreakdownRow[] = [...couponMap.entries()]
    .map(([coupon_code, order_count]) => ({ coupon_code, order_count }))
    .sort((a, b) => b.order_count - a.order_count)
    .slice(0, 15);

  const byDay = new Map<string, number>();
  for (const o of nonCancelled) {
    const created = o.created_at as string;
    const date = created?.slice(0, 10) ?? "unknown";
    byDay.set(date, (byDay.get(date) ?? 0) + 1);
  }
  const orders_by_day: OrdersByDay[] = [...byDay.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const orderIds = nonCancelled.map((o) => o.id as string);
  const variantQty = new Map<string, number>();

  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id, bundle_id, quantity, item_type")
      .in("order_id", orderIds);

    const bundleLinesCache = new Map<string, Awaited<ReturnType<typeof expandOrderItemToVariantQuantities>>>();

    for (const row of items ?? []) {
      const qty = Number(row.quantity ?? 0);
      if (qty <= 0) continue;

      if (row.variant_id) {
        variantQty.set(
          row.variant_id as string,
          (variantQty.get(row.variant_id as string) ?? 0) + qty
        );
        continue;
      }

      const bid = row.bundle_id as string | null;
      if (!bid) continue;

      let lines = bundleLinesCache.get(bid);
      if (!lines) {
        lines = await expandOrderItemToVariantQuantities(supabase, {
          variant_id: null,
          bundle_id: bid,
          quantity: 1,
          item_type: "bundle",
        });
        bundleLinesCache.set(bid, lines);
      }
      for (const line of lines) {
        variantQty.set(
          line.variantId,
          (variantQty.get(line.variantId) ?? 0) + line.quantity * qty
        );
      }
    }
  }

  const sortedVariants = [...variantQty.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const topIds = sortedVariants.slice(0, 5).map(([id]) => id);

  let top_products: TopProductRow[] = [];
  if (topIds.length > 0) {
    const { data: vars } = await supabase
      .from("product_variants")
      .select("id, name, sku, product_id, products(name)")
      .in("id", topIds);

    const vmap = new Map(
      (vars ?? []).map((v: any) => [
        v.id as string,
        {
          name: (v.name as string) ?? "",
          sku: (v.sku as string) ?? "",
          product_name: (v.products?.name as string) ?? "",
        },
      ])
    );

    top_products = topIds.map((vid) => {
      const v = vmap.get(vid);
      return {
        variant_id: vid,
        product_name: v?.product_name ?? "—",
        variant_name: v?.name ?? "—",
        sku: v?.sku ?? "—",
        quantity_sold: variantQty.get(vid) ?? 0,
      };
    });
  }

  return {
    period_days: periodDays,
    period_start_iso: sinceIso,
    order_count,
    revenue_inr: Math.round(revenue_inr * 100) / 100,
    aov_inr: Math.round(aov_inr * 100) / 100,
    cod_percent,
    prepaid_percent,
    rto_count,
    rto_rate_percent,
    repeat_customer_count,
    first_time_customer_count,
    orders_with_coupon_count,
    coupon_order_percent,
    top_products,
    coupon_breakdown,
    orders_by_day,
  };
}
