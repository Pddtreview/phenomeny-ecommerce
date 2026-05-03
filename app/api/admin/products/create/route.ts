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

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slugInput =
      typeof body?.slug === "string" ? body.slug.trim() : "";
    const category =
      ["frames", "crystals", "vastu", "bundles"].includes(body?.category) ?
        body.category : "frames";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const hsn_code =
      typeof body?.hsn_code === "string" ? body.hsn_code.trim() : "";
    const weight_grams =
      body?.weight_grams != null && body?.weight_grams !== ""
        ? Number(body.weight_grams)
        : null;
    const is_active = body?.is_active !== false;
    const variant = body?.variant;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const slug = slugInput || slugify(name);

    const variantName =
      typeof variant?.name === "string" ? variant.name.trim() : "Default";
    const variantSku =
      typeof variant?.sku === "string" ? variant.sku.trim() : "";
    const variantPrice = Number(variant?.price);
    const variantComparePrice =
      variant?.compare_price != null && variant?.compare_price !== ""
        ? Number(variant.compare_price)
        : null;
    const variantCostPrice =
      variant?.cost_price != null && variant?.cost_price !== ""
        ? Number(variant.cost_price)
        : null;
    const variantStock = Number(variant?.stock_quantity);
    if (!Number.isFinite(variantPrice) || variantPrice < 0) {
      return NextResponse.json(
        { error: "variant.price must be a non-negative number" },
        { status: 400 }
      );
    }
    if (!variantSku) {
      return NextResponse.json(
        { error: "variant.sku is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: product, error: productErr } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category,
        description: description || null,
        hsn_code: hsn_code || null,
        weight_grams: Number.isFinite(weight_grams) ? weight_grams : null,
        is_active,
      })
      .select("id")
      .single();

    if (productErr || !product) {
      if (productErr?.code === "23505") {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 }
        );
      }
      console.error("products create error:", productErr);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    const { error: variantErr } = await supabase.from("product_variants").insert({
      product_id: product.id,
      name: variantName,
      sku: variantSku,
      price: variantPrice,
      compare_price: variantComparePrice,
      cost_price: variantCostPrice,
      stock_quantity: Number.isInteger(variantStock) && variantStock >= 0 ? variantStock : 0,
      is_active: true,
    });

    if (variantErr) {
      console.error("product_variants create error:", variantErr);
      return NextResponse.json(
        { error: "Failed to create variant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, productId: product.id });
  } catch (e) {
    console.error("admin products create error:", e);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
