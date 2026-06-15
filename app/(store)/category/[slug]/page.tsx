import Link from "next/link";
import { notFound } from "next/navigation";
import ProductsClient from "@/components/store/ProductsClient";
import {
  formatCategoryTitle,
  getStoreCategoryBySlug,
  productMatchesStoreCategory,
} from "@/lib/store-categories";
import { getAllStoreProducts } from "@/lib/store-products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getStoreCategoryBySlug(slug);
  if (!category) notFound();

  const allProducts = await getAllStoreProducts();
  const products = allProducts.filter((product) =>
    productMatchesStoreCategory(product, category)
  );
  const title = formatCategoryTitle(slug);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#1A1A1A]">
      <header className="w-full bg-[#FFFFFF] px-4 py-10 text-center text-[#1A1A1A]">
        <p className="mx-auto inline-flex pill-gradient px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#1A1A1A]">{title}</h1>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        <nav className="mb-2 text-sm text-zinc-600">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>{" "}
          <span className="text-zinc-400">/</span>{" "}
          <Link href="/products" className="hover:text-zinc-900">
            Products
          </Link>{" "}
          <span className="text-zinc-400">/</span>{" "}
          <span className="text-zinc-900">{title}</span>
        </nav>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
          <div>
            <p className="text-sm text-zinc-500">
              No products in this category yet.
            </p>
            <Link
              href="/products"
              className="btn-gradient mt-4 inline-flex px-6 py-2 text-sm font-semibold hover:opacity-90"
            >
              Browse all products
            </Link>
          </div>
        </div>
      ) : (
        <ProductsClient products={products} hideCategoryFilters />
      )}
    </div>
  );
}
