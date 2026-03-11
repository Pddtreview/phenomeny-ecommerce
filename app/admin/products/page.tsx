import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

async function getProducts() {
  const supabase = await createServerSupabaseClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, category, is_active")
    .order("created_at", { ascending: false });

  if (error || !products?.length) return [];

  const productIds = products.map((p) => p.id);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("product_id, stock_quantity")
    .in("product_id", productIds);

  const variantCountByProduct = new Map<string, number>();
  const totalStockByProduct = new Map<string, number>();

  for (const v of variants ?? []) {
    const pid = v.product_id;
    variantCountByProduct.set(pid, (variantCountByProduct.get(pid) ?? 0) + 1);
    totalStockByProduct.set(
      pid,
      (totalStockByProduct.get(pid) ?? 0) + Number(v.stock_quantity ?? 0)
    );
  }

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    is_active: p.is_active,
    variants_count: variantCountByProduct.get(p.id) ?? 0,
    total_stock: totalStockByProduct.get(p.id) ?? 0,
  }));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          Add Product
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Category</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Variants</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Total stock</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{p.name}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {p.category ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-900">{p.variants_count}</td>
                <td className="px-4 py-3 text-zinc-900">{p.total_stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-medium hover:underline"
                    style={{ color: PRIMARY }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No products
          </p>
        )}
      </div>
    </div>
  );
}
