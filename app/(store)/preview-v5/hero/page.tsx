import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hero V5 Preview",
  robots: { index: false, follow: false },
};

const trustChips = [
  "1000+ Clients Guided",
  "10+ Years Practice",
  "Pan India",
  "Personal Consultations",
];

export default function PreviewV5HeroPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFF8EE_0%,#F8EEDD_56%,#F4E6CE_100%)]">
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-10 lg:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[18%] h-56 w-56 rounded-full bg-[#F8EED9]/70 blur-2xl" />
          <div className="absolute right-[-8%] top-[8%] h-72 w-72 rounded-full bg-[#EED7B2]/45 blur-2xl" />
          <div className="absolute bottom-[5%] left-[35%] h-64 w-64 rounded-full bg-[#F3E2C5]/60 blur-2xl" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-end">
          {/* Left content (40%) */}
          <div className="max-w-xl">
            <p className="inline-flex rounded-full border border-[#DCCBAF] bg-[#F9F0DE] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5640]">
              Trusted Vedic Astrologer
            </p>

            <h1 className="mt-5 text-[clamp(1.7rem,4.6vw,3.2rem)] font-black leading-[1.02] tracking-[-0.02em] text-[#32281F]">
              Sometimes clarity
              <br />
              changes everything.
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-[#5B4D40] sm:text-base">
              For the questions life doesn&apos;t answer easily — wealth, relationships,
              career, home, and direction — Karan Chopra offers practical Vedic guidance
              you can act on.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#C8860A] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(200,134,10,0.26)] transition hover:opacity-90"
              >
                Book Consultation
              </Link>
              <Link
                href="/about-karan"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D9C7A8] bg-[#FFF8EE]/80 px-7 text-sm font-semibold text-[#32281F] transition hover:bg-[#F8EEDC]"
              >
                Meet Karan
              </Link>
            </div>
          </div>

          {/* Right visual (60%) - Karan dominant silhouette */}
          <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[640px]">
            <div className="absolute inset-x-2 bottom-0 top-10 rounded-[50%] bg-[radial-gradient(circle_at_45%_30%,#F9F0DE_0%,#F3E2C5_55%,#EFD7B0_100%)]" />

            {/* Silhouette placeholder only; full visual area reserved for Karan */}
            <div
              className="absolute bottom-0 left-1/2 h-[88%] w-[72%] -translate-x-1/2 rounded-t-[45%] bg-[linear-gradient(180deg,#BFA886_0%,#9A8568_45%,#7D6B53_100%)] opacity-85"
              style={{
                clipPath:
                  "polygon(46% 0%,56% 0%,64% 7%,70% 16%,73% 25%,74% 37%,74% 53%,76% 73%,82% 100%,16% 100%,23% 74%,26% 54%,26% 36%,28% 24%,32% 14%,38% 7%)",
              }}
              aria-hidden
            />
            <div className="absolute bottom-0 left-1/2 h-[8%] w-[52%] -translate-x-1/2 rounded-full bg-black/20 blur-md" />

            {/* Floating trust chips around Karan */}
            <div className="absolute left-0 top-[18%] rounded-full border border-[#DCC9AA] bg-[#FFF8EE]/95 px-4 py-2 text-xs font-semibold text-[#4F4134] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              {trustChips[0]}
            </div>
            <div className="absolute right-[2%] top-[28%] rounded-full border border-[#DCC9AA] bg-[#FFF8EE]/95 px-4 py-2 text-xs font-semibold text-[#4F4134] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              {trustChips[1]}
            </div>
            <div className="absolute left-[5%] bottom-[22%] rounded-full border border-[#DCC9AA] bg-[#FFF8EE]/95 px-4 py-2 text-xs font-semibold text-[#4F4134] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              {trustChips[2]}
            </div>
            <div className="absolute right-[3%] bottom-[14%] rounded-full border border-[#DCC9AA] bg-[#FFF8EE]/95 px-4 py-2 text-xs font-semibold text-[#4F4134] shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
              {trustChips[3]}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
