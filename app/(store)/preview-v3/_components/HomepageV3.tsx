import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAllStoreProducts, type StoreProduct } from "@/lib/store-products";
import {
  getStoreCategoryBySlug,
  productMatchesStoreCategory,
} from "@/lib/store-categories";

type PreviewMode = "desktop" | "mobile";

type RecommendationLane = {
  id: string;
  title: string;
  note: string;
  categorySlug: "crystals" | "bracelets" | "vastu-decor" | "bundles";
};

const recommendationLanes: RecommendationLane[] = [
  {
    id: "wealth-career",
    title: "Wealth & Career",
    note: "When hard work is high but money flow stays unstable, I start with wealth-alignment tools and a fixed 21-day routine.",
    categorySlug: "crystals",
  },
  {
    id: "protection",
    title: "Protection",
    note: "If your energy feels exposed or drained, protection should come before expansion. This is where I begin.",
    categorySlug: "bracelets",
  },
  {
    id: "home-vastu",
    title: "Home & Vastu",
    note: "When the house feels heavy and progress slows, I prescribe vastu-led corrections with practical placement guidance.",
    categorySlug: "vastu-decor",
  },
  {
    id: "focus-clarity",
    title: "Focus & Clarity",
    note: "If your mind is scattered and decisions feel noisy, I recommend clarity-first tools to restore mental rhythm.",
    categorySlug: "bundles",
  },
];

const questions = [
  "Why does money never stay?",
  "Why do opportunities keep getting delayed?",
  "Why does my home feel heavy?",
  "Why do the same relationship patterns repeat?",
];

function getLaneProducts(allProducts: StoreProduct[], lane: RecommendationLane) {
  const category = getStoreCategoryBySlug(lane.categorySlug);
  if (!category) return [];
  return allProducts
    .filter((product) => productMatchesStoreCategory(product, category))
    .slice(0, 3);
}

async function getClientStories() {
  const supabase = await createServerSupabaseClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, body, rating, product_id")
    .eq("is_approved", true)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(6);

  return reviews ?? [];
}

export default async function HomepageV3({ mode }: { mode: PreviewMode }) {
  const allProducts = await getAllStoreProducts();
  const heroProduct = allProducts[0];
  const stories = await getClientStories();
  const lanes = recommendationLanes.map((lane) => ({
    ...lane,
    products: getLaneProducts(allProducts, lane),
  }));

  const heroVideo = process.env.NEXT_PUBLIC_KARAN_HERO_VIDEO_URL;
  const karanPhoto = process.env.NEXT_PUBLIC_KARAN_PHOTO_URL;
  const youtubeVideos = [
    process.env.NEXT_PUBLIC_KARAN_YOUTUBE_VIDEO_1,
    process.env.NEXT_PUBLIC_KARAN_YOUTUBE_VIDEO_2,
    process.env.NEXT_PUBLIC_KARAN_YOUTUBE_VIDEO_3,
  ];

  const isMobile = mode === "mobile";
  const wrapperClass = isMobile
    ? "mx-auto max-w-[430px] border-x border-[#EAEAEA] bg-white"
    : "mx-auto max-w-7xl bg-white";

  return (
    <div className="bg-[#FFFFFF] px-2 py-4 sm:px-4">
      <div className={wrapperClass}>
        {/* Section 1 — Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#111111] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div>
              <p className="inline-flex pill-gradient rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Nauvarah V3 Preview
              </p>
              <h1 className="mt-4 text-[clamp(1.9rem,7vw,4.6rem)] font-black leading-[0.93] tracking-[-0.03em]">
                Karan Chopra&apos;s Guidance,
                <br />
                Beyond The
                <br />
                Consultation Room
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
                Ancient Vedic wisdom for modern life — practical, disciplined, and
                built for real outcomes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/about-karan"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white"
                >
                  Meet Karan
                </Link>
                <Link
                  href="/preview-v3/recommendations"
                  className="btn-gradient inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
                >
                  Explore Recommendations
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-black/30">
              <div className="relative aspect-[4/5]">
                {heroVideo ? (
                  <video className="h-full w-full object-cover" controls playsInline preload="metadata">
                    <source src={heroVideo} />
                  </video>
                ) : karanPhoto ? (
                  <Image
                    src={karanPhoto}
                    alt="Karan Chopra"
                    fill
                    className="object-cover"
                    sizes={isMobile ? "100vw" : "40vw"}
                    unoptimized
                  />
                ) : heroProduct?.image_url ? (
                  <>
                    <Image
                      src={heroProduct.image_url}
                      alt="Karan media placeholder"
                      fill
                      className="object-cover"
                      sizes={isMobile ? "100vw" : "40vw"}
                      unoptimized
                    />
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/65 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                      Temporary label: Upload Karan photo/video URL in env
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
                    Temporary label: Karan media pending
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Trust Metrics */}
        <section className="px-4 py-10 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "1000+", label: "Clients Guided" },
              { value: "10+", label: "Years of Practice" },
              { value: "4.9★", label: "Client Satisfaction" },
              { value: "India", label: "Serving Clients Across The Country" },
            ].map((m) => (
              <article key={m.label} className="rounded-2xl border border-[#E8E8E8] bg-white px-4 py-4">
                <p className="text-2xl font-black tracking-[-0.02em] text-[#1A1A1A]">{m.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#666666]">
                  {m.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3 — Questions */}
        <section className="px-4 pb-10 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            The Questions People Come With
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {questions.map((q) => (
              <article key={q} className="rounded-2xl bg-[#F7F7F7] px-5 py-5">
                <p className="text-lg font-semibold text-[#1A1A1A]">{q}</p>
              </article>
            ))}
          </div>
          <Link
            href="/preview-v3/recommendations"
            className="btn-gradient mt-6 inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold text-white"
          >
            Explore Guidance
          </Link>
        </section>

        {/* Section 4 — Meet Karan */}
        <section className="px-4 pb-10 sm:px-6">
          <div className="grid gap-5 rounded-3xl bg-[#111111] px-6 py-8 text-white sm:px-8 sm:py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/25">
              {karanPhoto ? (
                <Image
                  src={karanPhoto}
                  alt="Karan Chopra portrait"
                  fill
                  className="object-cover"
                  sizes={isMobile ? "100vw" : "32vw"}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/75">
                  Temporary label: Professional Karan portrait pending
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                Meet Karan
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] sm:text-4xl">
                Authority built on
                <br />
                practice, not noise.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                Karan Chopra works with one principle: diagnose first, prescribe second.
                Clients trust him because recommendations are specific, practical, and
                designed for daily life — not generic spiritual templates.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                From wealth blocks to home energy imbalance, his approach combines
                Vedic discipline with contemporary execution.
              </p>
              <Link
                href="/about-karan"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A]"
              >
                Read Karan&apos;s Story
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5 — Client Stories */}
        <section className="px-4 pb-10 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            Client Stories
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(stories.length > 0
              ? stories.slice(0, 6)
              : [
                  {
                    id: "temp-v3-story",
                    body: "Temporary label: add approved client story",
                    rating: 5,
                    product_id: null,
                  },
                ]
            ).map((s) => (
              <article key={s.id} className="rounded-2xl border border-[#E8E8E8] bg-white p-4">
                <p className="text-xs text-[#E91E8C]">
                  {"★".repeat(Math.max(1, Math.min(5, s.rating || 5)))}
                </p>
                <p className="mt-2 text-sm text-[#1A1A1A]">{s.body || "Temporary label: story text pending"}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 6 — Recommendations */}
        <section className="px-4 pb-10 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            Karan&apos;s Recommendations
          </h2>
          <div className="mt-6 space-y-6">
            {lanes.map((lane) => (
              <article key={lane.id} className="rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-6">
                <h3 className="text-2xl font-black tracking-[-0.02em] text-[#1A1A1A]">{lane.title}</h3>
                <p className="mt-2 text-sm text-[#666666]">{lane.note}</p>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {lane.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/preview-v3/products/${product.slug}`}
                      className="w-[78vw] shrink-0 rounded-2xl bg-[#F7F7F7] p-4 sm:w-[44%] lg:w-[30%]"
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-[#1A1A1A]">{product.name}</p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]">
                        View Guidance →
                      </p>
                    </Link>
                  ))}
                  {lane.products.length === 0 && (
                    <div className="w-full rounded-2xl border border-dashed border-[#D5D5D5] bg-[#FAFAFA] p-4 text-sm text-[#666666]">
                      Temporary label: add curated product mapping
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 7 — Consultation */}
        <section className="px-4 pb-10 sm:px-6">
          <div className="rounded-3xl bg-[#111111] px-6 py-9 text-white sm:px-8 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
              Consultation
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] sm:text-5xl">
              Sometimes clarity changes everything.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              Book a direct consultation with Karan to receive a personalized direction.
            </p>
            <Link
              href="/consult"
              className="btn-gradient mt-6 inline-flex min-h-12 items-center rounded-full px-7 text-sm font-semibold text-white"
            >
              Book Consultation
            </Link>
          </div>
        </section>

        {/* Section 8 — Daily Wisdom */}
        <section className="px-4 pb-10 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            Daily Wisdom
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Articles",
              "Videos",
              "Astrology Insights",
              "Festival Guidance",
            ].map((item) => (
              <article key={item} className="rounded-2xl border border-[#E8E8E8] bg-white p-4">
                <p className="text-sm font-semibold text-[#1A1A1A]">{item}</p>
                <p className="mt-2 text-xs text-[#666666]">
                  Temporary label: editorial content will populate here
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 9 — Videos */}
        <section className="px-4 pb-10 sm:px-6">
          <h2 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
            Videos
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {youtubeVideos.map((url, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
                <div className="aspect-video bg-[#111111]">
                  {url ? (
                    <iframe
                      className="h-full w-full"
                      src={url}
                      title={`Karan video ${idx + 1}`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm text-white/75">
                      Temporary label: add YouTube URL {idx + 1}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 10 — Join Circle */}
        <section className="px-4 pb-12 sm:px-6">
          <div className="rounded-3xl border border-[#E8E8E8] bg-[#F7F7F7] px-6 py-8">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-3xl">
              Join Karan&apos;s Circle
            </h2>
            <p className="mt-2 text-sm text-[#666666]">
              Get guidance drops and direct updates on email and WhatsApp.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-full border border-[#DFDFDF] bg-white px-4 py-3 text-sm outline-none focus:border-[#BDBDBD]"
              />
              <button className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white">
                Join
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
