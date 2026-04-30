import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  compare_price: number | null;
  main_image: string | null;
};

function formatCategory(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getCategoryProducts(categorySlug: string): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();
  const slugWithSpaces = categorySlug.replace(/-/g, " ");
  const slugWithoutHyphens = categorySlug.replace(/-/g, "");
  const categoryCandidates = Array.from(
    new Set([categorySlug, slugWithSpaces, slugWithoutHyphens, "vastu"])
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, category")
    .in("category", categoryCandidates)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !products) {
    console.error("category products fetch error:", error?.message);
    return [];
  }

  const productsWithVariants = await Promise.all(
    products.map(async (product) => {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("price, compare_price, image_urls")
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
        main_image:
          (variant as any)?.image_urls?.[0] ??
          ((variant as any)?.image_urls ?? null),
      } as Product;
    })
  );

  return productsWithVariants;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const products = await getCategoryProducts(slug);
  const title = formatCategory(slug);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#1A1A1A]">
      <header className="w-full bg-[#FFFFFF] px-4 py-10 text-center text-[#1A1A1A]">
        <p className="mx-auto inline-flex pill-gradient px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">{title}</h1>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 text-sm text-zinc-600">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>{" "}
          <span className="text-zinc-400">/</span>{" "}
          <Link href="/products" className="hover:text-zinc-900">
            Products
          </Link>{" "}
          <span className="text-zinc-400">/</span>{" "}
          <span className="text-zinc-900">{title}</span>
        </nav>

        {products.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center text-center">
            <p className="text-sm text-zinc-500">
              No products in this category yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const href = `/products/${product.slug ?? product.id}`;
              const hasPrice = product.price !== null;
              const formattedPrice = hasPrice
                ? product.price!.toLocaleString("en-IN")
                : "Price on request";
              const hasCompare =
                product.compare_price != null &&
                hasPrice &&
                product.compare_price > product.price!;

              return (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <div className="flex h-48 items-center justify-center bg-[#FFFFFF] px-2 text-center">
                    <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-3">
                      {product.name}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col px-3 py-3">
                    <h2 className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {product.name}
                    </h2>

                    <div className="mt-1 flex items-baseline text-sm">
                      <span className="font-bold text-[#1A1A1A]">
                        {hasPrice ? (
                          <>
                            <span className="font-inter rupee">₹</span>
                            {formattedPrice}
                          </>
                        ) : (
                          formattedPrice
                        )}
                      </span>
                      {hasCompare && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          <span className="font-inter rupee">₹</span>
                          {product.compare_price!.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <Link
                      href={href}
                      className="btn-gradient mt-3 block py-2 text-center text-xs font-medium hover:scale-105 hover:opacity-90"
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

