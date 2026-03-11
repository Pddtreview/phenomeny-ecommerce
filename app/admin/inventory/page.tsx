import { createServerSupabaseClient } from "@/lib/supabase-server";
import { InventoryTable } from "@/components/admin/InventoryTable";

async function getInventoryRows() {
  const supabase = await createServerSupabaseClient();
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, product_id, name, sku, stock_quantity, price, is_active")
    .order("product_id");

  if (error || !variants?.length) return [];

  const productIds = [...new Set(variants.map((v) => v.product_id))];
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  return variants.map((v) => ({
    id: v.id,
    product_id: v.product_id,
    product_name: productMap.get(v.product_id) ?? "—",
    variant_name: v.name ?? "Default",
    sku: v.sku ?? "",
    stock_quantity: Number(v.stock_quantity ?? 0),
    price: Number(v.price ?? 0),
    is_active: Boolean(v.is_active),
  }));
}

export default async function AdminInventoryPage() {
  const rows = await getInventoryRows();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Inventory</h1>
      <p className="text-sm text-zinc-600">
        Rows in yellow: stock &lt; 20. Rows in red: out of stock.
      </p>
      <InventoryTable rows={rows} />
    </div>
  );
}
