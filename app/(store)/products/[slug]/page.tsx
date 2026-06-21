import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import SaveRecentlyViewed from "@/components/store/SaveRecentlyViewed";
import { getAllStoreProducts } from "@/lib/store-products";
import { getProductRecommendationMetadata } from "@/lib/product-recommendation-metadata";

const GOLD = "#E91E63";

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
  const whatsappHref = `https://wa.me/919115490001?text=${encodeURIComponent(
    `Hi Karan, I need help deciding if ${product.name} is right for me.`
  )}`;
  const relatedProducts = (await getAllStoreProducts())
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 3);
  const recommendationMeta = getProductRecommendationMetadata(product);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
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
      <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#6D5447] hover:text-[#2A1B12]"
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

        <div className="mt-6 grid gap-8 sm:grid-cols-[3fr_7fr]">
          <ProductDetailClient
            productId={product.id}
            productName={product.name}
            productCategory={product.category ?? null}
            variants={variantPayload}
            images={productImages}
            recommendationMeta={recommendationMeta}
          />
        </div>

        <section className="mt-6 rounded-xl border border-[#F0DEC8] bg-[#FFFDF9] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D5447]">
            Karan&apos;s Note
          </p>
          <p className="mt-2 text-sm text-[#2A1B12]">
            “I prescribe this when I see repeated energy stagnation in chart and space.
            Use this consistently for 21 days with clear intention.”
          </p>
          <p className="mt-2 text-xs text-[#6D5447]">— Karan Chopra</p>
        </section>

        {recommendationMeta && (
          <section className="mt-6 rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-5">
            <h2 className="text-lg font-semibold text-[#2A1B12]">Why Karan Recommends This</h2>
            <p className="mt-2 text-sm text-[#6D5447]">{recommendationMeta.whyKaranRecommends}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#F2E3D4] bg-[#FFF8F0] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A6C5B]">Primary Purpose</p>
                <p className="mt-1 text-sm font-medium text-[#2A1B12]">{recommendationMeta.primaryPurpose}</p>
              </div>
              <div className="rounded-xl border border-[#F2E3D4] bg-[#FFF8F0] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A6C5B]">Best For</p>
                <p className="mt-1 text-sm font-medium text-[#2A1B12]">{recommendationMeta.bestFor}</p>
              </div>
              <div className="rounded-xl border border-[#F2E3D4] bg-[#FFF8F0] p-3 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A6C5B]">Recommended When</p>
                <p className="mt-1 text-sm font-medium text-[#2A1B12]">{recommendationMeta.recommendedWhen}</p>
              </div>
            </div>
            {recommendationMeta.placementGuide ? (
              <div className="mt-4 rounded-xl border border-[#F2E3D4] bg-[#FFF8F0] p-3">
                <h3 className="text-sm font-semibold text-[#2A1B12]">Placement Guide</h3>
                <p className="mt-1 text-sm text-[#6D5447]">{recommendationMeta.placementGuide}</p>
              </div>
            ) : null}
            {recommendationMeta.usageGuide ? (
              <div className="mt-3 rounded-xl border border-[#F2E3D4] bg-[#FFF8F0] p-3">
                <h3 className="text-sm font-semibold text-[#2A1B12]">Usage Guide</h3>
                <p className="mt-1 text-sm text-[#6D5447]">{recommendationMeta.usageGuide}</p>
              </div>
            ) : null}
          </section>
        )}

        <section className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[#FFF4D9] px-3 py-1 font-medium text-[#8A4D11]">
            Limited stock
          </span>
          <span className="rounded-full bg-[#EEF8EE] px-3 py-1 font-medium text-[#15803D]">
            Fast dispatch available
          </span>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#25D366] px-3 py-1 font-medium text-white"
          >
            Ask Karan on WhatsApp
          </a>
        </section>

        {/* Description */}
        {product.description && (
          <section className="mt-10 border-t border-[#F0DEC8] pt-8">
            <h2 className="text-lg font-semibold text-[#2A1B12]">Description</h2>
            <div className="mt-3 prose prose-sm max-w-none text-[#6D5447] prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{product.description}</p>
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-10 border-t border-[#F0DEC8] pt-8">
          <h2 className="text-lg font-semibold text-[#2A1B12]">
            Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-[#6D5447]">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-lg border border-[#F0DEC8] bg-[#FFFDF9] p-4"
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
                      <span className="rounded bg-[#FFF2E5] px-2 py-0.5 text-xs font-medium text-[#6D5447]">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.body && (
                    <p className="mt-2 text-sm text-[#6D5447]">{review.body}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-10 border-t border-[#F0DEC8] pt-8">
            <h2 className="text-lg font-semibold text-[#2A1B12]">Related Recommendations</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relatedProducts.map((item) => {
                const meta = getProductRecommendationMetadata(item);
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="card-hover rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-3"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#FFF2E5]">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="rounded-full bg-[#FFF2E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D76618]">
                        Karan Recommended
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#2A1B12]">{item.name}</p>
                    {meta ? (
                      <>
                        <p className="mt-1 line-clamp-1 text-xs text-[#6D5447]">
                          <span className="font-semibold text-[#2A1B12]">For:</span> {meta.primaryPurpose}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#6D5447]">
                          <span className="font-semibold text-[#2A1B12]">Recommended When:</span>{" "}
                          {meta.recommendedWhen}
                        </p>
                      </>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
