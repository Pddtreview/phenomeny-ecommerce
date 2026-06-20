import Link from "next/link";

const lanes = [
  "For Financial Stagnation",
  "For Home Energy Imbalance",
  "For Protection & Negativity",
  "For Focus & Mental Clarity",
];

export default function RecommendationsWireframePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
            Recommendations Wireframe
          </h1>
          <Link
            href="/wireframes"
            className="rounded-full border border-[#E8E8E8] px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            Back
          </Link>
        </div>

        <section className="rounded-3xl border border-[#E8E8E8] bg-[#111111] p-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Curated Landing Page
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.02em]">
            Karan&apos;s Recommendations
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            This page is editorial-first: curated by situation, not a generic product filter grid.
          </p>
        </section>

        <div className="mt-6 space-y-5">
          {lanes.map((lane) => (
            <section
              key={lane}
              className="rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-6"
            >
              <h3 className="text-xl font-bold text-[#1A1A1A]">{lane}</h3>
              <p className="mt-1 text-sm text-[#666666]">
                Short explanation + Karan note + curated products row
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-[#F7F7F7] p-4">
                    <div className="mb-3 aspect-[4/3] rounded-xl bg-[#ECECEC]" />
                    <p className="text-sm font-semibold text-[#1A1A1A]">Recommendation Card</p>
                    <p className="mt-1 text-xs text-[#666666]">Reason + CTA</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
