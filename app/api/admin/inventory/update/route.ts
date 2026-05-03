import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) {
    throw new Error("Supabase not configured");
  }
  return createClient(url, key);
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const variantId =
      typeof body?.variantId === "string" ? body.variantId.trim() : "";
    const newQuantity = Number(body?.newQuantity);
    const oldQuantity = Number(body?.oldQuantity);

    if (!variantId) {
      return NextResponse.json(
        { error: "variantId is required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      return NextResponse.json(
        { error: "newQuantity must be a non-negative number" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(oldQuantity) || oldQuantity < 0) {
      return NextResponse.json(
        { error: "oldQuantity must be provided" },
        { status: 400 }
      );
    }

    const delta = newQuantity - oldQuantity;

    const supabase = getSupabase();

    const { error: updateErr } = await supabase
      .from("product_variants")
      .update({ stock_quantity: newQuantity })
      .eq("id", variantId);

    if (updateErr) {
      console.error("inventory update variant error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update stock quantity" },
        { status: 500 }
      );
    }

    const { error: logErr } = await supabase.from("inventory_log").insert({
      variant_id: variantId,
      change_type: "manual_adjustment",
      quantity_change: delta,
      note: "Admin manual adjustment",
    });

    if (logErr) {
      console.error("inventory_log insert error:", logErr);
      // Do not fail the request if logging fails
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin inventory update error:", e);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

