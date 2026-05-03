import { createServerSupabaseClient } from "@/lib/supabase-server";
import { BundlesPageClient } from "@/components/admin/BundlesPageClient";

async function getBundles() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bundles")
    .select("id, name, slug, price, compare_price, is_active, created_at, images")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("admin bundles list:", error?.message);
    return [];
  }

  return data.map((b: any) => {
    const imgs = (b.images as string[] | null) ?? [];
    return {
      id: b.id as string,
      name: b.name as string,
      slug: b.slug as string,
      price: Number(b.price ?? 0),
      compare_price:
        b.compare_price != null ? Number(b.compare_price) : null,
      is_active: Boolean(b.is_active),
      created_at: (b.created_at as string) ?? null,
      thumbnail: imgs[0] ?? null,
    };
  });
}

export default async function AdminBundlesPage() {
  const bundles = await getBundles();
  return <BundlesPageClient bundles={bundles} />;
}
