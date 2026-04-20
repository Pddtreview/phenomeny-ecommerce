import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

const GOLD = "#C8860A";
const CREAM = "#FDFAF5";
const TEXT = "#1A1A1A";
const MUTED = "#6B5E4E";

type OrderSummary = {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_charge: number;
  cod_charge: number;
  total: number;
  payment_method: "prepaid" | "cod";
  address_id: string | null;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type DeliveryAddress = {
  name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

async function getOrder(id: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, subtotal, shipping_charge, cod_charge, total, payment_method, address_id")
    .eq("id", id)
    .returns<OrderSummary[]>()
    .single();

  if (error || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, quantity, unit_price, total_price")
    .eq("order_id", order.id)
    .returns<OrderItem[]>();

  let address: DeliveryAddress | null = null;
  if (order.address_id) {
    const { data: addressRow } = await supabase
      .from("addresses")
      .select("name, phone, line1, line2, city, state, pincode")
      .eq("id", order.address_id)
      .returns<DeliveryAddress[]>()
      .maybeSingle();
    address = addressRow ?? null;
  }

  return { ...order, items: items ?? [], address };
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const paymentMethodLabel =
    order.payment_method === "cod" ? "Cash on Delivery" : "Prepaid";
  const trackHref = `/track/${encodeURIComponent(order.order_number)}`;

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-3xl">
        {/* SECTION 1 - SUCCESS HEADER */}
        <section className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#C8860A]/30 bg-[#C8860A]/10 text-4xl font-semibold"
            style={{ color: GOLD }}
          >
            ✓
          </div>
          <h1 className="mt-6 font-cormorant text-4xl font-semibold text-[#1A1A1A]">
            Thank You for Your Order!
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-inter text-base text-[#6B5E4E]">
            Your order has been confirmed and will be dispatched within 24 hours.
          </p>
          <p className="mt-4 font-cormorant text-xl text-[#C8860A]">
            Order #{order.order_number}
          </p>
        </section>

        {/* SECTION 2 - ORDER DETAILS CARD */}
        <section className="mt-8 rounded-xl border border-[#C8860A]/30 bg-white p-6">
          <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A]">
            Order Details
          </h2>

          <ul className="mt-4 space-y-2 border-b border-[#C8860A]/20 pb-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="font-inter text-[#1A1A1A]">
                  {item.name} <span className="text-[#6B5E4E]">× {item.quantity}</span>
                </div>
                <div className="shrink-0 font-inter text-[#1A1A1A]">
                  <span className="font-inter rupee">₹</span>
                  {Number(item.total_price).toLocaleString("en-IN")}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 font-inter text-sm">
            <div className="flex justify-between text-[#6B5E4E]">
              <span>Subtotal</span>
              <span>
                <span className="font-inter rupee">₹</span>
                {Number(order.subtotal || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-[#6B5E4E]">
              <span>Shipping</span>
              <span>
                <span className="font-inter rupee">₹</span>
                {Number(order.shipping_charge || 0).toLocaleString("en-IN")}
              </span>
            </div>
            {Number(order.cod_charge || 0) > 0 && (
              <div className="flex justify-between text-[#6B5E4E]">
                <span>COD Charge</span>
                <span>
                  <span className="font-inter rupee">₹</span>
                  {Number(order.cod_charge).toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#6B5E4E]">
              <span>Payment Method</span>
              <span>{paymentMethodLabel}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#C8860A]/20 pt-3 font-semibold text-[#C8860A]">
              <span>Total</span>
              <span>
                <span className="font-inter rupee">₹</span>
                {Number(order.total).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3 - DELIVERY DETAILS */}
        <section className="mt-6 rounded-xl border border-[#C8860A]/30 bg-white p-6">
          <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A]">
            Delivery Details
          </h2>

          {order.address ? (
            <div className="mt-4 font-inter text-sm leading-relaxed text-[#6B5E4E]">
              {order.address.name ? <p className="font-medium text-[#1A1A1A]">{order.address.name}</p> : null}
              <p>{order.address.line1}</p>
              {order.address.line2 ? <p>{order.address.line2}</p> : null}
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              {order.address.phone ? <p className="mt-1">Phone: {order.address.phone}</p> : null}
            </div>
          ) : (
            <p className="mt-4 font-inter text-sm text-[#6B5E4E]">Address information unavailable.</p>
          )}

          <p className="mt-4 font-inter text-sm text-[#6B5E4E]">
            Expected delivery: <span className="font-medium text-[#1A1A1A]">4-7 business days</span>
          </p>
          <Link
            href={trackHref}
            className="mt-2 inline-block font-inter text-sm text-[#C8860A] underline underline-offset-2"
          >
            Track order
          </Link>
        </section>

        {/* SECTION 4 - WHAT HAPPENS NEXT */}
        <section className="mt-6 rounded-xl border border-[#C8860A]/20 bg-white p-6">
          <h2 className="font-cormorant text-2xl font-semibold text-[#1A1A1A]">
            What Happens Next
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#C8860A]/25 bg-[#C8860A]/10 p-4 text-center">
              <p className="font-inter text-sm font-medium text-[#C8860A]">
                Order Confirmed ✓
              </p>
            </div>
            <div className="rounded-lg border border-[#C8860A]/15 bg-[#FDFAF5] p-4 text-center">
              <p className="font-inter text-sm text-[#6B5E4E]">Dispatched in 24hrs</p>
            </div>
            <div className="rounded-lg border border-[#C8860A]/15 bg-[#FDFAF5] p-4 text-center">
              <p className="font-inter text-sm text-[#6B5E4E]">Delivered in 4-7 days</p>
            </div>
          </div>
        </section>

        {/* SECTION 5 - CTA BUTTONS */}
        <section className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={trackHref}
            className="inline-flex items-center justify-center rounded-lg bg-[#C8860A] px-8 py-3 font-cormorant text-sm font-medium tracking-[0.08em] text-white transition-colors hover:bg-[#A86D08]"
          >
            Track Your Order
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-[#C8860A] px-8 py-3 font-cormorant text-sm font-medium tracking-[0.08em] text-[#C8860A] transition-colors hover:bg-[#C8860A]/5"
          >
            Continue Shopping
          </Link>
        </section>
      </div>
    </div>
  );
}
