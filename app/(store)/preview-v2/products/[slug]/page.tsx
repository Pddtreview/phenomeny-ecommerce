import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductDetailClient from "@/components/store/ProductDetailClient";

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

  const { data: relatedRaw } = await supabase
    .from("products")
    .select("id, name, slug")
    .neq("id", product.id)
    .eq("is_active", true)
    .limit(6);

  return {
    product,
    images: (productImages ?? []).map((img) => ({
      cloudinary_url: img.cloudinary_url,
      is_primary: !!img.is_primary,
    })),
    variants: (variants ?? []) as ProductVariantRow[],
    reviews: (reviews ?? []) as ReviewRow[],
    relatedRaw: relatedRaw ?? [],
  };
}

export const metadata = {
  title: "Product Preview V2",
  robots: { index: false, follow: false },
};

export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) notFound();

  const { product, images, variants, reviews, relatedRaw } = data;
  const variantPayload = variants.map((v) => ({
    id: v.id,
    name: v.name ?? "Default",
    sku: v.sku ?? "",
    price: Number(v.price),
    compare_price: v.compare_price != null ? Number(v.compare_price) : null,
    stock_quantity: Number(v.stock_quantity ?? 0),
    image_urls: Array.isArray(v.image_urls) ? v.image_urls : null,
  }));

  const recommendedWith = relatedRaw.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/preview-v2/recommendations"
            className="text-sm font-semibold text-[#1A1A1A] underline underline-offset-4"
          >
            ← Back to Recommendations Preview
          </Link>
        </div>

        {/* 1. Product Hero */}
        <section className="rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            1. Product Hero
          </p>
          <div className="mt-4 grid gap-7 md:grid-cols-2">
            <ProductDetailClient
              productId={product.id}
              productName={product.name}
              productCategory={product.category ?? null}
              variants={variantPayload}
              images={images}
            />
          </div>
        </section>

        {/* 2. Why Karan Recommends This */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-[#111111] p-5 text-white sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
            2. Why Karan Recommends This
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            I recommend this when I see repeated stagnation in progress, confidence,
            or financial rhythm. Used correctly, this helps restore movement and
            keeps your intention disciplined.
          </p>
        </section>

        {/* 3. Who This Is For */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            3. Who This Is For
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#1A1A1A]">
            <li>If your effort is high but outcomes feel blocked</li>
            <li>If your space feels heavy and your mind feels scattered</li>
            <li>If you need structure and consistency in your daily energy practice</li>
          </ul>
        </section>

        {/* 4. Benefits */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            4. Benefits
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              "Helps you hold one clear intention without drift",
              "Improves day-to-day consistency in energy and action",
              "Supports confidence and sharper decisions",
              "Works well with vastu and disciplined ritual",
            ].map((benefit) => (
              <div key={benefit} className="rounded-xl bg-[#F7F7F7] px-4 py-3 text-sm text-[#1A1A1A]">
                {benefit}
              </div>
            ))}
          </div>
        </section>

        {/* 5. How To Use */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            5. How To Use
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#1A1A1A]">
            <li>Before first use, define one intention in one sentence.</li>
            <li>Use it at a fixed time daily for 21 days.</li>
            <li>Pair it with action. Remedy and effort must move together.</li>
          </ol>
        </section>

        {/* 6. Recommended With */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            6. Recommended With
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {recommendedWith.map((item) => (
              <Link
                key={item.id}
                href={`/preview-v2/products/${item.slug}`}
                className="rounded-2xl bg-[#F7F7F7] p-4 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#EFEFEF]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>

        {/* 7. Reviews */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            7. Reviews
          </p>
          <div className="mt-3 space-y-3">
            {(reviews.length > 0
              ? reviews.slice(0, 3)
              : [
                  {
                    id: "temp-review",
                    rating: 5,
                    body: "Review text pending from verified purchase records.",
                    verified_purchase: true,
                  },
                ]
            ).map((review) => (
              <article key={review.id} className="rounded-xl border border-[#ECECEC] p-4">
                <p className="text-xs text-[#E91E8C]">
                  {"★".repeat(Math.max(1, Math.min(5, review.rating || 5)))}
                </p>
                <p className="mt-1 text-sm text-[#1A1A1A]">
                  {review.body || "Review text pending."}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666]">
            8. FAQ
          </p>
          <div className="mt-3 space-y-3">
            {[
              {
                q: "How long before I notice a difference?",
                a: "If you use it consistently, most people report shifts within 2-3 weeks.",
              },
              {
                q: "Can I use this with other remedies?",
                a: "Yes. I often pair this with one supporting remedy based on your situation.",
              },
              {
                q: "Is this suitable for beginners?",
                a: "Yes. Start simple, follow the routine, and avoid overcomplicating your practice.",
              },
            ].map((faq) => (
              <details key={faq.q} className="rounded-xl border border-[#ECECEC] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[#1A1A1A]">
                  {faq.q}
                </summary>
                <p className="mt-2 text-sm text-[#666666]">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 9. Related Guidance */}
        <section className="mt-5 rounded-3xl border border-[#E8E8E8] bg-[#111111] p-5 text-white sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
            9. Related Guidance
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              "How to Cleanse Your Crystals at Home",
              "Simple Vastu Shifts for Better Money Flow",
              "How I Prescribe Remedies",
            ].map((item) => (
              <Link
                key={item}
                href="/journal"
                className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15"
              >
                {item}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
