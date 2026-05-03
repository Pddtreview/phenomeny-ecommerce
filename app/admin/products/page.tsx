import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ImportProductsModal from "@/components/admin/ImportProductsModal";

const PRIMARY = "#1B3A6B";

async function getProducts() {
  const supabase = await createServerSupabaseClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, category, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error || !products?.length) return [];

  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, cloudinary_url, is_primary")
    .eq("is_primary", true)
    .in("product_id", productIds);

  const imageMap = new Map(
    (images ?? []).map((img) => [img.product_id, img.cloudinary_url])
  );

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    is_active: p.is_active,
    created_at: p.created_at,
    thumbnail: imageMap.get(p.id) ?? null,
  }));
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/products/import-template"
            download="nauvarah-products-template.xlsx"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Download Template
          </a>
          <ImportProductsModal />
          <Link
            href="/admin/products/new"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Product</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Category</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Created</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="h-10 w-10 rounded-md object-cover ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-100 text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                    <span className="font-medium text-zinc-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {p.category ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">{p.slug}</td>
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
                <td className="px-4 py-3 text-zinc-600">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={'/admin/products/' + p.id + '/edit'}
                      className="font-medium hover:underline"
                      style={{ color: PRIMARY }}
                    >
                      Edit
                    </Link>
                    <DeleteProductButton productId={p.id} />
                  </div>
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

