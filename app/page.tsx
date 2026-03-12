import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  compare_price: number | null;
  main_image: string | null;
};

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .limit(4);

  if (error || !products) return [];

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
        price: variant?.price ?? null,
        compare_price: variant?.compare_price ?? null,
        main_image:
          (variant as any)?.image_urls?.[0] ??
          // fallback if image_urls is stored as a single string
          ((variant as any)?.image_urls ?? null),
      } as Product;
    })
  );

  return productsWithVariants;
}

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nauvarah",
  url: "https://nauvarah.com",
  logo: "https://nauvarah.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
};
const orgSchemaJson = JSON.stringify(orgSchema);

export const metadata: Metadata = {
  title: "Nauvarah — Align Your Energy. Attract Your Abundance.",
  description:
    "Authentic pyrite frames, crystals, and vastu items curated for prosperity and positive energy. Shop Nauvarah.",
  alternates: { canonical: "https://nauvarah.com" },
};

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: orgSchemaJson }}
      />
      {/* Hero */}
      <section
        className="relative flex min-h-screen items-center justify-center px-6 py-16"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">
            Nauvarah • Crystal Energy
          </p>
          <h1 className="mb-4 max-w-[20rem] text-3xl font-semibold leading-tight text-white sm:max-w-xl sm:text-4xl">
            Align Your Energy. Attract Your Abundance.
          </h1>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-zinc-200 sm:text-base">
            Premium pyrite frames and vastu-aligned crystals curated to amplify
            wealth, protection, and radiant confidence in your home and
            workspace.
          </p>

          <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-white text-sm font-medium tracking-wide text-zinc-900 shadow-sm transition hover:bg-zinc-100 sm:flex-none sm:px-8"
            >
              Shop Now
            </Link>
            <Link
              href="/bundles"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/70 bg-transparent text-sm font-medium tracking-wide text-white transition hover:bg-white/10 sm:flex-none sm:px-8"
            >
              View Bundles
            </Link>
          </div>

          <div className="mt-10 flex w-full max-w-md flex-col items-center gap-3 rounded-2xl bg-white/5 p-4 text-left text-xs text-zinc-100 backdrop-blur sm:max-w-lg sm:flex-row sm:text-sm">
            <div className="flex-1">
              <p className="font-medium text-zinc-50">
                Intentionally crafted for the 2026 Sun Year.
              </p>
              <p className="mt-1 text-xs text-zinc-200">
                Each Nauvarah piece is energetically cleansed, charged, and
                shipped with guidance to help you work with your crystal daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-zinc-100 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 text-xs sm:grid-cols-4 sm:text-sm">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: GOLD }}
            >
              ₹
            </span>
            <div>
              <p className="font-semibold text-zinc-900">Free Shipping</p>
              <p className="text-[11px] text-zinc-500">Above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold text-zinc-900"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              ✦
            </span>
            <div>
              <p className="font-semibold text-zinc-900">100% Authentic</p>
              <p className="text-[11px] text-zinc-500">Ethically sourced</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold text-zinc-900"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              6D
            </span>
            <div>
              <p className="font-semibold text-zinc-900">6-Day Returns</p>
              <p className="text-[11px] text-zinc-500">Hassle-free window</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              ₹
            </span>
            <div>
              <p className="font-semibold text-zinc-900">Secure Payments</p>
              <p className="text-[11px] text-zinc-500">Powered by Razorpay</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-zinc-50 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-2 text-left">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: PRIMARY }}
            >
              Featured
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Nauvarah bestsellers
            </h2>
            <p className="max-w-md text-sm text-zinc-600">
              High-frequency pyrite frames, crystal clusters, and abundance
              tools aligned to the 2026 Sun Year energies.
            </p>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Products are being charged and prepared. Please check back in a
              moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {products.map((product) => {
                const imageUrl =
                  product.main_image ??
                  "/images/placeholders/product-gradient.jpg";

                const productHref = `/products/${product.slug ?? product.id}`;

                const hasPrice = product.price !== null;
                const formattedPrice = hasPrice
                  ? `₹${product.price!.toLocaleString("en-IN")}`
                  : "Price on request";

                return (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
                  >
                    <Link href={productHref} className="block">
                      <div className="h-40 w-full overflow-hidden bg-zinc-100">
                        <img
                          src={`https://placehold.co/400x400/1B3A6B/C8860A?text=${encodeURIComponent(
                            product.name
                          )}`}
                          alt={product.name}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
                      <Link href={productHref}>
                        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
                          {product.name}
                        </h3>
                      </Link>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: PRIMARY }}
                      >
                        {formattedPrice}
                      </p>
                      <button
                        type="button"
                        className="mt-auto inline-flex h-9 w-full items-center justify-center rounded-full bg-zinc-900 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-black"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 2026 Sun Year banner */}
      <section
        className="px-4 py-8 text-center text-white sm:py-10"
        style={{ backgroundColor: GOLD }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
            2026 • Sun Year
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Curated for the 2026 Sun Year
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
            Every Nauvarah curation is designed to honour the Sun&apos;s
            leadership, confidence, and prosperity codes—helping you step into
            your boldest, brightest self this year.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 py-8 text-sm text-zinc-200 sm:px-6"
        style={{ backgroundColor: PRIMARY }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-white">Nauvarah</p>
            <p className="text-xs text-zinc-300">
              Align Your Energy. Attract Your Abundance.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              © {new Date().getFullYear()} Nauvarah. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link
              href="/refund-policy"
              className="transition hover:text-white"
            >
              Refund Policy
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
