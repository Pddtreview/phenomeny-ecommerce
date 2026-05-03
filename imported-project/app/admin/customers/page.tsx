import { createServerSupabaseClient } from "@/lib/supabase-server";
import { CustomersTable } from "@/components/admin/CustomersTable";

async function getCustomers() {
  const supabase = await createServerSupabaseClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select(
      "id, name, phone, email, order_count, total_spent, is_rto_risk, last_order_at, rto_count, created_at"
    )
    .order("total_spent", { ascending: false });

  if (error || !customers) return [];

  return customers.map((c) => ({
    id: c.id,
    name: c.name ?? "—",
    phone: c.phone ?? "—",
    email: c.email ?? null,
    order_count: Number(c.order_count ?? 0),
    total_spent: Number(c.total_spent ?? 0),
    is_rto_risk: Boolean(c.is_rto_risk),
    last_order_at: c.last_order_at ?? null,
    rto_count: Number(c.rto_count ?? 0),
    created_at: c.created_at ?? null,
  }));
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
      <p className="text-sm text-zinc-600">
        Sorted by total spent. RTO risk customers highlighted in red.
      </p>
      <CustomersTable customers={customers} />
    </div>
  );
}

