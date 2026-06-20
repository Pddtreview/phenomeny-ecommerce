import type { StoreProduct } from "@/lib/store-products";

export type ProductRecommendationMetadata = {
  primaryPurpose: string;
  bestFor: string;
  recommendedWhen: string;
  category: string;
  discount: number;
  featured?: boolean;
  whyKaranRecommends: string;
  placementGuide?: string;
  usageGuide?: string;
};

type MetadataSeed = ProductRecommendationMetadata & {
  aliases: string[];
};

const seeds: MetadataSeed[] = [
  {
    aliases: ["wealth yantra sacred block"],
    primaryPurpose: "Wealth & Prosperity",
    bestFor: "Business Owners, Professionals",
    recommendedWhen: "Income feels inconsistent",
    category: "Vastu",
    discount: 40,
    whyKaranRecommends:
      "It helps create a stable prosperity anchor for people who need consistency in financial flow.",
    placementGuide:
      "Place in your work desk or finance corner where you make key money decisions.",
    usageGuide: "Keep the area clean and use with a clear monthly intention.",
  },
  {
    aliases: ["wealth yantra sacred block glass", "wealth yantra glass"],
    primaryPurpose: "Wealth & Prosperity",
    bestFor: "Home, Office",
    recommendedWhen: "Financial growth feels slow",
    category: "Vastu",
    discount: 40,
    whyKaranRecommends:
      "It is used when growth feels delayed and the space needs a stronger prosperity cue.",
    placementGuide:
      "Keep in your office, reception, or living area where financial activity is centered.",
    usageGuide: "Use consistently in one location instead of moving it frequently.",
  },
  {
    aliases: ["dhan yog orgonite pyramid"],
    primaryPurpose: "Wealth & Opportunities",
    bestFor: "Career Growth, Focus",
    recommendedWhen: "Opportunities keep slipping away",
    category: "Vastu",
    discount: 40,
    featured: true,
    whyKaranRecommends:
      "It is recommended for people who are putting in effort but missing timely openings.",
    placementGuide: "Place on your work desk or near your study/work zone.",
    usageGuide: "Pair with focused weekly action goals to track momentum.",
  },
  {
    aliases: ["dhan yog wealth bracelet"],
    primaryPurpose: "Wealth & Career",
    bestFor: "Professionals, Entrepreneurs",
    recommendedWhen: "Hard work isn't translating into growth",
    category: "Bracelet",
    discount: 40,
    whyKaranRecommends:
      "It is used when output is high but growth and recognition are still lagging.",
    usageGuide: "Wear daily during active work hours for best consistency.",
  },
  {
    aliases: ["black onyx evil eye bracelet"],
    primaryPurpose: "Protection & Nazar",
    bestFor: "Daily Wear",
    recommendedWhen: "You feel drained or affected by negativity",
    category: "Bracelet",
    discount: 40,
    whyKaranRecommends:
      "It is often chosen by people who report repeated energetic fatigue or emotional heaviness.",
    usageGuide: "Wear daily and avoid long gaps during high-stress weeks.",
  },
  {
    aliases: ["pyrite sacred pyramid bracelet"],
    primaryPurpose: "Wealth & Confidence",
    bestFor: "Career and Business",
    recommendedWhen: "You need momentum and confidence",
    category: "Bracelet",
    discount: 40,
    featured: true,
    whyKaranRecommends:
      "It supports people who need sharper decision confidence in work and business moves.",
    usageGuide: "Wear consistently through workdays and key meetings.",
  },
  {
    aliases: ["pyrite vastu tortoise"],
    primaryPurpose: "Stability & Vastu",
    bestFor: "Home and Office",
    recommendedWhen: "Life feels unstable",
    category: "Vastu",
    discount: 40,
    whyKaranRecommends:
      "It is used when routines and outcomes feel unstable and the space needs grounding support.",
    placementGuide: "Place in a calm and stable area of home or office.",
    usageGuide: "Keep it fixed in one spot and avoid shifting frequently.",
  },
  {
    aliases: ["pyrite crystal keychain"],
    primaryPurpose: "Daily Wealth Reminder",
    bestFor: "Everyday Carry",
    recommendedWhen: "You want a simple prosperity tool",
    category: "Accessory",
    discount: 40,
    whyKaranRecommends:
      "It works as a simple daily reminder for people starting their wealth-focused practice.",
    usageGuide: "Carry with your keys or wallet daily.",
  },
  {
    aliases: ["pyrite & karungali shield bracelet", "pyrite karungali shield bracelet"],
    primaryPurpose: "Protection + Wealth",
    bestFor: "People facing repeated setbacks",
    recommendedWhen: "Progress feels blocked",
    category: "Bracelet",
    discount: 40,
    whyKaranRecommends:
      "It is used when repeated setbacks affect both confidence and progress.",
    usageGuide: "Wear daily for continuity through high-pressure phases.",
  },
  {
    aliases: ["karungali protection bracelet"],
    primaryPurpose: "Protection & Grounding",
    bestFor: "Daily Protection",
    recommendedWhen: "You feel energetically drained",
    category: "Bracelet",
    discount: 40,
    whyKaranRecommends:
      "It is a grounding option for people who feel drained and need steadier day-to-day protection.",
    usageGuide: "Wear regularly, especially during travel or high interaction days.",
  },
  {
    aliases: ["natural pyrite wealth bracelet"],
    primaryPurpose: "Wealth Attraction",
    bestFor: "Business Owners",
    recommendedWhen: "Growth feels stagnant",
    category: "Bracelet",
    discount: 40,
    featured: true,
    whyKaranRecommends:
      "It is often prescribed when business growth feels flat despite sustained effort.",
    usageGuide: "Wear daily during business and planning hours.",
  },
  {
    aliases: ["pyrite 7 running horses vastu frame", "7 running horses frame", "sun frame"],
    primaryPurpose: "Career, Business & Property",
    bestFor: "Office, Home Office, Business",
    recommendedWhen: "Career growth and opportunities feel blocked",
    category: "Frame",
    discount: 40,
    featured: true,
    whyKaranRecommends:
      "It is used for people seeking movement in career and opportunity flow.",
    placementGuide:
      "Place on the wall facing your primary work or business activity zone.",
    usageGuide: "Keep visible in your daily line of sight while working.",
  },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const metadataEntries = seeds.flatMap((seed) =>
  seed.aliases.map((alias) => [normalize(alias), seed] as const)
);

const metadataMap = new Map(metadataEntries);

export function getProductRecommendationMetadata(
  product: Pick<StoreProduct, "name" | "slug" | "category">
): ProductRecommendationMetadata | null {
  const nameKey = normalize(product.name);
  const slugKey = normalize(product.slug.replace(/-/g, " "));

  const direct = metadataMap.get(nameKey) ?? metadataMap.get(slugKey);
  if (direct) {
    const { aliases: _aliases, ...meta } = direct;
    return meta;
  }

  return null;
}
