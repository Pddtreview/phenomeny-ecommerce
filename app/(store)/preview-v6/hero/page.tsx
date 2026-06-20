import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hero V6 Preview",
  robots: { index: false, follow: false },
};

const trustBadges = [
  "1000+ Clients Guided",
  "10+ Years Practice",
  "Pan India",
  "Personal Consultations",
];

const metrics = [
  { label: "Clients Guided", value: "1000+" },
  { label: "Years Practice", value: "10+" },
  { label: "Client Reach", value: "Pan India" },
];

export default function PreviewV6HeroPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#FFF8EE_0%,#F8EEDC_52%,#F3E3C8_100%)]">
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 sm:pb-14 sm:pt-3 lg:px-10 lg:pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-14%] top-[8%] h-48 w-48 rounded-full bg-[#F5E5C8]/60 blur-2xl" />
          <div className="absolute right-[-8%] top-[14%] h-64 w-64 rounded-full bg-[#EED7B2]/40 blur-2xl" />
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[0.6fr_0.4fr] lg:items-center">
          {/* Mobile-first: Karan visual appears first */}
          <div className="relative order-1 min-h-[52vh] sm:min-h-[58vh] lg:order-2 lg:min-h-[74vh]">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_48%_28%,#F8EEDB_0%,#F0DAB7_58%,#E5C8A0_100%)]" />

            <div
              className="absolute bottom-0 left-1/2 h-[90%] w-[76%] -translate-x-1/2 bg-[linear-gradient(180deg,#BBA27D_0%,#967E62_46%,#765F48_100%)] opacity-90"
              style={{
                clipPath:
                  "polygon(47% 0%,56% 1%,63% 8%,69% 17%,72% 29%,73% 44%,74% 63%,77% 79%,82% 100%,18% 100%,23% 79%,26% 63%,27% 44%,29% 29%,33% 18%,39% 8%)",
              }}
              aria-hidden
            />
            <div className="absolute bottom-0 left-1/2 h-[7%] w-[58%] -translate-x-1/2 rounded-full bg-black/20 blur-md" />

            {/* Trust badges overlaid on Karan visual */}
            <div className="absolute left-2 top-[9%] rounded-full border border-[#D9C4A1] bg-[#FFF8EE]/96 px-3 py-1.5 text-[11px] font-semibold text-[#4A3D30] shadow-[0_8px_20px_rgba(0,0,0,0.1)] sm:left-4 sm:px-4 sm:py-2">
              {trustBadges[0]}
            </div>
            <div className="absolute right-2 top-[22%] rounded-full border border-[#D9C4A1] bg-[#FFF8EE]/96 px-3 py-1.5 text-[11px] font-semibold text-[#4A3D30] shadow-[0_8px_20px_rgba(0,0,0,0.1)] sm:right-4 sm:px-4 sm:py-2">
              {trustBadges[1]}
            </div>
            <div className="absolute left-2 bottom-[22%] rounded-full border border-[#D9C4A1] bg-[#FFF8EE]/96 px-3 py-1.5 text-[11px] font-semibold text-[#4A3D30] shadow-[0_8px_20px_rgba(0,0,0,0.1)] sm:left-4 sm:px-4 sm:py-2">
              {trustBadges[2]}
            </div>
            <div className="absolute right-2 bottom-[12%] rounded-full border border-[#D9C4A1] bg-[#FFF8EE]/96 px-3 py-1.5 text-[11px] font-semibold text-[#4A3D30] shadow-[0_8px_20px_rgba(0,0,0,0.1)] sm:right-4 sm:px-4 sm:py-2">
              {trustBadges[3]}
            </div>
          </div>

          {/* Copy block follows visual */}
          <div className="order-2 lg:order-1 lg:pr-6">
            <p className="inline-flex rounded-full border border-[#DCC9AA] bg-[#F8EEDB] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#685541] sm:text-[11px]">
              Guidance by Karan Chopra
            </p>

            <h1 className="mt-4 text-[clamp(1.45rem,5.2vw,2.65rem)] font-bold leading-[1.08] tracking-[-0.015em] text-[#2F261E]">
              For the questions life
              <br />
              doesn&apos;t answer easily.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#584A3D] sm:text-base">
              Built for people coming from reels, searching for immediate clarity and a
              trusted voice. Straight, practical Vedic guidance for wealth,
              relationships, career, and home.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/consult"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#C8860A] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(200,134,10,0.28)] transition hover:opacity-90"
              >
                Book Consultation
              </Link>
              <Link
                href="/about-karan"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D8C3A1] bg-[#FFF8EE]/85 px-7 text-sm font-semibold text-[#2F261E] transition hover:bg-[#F7E9D2]"
              >
                Meet Karan
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E2CFB1] bg-[#FFF8EE]/85 px-3 py-3 text-center"
                >
                  <p className="text-[0.95rem] font-bold text-[#352A1F]">{item.value}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#6D5A45] sm:text-[11px]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
