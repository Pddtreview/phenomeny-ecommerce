import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import {
  generatePayUHash,
  PAYU_BASE_URL,
  PAYU_KEY,
  PAYU_SALT,
} from "@/lib/payu";

export const runtime = "nodejs";

function getSiteUrl(request: NextRequest): string | null {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (fromEnv && /^https?:\/\//.test(fromEnv)) return fromEnv.replace(/\/$/, "");
  // Fallback to the request's own origin (works for Replit dev domains and
  // production behind any proxy). PayU requires HTTPS in live mode.
  try {
    const origin = new URL(request.url).origin;
    if (origin.startsWith("https://") || origin.startsWith("http://localhost"))
      return origin;
  } catch {}
  return null;
}

function sanitizeFirstName(raw: string | undefined | null): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "Customer";
  const first = trimmed.split(/\s+/)[0].replace(/[^A-Za-z]/g, "");
  return first || "Customer";
}

function sanitizeProductInfo(raw: string): string {
  return raw.replace(/[^A-Za-z0-9\s_-]/g, "").trim() || "Order";
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYU_KEY?.trim() || !PAYU_SALT?.trim()) {
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

    const firstname = sanitizeFirstName(customer?.name as string | undefined);
    const email =
      typeof customer?.email === "string" && customer.email.trim()
        ? customer.email.trim()
        : "customer@nauvaraha.com";
    const phone =
      typeof customer?.phone === "string" && customer.phone.trim()
        ? customer.phone.trim().replace(/\D/g, "").slice(-10)
        : "";
    const productinfo = sanitizeProductInfo(`Nauvaraha Order ${order.order_number}`);
    const txnid = String(order.order_number);
    const udf1 = String(orderId);

    const { hash, amount } = generatePayUHash({
      txnid,
      amount: order.total as number,
      productinfo,
      firstname,
      email,
      udf1,
    });

    // The form fields must match the hash inputs exactly.
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
      udf1,
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
