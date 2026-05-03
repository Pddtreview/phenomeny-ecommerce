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

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
    if (q.length < 2) {
      return NextResponse.json({ variants: [] });
    }

    const supabase = getSupabase();
    const pat = `%${q.replace(/%/g, "")}%`;

    const [{ data: bySku }, { data: byVarName }] = await Promise.all([
      supabase
        .from("product_variants")
        .select(
          "id, sku, name, price, stock_quantity, product_id, products(name, slug)"
        )
        .eq("is_active", true)
        .ilike("sku", pat)
        .limit(20),
      supabase
        .from("product_variants")
        .select(
          "id, sku, name, price, stock_quantity, product_id, products(name, slug)"
        )
        .eq("is_active", true)
        .ilike("name", pat)
        .limit(20),
    ]);

    const { data: prodRows } = await supabase
      .from("products")
      .select("id")
      .ilike("name", pat)
      .eq("is_active", true)
      .limit(30);

    const productIds = [...new Set((prodRows ?? []).map((r) => r.id))];
    let byProduct: typeof bySku = [];
    if (productIds.length) {
      const { data: v2 } = await supabase
        .from("product_variants")
        .select(
          "id, sku, name, price, stock_quantity, product_id, products(name, slug)"
        )
        .eq("is_active", true)
        .in("product_id", productIds)
        .limit(25);
      byProduct = v2 ?? [];
    }

    const seen = new Set<string>();
    const merged: NonNullable<typeof bySku> = [];
    for (const row of [
      ...(bySku ?? []),
      ...(byVarName ?? []),
      ...byProduct,
    ]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      merged.push(row);
      if (merged.length >= 35) break;
    }

    const variants = merged.map((r: any) => ({
      id: r.id as string,
      sku: r.sku as string,
      name: (r.name as string) ?? "",
      price: Number(r.price ?? 0),
      stock_quantity: Number(r.stock_quantity ?? 0),
      product_id: r.product_id as string,
      product_name: (r.products?.name as string) ?? "",
      product_slug: (r.products?.slug as string) ?? "",
    }));

    return NextResponse.json({ variants });
  } catch (e) {
    console.error("product-variants search error:", e);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
