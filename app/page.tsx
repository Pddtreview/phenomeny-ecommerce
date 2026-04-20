import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Gem, Home as HomeIcon, Shield } from "lucide-react";
import { Header } from "@/components/store/Header";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreFooter } from "@/components/store/StoreFooter";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  compare_price: number | null;
  main_image: string | null;
  variant_id: string | null;
  variant_sku: string | null;
};

const GOLD_SYMBOL =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_logo_symble_golden_xvhcp8.png";

const sectionPad = "py-24 sm:py-32";
const sectionX = "px-4 sm:px-6 lg:px-8";
const container = "mx-auto max-w-6xl";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-md bg-[#C8860A] px-8 py-3.5 text-sm font-cormorant font-medium uppercase tracking-[0.22em] text-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:bg-[#A86D08]";

const btnSecondary =
  "inline-flex min-h-12 items-center justify-center rounded-md border border-black/10 bg-transparent px-8 py-3.5 text-sm font-cormorant font-medium uppercase tracking-[0.22em] text-[#1A1A1A] transition-all duration-300 hover:border-[#C8860A]/35 hover:bg-[#C8860A]/5";

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServerSupabaseClient();

  const featured = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(6);

  const fallback =
    !featured.data?.length || featured.error
      ? await supabase
          .from("products")
          .select("id, name, slug")
          .eq("is_active", true)
          .limit(6)
      : null;

  const products = (featured.data?.length ? featured.data : fallback?.data) ?? [];
  if (!products.length) return [];

  const ids = products.map((p) => p.id);

  const [{ data: variants }, { data: images }] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, product_id, sku, price, compare_price")
      .eq("is_active", true)
      .in("product_id", ids),
    supabase
      .from("product_images")
      .select("product_id, cloudinary_url, is_primary")
      .eq("is_primary", true)
      .in("product_id", ids),
  ]);

  const variantMap = new Map<
    string,
    { id: string | null; sku: string | null; price: number | null; compare: number | null }
  >();
  for (const v of variants ?? []) {
    if (!variantMap.has(v.product_id)) {
      variantMap.set(v.product_id, {
        id: (v as any).id ?? null,
        sku: (v as any).sku ?? null,
        price: (v as any).price ?? null,
        compare: (v as any).compare_price ?? null,
      });
    }
  }

  const imageMap = new Map<string, string>();
  for (const img of images ?? []) {
    if (!imageMap.has(img.product_id)) {
      imageMap.set(img.product_id, (img as any).cloudinary_url ?? "");
    }
  }

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: variantMap.get(p.id)?.price ?? null,
    compare_price: variantMap.get(p.id)?.compare ?? null,
    main_image: imageMap.get(p.id) ?? null,
    variant_id: variantMap.get(p.id)?.id ?? null,
    variant_sku: variantMap.get(p.id)?.sku ?? null,
  }));
}

export const metadata: Metadata = {
  title: "Nauvaraha · Align Your Energy. Attract Your Abundance.",
  description:
    "Sacred crystals and vastu tools, energetically charged for the 2026 Sun Year.",
  alternates: { canonical: "https://www.nauvaraha.com" },
};

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#1A1A1A]">
      <Header />

      {/* Hero — spotlight gradient */}
      <section
        className={cn(
          "flex min-h-[82vh] items-center justify-center text-center sm:min-h-screen",
          sectionX,
          sectionPad
        )}
        style={{
          background:
            "radial-gradient(ellipse 75% 58% at 50% 32%, #FFF8EE 0%, #FDFAF5 48%, #EDE6DC 100%)",
        }}
      >
        <div className={`${container} max-w-3xl`}>
          <Image
            src={GOLD_SYMBOL}
            alt="Nauvaraha symbol"
            width={280}
            height={280}
            quality={90}
            className="mx-auto h-[72px] w-[72px] opacity-[0.92]"
            priority
          />
          <div className="mx-auto mt-8 h-px w-12 bg-[#C8860A]/50" />
          <h1
            className="text-balance mt-8 font-cormorant font-light tracking-[0.08em] text-[#1A1A1A]"
            style={{ fontSize: "clamp(2.125rem, 5.2vw, 3.75rem)", lineHeight: 1.15 }}
          >
            Align Your Energy.
            <br />
            Attract Your Abundance.
          </h1>
          <p className="mx-auto mt-6 max-w-md font-inter text-[15px] font-normal leading-[1.75] text-[#4A3F35]">
            Sacred crystals and vastu tools, energetically charged for the 2026
            Sun Year.
          </p>
          <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row sm:gap-5">
            <Link href="/products" className={btnPrimary}>
              Explore Collection
            </Link>
            <Link href="#story" className={btnSecondary}>
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip — slim, elegant */}
      <section
        className="border-y border-black/5 bg-[#FDFAF5] py-4 sm:py-5"
        aria-label="Trust and service highlights"
      >
        <div className={`${container} ${sectionX}`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-center sm:grid-cols-4 sm:gap-6">
            {[
              "Energetically Charged",
              "Lab Certified Crystals",
              <>
                Free Shipping Above <span className="font-inter rupee">₹</span>999
              </>,
              "6-Day Easy Returns",
            ].map((item, i) => (
              <p
                key={i}
                className="flex items-start justify-center gap-1.5 font-inter text-[10px] font-normal uppercase leading-snug tracking-[0.28em] text-[#4A3F35] sm:text-[11px]"
              >
                <Check
                  className="mt-0.5 h-3 w-3 shrink-0 text-[#C8860A]/80"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className={cn("bg-[#FDFAF5]", sectionX, sectionPad)}>
        <div className={container}>
          <div className="text-center">
            <h2 className="text-balance font-cormorant text-[clamp(2rem,5vw,3rem)] font-light tracking-[0.1em] text-[#1A1A1A]">
              Sacred Collection
            </h2>
            <p className="mx-auto mt-5 max-w-lg font-inter text-[15px] font-normal leading-[1.75] text-[#4A3F35]">
              Each piece is cleansed, charged, and sent with intention.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                href={`/products/${product.slug || product.id}`}
                productId={product.id}
                name={product.name}
                image={product.main_image}
                price={product.price}
                comparePrice={product.compare_price}
                variantId={product.variant_id}
                sku={product.variant_sku}
                fallbackImage={GOLD_SYMBOL}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section
        id="story"
        className={cn(
          "bg-[radial-gradient(ellipse_90%_80%_at_50%_0%,#FFF8EE_0%,#FDFAF5_55%)]",
          sectionX,
          sectionPad
        )}
      >
        <div className={`${container} grid items-center gap-14 md:grid-cols-2 md:gap-16`}>
          <div className="flex justify-center">
            <div className={cn("rounded-2xl border border-black/5 bg-white/60 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]")}>
              <Image
                src={GOLD_SYMBOL}
                alt="Nauvaraha golden symbol"
                width={200}
                height={200}
                quality={90}
                className="h-auto w-[min(200px,45vw)] opacity-95"
              />
            </div>
          </div>
          <div>
            <p className="font-cormorant text-[11px] font-medium tracking-[0.35em] text-[#C8860A]/90">
              THE NAUVARAHA STORY
            </p>
            <h2 className="text-balance mt-5 font-cormorant text-[clamp(2rem,4.8vw,2.75rem)] font-light leading-[1.15] tracking-[0.06em] text-[#1A1A1A]">
              Ancient Wisdom.
              <br />
              Modern Intention.
            </h2>
            <p className="mt-8 font-inter text-[15px] font-normal leading-[1.85] text-[#4A3F35]">
              Every piece in the Nauvaraha collection is selected, charged, and
              prescribed by Karan Chopra—Vedic astrologer with over 15 years of
              practice. These are not products. They are tools for
              transformation.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 border-b border-[#C8860A]/40 pb-0.5 font-cormorant text-sm tracking-[0.14em] text-[#C8860A] transition-colors duration-300 hover:border-[#C8860A] hover:text-[#A86D08]"
            >
              Meet Karan <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Intention — bento-style */}
      <section className={cn("bg-[#FDFAF5]", sectionX, sectionPad)}>
        <div className={container}>
          <h2 className="text-balance text-center font-cormorant text-[clamp(2rem,5vw,3rem)] font-light tracking-[0.1em] text-[#1A1A1A]">
            Shop by Intention
          </h2>
          <div className="mt-16 grid gap-5 md:grid-cols-3 md:gap-6">
            {[
              {
                label: "Wealth & Abundance",
                href: "/category/crystals",
                Icon: Gem,
              },
              {
                label: "Protection & Shielding",
                href: "/category/bracelets",
                Icon: Shield,
              },
              {
                label: "Vastu & Home Energy",
                href: "/category/vastu-decor",
                Icon: HomeIcon,
              },
            ].map(({ label, href, Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/70 p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500",
                  "hover:border-black/10 hover:bg-[#C8860A]/5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)]"
                )}
              >
                <Icon
                  className="h-11 w-11 text-[#C8860A]/85 transition-transform duration-500 group-hover:scale-105"
                  strokeWidth={1.1}
                  aria-hidden
                />
                <h3 className="text-balance mt-5 font-cormorant text-xl font-medium tracking-[0.04em] text-[#1A1A1A]">
                  {label}
                </h3>
                <div
                  className="mx-auto mt-6 h-px w-12 bg-[#C8860A]/25 transition-all duration-500 group-hover:w-16 group-hover:bg-[#C8860A]/40"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Year CTA */}
      <section
        className={cn(
          "border-y border-black/5 text-center",
          sectionX,
          sectionPad
        )}
        style={{
          background:
            "linear-gradient(165deg, #FDFAF5 0%, #FFF8EE 42%, #EDE6DC 100%)",
        }}
      >
        <div className={`${container} max-w-3xl`}>
          <p className="font-cormorant text-7xl font-extralight tracking-[0.06em] text-[#C8860A]/25 sm:text-8xl">
            2026
          </p>
          <h2 className="text-balance -mt-2 font-cormorant text-[clamp(1.75rem,4vw,2.25rem)] font-light tracking-[0.08em] text-[#1A1A1A]">
            The Year of the Sun
          </h2>
          <p className="mx-auto mt-8 max-w-lg font-inter text-[15px] font-normal leading-[1.85] text-[#4A3F35]">
            The Sun governs confidence, authority, and abundance. 2026 is the
            year to align your energy and step into your power.
          </p>
          <Link href="/products" className={cn(btnPrimary, "mt-12")}>
            Explore the Collection
          </Link>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
