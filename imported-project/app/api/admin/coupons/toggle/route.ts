import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const couponId =
      typeof body?.couponId === "string" ? body.couponId.trim() : "";
    const is_active = Boolean(body?.is_active);

    if (!couponId) {
      return NextResponse.json(
        { error: "couponId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("coupons")
      .update({ is_active })
      .eq("id", couponId);

    if (error) {
      console.error("coupons toggle error:", error);
      return NextResponse.json(
        { error: "Failed to update coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin coupons toggle error:", e);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}
