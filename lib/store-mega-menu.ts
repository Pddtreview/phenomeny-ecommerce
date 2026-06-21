export type MegaMenuLink = {
  href: string;
  label: string;
  description?: string;
};

export const MEGA_MENU_COLLECTIONS: MegaMenuLink[] = [
  {
    href: "/category/crystals",
    label: "Wealth & Career",
    description: "Tools for stability, growth, and money momentum.",
  },
  {
    href: "/category/bracelets",
    label: "Marriage & Relationships",
    description: "Recommendations for harmony and emotional balance.",
  },
  {
    href: "/category/vastu-decor",
    label: "Protection & Negativity",
    description: "Protective tools for repeated setbacks and heavy phases.",
  },
  {
    href: "/category/frames",
    label: "Life Decisions & Clarity",
    description: "Clarity-first picks for important transitions.",
  },
];

export const MEGA_MENU_CATEGORIES: MegaMenuLink[] = [
  { href: "/category/bracelets", label: "Bracelets" },
  { href: "/category/frames", label: "Frames" },
  { href: "/category/crystals", label: "Crystals" },
  { href: "/category/vastu-decor", label: "Vastu" },
  { href: "/category/bundles", label: "Bundles" },
];

export const MEGA_MENU_FEATURED: MegaMenuLink[] = [
  {
    href: "/recommendations",
    label: "Karan's Top Recommendations",
    description: "Problem-first guidance curated by Karan.",
  },
  {
    href: "/products",
    label: "New Arrivals",
    description: "Latest additions across bracelets, frames, and vastu.",
  },
  {
    href: "/products",
    label: "Most Recommended",
    description: "Frequently prescribed tools for common situations.",
  },
];

export const MEGA_MENU_FEATURED_PRODUCT = {
  href: "/products/pyrite-7-running-horses-vastu-wall-frame",
  image:
    "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776237677/nauvarah/products/279980ba-3c18-4548-a975-c42ae46e4b4e/ael6kw9d2afeqksa9pc2.webp",
  title: "Pyrite 7 Running Horses Vastu Frame",
  subtitle: "Wealth, Momentum & Career Growth",
  description:
    "Designed to attract growth, opportunity, and positive financial momentum.",
  cta: "Discover The Remedy",
} as const;
