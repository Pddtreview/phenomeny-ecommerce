import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

async function getOrder(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, status, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, sku, quantity, unit_price, total_price")
    .eq("order_id", order.id);

  return { ...order, items: items ?? [] };
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          className="mt-6 text-2xl font-bold sm:text-3xl"
          style={{ color: PRIMARY }}
        >
          Order Confirmed!
        </h1>
        <p className="mt-2 text-zinc-600">
          Thank you for your purchase. Your order number is:
        </p>
        <p
          className="mt-2 text-lg font-semibold"
          style={{ color: GOLD }}
        >
          {order.order_number}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          <span className="font-inter rupee">₹</span>
          {Number(order.total).toLocaleString("en-IN")} • {order.items.length} item(s)
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/products"
            className="rounded-lg py-3 text-sm font-medium text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
