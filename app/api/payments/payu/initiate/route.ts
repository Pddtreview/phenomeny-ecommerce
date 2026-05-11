import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { generatePayUHash, PAYU_BASE_URL, PAYU_KEY } from "@/lib/payu";

export const runtime = "nodejs";

function getSiteUrl(request: NextRequest): string | null {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  try {
    const origin = new URL(request.url).origin;
    if (origin.startsWith("https://") || origin.startsWith("http://localhost"))
      return origin;
  } catch {}
  return null;
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYU_KEY?.trim() || !process.env.PAYU_MERCHANT_SALT?.trim()) {
      return NextResponse.json(
        {
          error:
            "PayU is not configured. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in the environment.",
        },
        { status: 503 }
      );
    }

    const siteUrl = getSiteUrl(request);
    if (!siteUrl) {
      return NextResponse.json(
        {
          error:
            "Site URL is not configured. Set NEXT_PUBLIC_SITE_URL to a fully qualified https URL.",
        },
        { status: 500 }
      );
    }

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

    const nameRaw = typeof customer?.name === "string" ? customer.name.trim() : "";
    const firstname = nameRaw ? nameRaw.split(/\s+/)[0]! : "Customer";
    const email =
      typeof customer?.email === "string" && customer.email.trim()
        ? customer.email.trim()
        : "customer@nauvaraha.com";
    const phone =
      typeof customer?.phone === "string" && customer.phone.trim()
        ? customer.phone.trim().replace(/\D/g, "").slice(-10)
        : "";
    const productinfo = "Nauvaraha Order " + order.order_number;
    const txnid = String(order.order_number);
    const amount = Number(order.total).toFixed(2);

    const hash = generatePayUHash({
      key: process.env.PAYU_MERCHANT_KEY!,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      salt: process.env.PAYU_MERCHANT_SALT!,
    });

    console.log("Generated hash:", hash);
    console.log("Merchant key:", process.env.PAYU_MERCHANT_KEY);
    console.log(
      "Salt first 6 chars:",
      process.env.PAYU_MERCHANT_SALT?.substring(0, 6)
    );

    const params = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${siteUrl}/api/payments/payu/success`,
      furl: `${siteUrl}/payment-failed`,
      hash,
    };

    return NextResponse.json({
      payuUrl: `${PAYU_BASE_URL}/_payment`,
      params,
    });
  } catch (error) {
    console.error("payu/initiate error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
