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

type VariantUpdate = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_price?: number | null;
  cost_price?: number | null;
  stock_quantity: number;
};

export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const category =
      body?.category && ["frames", "crystals", "vastu", "bundles"].includes(body.category)
        ? body.category
        : "frames";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const hsn_code =
      typeof body?.hsn_code === "string" ? body.hsn_code.trim() : "";
    const weight_grams =
      body?.weight_grams != null && body.weight_grams !== ""
        ? Number(body.weight_grams)
        : null;
    const is_active =
      typeof body?.is_active === "boolean" ? body.is_active : true;
    const variant: VariantUpdate | undefined = body?.variant;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    if (!variant || typeof variant.id !== "string") {
      return NextResponse.json(
        { error: "variant with id is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error: productErr } = await supabase
      .from("products")
      .update({
        name,
        slug,
        category,
        description: description || null,
        hsn_code: hsn_code || null,
        weight_grams: Number.isFinite(weight_grams) ? weight_grams : null,
        is_active,
      })
      .eq("id", id);

    if (productErr) {
      console.error("admin products update product error:", productErr);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    const { error: variantErr } = await supabase
      .from("product_variants")
      .update({
        name: variant.name,
        sku: variant.sku,
        price: Number(variant.price),
        compare_price:
          variant.compare_price != null ? Number(variant.compare_price) : null,
        cost_price:
          variant.cost_price != null ? Number(variant.cost_price) : null,
        stock_quantity: Number.isFinite(variant.stock_quantity)
          ? Number(variant.stock_quantity)
          : 0,
      })
      .eq("id", variant.id)
      .eq("product_id", id);

    if (variantErr) {
      console.error("admin products update variant error:", variantErr);
      return NextResponse.json(
        { error: "Failed to update variant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin products [id]/update error:", e);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

