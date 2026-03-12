import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";

async function getCustomer(id: string) {
  const supabase = await createServerSupabaseClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      "id, name, phone, email, is_rto_risk, rto_count, order_count, total_spent, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !customer) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, payment_method, order_status, created_at"
    )
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, label, name, line1, city, state, pincode")
    .eq("customer_id", id);

  return {
    customer,
    orders: orders ?? [],
    addresses: addresses ?? [],
  };
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomer(id);
  if (!data) notFound();

  const { customer, orders, addresses } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/customers"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← Customers
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            {customer.name ?? "Customer"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Joined{" "}
            {customer.created_at
              ? new Date(customer.created_at).toLocaleDateString("en-IN")
              : "—"}
          </p>
        </div>
        <div className="text-right text-sm text-zinc-700">
          <p>
            Orders:{" "}
            <span className="font-semibold">
              {Number(customer.order_count ?? 0)}
            </span>
          </p>
          <p>
            Total spent:{" "}
            <span className="font-semibold">
              ₹{Number(customer.total_spent ?? 0).toLocaleString("en-IN")}
            </span>
          </p>
        </div>
      </div>

      {customer.is_rto_risk && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">
            HIGH RISK — COD should be blocked for this customer
          </p>
          <p className="mt-1 text-xs text-red-700">
            RTO count: {Number(customer.rto_count ?? 0)}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">
          Customer details
        </h2>
        <div className="mt-4 space-y-1 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">{customer.name}</p>
          <p>{customer.phone}</p>
          {customer.email && <p>{customer.email}</p>}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                  <th className="px-3 py-2 font-medium">Order #</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Payment</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium hover:underline"
                        style={{ color: PRIMARY }}
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      ₹{Number(o.total ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">
                      {String(o.payment_method ?? "").replace(/_/g, " ")}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">
                      {String(o.order_status ?? "").replace(/_/g, " ")}
                    </td>
                    <td className="px-3 py-2 text-zinc-500">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">
          Saved addresses
        </h2>
        {addresses.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No saved addresses.</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-zinc-700">
            {addresses.map((addr: any) => (
              <div
                key={addr.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                {addr.label && (
                  <p className="text-xs font-semibold text-zinc-600">
                    {addr.label}
                  </p>
                )}
                <p className="mt-1 font-medium text-zinc-900">{addr.name}</p>
                <p>{addr.line1}</p>
                <p>
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

