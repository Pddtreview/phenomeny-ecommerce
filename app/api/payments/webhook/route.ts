import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8")
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const signature = request.headers.get("x-razorpay-signature") || "";

  try {
    const rawBody = await request.text();

    if (secret && signature) {
      const ok = verifySignature(rawBody, signature, secret);
      if (!ok) {
        console.error("Razorpay webhook signature mismatch");
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    } else {
      console.warn("Razorpay webhook secret/signature missing; skipping verify");
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event as string | undefined;
    const entity = payload?.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id as string | undefined;

    if (!event || !razorpayOrderId) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event === "payment.captured") {
      await supabase
        .from("orders")
        .update({ payment_status: "paid", order_status: "confirmed" })
        .eq("razorpay_order_id", razorpayOrderId);
    }

    if (event === "payment.failed") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("razorpay_order_id", razorpayOrderId);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("Razorpay webhook error:", e);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

