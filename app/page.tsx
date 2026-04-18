import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/store/Header";
import { StoreFooter } from "@/components/store/StoreFooter";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  compare_price: number | null;
  main_image: string | null;
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
      .select("product_id, price, compare_price")
      .eq("is_active", true)
      .in("product_id", ids),
    supabase
      .from("product_images")
      .select("product_id, cloudinary_url, is_primary")
      .eq("is_primary", true)
      .in("product_id", ids),
  ]);

  const variantMap = new Map<string, { price: number | null; compare: number | null }>();
  for (const v of variants ?? []) {
    if (!variantMap.has(v.product_id)) {
      variantMap.set(v.product_id, {
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
  }));
}

export const metadata: Metadata = {
  title: "Nauvaraha ? Align Your Energy. Attract Your Abundance.",
  description:
    "Sacred crystals and vastu tools, energetically charged for the 2026 Sun Year.",
  alternates: { canonical: "https://www.nauvaraha.com" },
};

function formatPrice(value: number | null) {
  if (value === null) return "Price on request";
  return (
    <>
      <span className="font-inter rupee">₹</span>
      {value.toLocaleString("en-IN")}
    </>
  );
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-[#FDFAF5] text-[#1A1A1A]">
      <Header />

      <section
        className="flex min-h-[80vh] items-center justify-center px-6 py-20 text-center sm:min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #FFF8EE 0%, #FDFAF5 50%, #FFF3E0 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <Image
            src={GOLD_SYMBOL}
            alt="Nauvaraha symbol"
            width={280}
            height={280}
            quality={90}
            className="mx-auto h-[70px] w-[70px]"
            priority
          />
          <div className="mx-auto mt-6 h-px w-[50px] bg-[#C8860A]" />
          <h1
            className="mt-7 font-cormorant font-semibold tracking-[0.05em] text-[#1A1A1A]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Align Your Energy.
            <br />
            Attract Your Abundance.
          </h1>
          <p className="mt-4 font-inter text-base font-light text-[#6B5E4E]">
            Sacred crystals and vastu tools, energetically charged for the 2026
            Sun Year.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="font-cormorant rounded-none bg-[#C8860A] px-8 py-3 text-sm uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#A86D08]"
            >
              Explore Collection
            </Link>
            <Link
              href="#story"
              className="font-cormorant rounded-none border border-[#C8860A] px-8 py-3 text-sm uppercase tracking-[0.2em] text-[#C8860A] transition-colors hover:bg-[#C8860A] hover:text-white"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#C8860A]/20 bg-[#FFF8EE] px-4 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            "Energetically Charged",
            "Lab Certified Crystals",
            "Free Shipping Above ?999",
            "6-Day Easy Returns",
          ].map((item) => (
            <p
              key={item}
              className="font-inter text-xs uppercase tracking-[0.2em] text-[#6B5E4E]"
            >
              <span className="text-[#C8860A]">? </span>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-[#FDFAF5] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-cormorant text-4xl font-semibold text-[#1A1A1A]">
              Sacred Collection
            </h2>
            <p className="mt-3 font-inter text-base text-[#6B5E4E]">
              Each piece is cleansed, charged, and sent with intention.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-lg border border-[#C8860A]/15 bg-white transition-all duration-300 hover:border-[#C8860A]/50 hover:shadow-[0_8px_30px_rgba(200,134,10,0.1)]"
              >
                <Link href={`/products/${product.slug || product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={product.main_image || GOLD_SYMBOL}
                      alt={product.name}
                      fill
                      quality={90}
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-cormorant text-base font-medium leading-snug text-[#1A1A1A]">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center">
                    <p className="font-inter text-lg font-semibold text-[#C8860A]">
                      {formatPrice(product.price)}
                    </p>
                    {product.compare_price ? (
                      <p className="ml-2 font-inter text-sm text-[#6B5E4E] line-through">
                        {formatPrice(product.compare_price)}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="mt-3 block w-full rounded-none bg-[#C8860A] py-2.5 text-center font-cormorant text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#A86D08]"
                  >
                    Add to Cart
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="bg-[#FFF8EE] px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div className="flex justify-center">
            <Image
              src={GOLD_SYMBOL}
              alt="Nauvaraha golden symbol"
              width={200}
              height={200}
              quality={90}
              className="h-auto w-[200px] drop-shadow-[0_0_20px_rgba(200,134,10,0.3)]"
            />
          </div>
          <div>
            <p className="font-cormorant text-xs tracking-[0.25em] text-[#C8860A]">
              THE NAUVARAHA STORY
            </p>
            <h2 className="mt-4 font-cormorant text-4xl font-semibold leading-tight text-[#1A1A1A]">
              Ancient Wisdom.
              <br />
              Modern Intention.
            </h2>
            <p className="mt-6 font-inter font-light leading-relaxed text-[#6B5E4E]">
              Every piece in the Nauvaraha collection is selected, charged, and
              prescribed by Karan Chopra ? Vedic astrologer with over 15 years
              of practice. These are not products. They are tools for
              transformation.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block border-b border-[#C8860A] pb-1 font-cormorant text-sm tracking-[0.12em] text-[#C8860A] transition-colors hover:text-[#A86D08]"
            >
              Meet Karan ?
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#FDFAF5] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-cormorant text-4xl font-semibold text-[#1A1A1A]">
            Shop by Intention
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { label: "Wealth & Abundance", href: "/category/crystals" },
              { label: "Protection & Shielding", href: "/category/bracelets" },
              { label: "Vastu & Home Energy", href: "/category/vastu-decor" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-[#C8860A]/20 bg-[#FFF8EE] p-8 text-center transition-colors hover:border-[#C8860A]/60"
              >
                <p className="text-4xl text-[#C8860A]">?</p>
                <h3 className="mt-3 font-cormorant text-xl text-[#1A1A1A]">
                  {item.label}
                </h3>
                <p className="mt-2 text-[#C8860A]">?</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#C8860A]/20 px-4 py-20 text-center sm:px-6"
        style={{ background: "linear-gradient(135deg, #FFF3E0 0%, #FFF8EE 100%)" }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="font-cormorant text-8xl font-thin text-[#C8860A] opacity-20">
            2026
          </p>
          <h2 className="-mt-4 font-cormorant text-3xl text-[#1A1A1A]">
            The Year of the Sun
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-center font-inter font-light text-[#6B5E4E]">
            The Sun governs confidence, authority, and abundance. 2026 is the
            year to align your energy and step into your power.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-none bg-[#C8860A] px-8 py-3 font-cormorant text-sm uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#A86D08]"
          >
            Explore the Collection
          </Link>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}

