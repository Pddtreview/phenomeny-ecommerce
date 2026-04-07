import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { expandOrderItemToVariantQuantities } from "@/lib/bundle-stock";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status =
      typeof body?.status === "string" ? body.status.trim() : "";

    if (!id || !status) {
      return NextResponse.json(
        { error: "status required" },
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

    const { error: updateErr } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", id);

    if (updateErr) {
      console.error("admin orders status update error:", updateErr);
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      );
    }

    if (status === "cancelled") {
      const { data: items, error: itemsErr } = await supabase
        .from("order_items")
        .select("variant_id, bundle_id, quantity, item_type")
        .eq("order_id", id);

      if (!itemsErr && items) {
        for (const it of items) {
          const lines = await expandOrderItemToVariantQuantities(supabase, {
            variant_id: it.variant_id,
            bundle_id: it.bundle_id,
            quantity: Number(it.quantity ?? 0),
            item_type: it.item_type,
          });
          for (const line of lines) {
            if (!line.variantId || line.quantity <= 0) continue;
            const { data: variant, error: vErr } = await supabase
              .from("product_variants")
              .select("stock_quantity")
              .eq("id", line.variantId)
              .single();
            if (vErr || !variant) continue;
            const current = Number(variant.stock_quantity ?? 0);
            const newStock = current + line.quantity;
            await supabase
              .from("product_variants")
              .update({ stock_quantity: newStock })
              .eq("id", line.variantId);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin orders status error:", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

