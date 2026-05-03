import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/store/Header";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreFooter } from "@/components/store/StoreFooter";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A]">
      <Header />
      <section className="bg-white px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mx-auto inline-flex pill-gradient px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            ✦ 2026 Sun Year Collection
          </p>
          <h1 className="mt-8 text-[clamp(3rem,8vw,7rem)] leading-[0.95] font-black tracking-[-0.03em] text-[#1A1A1A]">
            Align Your Energy.
            <br />
            Attract Your
            <br />
            <span className="bg-gradient-to-br from-[#FF6B35] via-[#E91E8C] to-[#7B2FBE] bg-clip-text text-transparent">
              Abundance.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg font-normal text-[#666666]">
            Sacred crystals and vastu tools, prescribed by Vedic astrologer Karan Chopra.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="btn-gradient px-8 py-3 font-semibold hover:scale-105 hover:opacity-90 hover:shadow-lg"
            >
              Explore Collection
            </Link>
            <Link
              href="#story"
              className="rounded-full bg-[#F5F5F5] px-8 py-3 font-semibold text-[#1A1A1A] hover:bg-[#E8E8E8]"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F5F5F5] py-4">
        <div className="whitespace-nowrap text-sm font-medium text-[#1A1A1A]">
          <div className="inline-block min-w-full animate-[marquee_20s_linear_infinite]">
            ✦ Energetically Charged &nbsp;&nbsp;✦ Lab Certified Crystals &nbsp;&nbsp;✦ Free Shipping
            Above ₹999 &nbsp;&nbsp;✦ 6-Day Easy Returns &nbsp;&nbsp;✦ Prescribed by Karan Chopra
            &nbsp;&nbsp;✦ Energetically Charged &nbsp;&nbsp;✦ Lab Certified Crystals &nbsp;&nbsp;✦
            Free Shipping Above ₹999 &nbsp;&nbsp;✦ 6-Day Easy Returns &nbsp;&nbsp;✦ Prescribed by
            Karan Chopra &nbsp;&nbsp;
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="inline-flex pill-gradient px-4 py-1 text-xs font-medium tracking-widest uppercase">
              Sacred Collection
            </p>
            <h2 className="mt-4 text-5xl font-black tracking-tight text-[#1A1A1A]">Our Bestsellers</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <section
        id="story"
        className="rounded-t-[3rem] px-4 py-24 sm:px-6 lg:px-8"
        style={{ background: "#FFFFFF" }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="inline-flex pill-gradient px-4 py-1 text-xs font-medium tracking-widest uppercase">
              The Nauvaraha Story
            </p>
            <h2 className="mt-5 text-5xl leading-[0.95] font-black tracking-[-0.03em] text-[#1A1A1A]">
              Ancient Wisdom.
              <br />
              Modern Tools.
            </h2>
            <p className="mt-6 max-w-md leading-relaxed font-normal text-[#666666]">
              Every piece is selected, charged, and prescribed by Karan Chopra — Vedic astrologer
              with 15+ years of practice.
            </p>
            <Link
              href="/about"
              className="btn-gradient mt-8 inline-flex px-8 py-3 font-semibold hover:scale-105 hover:opacity-90 hover:shadow-lg"
            >
              Meet Karan
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-5xl font-black tracking-[-0.03em] text-[#1A1A1A]">
            Shop by Intention
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Wealth",
                desc: "For abundance, prosperity, and financial confidence.",
                href: "/category/crystals",
              },
              {
                title: "Protection",
                desc: "Shield your energy from stress, negativity, and drain.",
                href: "/category/bracelets",
              },
              {
                title: "Vastu",
                desc: "Harmonize your home and workspace for better flow.",
                href: "/category/vastu-decor",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-3xl border border-[#EEEEEE] bg-[#FFFFFF] p-8 transition-all duration-300 hover:scale-[1.02]"
              >
                <h3 className="text-2xl font-bold text-[#1A1A1A]">{item.title}</h3>
                <p className="mt-3 text-sm text-[#666666]">{item.desc}</p>
                <p className="mt-6 inline-flex items-center gap-1 font-semibold text-[#1A1A1A] transition-all duration-200 group-hover:gap-2">
                  Shop now <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-4 mb-8 rounded-[3rem] bg-[#1A1A1A] px-4 py-24 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="mx-auto inline-flex rounded-full bg-white/10 px-4 py-1 text-xs tracking-widest text-white/70 uppercase">
            ✦ The Year of the Sun
          </p>
          <p className="mt-6 bg-gradient-to-br from-[#FF6B35] via-[#E91E8C] to-[#7B2FBE] bg-clip-text text-[8rem] leading-none font-black tracking-tight text-transparent">
            2026
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            Align your energy. Step into your power.
          </h2>
          <p className="mx-auto mt-4 max-w-md font-normal text-white/60">
            The Sun governs confidence, authority, and abundance. This is your year.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-3 font-semibold text-[#1A1A1A] hover:scale-105 hover:shadow-lg"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
