import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { generatePayUHash, PAYU_BASE_URL, PAYU_KEY, PAYU_SALT } from "@/lib/payu";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, customer_id, address_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("name, email, phone")
      .eq("id", order.customer_id)
      .single();

    const customerName =
      typeof customer?.name === "string" && customer.name.trim()
        ? customer.name.trim().split(" ")[0].replace(/[^a-zA-Z]/g, "") || "Customer"
        : "Customer";
    const customerEmail =
      typeof customer?.email === "string" && customer.email.trim()
        ? customer.email.trim()
        : "customer@nauvaraha.com";
    const customerPhone =
      typeof customer?.phone === "string" && customer.phone.trim()
        ? customer.phone.trim()
        : "";
    const amount = Number(order.total).toFixed(2);
    const txnid = order.order_number;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const params = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo: `Nauvaraha Order ${order.order_number}`.replace(
        /[^a-zA-Z0-9\s_-]/g,
        ""
      ),
      firstname: customerName,
      email: customerEmail,
      phone: customerPhone,
      surl: `${siteUrl}/order-success/${orderId}`,
      furl: `${siteUrl}/payment-failed`,
      udf1: orderId,
    };

    const hash = generatePayUHash({
      txnid: params.txnid,
      amount: params.amount,
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      udf1: params.udf1,
    });
    const { productinfo, firstname, email, udf1 } = params;

    console.log(
      "PayU Hash String:",
      `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}||||||${PAYU_SALT}`
    );

    console.log("PayU Params:", {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
    });

    return NextResponse.json({
      payuUrl: `${PAYU_BASE_URL}/_payment`,
      params: {
        ...params,
        hash,
      },
    });
  } catch (error) {
    console.error("payu/initiate error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
