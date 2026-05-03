import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * PayU POSTs form-data to this URL after a payment attempt (configured as `surl`).
 * We forward the same form data to the webhook (which validates the hash and
 * updates the order) and then redirect the browser to the appropriate
 * customer-facing page.
 *
 * Lives at /api/payments/payu/success to avoid conflicting with the
 * /order-success/[id] page route in Next.js 16.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const orderId = String(formData.get("udf1") || "");
  const status = String(formData.get("status") || "");

  const origin = new URL(request.url).origin;
  const failedUrl = new URL("/payment-failed", request.url);
  if (orderId) failedUrl.searchParams.set("orderId", orderId);

  if (!orderId) {
    return NextResponse.redirect(failedUrl, 303);
  }

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
