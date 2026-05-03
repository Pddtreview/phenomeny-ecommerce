import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import SaveRecentlyViewed from "@/components/store/SaveRecentlyViewed";

const PRIMARY = "#1A1A1A";
const GOLD = "#E91E8C";

type ProductVariantRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  image_urls: string[] | null;
};

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  verified_purchase: boolean | null;
};

async function getProductBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, description, category")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) return null;

  const { data: productImages } = await supabase
    .from("product_images")
    .select("cloudinary_url, is_primary")
    .eq("product_id", product.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  const primaryImageUrl =
    (productImages ?? []).find((img) => img.is_primary)?.cloudinary_url ??
    productImages?.[0]?.cloudinary_url ??
    null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, name, sku, price, compare_price, stock_quantity, image_urls")
    .eq("product_id", product.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, body, verified_purchase")
    .eq("product_id", product.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const imagesForClient = (productImages ?? []).map((img) => ({
    cloudinary_url: img.cloudinary_url,
    is_primary: !!img.is_primary,
  }));

  return {
    product,
    primaryImageUrl,
    productImages: imagesForClient,
    variants: (variants ?? []) as ProductVariantRow[],
    reviews: (reviews ?? []) as ReviewRow[],
  };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return {};
  const { product, primaryImageUrl } = data;
  const metaDescription =
    product.description && product.description.length > 160
      ? product.description.slice(0, 157) + "..."
      : product.description ?? "";
  const canonicalUrl = "https://nauvaraha.com/products/" + product.slug;
  const openGraphImages = primaryImageUrl
    ? [{ url: primaryImageUrl, width: 800, height: 800, alt: product.name }]
    : undefined;
  return {
    title: product.name,
    description: metaDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      url: canonicalUrl,
      images: openGraphImages,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);

  if (!data) notFound();

  const { product, primaryImageUrl, productImages, variants, reviews } = data;

  const variantPayload = variants.map((v) => ({
    id: v.id,
    name: v.name ?? "Default",
    sku: v.sku ?? "",
    price: Number(v.price),
    compare_price: v.compare_price != null ? Number(v.compare_price) : null,
    stock_quantity: Number(v.stock_quantity ?? 0),
    image_urls: Array.isArray(v.image_urls) ? v.image_urls : null,
  }));

  const firstVariant = variants[0];
  const variantPrice = firstVariant ? Number(firstVariant.price) : 0;
  const inStock = firstVariant ? Number(firstVariant.stock_quantity ?? 0) > 0 : false;
  const availability = inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: primaryImageUrl ?? undefined,
    brand: {
      "@type": "Brand",
      name: "Nauvaraha",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: variantPrice,
      availability,
      seller: {
        "@type": "Organization",
        name: "Nauvaraha",
      },
    },
  };
  const productSchemaJson = JSON.stringify(productSchema);

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <SaveRecentlyViewed
        id={product.id}
        slug={product.slug}
        name={product.name}
        price={variantPrice}
        image_url={primaryImageUrl}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productSchemaJson }}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to products
        </Link>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <ProductDetailClient
            productId={product.id}
            productName={product.name}
            productCategory={product.category ?? null}
            variants={variantPayload}
            images={productImages}
          />
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-10 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-semibold text-zinc-900">Description</h2>
            <div className="mt-3 prose prose-sm max-w-none text-zinc-600 prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-10 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-lg border border-zinc-100 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5" aria-label={`${review.rating} stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className="text-amber-500"
                          style={{
                            color: star <= review.rating ? GOLD : "#e5e7eb",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.body && (
                    <p className="mt-2 text-sm text-zinc-600">{review.body}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
