import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  createShiprocketOrder,
  assignCourier,
  generateLabel,
  type ShiprocketOrderPayload,
} from "@/lib/shiprocket";
import { sendOrderConfirmationSMS } from "@/lib/notifications";

const PICKUP_LOCATION = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";

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
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, total, payment_method, customer_id, address_id"
      )
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

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
          .select("id, name, sku, quantity, unit_price, total_price")
          .eq("order_id", order.id),
      ]);

    if (!customer || !address) {
      return NextResponse.json(
        { error: "Customer or address not found" },
        { status: 400 }
      );
    }

    const orderDate = new Date(order.created_at).toISOString().slice(0, 19).replace("T", " ");
    const billingAddress = [address.line1, address.line2].filter(Boolean).join(", ");
    const phone = (address.phone || customer.phone || "").replace(/\D/g, "").slice(-10);
    const email = customer.email || `noreply+${order.id}@nauvarah.com`;
    const nameParts = (address.name || customer.name || "Customer").trim().split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || ".";

    const payload: ShiprocketOrderPayload = {
      order_id: order.order_number,
      order_date: orderDate,
      pickup_location: PICKUP_LOCATION,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: billingAddress,
      billing_city: address.city,
      billing_state: address.state,
      billing_country: "India",
      billing_pincode: address.pincode,
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: (items || []).map((it: any) => ({
        name: it.name,
        sku: it.sku,
        units: Number(it.quantity),
        selling_price: Number(it.unit_price),
        discount: 0,
        tax: "0",
        hsn: "998399",
      })),
      payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total: Number(order.total),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    const { order_id: srOrderId, shipment_id } = await createShiprocketOrder(payload);

    await supabase
      .from("orders")
      .update({
        shiprocket_order_id: String(srOrderId),
        shiprocket_shipment_id: String(shipment_id),
      })
      .eq("id", orderId);

    const { awb_code, courier_name } = await assignCourier(String(shipment_id));

    await supabase
      .from("orders")
      .update({ awb_number: awb_code, courier_name })
      .eq("id", orderId);

    let labelUrl = "";
    try {
      const { label_url } = await generateLabel(String(shipment_id));
      labelUrl = label_url || "";
      if (labelUrl) {
        await supabase
          .from("orders")
          .update({ label_url: labelUrl })
          .eq("id", orderId);
      }
    } catch (e) {
      console.error("Shiprocket label generate error:", e);
    }

    try {
      await sendOrderConfirmationSMS(
        phone,
        order.order_number,
        Number(order.total)
      );
    } catch (e) {
      console.error("Order confirmation SMS error:", e);
    }

    return NextResponse.json({
      success: true,
      awb: awb_code,
      courierName: courier_name,
      labelUrl: labelUrl || undefined,
    });
  } catch (e) {
    console.error("Shiprocket create-order error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create shipment" },
      { status: 500 }
    );
  }
}
