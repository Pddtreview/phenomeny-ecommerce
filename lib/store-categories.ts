import {
  productHasDbCategory,
  type DbCategory,
} from "@/lib/product-categories";

export type { DbCategory };

export type StoreCategorySlug =
  | "crystals"
  | "frames"
  | "vastu"
  | "vastu-decor"
  | "bracelets"
  | "bundles";

export type StoreCategory = {
  slug: StoreCategorySlug;
  label: string;
  /** Product `category` values to include (case-insensitive). */
  dbCategories: DbCategory[];
  /** Match product name or slug (case-insensitive). */
  productMatchers?: string[];
  /** Optional name/description keywords (case-insensitive). */
  keywords?: string[];
};

/** Products that belong in the Vastu shop category. */
export const VASTU_PRODUCT_MATCHERS = [
  "wealth yantra sacred block",
  "pyrite 7 running horses vastu frame",
  "dhan yog orgonite pyramid",
  "wealth-yantra-sacred-energy-block",
  "wealth-yantra-energy-block",
  "pyrite-7-running-horses-vastu",
  "dhan-yog-orgonite",
];

/** URL slugs used in nav and marketing sections → how we match products in Supabase. */
export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: "crystals",
    label: "Crystals & Frames",
    dbCategories: ["crystals", "frames"],
  },
  {
    slug: "frames",
    label: "Frames",
    dbCategories: ["frames"],
  },
  {
    slug: "bracelets",
    label: "Bracelets",
    dbCategories: ["crystals"],
    keywords: ["bracelet", "mala", "rakhi"],
  },
  {
    slug: "vastu-decor",
    label: "Vastu Decor",
    dbCategories: ["vastu"],
    productMatchers: VASTU_PRODUCT_MATCHERS,
  },
  {
    slug: "vastu",
    label: "Vastu Decor",
    dbCategories: ["vastu"],
    productMatchers: VASTU_PRODUCT_MATCHERS,
  },
  {
    slug: "bundles",
    label: "Bundles",
    dbCategories: ["bundles"],
  },
];

export const STORE_NAV_LINKS = STORE_CATEGORIES.filter((c) =>
  ["bracelets", "vastu-decor", "crystals"].includes(c.slug)
).map(({ slug, label }) => ({ href: `/category/${slug}`, label }));

type MatchableProduct = {
  category: string | null;
  name: string;
  slug?: string | null;
  description?: string | null;
};

export function getStoreCategoryBySlug(
  slug: string
): StoreCategory | undefined {
  const normalized = slug.toLowerCase().trim();
  return STORE_CATEGORIES.find((c) => c.slug === normalized);
}

export function formatCategoryTitle(slug: string): string {
  return getStoreCategoryBySlug(slug)?.label ?? slug.replace(/-/g, " ");
}

function matchesDbCategory(productCategory: string, dbCategories: DbCategory[]): boolean {
  return dbCategories.some((db) => productHasDbCategory(productCategory, db));
}

function matchesProductList(
  product: MatchableProduct,
  matchers: string[]
): boolean {
  const haystack = `${product.name} ${product.slug ?? ""}`.toLowerCase();
  return matchers.some((m) => haystack.includes(m.toLowerCase()));
}

export function productMatchesStoreCategory(
  product: MatchableProduct,
  category: StoreCategory
): boolean {
  if (
    category.productMatchers?.length &&
    matchesProductList(product, category.productMatchers)
  ) {
    return true;
  }

  const dbMatch = matchesDbCategory(product.category ?? "", category.dbCategories);

  if (!category.keywords?.length) {
    return dbMatch;
  }

  const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
  const keywordMatch = category.keywords.some((kw) => haystack.includes(kw));

  // Bracelets: show keyword matches, or all crystals if none are tagged yet.
  if (category.slug === "bracelets") {
    return keywordMatch || dbMatch;
  }

  return dbMatch || keywordMatch;
}
