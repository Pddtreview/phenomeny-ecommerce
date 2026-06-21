import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAllStoreProducts } from "@/lib/store-products";
import { getStoreCategoryBySlug, productMatchesStoreCategory } from "@/lib/store-categories";
import type { StoreProduct } from "@/lib/store-products";

const WHATSAPP_NUMBER = "919115490001";
const WHATSAPP_TEXT =
  "Hi Karan, I need help choosing the right tool for my situation.";

type ClientStory = {
  id: string;
  rating: number;
  body: string | null;
  product_id: string | null;
};

type IntentionCard = {
  title: string;
  subtitle: string;
  href: string;
  sourceSlug: "crystals" | "bracelets" | "vastu-decor" | "bundles";
};

const intentionCards: IntentionCard[] = [
  {
    title: "Wealth & Career",
    subtitle: "For abundance, stability, and growth momentum.",
    href: "/preview-v2/recommendations#wealth-career",
    sourceSlug: "crystals",
  },
  {
    title: "Protection",
    subtitle: "For shielding from negativity and emotional drain.",
    href: "/preview-v2/recommendations#protection",
    sourceSlug: "bracelets",
  },
  {
    title: "Home & Vastu",
    subtitle: "For balanced space and better energy flow.",
    href: "/preview-v2/recommendations#home-vastu",
    sourceSlug: "vastu-decor",
  },
  {
    title: "Focus & Clarity",
    subtitle: "For grounded thinking and daily consistency.",
    href: "/preview-v2/recommendations#focus-clarity",
    sourceSlug: "bundles",
  },
];

async function getClientStories() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, body, product_id")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return (data ?? []) as ClientStory[];
}

function pickProductsForIntention(
  allProducts: StoreProduct[],
  sourceSlug: IntentionCard["sourceSlug"]
) {
  const category = getStoreCategoryBySlug(sourceSlug);
  if (!category) return [];
  return allProducts
    .filter((product) => productMatchesStoreCategory(product, category))
    .slice(0, 3);
}

export const metadata = {
  title: "Homepage Preview V2",
  robots: { index: false, follow: false },
};

export default async function HomePreviewPage() {
  const allProducts = await getAllStoreProducts();
  const clientStories = await getClientStories();
  const heroProduct = allProducts[0];
  const karanHeroVideoUrl = process.env.NEXT_PUBLIC_KARAN_HERO_VIDEO_URL;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_TEXT
  )}`;

  const recommendations = intentionCards.map((item) => ({
    ...item,
    products: pickProductsForIntention(allProducts, item.sourceSlug),
  }));

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroProduct?.image_url ? (
            <Image
              src={heroProduct.image_url}
              alt={heroProduct.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-[#1A1A1A]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.68)_65%,rgba(0,0,0,0.86)_100%)]" />
        </div>

        <div className="relative mx-auto grid min-h-[82vh] w-full max-w-6xl items-end gap-6 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex w-fit pill-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Karan Chopra&apos;s Guidance
            </p>
            <h1 className="mt-4 max-w-3xl text-[clamp(2rem,9vw,4.8rem)] font-black leading-[0.92] tracking-[-0.03em] text-white">
              I Don&apos;t Sell
              <br />
              Random Products.
              <br />
              <span className="bg-gradient-to-br from-[#FF6B35] via-[#E91E8C] to-[#7B2FBE] bg-clip-text text-transparent">
                I Prescribe.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              I&apos;ve guided 10,000+ clients through wealth, protection, and vastu
              remedies. Start with your intention, and I&apos;ll show you what to use.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/preview-v2/recommendations"
                className="btn-gradient inline-flex min-h-14 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white"
              >
                Get My Recommendations
              </Link>
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/35 px-8 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Ask Me on WhatsApp
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/20 bg-black/25 p-3 backdrop-blur-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/45">
              {karanHeroVideoUrl ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                >
                  <source src={karanHeroVideoUrl} />
                </video>
              ) : heroProduct?.image_url ? (
                <>
                  <Image
                    src={heroProduct.image_url}
                    alt="Karan Chopra hero media"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    unoptimized
                  />
                  <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/65 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                    Karan photo/video (temporary label until final media upload)
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/75">
                  Karan photo/video (temporary label until final media upload)
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Clients Guided", value: "10,000+" },
            { label: "Years of Practice", value: "15+" },
            { label: "Avg. Product Rating", value: "4.8/5" },
            { label: "Support Response", value: "< 24 hours" },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[#E8E8E8] bg-white px-4 py-4">
              <p className="text-2xl font-black tracking-[-0.02em] text-[#1A1A1A]">
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#666666]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Choose Your Intention */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
          Choose Your Intention
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {intentionCards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl bg-[#F7F7F7] px-5 py-5 transition hover:bg-[#EFEFEF]"
            >
              <p className="text-lg font-bold text-[#1A1A1A]">{item.title}</p>
              <p className="mt-1 text-sm text-[#666666]">{item.subtitle}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]">
                See my picks →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Meet Karan */}
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="rounded-3xl bg-[#111111] px-6 py-8 text-white sm:px-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
            Meet Karan
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.02em] sm:text-5xl">
            I read patterns first.
            <br />
            Then I recommend.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            I&apos;m Karan Chopra. For over 15 years, my work has been simple:
            diagnose the block, prescribe the right remedy, and make sure you know exactly
            how to use it. I don&apos;t believe in one-size-fits-all spirituality.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
            Whether your issue is money stagnation, constant tension at home, or lack of
            focus, I recommend tools based on your context — not trend-driven product lists.
            That is the difference between shopping and guided transformation.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/about-karan"
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A]"
            >
              Read My Story
            </Link>
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white"
            >
              Message Me Directly
            </Link>
          </div>
        </div>
      </section>

      {/* Client Stories */}
      <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
          Client Stories
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(clientStories.length > 0
            ? clientStories.slice(0, 3)
            : [
                {
                  id: "temp-story",
                  rating: 5,
                  body: "Client story content pending editorial approval.",
                  product_id: null,
                },
              ]
          ).map((story) => (
            <article key={story.id} className="rounded-2xl border border-[#E8E8E8] bg-white p-4">
              <p className="text-xs text-[#E91E8C]">
                {"★".repeat(Math.max(1, Math.min(5, story.rating || 5)))}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]">
                {story.body || "Client story text pending final review upload."}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Karan's Recommendations */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            Karan&apos;s Recommendations
          </h2>
          <Link
            href="/preview-v2/recommendations"
            className="hidden text-sm font-semibold text-[#1A1A1A] underline decoration-[#E91E8C] underline-offset-4 md:block"
          >
            View editorial page
          </Link>
        </div>
        <div className="mt-7 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recommendations.flatMap((lane) =>
            lane.products.slice(0, 1).map((product) => (
              <Link
                key={`${lane.title}-${product.id}`}
                href={`/preview-v2/products/${product.slug}`}
                className="w-[84vw] shrink-0 rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:w-[46%] lg:w-[31%]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#F2F2F2]">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 84vw, (max-width: 1024px) 46vw, 31vw"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                    {lane.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-[#1A1A1A]">
                    {product.name}
                  </p>
                  <p className="mt-2 text-xs text-[#666666]">
                    My starting recommendation for this intention.
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Daily Wisdom */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
          Daily Wisdom
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "How to Cleanse Your Crystals at Home",
            "Simple Vastu Shifts for Better Money Flow",
            "How Karan Prescribes Remedies",
          ].map((title) => (
            <article key={title} className="rounded-2xl border border-[#E8E8E8] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666]">
                Wisdom
              </p>
              <p className="mt-2 text-sm font-semibold text-[#1A1A1A]">{title}</p>
              <p className="mt-2 text-xs text-[#666666]">
                A practical note from me for daily use.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]">
                Read →
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="mx-4 rounded-3xl bg-[#111111] px-6 py-10 text-white sm:mx-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
              Consultation
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] sm:text-4xl">
              Need my direct guidance?
            </h2>
            <p className="mt-2 text-sm text-white/75">
              Book a one-to-one consultation and I&apos;ll recommend a plan built for your exact situation.
            </p>
          </div>
          <Link
            href="/consult"
            className="btn-gradient inline-flex min-h-12 items-center rounded-full px-7 text-sm font-semibold text-white"
          >
            Book Consultation
          </Link>
        </div>
      </section>

      {/* Join Karan's Circle */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-[#E8E8E8] bg-[#F7F7F7] px-5 py-7 sm:px-7 sm:py-8">
          <h2 className="text-2xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-3xl">
            Join Karan&apos;s Circle
          </h2>
          <p className="mt-2 text-sm text-[#666666]">
            I share practical guidance, ritual reminders, and recommendation updates here first.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border border-[#DFDFDF] bg-white px-4 py-3 text-sm outline-none focus:border-[#BDBDBD]"
            />
            <button className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white">
              Join
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
