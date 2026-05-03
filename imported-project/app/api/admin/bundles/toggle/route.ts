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
    const bundleId =
      typeof body?.bundleId === "string" ? body.bundleId.trim() : "";
    const is_active = Boolean(body?.is_active);

    if (!bundleId) {
      return NextResponse.json(
        { error: "bundleId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("bundles")
      .update({ is_active })
      .eq("id", bundleId);

    if (error) {
      console.error("bundles toggle error:", error);
      return NextResponse.json(
        { error: "Failed to update bundle" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin bundles toggle error:", e);
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}
