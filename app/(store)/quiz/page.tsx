"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Option = {
  id: string;
  label: string;
  category: "crystals" | "vastu-decor" | "bracelets" | "bundles";
  recommendation: {
    title: string;
    note: string;
    href: string;
  };
};

const options: Option[] = [
  {
    id: "money",
    label: "Money never stays despite hard work",
    category: "crystals",
    recommendation: {
      title: "Dhan Yog Wealth Bracelet",
      note: "For financial stagnation and weak wealth retention patterns.",
      href: "/category/crystals",
    },
  },
  {
    id: "home",
    label: "Home feels heavy or tense",
    category: "vastu-decor",
    recommendation: {
      title: "Vastu Harmony Set",
      note: "To rebalance energy in your home and work space.",
      href: "/category/vastu-decor",
    },
  },
  {
    id: "mind",
    label: "Mind won't stop, can't focus",
    category: "bracelets",
    recommendation: {
      title: "Protection & Focus Bracelet",
      note: "For grounding and calmer mental energy throughout the day.",
      href: "/category/bracelets",
    },
  },
  {
    id: "blocked",
    label: "Feel like something is blocking progress",
    category: "vastu-decor",
    recommendation: {
      title: "Pyrite 7 Horses Vastu Frame",
      note: "For removing stagnation and activating forward movement.",
      href: "/category/vastu-decor",
    },
  },
  {
    id: "new",
    label: "Starting something new",
    category: "bundles",
    recommendation: {
      title: "Beginner Alignment Bundle",
      note: "A complete starter combination for intention setting.",
      href: "/category/bundles",
    },
  },
];

export default function QuizPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => options.find((opt) => opt.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="inline-flex pill-gradient rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
          2 Minute Quiz
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.02em] text-[#1A1A1A] sm:text-4xl">
          Which tool is right for you?
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Choose what feels most true right now. You&apos;ll get Karan&apos;s recommended
          direction instantly.
        </p>

        <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            What is your biggest block right now?
          </p>
          <div className="mt-4 space-y-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedId(opt.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedId === opt.id
                    ? "border-[#1A1A1A] bg-[#F5F5F5] text-[#1A1A1A]"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {selected && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Karan recommends
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#1A1A1A]">
              {selected.recommendation.title}
            </h2>
            <p className="mt-2 text-sm text-[#666666]">{selected.recommendation.note}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href={selected.recommendation.href}
                className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
              >
                Explore recommendation
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-[#1A1A1A]"
              >
                View all tools
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
