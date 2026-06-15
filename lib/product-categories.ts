export type DbCategory = "frames" | "crystals" | "vastu" | "bundles";

export const PRODUCT_CATEGORIES: { value: DbCategory; label: string }[] = [
  { value: "frames", label: "Frames" },
  { value: "crystals", label: "Crystals" },
  { value: "vastu", label: "Vastu" },
  { value: "bundles", label: "Bundles" },
];

export const VALID_PRODUCT_CATEGORIES = PRODUCT_CATEGORIES.map((c) => c.value);

export function parseProductCategories(
  raw: string | null | undefined
): DbCategory[] {
  if (!raw?.trim()) return [];

  const parts = raw
    .split(/[,|]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  const parsed = parts.filter((part): part is DbCategory =>
    VALID_PRODUCT_CATEGORIES.includes(part as DbCategory)
  );

  if (parsed.length > 0) return [...new Set(parsed)];

  const single = raw.trim().toLowerCase();
  if (VALID_PRODUCT_CATEGORIES.includes(single as DbCategory)) {
    return [single as DbCategory];
  }

  return [];
}

export function serializeProductCategories(categories: DbCategory[]): string {
  return [...new Set(categories)].join(",");
}

export function parseCategoriesFromBody(body: {
  categories?: unknown;
  category?: unknown;
}): DbCategory[] {
  if (Array.isArray(body.categories)) {
    const parsed = body.categories
      .filter(
        (value): value is DbCategory =>
          typeof value === "string" &&
          VALID_PRODUCT_CATEGORIES.includes(value as DbCategory)
      )
      .map((value) => value as DbCategory);
    if (parsed.length > 0) return [...new Set(parsed)];
  }

  if (
    typeof body.category === "string" &&
    VALID_PRODUCT_CATEGORIES.includes(body.category as DbCategory)
  ) {
    return [body.category as DbCategory];
  }

  return ["frames"];
}

export function formatProductCategoryLabels(
  raw: string | null | undefined
): string {
  const values = parseProductCategories(raw);
  if (values.length === 0) return "—";

  return values
    .map(
      (value) =>
        PRODUCT_CATEGORIES.find((category) => category.value === value)?.label ??
        value
    )
    .join(", ");
}

export function productHasDbCategory(
  rawCategory: string | null | undefined,
  target: DbCategory
): boolean {
  const categories = parseProductCategories(rawCategory);
  if (categories.includes(target)) return true;

  const legacy = (rawCategory ?? "").toLowerCase();
  switch (target) {
    case "frames":
      return legacy === "frames" || legacy.includes("frame");
    case "crystals":
      return legacy === "crystals" || legacy.includes("crystal");
    case "vastu":
      return legacy === "vastu" || legacy.includes("vastu");
    case "bundles":
      return legacy === "bundles" || legacy.includes("bundle");
    default:
      return false;
  }
}
