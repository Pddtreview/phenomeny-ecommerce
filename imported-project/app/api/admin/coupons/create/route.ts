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
    const type =
      body?.type === "flat" || body?.type === "percent" ? body.type : "flat";
    const value = Number(body?.discount_value);
    const max_uses =
      body?.usage_limit != null && body?.usage_limit !== ""
        ? Number(body.usage_limit)
        : null;
    const expires_at =
      typeof body?.expiry_date === "string" && body.expiry_date.trim() !== ""
        ? body.expiry_date.trim()
        : null;

    if (!code) {
      return NextResponse.json(
        { error: "code is required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "discount_value must be a non-negative number" },
        { status: 400 }
      );
    }
    if (type === "percent" && value > 100) {
      return NextResponse.json(
        { error: "percent discount cannot exceed 100" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code,
        type,
        value,
        max_uses,
        expires_at,
        used_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 409 }
        );
      }
      console.error("coupons create error:", error);
      return NextResponse.json(
        { error: "Failed to create coupon" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, coupon });
  } catch (e) {
    console.error("admin coupons create error:", e);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
