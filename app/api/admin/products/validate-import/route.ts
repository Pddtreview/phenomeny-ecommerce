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

    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];
    const preview: Array<Record<string, unknown>> = [];
    let validCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const r = rows[i];
      const name = toStr(r?.name);
      const sku = toStr(r?.sku);
      const price = toNum(r?.price);
      const category = toStr(r?.category).toLowerCase();
      const image_urls = toStr(r?.image_urls);
      const compare_price = toNum(r?.compare_price);
      const cost_price = toNum(r?.cost_price);
      const stock_quantity = toNum(r?.stock_quantity);
      const is_active = toStr(r?.is_active).toUpperCase();
      const weight_grams = toNum(r?.weight_grams);
      const length_cm = toNum(r?.length_cm);
      const breadth_cm = toNum(r?.breadth_cm);
      const height_cm = toNum(r?.height_cm);

      let rowValid = true;

      if (!name) {
        errors.push({ row: rowNum, field: "name", message: "Name is required" });
        rowValid = false;
      }
      if (!sku) {
        errors.push({ row: rowNum, field: "sku", message: "SKU is required" });
        rowValid = false;
      } else if (skuSet.has(sku.toLowerCase())) {
        errors.push({
          row: rowNum,
          field: "sku",
          message: "SKU must be unique (already exists)",
        });
        rowValid = false;
      }
      if (price === null || price === undefined) {
        errors.push({
          row: rowNum,
          field: "price",
          message: "Price is required and must be a positive number",
        });
        rowValid = false;
      } else if (price <= 0) {
        errors.push({
          row: rowNum,
          field: "price",
          message: "Price must be positive",
        });
        rowValid = false;
      }

      if (compare_price !== null && (typeof compare_price !== "number" || !Number.isFinite(compare_price))) {
        errors.push({ row: rowNum, field: "compare_price", message: "Must be a number" });
        rowValid = false;
      }
      if (cost_price !== null && (typeof cost_price !== "number" || !Number.isFinite(cost_price))) {
        errors.push({ row: rowNum, field: "cost_price", message: "Must be a number" });
        rowValid = false;
      }
      if (stock_quantity !== null && (typeof stock_quantity !== "number" || !Number.isFinite(stock_quantity))) {
        errors.push({ row: rowNum, field: "stock_quantity", message: "Must be a number" });
        rowValid = false;
      }
      if (is_active && is_active !== "TRUE" && is_active !== "FALSE") {
        errors.push({ row: rowNum, field: "is_active", message: "Must be TRUE or FALSE" });
        rowValid = false;
      }
      if (weight_grams !== null && (typeof weight_grams !== "number" || !Number.isFinite(weight_grams))) {
        errors.push({ row: rowNum, field: "weight_grams", message: "Must be a number" });
        rowValid = false;
      }
      if (length_cm !== null && (typeof length_cm !== "number" || !Number.isFinite(length_cm))) {
        errors.push({ row: rowNum, field: "length_cm", message: "Must be a number" });
        rowValid = false;
      }
      if (breadth_cm !== null && (typeof breadth_cm !== "number" || !Number.isFinite(breadth_cm))) {
        errors.push({ row: rowNum, field: "breadth_cm", message: "Must be a number" });
        rowValid = false;
      }
      if (height_cm !== null && (typeof height_cm !== "number" || !Number.isFinite(height_cm))) {
        errors.push({ row: rowNum, field: "height_cm", message: "Must be a number" });
        rowValid = false;
      }

      if (image_urls) {
        const urls = image_urls.split(",").map((u) => u.trim());
        if (urls.some((u) => !u.startsWith("http"))) {
          errors.push({
            row: rowNum,
            field: "image_urls",
            message: "Each URL must start with http",
          });
          rowValid = false;
        }
      } else {
        warnings.push({ row: rowNum, field: "image_urls", message: "Empty; consider adding image URLs" });
      }
      if (category && !CATEGORIES.includes(category)) {
        warnings.push({
          row: rowNum,
          field: "category",
          message: "Should be one of: frames, crystals, vastu, bundles",
        });
      }

      if (rowValid) {
        validCount++;
        if (preview.length < 3) preview.push(r ?? {});
        skuSet.add(sku.toLowerCase());
      }
    }

    return NextResponse.json({
      valid: errors.length === 0,
      totalRows: validCount,
      errors,
      warnings,
      preview,
    });
  } catch (e) {
    console.error("validate-import error:", e);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
