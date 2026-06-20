import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Karan's Recommendations",
  description:
    "Situation-based product recommendations curated by Karan Chopra.",
  alternates: { canonical: "https://www.nauvaraha.com/recommendations" },
};

const groups = [
  {
    title: "Money & Career",
    note: "If effort feels high but growth feels delayed, I start with grounding and wealth-supportive tools.",
    href: "/category/crystals",
  },
  {
    title: "Marriage & Relationships",
    note: "For recurring misunderstandings, delays, and emotional distance, I recommend calm and harmony-led support.",
    href: "/category/bracelets",
  },
  {
    title: "Protection & Negativity",
    note: "When setbacks repeat and momentum breaks, begin with protection before expansion.",
    href: "/category/vastu-decor",
  },
  {
    title: "Life Decisions & Clarity",
    note: "For major timing decisions, clarity and focus should lead the action plan.",
    href: "/category/frames",
  },
];

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="inline-flex rounded-full border border-[#F0DEC8] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D5447]">
          Curated by Karan Chopra
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#2A1B12]">
          Where Most People Start
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[#6D5447]">
          Choose the situation closest to what you are facing right now. Each lane is organized to make decisions easier.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group.title}
              href={group.href}
              className="card-hover rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-6"
            >
              <h2 className="text-xl font-semibold text-[#2A1B12]">{group.title}</h2>
              <p className="mt-2 text-sm text-[#6D5447]">{group.note}</p>
              <p className="mt-4 text-sm font-semibold text-[#FF7A00]">Explore this lane →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
