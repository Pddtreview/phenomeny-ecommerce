import Link from "next/link";
import { getAllStoreProducts } from "@/lib/store-products";

export const metadata = {
  title: "Preview V2",
  robots: { index: false, follow: false },
};

export default async function PreviewV2IndexPage() {
  const products = await getAllStoreProducts();
  const firstProductSlug = products[0]?.slug ?? "";

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full bg-[#1A1A1A] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          V2 Preview
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#1A1A1A]">
          Guidance-First Redesign
        </h1>
        <p className="mt-3 text-sm text-[#666666]">
          These routes are preview-only and do not replace current live pages.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/preview-v2/home"
            className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
          >
            <p className="text-lg font-bold text-[#1A1A1A]">Homepage Preview</p>
            <p className="mt-1 text-sm text-[#666666]">
              Hero, intention flow, Meet Karan, client stories, recommendations, daily wisdom,
              consultation, and circle signup.
            </p>
          </Link>

          <Link
            href="/preview-v2/recommendations"
            className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
          >
            <p className="text-lg font-bold text-[#1A1A1A]">Recommendations Preview</p>
            <p className="mt-1 text-sm text-[#666666]">
              Editorial, intention-led, curated landing page.
            </p>
          </Link>

          {firstProductSlug ? (
            <Link
              href={`/preview-v2/products/${firstProductSlug}`}
              className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
            >
              <p className="text-lg font-bold text-[#1A1A1A]">Product Page Preview</p>
              <p className="mt-1 text-sm text-[#666666]">
                One completed trust-first PDP preview with real product/cart flow.
              </p>
            </Link>
          ) : (
            <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5">
              <p className="text-lg font-bold text-[#1A1A1A]">Product Page Preview</p>
              <p className="mt-1 text-sm text-[#666666]">
                Product data not found yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
