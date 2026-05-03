import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const CATEGORIES = ["frames", "crystals", "vastu", "bundles"];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("Supabase not configured");
  return createClient(url, key);
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return String(v).trim();
}

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function publicIdFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname;
    const uploadIdx = path.indexOf("/upload/");
    if (uploadIdx === -1) return path.replace(/^\//, "").replace(/\.[^.]+$/, "");
    const after = path.slice(uploadIdx + 8);
    const withoutVersion = after.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^.]+$/, "");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    const supabase = getSupabase();
    const { data: existingSkus } = await supabase
      .from("product_variants")
      .select("sku");
    const skuSet = new Set(
      (existingSkus ?? []).map((r) => String(r.sku ?? "").toLowerCase())
    );

    const errors: Array<{ row: number; sku: string; message: string }> = [];
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const r = rows[i];
      const name = toStr(r?.name);
      const slugInput = toStr(r?.slug);
      const category = toStr(r?.category) || null;
      const description = toStr(r?.description) || null;
      const hsn_code = toStr(r?.hsn_code) || null;
      const weight_grams = toNum(r?.weight_grams);
      const is_active_raw = toStr(r?.is_active).toUpperCase();
      const is_active = is_active_raw === "TRUE" || is_active_raw !== "FALSE";
      const variant_name = toStr(r?.variant_name) || "Standard";
      const sku = toStr(r?.sku);
      const price = toNum(r?.price);
      const compare_price = toNum(r?.compare_price);
      const cost_price = toNum(r?.cost_price);
      const stock_quantity = toNum(r?.stock_quantity) ?? 0;
      const variant_weight_grams = toNum(r?.weight_grams);
      const image_urls_str = toStr(r?.image_urls);

      if (!name || !sku || price === null || price === undefined || price <= 0) {
        failed++;
        errors.push({
          row: rowNum,
          sku: sku || "",
          message: "Missing or invalid name, sku, or price",
        });
        continue;
      }
      if (skuSet.has(sku.toLowerCase())) {
        failed++;
        errors.push({
          row: rowNum,
          sku,
          message: "SKU already exists",
        });
        continue;
      }

      try {
        const slug = slugInput || slugFromName(name);

        const { data: productRow, error: productErr } = await supabase
          .from("products")
          .insert({
            name,
            slug,
            category,
            description,
            hsn_code,
            weight_grams,
            is_active,
          })
          .select("id")
          .single();

        if (productErr || !productRow) {
          failed++;
          errors.push({
            row: rowNum,
            sku,
            message: productErr?.message ?? "Failed to insert product",
          });
          continue;
        }

        const productId = productRow.id;

        const { error: variantErr } = await supabase
          .from("product_variants")
          .insert({
            product_id: productId,
            name: variant_name,
            sku,
            price,
            compare_price,
            cost_price,
            stock_quantity,
            weight_grams: variant_weight_grams,
            is_active: true,
          });

        if (variantErr) {
          await supabase.from("products").delete().eq("id", productId);
          failed++;
          errors.push({
            row: rowNum,
            sku,
            message: variantErr.message,
          });
          continue;
        }

        if (image_urls_str) {
          const urls = image_urls_str
            .split(",")
            .map((u) => u.trim())
            .filter((u) => u.startsWith("http"));
          if (urls.length > 0) {
            const imageRows = urls.map((url, j) => ({
              product_id: productId,
              cloudinary_url: url,
              cloudinary_public_id: publicIdFromUrl(url) || null,
              is_primary: j === 0,
            }));
            await supabase.from("product_images").insert(imageRows);
          }
        }

        skuSet.add(sku.toLowerCase());
        imported++;
      } catch (err) {
        failed++;
        errors.push({
          row: rowNum,
          sku,
          message: err instanceof Error ? err.message : "Import failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      errors,
    });
  } catch (e) {
    console.error("import error:", e);
    return NextResponse.json(
      { success: false, message: "Import failed" },
      { status: 500 }
    );
  }
}
