import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HOMEPAGE_IMAGES } from "@/lib/homepage-images";
import { pathwayCards } from "@/lib/homepage-pathway-cards";
import { getAllStoreProducts, type StoreProduct } from "@/lib/store-products";

export const metadata: Metadata = {
  title: "Homepage V6 Preview",
  robots: { index: false, follow: false },
};

type RecommendationProduct = {
  name: string;
  note: string;
  keywords: string[];
  imageOverrideUrl?: string;
  exactMatchName?: string;
};

type RecommendationStory = {
  problem: string;
  note: string;
  products: RecommendationProduct[];
  featured?: string;
};

const recommendationStories: RecommendationStory[] = [
  {
    problem: "Money & Career — If your hard work isn't translating into growth",
    products: [
      {
        name: "Dhan Yog Orgonite Pyramid",
        note: "For financial stagnation and delayed opportunities.",
        keywords: ["dhan yog", "orgonite pyramid", "dhan yog orgonite"],
      },
      {
        name: "Natural Pyrite Wealth Bracelet",
        note: "For momentum in money and career actions.",
        keywords: ["pyrite wealth bracelet", "natural pyrite bracelet", "natural pyrite"],
      },
      {
        name: "Wealth Yantra Sacred Block",
        note: "For people needing a steadier prosperity anchor.",
        keywords: ["wealth yantra sacred block", "wealth yantra", "sacred block"],
      },
    ],
    note: "I often recommend these for people struggling with financial stagnation, delayed opportunities, or lack of momentum.",
  },
  {
    problem: "Marriage & Relationships — If marriage discussions keep falling through",
    products: [
      {
        name: "Rose Quartz Love Bracelet",
        note: "For emotional softness and better communication.",
        keywords: ["rose quartz", "love bracelet"],
        imageOverrideUrl: HOMEPAGE_IMAGES.roseQuartzLoveBracelet,
      },
      {
        name: "Relationship Harmony Bracelet",
        note: "For reducing repeated misunderstandings and relationship friction.",
        keywords: ["relationship harmony", "harmony bracelet"],
        imageOverrideUrl: HOMEPAGE_IMAGES.relationshipHarmonyBracelet,
      },
      {
        name: "Couple Harmony Bracelet",
        note: "For strengthening connection, trust, and emotional balance.",
        keywords: ["couple harmony", "couple bracelet", "harmony"],
        imageOverrideUrl: HOMEPAGE_IMAGES.coupleHarmonyBracelet,
      },
    ],
    note: "For people facing delays in marriage, relationship uncertainty, misunderstandings, or emotional distance.",
  },
  {
    problem: "Repeated Setbacks — If the same setbacks keep repeating",
    products: [
      {
        name: "Black Onyx Evil Eye Bracelet",
        note: "For recurring negativity and external disturbance.",
        keywords: ["black onyx evil eye", "evil eye bracelet", "onyx"],
        exactMatchName: "Black Onyx Evil Eye Bracelet",
      },
      {
        name: "Karungali Protection Bracelet",
        note: "For grounding and energetic steadiness.",
        keywords: ["karungali protection bracelet", "karungali bracelet", "karungali"],
        exactMatchName: "Karungali Protection Bracelet",
      },
      {
        name: "Pyrite & Karungali Shield Bracelet",
        note: "For people feeling blocked repeatedly.",
        keywords: ["pyrite karungali shield bracelet", "pyrite karungali", "shield bracelet"],
        exactMatchName: "Pyrite & Karungali Shield Bracelet",
      },
    ],
    note: "For people who feel stuck, blocked, or affected by recurring setbacks.",
  },
  {
    problem: "Life Decisions — If you're facing an important life decision",
    products: [
      {
        name: "Dhan Yog Orgonite Pyramid",
        note: "For stronger confidence and direction before major decisions.",
        keywords: ["dhan yog", "orgonite pyramid", "dhan yog orgonite"],
      },
      {
        name: "Pyrite Sacred Pyramid Bracelet",
        note: "For clarity when choosing direction.",
        keywords: ["pyrite sacred pyramid bracelet", "pyrite pyramid bracelet", "pyrite pyramid"],
      },
      {
        name: "Pyrite 7 Running Horses Vastu Frame",
        note: "For decisive movement in career, business, and property choices.",
        keywords: ["pyrite 7 running horses vastu frame", "7 running horses frame", "sun frame"],
      },
    ],
    note: "For people seeking clarity before making important decisions about career, business, property, investments, or life direction.",
    featured: "Pyrite 7 Running Horses Vastu Frame",
  },
];

const wisdomCards = [
  {
    title: "How to choose your crystal at home",
    subtitle: "A practical, no-confusion approach for daily use.",
  },
  {
    title: "Simple vastu shifts for better money flow",
    subtitle: "A weekend reset from me for your living space.",
  },
  {
    title: "How Karan prescribes remedies",
    subtitle: "How intention, chart patterns, and remedies connect.",
  },
];

const ICON_STROKE = 1.8;

function IconFrame({
  children,
  tone = "orange",
}: {
  children: React.ReactNode;
  tone?: "orange" | "pink" | "amber";
}) {
  const toneClass =
    tone === "orange"
      ? "text-[#FF7A00] border-[#FFD7B8] bg-[#FFF5EB]"
      : tone === "pink"
        ? "text-[#E91E63] border-[#F8CBDB] bg-[#FFF0F6]"
        : "text-[#D99818] border-[#F6DEAA] bg-[#FFF8E6]";
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${toneClass}`}
      aria-hidden
    >
      {children}
    </span>
  );
}

function IntentionIcon({ type }: { type: "wealth" | "shield" | "love" | "focus" }) {
  if (type === "wealth") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 2.8 14.6 7.4l5 .7-3.7 3.6.9 5.1-4.8-2.5-4.8 2.5.9-5.1L4.4 8.1l5-.7L12 2.8Z" />
        <circle cx="12" cy="11" r="2.1" />
        <path d="M12 17.6v3.1M8.9 19.1h6.2" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <circle cx="12" cy="12" r="8.4" />
        <path d="M12 6.2c1.8 1.9 3.7 2.4 5 2.5v3.4c0 3-2 4.8-5 5.9-3-1.1-5-2.9-5-5.9V8.7c1.3-.1 3.2-.6 5-2.5Z" />
        <path d="M8.4 12h7.2M12 8.4v7.2" />
      </svg>
    );
  }
  if (type === "love") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M7.3 14.8c-1.9-1.6-2.8-3.8-2.1-5.8 1-2.9 4.5-3.8 6.8-1.8 2.3-2 5.8-1.1 6.8 1.8.7 2-.2 4.2-2.1 5.8" />
        <path d="M6.3 16.8c2.6-1 4-2.2 5.7-4.2 1.7 2 3.1 3.2 5.7 4.2" />
        <path d="M8.7 10.8c1.4-.3 2.5-.9 3.3-2.1.8 1.2 1.9 1.8 3.3 2.1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
      <path d="M12 3.5 16 8l-4 4-4-4 4-4Z" />
      <path d="M12 12v8M8.5 16h7" />
      <circle cx="12" cy="12" r="8.4" />
    </svg>
  );
}

function TrustIcon({ type }: { type: "clients" | "years" | "india" | "consult" }) {
  if (type === "clients") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <circle cx="12" cy="7.5" r="2.2" />
        <circle cx="6.8" cy="10.1" r="1.8" />
        <circle cx="17.2" cy="10.1" r="1.8" />
        <path d="M8.3 16.8c.7-1.6 2.1-2.4 3.7-2.4 1.6 0 3 .8 3.7 2.4" />
        <path d="M4.8 17.2c.5-1.1 1.4-1.7 2.5-1.8M16.7 15.4c1.1.1 2 .7 2.5 1.8" />
      </svg>
    );
  }
  if (type === "years") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 4.3c2 1.8 2.8 3.4 2.8 5.1A2.8 2.8 0 0 1 12 12.2a2.8 2.8 0 0 1-2.8-2.8c0-1.7.8-3.3 2.8-5.1Z" />
        <path d="M12 12.5c-2.5 0-4.6 1.8-5.1 4.3h10.2c-.5-2.5-2.6-4.3-5.1-4.3Z" />
        <path d="M8.5 19.2h7" />
      </svg>
    );
  }
  if (type === "india") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 4.2v3.1M12 16.7v3.1M4.2 12h3.1M16.7 12h3.1" />
        <circle cx="12" cy="12" r="4.6" />
        <path d="m12 9.5 1.4 2.5-1.4 2.5-1.4-2.5L12 9.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
      <path d="M6 7.8h12a2 2 0 0 1 2 2v4.6a2 2 0 0 1-2 2h-4.1L10 19.8v-3.4H6a2 2 0 0 1-2-2V9.8a2 2 0 0 1 2-2Z" />
      <path d="M12 9.8c1 .8 1.5 1.5 1.5 2.2A1.5 1.5 0 0 1 12 13.5 1.5 1.5 0 0 1 10.5 12c0-.7.5-1.4 1.5-2.2Z" />
      <path d="M9.9 15h4.2" />
    </svg>
  );
}

function SectionIcon({ type }: { type: "guidance" | "root" | "practical" | "wisdomA" | "wisdomB" | "wisdomC" }) {
  if (type === "guidance") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    );
  }
  if (type === "root") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 4.5 18.5 9 12 13.5 5.5 9 12 4.5Z" />
        <path d="m7.5 10.5 4.5 3 4.5-3M12 13.5v6" />
      </svg>
    );
  }
  if (type === "practical") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 5.5c2.2 2 3.3 3.6 3.3 5.1A3.3 3.3 0 0 1 12 13.9a3.3 3.3 0 0 1-3.3-3.3c0-1.5 1.1-3.1 3.3-5.1Z" />
        <path d="M9 17.2h6M8 19.5h8" />
      </svg>
    );
  }
  if (type === "wisdomA") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 7.5v9M7.5 12h9" />
      </svg>
    );
  }
  if (type === "wisdomB") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
        <path d="M12 4.5c2 1.8 2.8 3.3 2.8 4.8A2.8 2.8 0 0 1 12 12.1a2.8 2.8 0 0 1-2.8-2.8c0-1.5.8-3 2.8-4.8Z" />
        <path d="M12 12.3v7.2M9.2 16.1h5.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={ICON_STROKE}>
      <path d="M12 4.5 18 8v8l-6 3.5L6 16V8l6-3.5Z" />
      <path d="M12 8v8M8.8 10.2h6.4M8.8 13.8h6.4" />
    </svg>
  );
}

type ProductCardData = {
  name: string;
  note: string;
  href: string;
  imageUrl: string;
  isFeatured: boolean;
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
}

function getProductCandidates(
  products: StoreProduct[],
  item: RecommendationProduct
): StoreProduct[] {
  const normalizedExact = normalizeText(item.exactMatchName ?? item.name);

  const exactMatches = products.filter(
    (product) => normalizeText(product.name) === normalizedExact
  );

  const keywordMatches = products.filter((product) => {
    const target = normalizeText(`${product.name} ${product.description ?? ""}`);
    return item.keywords.some((keyword) => target.includes(normalizeText(keyword)));
  });

  const ordered = [...exactMatches, ...keywordMatches];
  const seen = new Set<string>();
  return ordered.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export async function HomepageV6() {
  const storeProducts = await getAllStoreProducts();
  const usedProductIds = new Set<string>();
  const usedImageUrls = new Set<string>();

  const recommendationCards = recommendationStories.map((story) => {
    const products: ProductCardData[] = story.products.map((item) => {
      const candidates = getProductCandidates(storeProducts, item);
      const matched =
        candidates.find((p) => {
          if (usedProductIds.has(p.id)) return false;
          if (p.image_url && usedImageUrls.has(p.image_url)) return false;
          return true;
        }) ??
        candidates.find((p) => !usedProductIds.has(p.id)) ??
        candidates[0] ??
        null;

      if (matched) {
        usedProductIds.add(matched.id);
        if (matched.image_url) usedImageUrls.add(matched.image_url);
      }

      return {
        name: item.name,
        note: item.note,
        href: matched ? `/products/${matched.slug}` : "/products",
        imageUrl:
          item.imageOverrideUrl ??
          matched?.image_url ??
          "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_logo_symble_golden_xvhcp8.png",
        isFeatured: story.featured === item.name,
      };
    });
    return { ...story, products };
  });

  return (
    <div className="relative overflow-hidden bg-[#FFF8F0] text-[#2A1B12]">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#FF7A00]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-[32rem] h-96 w-96 rounded-full bg-[#E91E63]/10 blur-3xl" />

      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-14 px-5 pb-24 pt-4 sm:px-8 md:gap-20 md:pt-6 lg:gap-12 lg:pb-16 lg:pt-5 lg:px-12 xl:px-16 2xl:px-20">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[36px] border border-[#F1DFCE] bg-[linear-gradient(120deg,#FFF9F2_0%,#FFF3E8_55%,#FFEFEA_100%)] p-4 shadow-[0_30px_70px_rgba(42,27,18,0.08)] md:p-7 lg:p-6">
          <div className="grid items-center gap-7 md:grid-cols-[55fr_45fr] lg:gap-8">
            <div className="order-2 md:order-1">
              <span className="inline-flex w-fit rounded-full border border-[#FFD6BA] bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AA4A1A] backdrop-blur">
                Karan Chopra&apos;s Guidance
              </span>
              <h1 className="mt-4 text-[clamp(1.7rem,4.6vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                I Don&apos;t Sell
                <br />
                Random Products.
                <br />
                <span className="bg-gradient-to-r from-[#FF7A00] to-[#E91E63] bg-clip-text text-transparent">
                  I Prescribe.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5D3F2F] md:text-base">
                I&apos;ve guided 10,000+ clients through wealth, protection, and
                relationship-focused remedies. Start with your intention and
                I&apos;ll show you what to use.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/quiz"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A00] to-[#E91E63] px-7 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(233,30,99,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(233,30,99,0.32)]"
                >
                  Get My Recommendations
                </Link>
                <Link
                  href="https://wa.me/919999999999"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#EED8C8] bg-white/80 px-7 text-sm font-semibold text-[#3A251A] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E0C4B0] hover:bg-white"
                >
                  Ask Me on WhatsApp
                </Link>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative min-h-[220px] overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_50%_28%,#FFF6EA_0%,#FBE7D3_58%,#F5D8BE_100%)] sm:min-h-[260px] md:min-h-[340px] lg:min-h-[300px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_88%,rgba(42,27,18,0.14)_0%,rgba(42,27,18,0)_46%)]" />
                <Image
                  src={HOMEPAGE_IMAGES.karanHero}
                  alt="Karan Chopra"
                  fill
                  priority
                  className="object-contain object-bottom transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-4">
            {[
              "10,000+ Clients Guided",
              "15+ Years Practice",
              "India, USA, Australia & Canada Clients",
              "Personal Consultations",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-center rounded-2xl border border-[#F1DFCE] bg-white/70 px-3 py-2 text-center text-[11px] font-semibold text-[#664838] backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Pathways */}
        <section className="rounded-[34px] border border-[#F1DFCE] bg-white/55 p-6 shadow-[0_20px_50px_rgba(42,27,18,0.07)] backdrop-blur-sm md:p-10 lg:p-7">
          <h2 className="text-center text-[clamp(1.85rem,3.85vw,3.4rem)] font-semibold tracking-[-0.03em]">
            What&apos;s Bothering You?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[0.95rem] leading-relaxed text-[#6A4A39] lg:mt-3">
            Most people come to me when something in life isn&apos;t going the way they hoped.
            Tell me which situation feels closest to yours.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4 lg:mt-6">
            {pathwayCards.map((card) => (
              <Link
                key={card.title}
                href="/quiz"
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[26px] border border-[#F1E0D3] bg-white/80 shadow-[0_14px_30px_rgba(42,27,18,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E8C9AE] hover:shadow-[0_24px_44px_rgba(217,107,42,0.16)]"
              >
                <div className="relative aspect-[16/10] h-[180px] w-full overflow-hidden rounded-t-[26px] sm:h-[190px] md:h-[200px] lg:h-[160px] xl:h-[170px]">
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 lg:p-5">
                  <h3 className="text-[clamp(1.35rem,1.9vw,1.7rem)] font-semibold leading-tight tracking-[-0.02em]">
                    {card.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-[#6A4A39] lg:mt-2 lg:line-clamp-3">{card.subtitle}</p>
                  {card.examples && (
                    <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-[#6A4A39] lg:mt-2 lg:space-y-1">
                      {card.examples.map((example) => (
                        <li key={example} className="lg:line-clamp-1">• {example}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-6 inline-flex rounded-full border border-[#F2D8C2] bg-[#FFF3E8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#D76618] transition-colors duration-300 group-hover:bg-[#FFEAD9] lg:mt-4">
                    {card.cta} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Meet Karan */}
        <section className="overflow-hidden rounded-[34px] border border-[#F1DFCE] bg-white p-6 shadow-[0_20px_55px_rgba(42,27,18,0.08)] md:p-10 lg:p-7">
          <div className="grid items-stretch gap-7 md:grid-cols-[0.9fr_1.1fr] lg:gap-6">
            <div className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-[#F4D9C2] bg-[linear-gradient(145deg,#FFF0DF_0%,#FFE7D8_100%)] shadow-[0_30px_70px_rgba(217,107,42,0.22)] md:order-2 md:min-h-[380px] lg:min-h-[340px]">
              <Image
                src={HOMEPAGE_IMAGES.karanConsulting}
                alt="Karan Chopra reviewing a kundli chart"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2A1B12]/35 to-transparent p-5">
                <p className="text-sm font-semibold tracking-[0.08em] text-white">KARAN CHOPRA</p>
              </div>
            </div>
            <div className="flex flex-col justify-center md:order-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D36B2A]">Meet Karan</p>
              <h2 className="mt-3 text-[clamp(1.78rem,3.75vw,3.25rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
                Let&apos;s Start With Your Current Situation
              </h2>
              <p className="mt-5 max-w-2xl text-[clamp(0.92rem,1.1vw,1.05rem)] leading-relaxed text-[#5D3F30] lg:mt-4">
                In over a decade of practice, I&apos;ve sat with more than a thousand
                people — and the same problem rarely has the same cause.
                <br />
                <br />
                Two people struggling in their careers can have completely different
                reasons for feeling stuck. Two people facing marriage delays may need
                entirely different guidance.
                <br />
                <br />
                That&apos;s why I don&apos;t start with a remedy. I start with your situation.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-5">
                <Link
                  href="/about-karan"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF7A00] px-7 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,122,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(255,122,0,0.32)]"
                >
                  Read My Story
                </Link>
                <Link
                  href="https://wa.me/919999999999"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#F2D3BE] bg-[#FFF7EF] px-7 text-sm font-semibold text-[#40291D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Talk To Me
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#6D4B3B] lg:mt-4">
                <span className="rounded-full bg-[#FFF3E8] px-3 py-1.5">10,000+ Clients Guided</span>
                <span className="rounded-full bg-[#FFF3E8] px-3 py-1.5">15+ Years of Practice</span>
                <span className="rounded-full bg-[#FFF3E8] px-3 py-1.5">Personal Consultations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended by Karan */}
        <section className="rounded-[34px] border border-[#F1DFCE] bg-[#FFFDFB] p-6 shadow-[0_20px_55px_rgba(42,27,18,0.08)] md:p-10 lg:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-[clamp(1.85rem,3.85vw,3.3rem)] font-semibold tracking-[-0.03em]">
                What I Usually Recommend
              </h2>
              <p className="mt-3 max-w-3xl text-[0.95rem] leading-relaxed text-[#664838]">
                These are some of the remedies and tools I most frequently recommend based on the situations people come to me with.
              </p>
            </div>
            <Link
              href="/recommendations"
              className="inline-flex rounded-full border border-[#F2D8C3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#B95A2A] transition-all duration-300 hover:-translate-y-0.5"
            >
              View editorial page →
            </Link>
          </div>

          <div className="mt-8 space-y-8 lg:mt-6 lg:space-y-5">
            {recommendationCards.map((group, groupIndex) => (
              <article
                key={group.problem}
                className="rounded-[28px] border border-[#F2E2D5] bg-white/70 p-5 shadow-[0_12px_34px_rgba(42,27,18,0.06)] backdrop-blur-sm md:p-6 lg:p-5"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between lg:mb-4">
                  <div>
                    <h3 className="text-[clamp(1.22rem,1.95vw,1.78rem)] font-semibold leading-tight tracking-[-0.02em] text-[#2A1B12]">
                      {group.problem}
                    </h3>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#8A5B3E]">
                      Karan&apos;s Note
                    </p>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-[#654536]">
                      {group.note}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                      groupIndex % 3 === 0
                        ? "bg-[#FFF1E6] text-[#D76618]"
                        : groupIndex % 3 === 1
                          ? "bg-[#FFF0F6] text-[#D53C7A]"
                          : "bg-[#FFF8E9] text-[#B9871E]"
                    }`}
                  >
                    Karan&apos;s picks
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.products.map((product) => (
                    <article
                      key={product.name}
                      className={`group overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(42,27,18,0.14)] ${
                        product.isFeatured
                          ? "border-[#F2C277] bg-[#FFF4E2] shadow-[0_12px_28px_rgba(217,152,24,0.2)]"
                          : "border-[#F3E4D8] bg-white"
                      }`}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/10]">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
                        {product.isFeatured && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#FFC247] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#5A3A10]">
                            Most Recommended
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 p-4 lg:space-y-2">
                        <h4 className="text-[clamp(0.95rem,1.2vw,1.1rem)] font-semibold leading-snug text-[#3B2A1F]">
                          {product.name}
                        </h4>
                        {product.isFeatured && (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A56A1D]">
                            Karan&apos;s Top Pick
                          </p>
                        )}
                        <p className="text-sm leading-relaxed text-[#6A4A39]">{product.note}</p>
                        <Link
                          href={product.href}
                          className="inline-flex min-h-10 items-center rounded-full bg-[#FFF2E8] px-4 text-xs font-semibold uppercase tracking-[0.09em] text-[#D76618] transition-colors duration-300 hover:bg-[#FFE8D8]"
                        >
                          View Product →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-5 lg:mt-4">
                  <Link
                    href="/recommendations"
                    className="inline-flex min-h-10 items-center rounded-full border border-[#F2D8C3] bg-white px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#B95A2A] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    View All Recommendations →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Client stories */}
        <section className="rounded-[34px] border border-[#F1DFCE] bg-white/70 p-6 shadow-[0_20px_55px_rgba(42,27,18,0.08)] backdrop-blur-sm md:p-10 lg:p-7">
          <h2 className="text-[clamp(1.85rem,3.65vw,3.05rem)] font-semibold tracking-[-0.03em]">
            Stories From People I&apos;ve Guided
          </h2>
          <div className="mt-6">
            <article className="rounded-3xl border border-[#F3E5DB] bg-[#FFF9F3] p-6 shadow-[0_10px_26px_rgba(42,27,18,0.05)]">
              <p className="text-[0.95rem] leading-relaxed text-[#573A2B]">
                “Karan&apos;s guidance changed the way I look at challenges. The clarity and
                peace I feel now is priceless.”
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#A7663A]">— Riya S.</p>
            </article>
          </div>
        </section>

        {/* Consultation CTA */}
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-[#FF7A00] to-[#E91E63] p-7 text-white shadow-[0_26px_52px_rgba(233,30,99,0.3)] md:p-10 lg:p-7">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">Consultations</p>
              <h2 className="mt-2 text-[clamp(1.85rem,3.65vw,3.05rem)] font-semibold leading-tight tracking-[-0.03em]">
                Need Personal Guidance?
              </h2>
              <p className="mt-2 text-[0.95rem] text-white/90">
                Book a one-to-one consultation and get guidance tailored to your current situation.
              </p>
            </div>
            <Link
              href="/consult"
              className="inline-flex min-h-12 min-w-52 items-center justify-center rounded-full border border-white/40 bg-white/90 px-7 text-sm font-semibold text-[#6A2F1E] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Book Consultation →
            </Link>
          </div>
        </section>

        {/* Daily wisdom */}
        <section className="rounded-[34px] border border-[#F1DFCE] bg-white/70 p-6 shadow-[0_20px_55px_rgba(42,27,18,0.08)] backdrop-blur-sm md:p-10 lg:p-7">
          <h2 className="text-[clamp(1.85rem,3.65vw,3.05rem)] font-semibold tracking-[-0.03em]">Daily Wisdom</h2>
          <p className="mt-3 text-[0.95rem] text-[#664838]">
            Latest insights, videos, articles, and guidance from Karan.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3 lg:mt-6">
            {wisdomCards.map((card) => (
              <article
                key={card.title}
                className="group rounded-[24px] border border-[#F4E4D8] bg-[#FFF9F3] p-5 shadow-[0_10px_26px_rgba(42,27,18,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(42,27,18,0.1)]"
              >
                <h3 className="text-base font-semibold leading-snug">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#674A3B]">{card.subtitle}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#E66E17]">Read →</p>
              </article>
            ))}
          </div>
        </section>

        {/* Footer preview block */}
        <section className="rounded-[30px] border border-[#F3E2D2] bg-[#FFF9F3] p-6">
          <div className="grid gap-3 text-sm text-[#614534] sm:grid-cols-2 md:grid-cols-5">
            <p className="font-semibold text-[#3A261A]">NAUVARAH</p>
            <p>Shop</p>
            <p>Help</p>
            <p>Legal</p>
            <p>Stay Connected</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default async function PreviewV6HomePage() {
  return <HomepageV6 />;
}
