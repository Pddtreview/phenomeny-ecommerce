import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendDeliveryConfirmationSMS,
  sendShippingConfirmationSMS,
  sendNDRSMS,
} from "@/lib/notifications";
import { expandOrderItemToVariantQuantities } from "@/lib/bundle-stock";

const STATUS_MAP: Record<string, string> = {
  Shipped: "shipped",
  "Out for Delivery": "out_for_delivery",
  Delivered: "delivered",
  "RTO Initiated": "rto",
  "RTO Delivered": "rto",
  Undelivered: "ndr",
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current_status =
      typeof body?.current_status === "string" ? body.current_status : "";
    const awb_code = typeof body?.awb_code === "string" ? body.awb_code : "";
    const order_id = body?.order_id;

    const orderStatus = STATUS_MAP[current_status] || null;
    if (!orderStatus || !awb_code) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = getSupabase();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, customer_id, awb_number, courier_name")
      .eq("awb_number", awb_code)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await supabase
      .from("orders")
      .update({ order_status: orderStatus })
      .eq("id", order.id);

    const { data: customer } = await supabase
      .from("customers")
      .select("id, name, phone")
      .eq("id", order.customer_id)
      .single();

    const phone = (customer?.phone || "").replace(/\D/g, "").slice(-10);

    if (orderStatus === "delivered" && phone) {
      try {
        await sendDeliveryConfirmationSMS(phone, order.order_number);
      } catch (e) {
        console.error("Delivery confirmation SMS error:", e);
      }
    }

    if (orderStatus === "shipped" && phone) {
      try {
        await sendShippingConfirmationSMS(
          phone,
          order.order_number,
          order.awb_number || awb_code,
          order.courier_name || "Courier"
        );
      } catch (e) {
        console.error("Shipping confirmation SMS error:", e);
      }
    }

    if (orderStatus === "ndr" && phone) {
      try {
        await sendNDRSMS(phone, order.order_number);
      } catch (e) {
        console.error("NDR SMS error:", e);
      }
    }

    if (orderStatus === "rto") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("id, variant_id, bundle_id, quantity, item_type")
        .eq("order_id", order.id);

      for (const it of orderItems || []) {
        const lines = await expandOrderItemToVariantQuantities(supabase, {
          variant_id: it.variant_id,
          bundle_id: it.bundle_id,
          quantity: Number(it.quantity ?? 0),
          item_type: it.item_type,
        });
        for (const line of lines) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", line.variantId)
            .single();
          if (variant) {
            const current = Number(variant.stock_quantity ?? 0);
            const newStock = current + line.quantity;
            await supabase
              .from("product_variants")
              .update({ stock_quantity: newStock })
              .eq("id", line.variantId);
            await supabase.from("inventory_log").insert({
              variant_id: line.variantId,
              order_id: order.id,
              quantity_change: line.quantity,
              balance_after: newStock,
              reason: "rto_return",
            });
          }
        }
      }

      const { data: cust } = await supabase
        .from("customers")
        .select("id, rto_count")
        .eq("id", order.customer_id)
        .single();

      if (cust) {
        const rtoCount = Number(cust.rto_count ?? 0) + 1;
        await supabase
          .from("customers")
          .update({
            rto_count: rtoCount,
            is_rto_risk: rtoCount >= 2,
          })
          .eq("id", cust.id);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("Shiprocket webhook error:", e);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
