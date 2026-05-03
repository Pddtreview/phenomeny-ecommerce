import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderItemStockInput = {
  variant_id: string | null;
  bundle_id: string | null;
  quantity: number;
  item_type?: string | null;
};

/**
 * Expands one order_items row into per–product-variant stock movements
 * (handles bundle lines vs single-variant lines).
 */
export async function expandOrderItemToVariantQuantities(
  supabase: SupabaseClient,
  item: OrderItemStockInput
): Promise<Array<{ variantId: string; quantity: number }>> {
  const q = Number(item.quantity ?? 0);
  if (q <= 0) return [];

  const isBundle =
    item.item_type === "bundle" || (!!item.bundle_id && !item.variant_id);

  if (isBundle && item.bundle_id) {
    const { data: rows } = await supabase
      .from("bundle_items")
      .select("product_variant_id, quantity")
      .eq("bundle_id", item.bundle_id);

    return (rows ?? []).map((r: { product_variant_id: string; quantity: number }) => ({
      variantId: r.product_variant_id,
      quantity: Number(r.quantity ?? 1) * q,
    }));
  }

  if (item.variant_id) {
    return [{ variantId: item.variant_id, quantity: q }];
  }

  return [];
}
