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
    <div className="min-h-screen bg-[#FFFFFF]">
      <header className="w-full bg-[#FFFFFF] px-4 py-12 text-center text-[#1A1A1A]">
        <p className="mx-auto inline-flex rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] pill-gradient">
          2026 Sun Year Collection
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1A1A1A]">Our Collection</h1>
        <p className="mt-2 text-sm text-[#666666]">
          Handpicked pyrite and crystal products for wealth and abundance.
        </p>
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

