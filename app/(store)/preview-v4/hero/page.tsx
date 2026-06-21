import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Homepage Hero V4 Preview",
  robots: { index: false, follow: false },
};

const trustMetrics = [
  { value: "10,000+", label: "Clients Guided" },
  { value: "15+", label: "Years Practice" },
  { value: "India, USA, Australia & Canada", label: "Client Base" },
  { value: "Personal", label: "Consultations" },
];

export default function PreviewV4HeroPage() {
  return (
    <div className="min-h-screen bg-[#FFF8EF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#E8DDCB] bg-[linear-gradient(145deg,#FFF8EF_0%,#F8EEDD_52%,#F2E4CE_100%)] px-5 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.07)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[#F4E6CE]/70 blur-2xl" />
            <div className="absolute right-[-90px] top-1/3 h-80 w-80 rounded-full bg-[#EED7B0]/55 blur-2xl" />
            <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-[#F8EFD9]/85 blur-2xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            {/* Left 60% */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="inline-flex rounded-full border border-[#DCCAA8] bg-[#F8EFD9] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6A5640]">
                  Trusted by 10,000+ clients
                </p>

                <h1 className="mt-5 text-[clamp(2rem,5.8vw,5rem)] font-black leading-[0.95] tracking-[-0.03em] text-[#2F2620]">
                  Ancient Vedic Wisdom
                  <br />
                  For Modern Life
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#584B40]">
                  Guidance, consultations, and carefully curated recommendations from
                  Vedic Astrologer Karan Chopra.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6A5E52] sm:text-base">
                  Helping people gain clarity in wealth, relationships, career, home,
                  and life direction through practical Vedic guidance.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/consult"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#C8860A] px-7 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(200,134,10,0.28)] transition hover:opacity-90"
                  >
                    Book Consultation
                  </Link>
                  <Link
                    href="/about-karan"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D8C6A7] bg-[#FFF8EF]/70 px-7 text-sm font-semibold text-[#2F2620] transition hover:bg-[#F8EFD9]"
                  >
                    Meet Karan
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {trustMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="rounded-2xl border border-[#E3D4BA] bg-[#FFF8EF]/80 px-4 py-4 shadow-[0_10px_20px_rgba(58,42,26,0.06)]"
                  >
                    <p className="text-2xl font-black tracking-[-0.02em] text-[#2F2620]">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6A5E52]">
                      {metric.label}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Right 40% */}
            <div className="relative">
              <div className="absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),rgba(248,238,221,0.35)_50%,rgba(238,215,176,0.45)_100%)]" />
              <div className="relative flex h-full min-h-[360px] items-center justify-center overflow-hidden rounded-[1.7rem] border border-[#E0CEAF] bg-[linear-gradient(165deg,#FBF3E5_0%,#F4E6CF_58%,#EFD7B1_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:min-h-[420px] lg:min-h-[560px]">
                <div className="pointer-events-none absolute -left-6 top-8 h-28 w-28 rounded-full border border-[#E8D7BA] bg-white/30" />
                <div className="pointer-events-none absolute bottom-6 right-4 h-32 w-32 rounded-full border border-[#DFC8A3] bg-[#F8EBD4]/45" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 h-[82%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] border border-dashed border-[#D4B98F] bg-[#FFF8EF]/45" />

                <div className="relative z-10 max-w-[220px] text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7B654A]">
                    Karan Chopra
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-[#4C3E32]">
                    Photo Placeholder
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#6A5E52]">
                    Professional portrait/video will be placed here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
