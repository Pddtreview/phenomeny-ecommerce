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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code =
      typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
    const cartTotal = Number(body?.cartTotal);
    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(cartTotal) || cartTotal < 0) {
      return NextResponse.json(
        { valid: false, message: "Invalid cart total" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("id, code, type, value, used_count, max_uses, expires_at, is_active")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("coupons validate fetch error:", error);
      return NextResponse.json(
        { valid: false, message: "Could not validate coupon" },
        { status: 500 }
      );
    }

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or inactive coupon code",
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (coupon.expires_at && coupon.expires_at < today) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    const usageCount = Number(coupon.used_count ?? 0);
    const usageLimit = coupon.max_uses != null ? Number(coupon.max_uses) : null;
    if (usageLimit != null && usageCount >= usageLimit) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    let discountAmount = 0;
    if (coupon.type === "flat") {
      discountAmount = Number(coupon.value) ?? 0;
    } else if (coupon.type === "percent") {
      const pct = Number(coupon.value) ?? 0;
      discountAmount = Math.round((cartTotal * pct) / 100);
    }
    discountAmount = Math.min(Math.max(0, discountAmount), cartTotal);

    return NextResponse.json({
      valid: true,
      discountAmount,
      couponId: coupon.id,
      code: coupon.code,
    });
  } catch (e) {
    console.error("coupons validate error:", e);
    return NextResponse.json(
      { valid: false, message: "Could not validate coupon" },
      { status: 500 }
    );
  }
}
