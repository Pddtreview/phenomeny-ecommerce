import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const txnid = String(formData.get("txnid") || "").trim();

    if (txnid) {
      const supabase = createSupabaseServiceRoleClient();
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("order_number", txnid);
    }
  } catch (err) {
    console.error("payu/failure:", err);
  }

  return NextResponse.redirect(
    new URL("/checkout?payment_failed=1", request.url),
    303
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/checkout?payment_failed=1", request.url),
    303
  );
}
