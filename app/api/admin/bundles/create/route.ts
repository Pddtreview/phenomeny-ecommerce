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
    .replace(/^-|-$/g, "") || "bundle";
}

type ItemInput = {
  product_variant_id: string;
  quantity: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const slugInput =
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

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
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

    const slug = slugInput || slugify(name);
    const supabase = getSupabase();

    const { data: bundle, error: bErr } = await supabase
      .from("bundles")
      .insert({
        name,
        slug,
        description: description || null,
        price,
        compare_price:
          compare_price != null && Number.isFinite(compare_price)
            ? compare_price
            : null,
        is_active,
        images: [],
      })
      .select("id")
      .single();

    if (bErr || !bundle) {
      if (bErr?.code === "23505") {
        return NextResponse.json(
          { error: "A bundle with this slug already exists" },
          { status: 409 }
        );
      }
      console.error("bundles create error:", bErr);
      return NextResponse.json(
        { error: "Failed to create bundle" },
        { status: 500 }
      );
    }

    const bundleId = bundle.id as string;
    const rows = items.map((it) => ({
      bundle_id: bundleId,
      product_variant_id: it.product_variant_id,
      quantity: it.quantity,
    }));

    const { error: iErr } = await supabase.from("bundle_items").insert(rows);
    if (iErr) {
      console.error("bundle_items insert error:", iErr);
      await supabase.from("bundles").delete().eq("id", bundleId);
      return NextResponse.json(
        { error: "Failed to save bundle items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bundleId });
  } catch (e) {
    console.error("admin bundles create error:", e);
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}
