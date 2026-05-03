import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { sendOrderConfirmationEmail } from "@/lib/notifications";
import { verifyPayUHash } from "@/lib/payu";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const status = String(formData.get("status") || "");
    const txnid = String(formData.get("txnid") || "");
    const amount = String(formData.get("amount") || "");
    const hash = String(formData.get("hash") || "");
    const mihpayid = String(formData.get("mihpayid") || "");
    const udf1 = String(formData.get("udf1") || "");
    const productinfo = String(formData.get("productinfo") || "");
    const firstname = String(formData.get("firstname") || "");
    const email = String(formData.get("email") || "");
    const udf2 = String(formData.get("udf2") || "");
    const udf3 = String(formData.get("udf3") || "");
    const udf4 = String(formData.get("udf4") || "");
    const udf5 = String(formData.get("udf5") || "");

    if (!status || !txnid || !amount || !hash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isValid = verifyPayUHash({
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      hash,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: order } = await supabase
      .from("orders")
      .select(
        "id, order_number, total, customer_id, address_id, payment_status, order_items(name, quantity, total_price)"
      )
      .eq("order_number", txnid)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "success") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "confirmed",
          payu_transaction_id: mihpayid || null,
        })
        .eq("id", order.id);

      const [{ data: customer }, { data: address }] = await Promise.all([
        supabase
          .from("customers")
          .select("email")
          .eq("id", order.customer_id)
          .single(),
        supabase
          .from("addresses")
          .select("line1, line2, city, state, pincode")
          .eq("id", order.address_id)
          .single(),
      ]);

      if (customer?.email && address) {
        const items = Array.isArray(order.order_items) ? order.order_items : [];
        sendOrderConfirmationEmail(
          customer.email,
          order.order_number,
          items.map((it) => ({
            name: String(it.name),
            quantity: Number(it.quantity),
            total_price: Number(it.total_price),
          })),
          Number(order.total),
          {
            line1: String(address.line1 || ""),
            line2: address.line2 ? String(address.line2) : undefined,
            city: String(address.city || ""),
            state: String(address.state || ""),
            pincode: String(address.pincode || ""),
          }
        ).catch((err) => console.error("order confirmation email:", err));
      }
    } else if (status === "failure") {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
        })
        .eq("id", order.id);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("payu/webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
