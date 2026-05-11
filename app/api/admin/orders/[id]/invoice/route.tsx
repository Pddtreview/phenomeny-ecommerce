import React from "react";
import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { InvoicePdf, type InvoiceOrder } from "@/lib/invoice-pdf";

type OrderItemRow = {
  id: string;
  name: string | null;
  sku: string | null;
  quantity: number | string | null;
  unit_price: number | string | null;
  total_price: number | string | null;
  variant_id: string | null;
  bundle_id: string | null;
  item_type: string | null;
};

type VariantRow = { id: string; name: string | null; product_id: string };
type ProductRow = { id: string; name: string | null; slug: string | null; hsn_code: string | null };
type BundleRow = { id: string; name: string | null; slug: string | null };

function humanizeSlug(slug: string): string {
  const s = String(slug || "").trim();
  if (!s) return "";
  return s
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function firstSegmentProductTitle(name: string): string {
  const t = String(name || "").trim();
  if (!t) return "";
  const pipe = t.split("|")[0] ?? t;
  const dash = pipe.split(/[–—]/)[0]?.trim() ?? pipe.trim();
  return dash;
}

function resolveInvoiceLineName(
  row: OrderItemRow,
  variantMap: Map<string, VariantRow>,
  productMap: Map<string, ProductRow>,
  bundleMap: Map<string, BundleRow>
): string {
  const stored = String(row.name || "").trim();
  const itemType = String(row.item_type || "");
  if ((itemType === "bundle" || row.bundle_id) && row.bundle_id) {
    const b = bundleMap.get(row.bundle_id);
    if (b?.name?.trim()) return b.name.trim();
    if (b?.slug) {
      const h = humanizeSlug(b.slug);
      if (h) return h;
    }
    return firstSegmentProductTitle(stored) || stored;
  }
  if (row.variant_id) {
    const v = variantMap.get(row.variant_id);
    const p = v ? productMap.get(v.product_id) : undefined;
    const fromSlug = p?.slug ? humanizeSlug(p.slug) : "";
    const fromProduct = p?.name ? firstSegmentProductTitle(p.name) : "";
    const base = (fromSlug || fromProduct || stored).trim() || stored;
    const vn = String(v?.name || "").trim();
    if (vn && vn.toLowerCase() !== "default") {
      return `${base} (${vn})`;
    }
    return base;
  }
  return firstSegmentProductTitle(stored) || stored;
}

function resolveLineHsn(
  row: OrderItemRow,
  variantMap: Map<string, VariantRow>,
  productMap: Map<string, ProductRow>
): string | null {
  if (!row.variant_id) return null;
  const v = variantMap.get(row.variant_id);
  if (!v) return null;
  const p = productMap.get(v.product_id);
  const h = p?.hsn_code?.trim();
  return h || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServiceRoleClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, payment_method, subtotal, discount, shipping_charge, cod_charge, total, customer_id, address_id"
      )
      .eq("id", id)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response("Order not found", { status: 404 });
    }

    const [{ data: customer }, { data: address }, { data: rawItems }] =
      await Promise.all([
        supabase
          .from("customers")
          .select("id, name, phone")
          .eq("id", order.customer_id)
          .maybeSingle(),
        supabase
          .from("addresses")
          .select("id, name, phone, line1, line2, city, state, pincode")
          .eq("id", order.address_id)
          .maybeSingle(),
        supabase
          .from("order_items")
          .select(
            "id, name, sku, quantity, unit_price, total_price, variant_id, bundle_id, item_type"
          )
          .eq("order_id", order.id),
      ]);

    const rows = (rawItems || []) as OrderItemRow[];
    const variantIds = [
      ...new Set(rows.map((r) => r.variant_id).filter(Boolean) as string[]),
    ];
    const bundleIds = [
      ...new Set(rows.map((r) => r.bundle_id).filter(Boolean) as string[]),
    ];

    const variantMap = new Map<string, VariantRow>();
    const productMap = new Map<string, ProductRow>();
    const bundleMap = new Map<string, BundleRow>();

    if (variantIds.length) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, name, product_id")
        .in("id", variantIds);
      for (const v of (variants || []) as VariantRow[]) {
        variantMap.set(v.id, v);
      }
      const productIds = [
        ...new Set(
          [...variantMap.values()].map((v) => v.product_id).filter(Boolean)
        ),
      ];
      if (productIds.length) {
        const { data: products } = await supabase
          .from("products")
          .select("id, name, slug, hsn_code")
          .in("id", productIds);
        for (const p of (products || []) as ProductRow[]) {
          productMap.set(p.id, p);
        }
      }
    }

    if (bundleIds.length) {
      const { data: bundles } = await supabase
        .from("bundles")
        .select("id, name, slug")
        .in("id", bundleIds);
      for (const b of (bundles || []) as BundleRow[]) {
        bundleMap.set(b.id, b);
      }
    }

    const invoiceOrder: InvoiceOrder = {
      order_number: order.order_number,
      created_at: order.created_at,
      payment_method: order.payment_method,
      subtotal: Number(order.subtotal ?? 0),
      discount: Number(order.discount ?? 0),
      shipping_charge: Number(order.shipping_charge ?? 0),
      cod_charge: Number(order.cod_charge ?? 0),
      total: Number(order.total ?? 0),
      customer: customer
        ? {
            name: customer.name,
            phone: customer.phone,
          }
        : null,
      address: address
        ? {
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 ?? null,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          }
        : null,
      items: rows.map((it) => ({
        id: it.id,
        name: resolveInvoiceLineName(it, variantMap, productMap, bundleMap),
        sku: it.sku ?? null,
        quantity: Number(it.quantity ?? 0),
        unit_price: Number(it.unit_price ?? 0),
        total_price: Number(it.total_price ?? 0),
        hsn_code: resolveLineHsn(it, variantMap, productMap),
      })),
    };

    const stream = await renderToStream(<InvoicePdf order={invoiceOrder} />);

    const filename = `invoice-${order.order_number || order.id}.pdf`;

    return new Response(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("invoice route error:", e);
    return new Response("Failed to generate invoice", { status: 500 });
  }
}
