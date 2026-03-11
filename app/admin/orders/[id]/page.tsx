import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OrderStatusUpdate } from "@/components/admin/OrderStatusUpdate";
import { CreateShipmentButton } from "@/components/admin/CreateShipmentButton";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

async function getOrder(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, order_status, payment_status, payment_method, subtotal, discount, shipping_charge, cod_charge, total, customer_id, address_id, shiprocket_order_id, shiprocket_shipment_id, awb_number, courier_name, label_url, tracking_url"
    )
    .eq("id", id)
    .single();

  if (error || !order) return null;

  const [{ data: customer }, { data: address }, { data: items }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, phone, email")
        .eq("id", order.customer_id)
        .single(),
      supabase
        .from("addresses")
        .select("id, name, phone, line1, line2, city, state, pincode")
        .eq("id", order.address_id)
        .single(),
      supabase
        .from("order_items")
        .select("id, name, sku, quantity, unit_price, total_price, item_type")
        .eq("order_id", order.id),
    ]);

  return {
    order,
    customer: customer ?? null,
    address: address ?? null,
    items: items ?? [],
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data) notFound();

  const { order, customer, address, items } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← Orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusUpdate orderId={id} currentStatus={order.order_status} />
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Print label
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Order summary
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">Subtotal</span>
              <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Discount</span>
              <span>−₹{Number(order.discount ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Shipping</span>
              <span>₹{Number(order.shipping_charge ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">COD charge</span>
              <span>₹{Number(order.cod_charge ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold">
              <span>Total</span>
              <span style={{ color: PRIMARY }}>
                ₹{Number(order.total).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Payment: {String(order.payment_status).replace(/_/g, " ")} •{" "}
            {String(order.payment_method).replace(/_/g, " ")}
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Customer details
          </h2>
          {customer ? (
            <div className="mt-4 text-sm text-zinc-700">
              <p className="font-medium text-zinc-900">{customer.name}</p>
              <p>{customer.phone}</p>
              {customer.email && <p>{customer.email}</p>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">—</p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">
          Delivery address
        </h2>
        {address ? (
          <div className="mt-4 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">{address.name}</p>
            <p>{address.phone}</p>
            <p className="mt-2">{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p className="mt-2">
              {address.city}, {address.state} {address.pincode}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">—</p>
        )}
      </section>

      {order.shiprocket_order_id ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">
            Shiprocket details
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">AWB number</span>
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
            {order.label_url && (
              <div className="pt-2">
                <a
                  href={order.label_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: PRIMARY }}
                >
                  Download label
                </a>
              </div>
            )}
            {order.tracking_url && (
              <div className="pt-1">
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: PRIMARY }}
                >
                  Tracking URL
                </a>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Shiprocket</h2>
          <p className="mt-2 text-sm text-zinc-600">
            No shipment created yet. Create one to assign AWB and generate label.
          </p>
          <div className="mt-4">
            <CreateShipmentButton orderId={id} />
          </div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Order items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-600">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Price</th>
                <th className="pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {(items as any[]).map((it) => (
                <tr key={it.id} className="border-b border-zinc-100">
                  <td className="py-2 text-zinc-900">{it.name}</td>
                  <td className="py-2 text-zinc-600">{it.sku}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">
                    ₹{Number(it.unit_price).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 font-medium">
                    ₹{Number(it.total_price).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-900">Admin notes</h2>
        <textarea
          placeholder="Add internal notes..."
          rows={3}
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ outlineColor: PRIMARY }}
        />
      </section>
    </div>
  );
}
