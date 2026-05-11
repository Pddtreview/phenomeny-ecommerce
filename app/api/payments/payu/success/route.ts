import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * PayU POSTs form-data to this URL after a payment attempt (configured as `surl`).
 * We forward the same form data to the webhook (which validates the hash and
 * updates the order) and then redirect the browser to the appropriate
 * customer-facing page.
 *
 * Order UUID is resolved from `txnid` (order number); `udf1` is not used in the PayU request.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const txnid = String(formData.get("txnid") || "").trim();
  const status = String(formData.get("status") || "");

  const failedUrl = new URL("/payment-failed", request.url);

  let orderId = "";
  if (txnid) {
    const supabase = createSupabaseServiceRoleClient();
    const { data: row } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", txnid)
      .maybeSingle();
    orderId = row?.id ? String(row.id) : "";
  }

  if (!orderId) {
    return NextResponse.redirect(failedUrl, 303);
  }

  failedUrl.searchParams.set("orderId", orderId);

  const origin = new URL(request.url).origin;
  let webhookOk = false;
  try {
    const webhookRes = await fetch(`${origin}/api/payments/payu/webhook`, {
      method: "POST",
      body: formData,
    });
    webhookOk = webhookRes.ok;
  } catch (err) {
    console.error("payu/success: webhook forwarding failed", err);
  }

  if (status === "success" && webhookOk) {
    return NextResponse.redirect(
      new URL(`/order-success/${orderId}`, request.url),
      303
    );
  }

  return NextResponse.redirect(failedUrl, 303);
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}
