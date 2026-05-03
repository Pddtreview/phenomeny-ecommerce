import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * PayU POSTs form data to `surl` (HTTPS POST). The success page is a GET-only
 * React page; without this handler the POST would not be handled correctly.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const formData = await request.formData();
  const udf1 = String(formData.get("udf1") || "");
  if (udf1 && udf1 !== id) {
    return NextResponse.redirect(new URL("/payment-failed", request.url), 303);
  }

  const origin = new URL(request.url).origin;
  const webhookRes = await fetch(`${origin}/api/payments/payu/webhook`, {
    method: "POST",
    body: formData,
  });

  const status = String(formData.get("status") || "");
  if (!webhookRes.ok) {
    return NextResponse.redirect(new URL("/payment-failed", request.url), 303);
  }
  if (status === "success") {
    return NextResponse.redirect(new URL(`/order-success/${id}`, request.url), 303);
  }
  return NextResponse.redirect(new URL("/payment-failed", request.url), 303);
}
