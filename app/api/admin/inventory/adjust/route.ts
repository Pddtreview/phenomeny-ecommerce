import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const variantId =
      typeof body?.variantId === "string" ? body.variantId.trim() : "";
    const change = Number(body?.change);
    const reason =
      typeof body?.reason === "string" ? body.reason.trim() : "admin adjust";

    if (!variantId || !Number.isInteger(change)) {
      return NextResponse.json(
        { error: "variantId and change (integer) required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: variant, error: fetchErr } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", variantId)
      .single();

    if (fetchErr || !variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    const current = Number(variant.stock_quantity ?? 0);
    const newStock = Math.max(0, current + change);

    const { error: updateErr } = await supabase
      .from("product_variants")
      .update({ stock_quantity: newStock })
      .eq("id", variantId);

    if (updateErr) {
      console.error("inventory adjust update error:", updateErr);
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      );
    }

    await supabase.from("inventory_log").insert({
      variant_id: variantId,
      quantity_change: change,
      balance_after: newStock,
      reason: reason || "admin adjust",
    });

    return NextResponse.json({ success: true, newStock });
  } catch (e) {
    console.error("inventory adjust error:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
