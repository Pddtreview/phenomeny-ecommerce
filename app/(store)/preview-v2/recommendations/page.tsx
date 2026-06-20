import Image from "next/image";
import Link from "next/link";
import { getAllStoreProducts } from "@/lib/store-products";
import { getStoreCategoryBySlug, productMatchesStoreCategory } from "@/lib/store-categories";
import type { StoreProduct } from "@/lib/store-products";

type RecommendationLane = {
  id: string;
  title: string;
  insight: string;
  slug: "crystals" | "bracelets" | "vastu-decor" | "bundles";
};

const lanes: RecommendationLane[] = [
  {
    id: "wealth-career",
    title: "Wealth & Career",
    insight:
      "If your effort is high but financial movement is low, I start here to restore momentum and discipline.",
    slug: "crystals",
  },
  {
    id: "protection",
    title: "Protection",
    insight:
      "When your energy feels exposed or drained, I prescribe protection first before expansion.",
    slug: "bracelets",
  },
  {
    id: "home-vastu",
    title: "Home & Vastu",
    insight:
      "If your home feels heavy or stuck, I use vastu-led tools to reset flow and reduce friction.",
    slug: "vastu-decor",
  },
  {
    id: "focus-clarity",
    title: "Focus & Clarity",
    insight:
      "When focus breaks and decisions get noisy, I recommend tools that stabilize mental rhythm.",
    slug: "bundles",
  },
];

function getLaneProducts(allProducts: StoreProduct[], lane: RecommendationLane) {
  const category = getStoreCategoryBySlug(lane.slug);
  if (!category) return [];
  return allProducts
    .filter((product) => productMatchesStoreCategory(product, category))
    .slice(0, 4);
}

export const metadata = {
  title: "Recommendations Preview V2",
  robots: { index: false, follow: false },
};

export default async function RecommendationsPreviewPage() {
  const allProducts = await getAllStoreProducts();
  const laneData = lanes.map((lane) => ({
    lane,
    products: getLaneProducts(allProducts, lane),
  }));

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-[#111111] px-6 py-9 text-white sm:px-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
            Curated by Karan Chopra
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.02em] sm:text-5xl">
            My Recommendations
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/75 sm:text-base">
            Don&apos;t start with product types. Start with your real block. I&apos;ve organized
            this page by intention so you can choose clearly and act with confidence.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-[#E8E8E8] bg-[#F7F7F7] p-5 sm:p-7">
          <h2 className="text-lg font-bold text-[#1A1A1A] sm:text-xl">How to use this page</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[#666666]">
            <li>Pick the intention that matches what you&apos;re facing right now.</li>
            <li>Read my recommendation note for context before buying.</li>
            <li>Open a product and follow the usage guidance with consistency.</li>
          </ol>
        </section>

        <div className="mt-8 space-y-8">
          {laneData.map(({ lane, products }) => (
            <section key={lane.id} id={lane.id} className="rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
                Intention
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
                {lane.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-[#666666]">{lane.insight}</p>
              <p className="mt-3 text-sm font-medium text-[#1A1A1A]">
                My advice: start with one tool, commit for 21 days, and track your shift.
              </p>

              <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/preview-v2/products/${product.slug}`}
                    className="w-[78vw] shrink-0 rounded-2xl bg-[#FFFFFF] shadow-[0_8px_22px_rgba(0,0,0,0.08)] sm:w-[45%] lg:w-[31%]"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#F2F2F2]">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 78vw, (max-width: 1024px) 45vw, 31vw"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="px-4 py-4">
                      <p className="line-clamp-2 text-sm font-semibold text-[#1A1A1A]">
                        {product.name}
                      </p>
                      <p className="mt-2 text-xs text-[#666666]">
                        Why I recommend this: aligned to this intention lane.
                      </p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1A1A]">
                        Read my recommendation →
                      </p>
                    </div>
                  </Link>
                ))}
                {products.length === 0 && (
                  <div className="w-full rounded-2xl border border-dashed border-[#D5D5D5] bg-[#FAFAFA] p-5 text-sm text-[#666666]">
                    Recommendation items pending for this intention.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
