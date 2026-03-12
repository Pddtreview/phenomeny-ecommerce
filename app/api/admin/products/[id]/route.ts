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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select(
        "id, name, slug, category, description, hsn_code, weight_grams, is_active, created_at"
      )
      .eq("id", id)
      .single();

    if (productErr || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { data: variant } = await supabase
      .from("product_variants")
      .select(
        "id, name, sku, price, compare_price, cost_price, stock_quantity, is_active"
      )
      .eq("product_id", id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: images } = await supabase
      .from("product_images")
      .select(
        "id, product_id, cloudinary_url, cloudinary_public_id, is_primary, created_at"
      )
      .eq("product_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      product,
      variant: variant ?? null,
      images: images ?? [],
    });
  } catch (e) {
    console.error("admin products [id] GET error:", e);
    return NextResponse.json(
      { error: "Failed to load product" },
      { status: 500 }
    );
  }
}

