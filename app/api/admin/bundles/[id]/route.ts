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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: bundle, error: bErr } = await supabase
      .from("bundles")
      .select(
        "id, name, slug, description, price, compare_price, is_active, images, created_at"
      )
      .eq("id", id)
      .single();

    if (bErr || !bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    const { data: rawItems } = await supabase
      .from("bundle_items")
      .select("id, bundle_id, product_variant_id, quantity")
      .eq("bundle_id", id);

    const itemsList = rawItems ?? [];
    const vids = [...new Set(itemsList.map((i) => i.product_variant_id))];
    const { data: variants } = vids.length
      ? await supabase
          .from("product_variants")
          .select("id, sku, name, price, product_id, products(name, slug)")
          .in("id", vids)
      : { data: [] as unknown[] };

    const vmap = new Map(
      (variants ?? []).map((v: any) => [
        v.id,
        {
          sku: v.sku,
          name: v.name,
          price: v.price,
          product_name: v.products?.name,
        },
      ])
    );

    const items = itemsList.map((it) => {
      const v = vmap.get(it.product_variant_id);
      return {
        id: it.id,
        product_variant_id: it.product_variant_id,
        quantity: it.quantity,
        variant_label: v
          ? `${v.product_name ?? "Product"} — ${v.name ?? ""} (${v.sku})`
          : it.product_variant_id,
      };
    });

    return NextResponse.json({ bundle, items });
  } catch (e) {
    console.error("admin bundles [id] GET error:", e);
    return NextResponse.json(
      { error: "Failed to load bundle" },
      { status: 500 }
    );
  }
}

type ItemInput = {
  product_variant_id: string;
  quantity: number;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slug =
      typeof body?.slug === "string" ? body.slug.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const price = Number(body?.price);
    const compare_price =
      body?.compare_price != null && body?.compare_price !== ""
        ? Number(body.compare_price)
        : null;
    const is_active = body?.is_active !== false;
    const rawItems: ItemInput[] = Array.isArray(body?.items) ? body.items : [];

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const items: ItemInput[] = [];
    const seen = new Set<string>();
    for (const row of rawItems) {
      const vid =
        typeof row?.product_variant_id === "string"
          ? row.product_variant_id.trim()
          : "";
      const qty = Number(row?.quantity);
      if (!vid || !Number.isFinite(qty) || qty < 1) continue;
      if (seen.has(vid)) continue;
      seen.add(vid);
      items.push({ product_variant_id: vid, quantity: Math.floor(qty) });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Add at least one product variant" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error: uErr } = await supabase
      .from("bundles")
      .update({
        name,
        slug,
        description: description || null,
        price,
        compare_price:
          compare_price != null && Number.isFinite(compare_price)
            ? compare_price
            : null,
        is_active,
      })
      .eq("id", id);

    if (uErr) {
      if (uErr.code === "23505") {
        return NextResponse.json(
          { error: "Slug already in use" },
          { status: 409 }
        );
      }
      console.error("bundles update error:", uErr);
      return NextResponse.json(
        { error: "Failed to update bundle" },
        { status: 500 }
      );
    }

    await supabase.from("bundle_items").delete().eq("bundle_id", id);

    const rows = items.map((it) => ({
      bundle_id: id,
      product_variant_id: it.product_variant_id,
      quantity: it.quantity,
    }));

    const { error: iErr } = await supabase.from("bundle_items").insert(rows);
    if (iErr) {
      console.error("bundle_items replace error:", iErr);
      return NextResponse.json(
        { error: "Failed to update bundle items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("admin bundles PATCH error:", e);
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}
