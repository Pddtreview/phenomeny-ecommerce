import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, category, is_active")
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Products
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">
        Edit: {product.name}
      </h1>
      <p className="text-sm text-zinc-500">
        Product edit form coming soon. Slug: {product.slug}, Category:{" "}
        {product.category ?? "—"}, Active: {String(product.is_active)}
      </p>
    </div>
  );
}
