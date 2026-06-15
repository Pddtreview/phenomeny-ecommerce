export type DbCategory = "frames" | "crystals" | "vastu" | "bundles";

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
  /** Optional name/description keywords (case-insensitive). */
  keywords?: string[];
};

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
  },
  {
    slug: "vastu",
    label: "Vastu Decor",
    dbCategories: ["vastu"],
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
  const c = productCategory.toLowerCase();
  return dbCategories.some((db) => {
    switch (db) {
      case "frames":
        return c === "frames" || c.includes("frame");
      case "crystals":
        return c === "crystals" || c.includes("crystal");
      case "vastu":
        return c === "vastu" || c.includes("vastu");
      case "bundles":
        return c === "bundles" || c.includes("bundle");
      default:
        return c === db;
    }
  });
}

export function productMatchesStoreCategory(
  product: MatchableProduct,
  category: StoreCategory
): boolean {
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
