import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OrdersTableClient } from "@/components/admin/OrdersTableClient";

async function getOrders() {
  const supabase = await createServerSupabaseClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, total, payment_method, order_status, payment_status, created_at"
    )
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
      <OrdersTableClient orders={orders} />
    </div>
  );
}
