import { createServerSupabaseClient } from "@/lib/supabase-server";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  compare_price: number | null;
  image_url: string | null;
};

export async function getAllStoreProducts(): Promise<StoreProduct[]> {
  const supabase = await createServerSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, category")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !products) {
    console.error("Error fetching products:", error?.message);
    return [];
  }

  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, cloudinary_url, is_primary")
    .eq("is_primary", true)
    .in("product_id", productIds);

  const imageMap = new Map(
    (images ?? []).map((img) => [img.product_id, img.cloudinary_url])
  );

  const productsWithVariants = await Promise.all(
    products.map(async (product) => {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("price, compare_price")
        .eq("product_id", product.id)
        .eq("is_active", true)
        .limit(1)
        .single();

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? null,
        category: product.category ?? null,
        price: variant?.price ?? null,
        compare_price: variant?.compare_price ?? null,
        image_url: imageMap.get(product.id) ?? null,
      } satisfies StoreProduct;
    })
  );

  return productsWithVariants;
}
