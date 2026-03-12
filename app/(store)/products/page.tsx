import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Link from "next/link";

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
    "Shop all Nauvarah products — pyrite frames, crystals, vastu items, and abundance bundles.",
  alternates: { canonical: "https://nauvarah.com/products" },
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="w-full bg-[#1B3A6B] px-4 py-12 text-center text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8860A]">
          2026 Sun Year Collection
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Our Collection</h1>
        <p className="mt-2 text-sm text-white/70">
          Handpicked pyrite and crystal products for wealth and abundance.
        </p>
      </header>

      {/* Product grid / empty state */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!hasProducts ? (
          <div className="flex min-h-[40vh] items-center justify-center text-center">
            <p className="max-w-md text-sm text-zinc-500">
              Collection launching soon. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const href = `/products/${product.slug ?? product.id}`;

              const hasPrice = product.price !== null;
              const formattedPrice = hasPrice
                ? `₹${product.price!.toLocaleString("en-IN")}`
                : "Price on request";

              const hasComparePrice =
                product.compare_price !== null && hasPrice;

              return (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  {/* Image area */}
                  <div className="flex h-48 items-center justify-center bg-zinc-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#1B3A6B] px-2 text-center">
                        <p className="text-sm font-medium text-[#C8860A] line-clamp-3">
                          {product.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col px-3 py-3">
                    <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    <div className="mt-1 flex items-baseline text-sm">
                      <span className="font-bold text-[#1B3A6B]">
                        {formattedPrice}
                      </span>
                      {hasComparePrice && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          ₹{product.compare_price!.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <Link
                      href={href}
                      className="mt-3 block rounded-lg bg-[#1B3A6B] py-2 text-center text-xs font-medium text-white transition hover:bg-[#162f55]"
                    >
                      View Product
                    </Link>
                  </div>
                </article>
            );
          })}
        </div>
      )}
    </main>
  </div>
);
}

