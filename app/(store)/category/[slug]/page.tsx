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
  const descriptionBySlug: Record<string, string> = {
    bracelets:
      "Recommended by Karan for wealth, protection, confidence, relationships, and daily guidance.",
    frames:
      "Recommended by Karan for career movement, business growth, and home-office focus.",
    crystals:
      "Recommended by Karan for prosperity, clarity, and practical daily support.",
    "vastu-decor":
      "Recommended by Karan for wealth flow, stability, and balanced home or office energy.",
    vastu:
      "Recommended by Karan for wealth flow, stability, and balanced home or office energy.",
    bundles:
      "Recommended by Karan for combined support across key life situations.",
  };
  const description =
    descriptionBySlug[slug] ??
    "Recommended by Karan for practical support in your current life situation.";

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-inter text-[#2A1B12]">
      <header className="w-full bg-[#FFF8F0] px-4 py-10 text-center text-[#2A1B12]">
        <p className="mx-auto inline-flex pill-gradient px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#2A1B12]">{title}</h1>
        <p className="mx-auto mt-2 max-w-3xl text-sm text-[#6D5447]">{description}</p>
        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
          <span className="rounded-full bg-[#FFF2E8] px-3 py-1 text-[#D76618]">{products.length} Products</span>
          <span className="rounded-full bg-[#FFF4D9] px-3 py-1 text-[#8A4D11]">40% OFF Sitewide</span>
          <span className="rounded-full bg-[#EEF8EE] px-3 py-1 text-[#15803D]">Karan Recommended</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        <nav className="mb-2 text-sm text-[#6D5447]">
          <Link href="/" className="link-underline hover:text-[#2A1B12]">
            Home
          </Link>{" "}
          <span className="text-[#B59885]">/</span>{" "}
          <Link href="/products" className="link-underline hover:text-[#2A1B12]">
            Products
          </Link>{" "}
          <span className="text-[#B59885]">/</span>{" "}
          <span className="text-[#2A1B12]">{title}</span>
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
