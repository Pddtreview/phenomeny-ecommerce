import type { Metadata } from "next";
import ProductsClient from "@/components/store/ProductsClient";
import { getAllStoreProducts } from "@/lib/store-products";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Shop all Nauvaraha products — pyrite frames, crystals, vastu items, and abundance bundles.",
  alternates: { canonical: "https://nauvaraha.com/products" },
};

export default async function ProductsPage() {
  const products = await getAllStoreProducts();

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="w-full bg-[#FFF8F0] px-4 py-12 text-center text-[#2A1B12]">
        <p className="mx-auto inline-flex rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] pill-gradient">
          2026 Sun Year Collection
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#2A1B12]">Collection</h1>
        <p className="mx-auto mt-2 max-w-3xl text-sm text-[#6D5447]">
          Recommended by Karan for wealth, protection, confidence, relationships, and daily guidance.
        </p>
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
          <span className="rounded-full bg-[#FFF2E8] px-3 py-1 text-[#D76618]">{products.length} Products</span>
          <span className="rounded-full bg-[#FFF4D9] px-3 py-1 text-[#8A4D11]">40% OFF Sitewide</span>
          <span className="rounded-full bg-[#EEF8EE] px-3 py-1 text-[#15803D]">Karan Recommended</span>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center text-center">
          <p className="max-w-md text-sm text-zinc-500">
            Collection launching soon. Check back shortly.
          </p>
        </div>
      ) : (
        <ProductsClient products={products} />
      )}
    </div>
  );
}

