import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductsClient from "@/components/store/ProductsClient";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  compare_price: number | null;
  image_url: string | null;
};

async function getAllProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, category")
    .eq("is_active", true);

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
        category: (product as any).category ?? null,
        price: variant?.price ?? null,
        compare_price: variant?.compare_price ?? null,
        image_url: imageMap.get(product.id) ?? null,
      } as Product;
    })
  );

  return productsWithVariants;
}

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Shop all Nauvaraha products — pyrite frames, crystals, vastu items, and abundance bundles.",
  alternates: { canonical: "https://nauvaraha.com/products" },
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <header className="w-full bg-[#FFFFFF] px-4 py-12 text-center text-[#1A1A1A]">
        <p className="mx-auto inline-flex rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] pill-gradient">
          2026 Sun Year Collection
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">Our Collection</h1>
        <p className="mt-2 text-sm text-[#666666]">
          Handpicked pyrite and crystal products for wealth and abundance.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center text-center">
          <p className="max-w-md text-sm text-zinc-500">
            Collection launching soon. Check back shortly.
          </p>
        </div>
      ) : (
        <ProductsClient products={products} />
      )}
    </div>
  );
}

