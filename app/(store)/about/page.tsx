import type { Metadata } from "next";
import Link from "next/link";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Nauvaraha",
  description:
    "Nauvaraha — authentic spiritual tools and Vedic remedies from Jalandhar, Punjab. Ancient wisdom, modern intention since 2013.",
  alternates: {
    canonical: "https://www.nauvaraha.com/about",
  },
};

const sectionHeading = "mt-10 text-2xl font-bold text-[#2A1B12] first:mt-0";
const bodyText = "mt-4 text-base font-normal text-[#6D5447] sm:text-[1.05rem]";

export default function AboutPage() {
  return (
    <div className="bg-[#FFF8F0] pb-16 pt-16">
      <article className="mx-auto max-w-3xl px-4 font-inter leading-relaxed">
        <h1 className="text-5xl font-black tracking-tight text-[#2A1B12]">
          About Nauvaraha
        </h1>
        <p className="mt-4 text-xl font-normal text-[#6D5447]">
          Ancient Wisdom. Modern Intention.
        </p>

        <p className="mt-6 text-base font-normal text-[#6D5447] sm:text-[1.05rem]">
          Established in 2013 in Jalandhar, Punjab, Nauvaraha is a premier
          destination for authentic spiritual tools and Vedic remedies. We
          believe that spiritual growth should be supported by genuine,
          high-quality instruments that bridge the gap between ancient
          traditions and contemporary life.
        </p>

        <section
          className="mt-10 rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-6 sm:p-8"
          aria-labelledby="story-heading"
        >
          <h2 id="story-heading" className="text-2xl font-bold text-[#2A1B12]">
            The Nauvaraha Story
          </h2>
          <p className={bodyText}>
            Every piece in our collection is more than just a product; it is a
            tool for personal transformation. Our founder, Karan Chopra, is a
            seasoned Vedic astrologer with over 15 years of dedicated practice.
            Under his expert guidance, each item is meticulously selected,
            energetically charged, and prescribed based on authentic Vedic
            principles to ensure it serves its true purpose for the wearer.
          </p>
        </section>

        <h2 className={sectionHeading}>Our Commitment to Quality</h2>
        <p className="mt-3 text-base font-normal text-[#6D5447]">
          At Nauvaraha, we specialise in:
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-base font-normal text-[#6D5447] sm:text-[1.05rem]">
          <li>
            <span className="font-medium text-[#2A1B12]">
              Authentic Gemstones &amp; Crystals:
            </span>{" "}
            Sourced for their purity and vibrational quality.
          </li>
          <li>
            <span className="font-medium text-[#2A1B12]">Vedic Remedies:</span>{" "}
            Tools prescribed to align with your astrological profile.
          </li>
          <li>
            <span className="font-medium text-[#2A1B12]">
              Spiritual Guidance:
            </span>{" "}
            Expert consultations in crystal healing and Vastu to help you find
            the right pieces for your specific intentions.
          </li>
        </ul>

        <h2 className={sectionHeading}>Why Choose Us?</h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-base font-normal text-[#6D5447] sm:text-[1.05rem]">
          <li>
            <span className="font-medium text-[#2A1B12]">Expert Curation:</span>{" "}
            Products are handpicked and verified by a practicing astrologer.
          </li>
          <li>
            <span className="font-medium text-[#2A1B12]">Transparency:</span>{" "}
            Based in Jalandhar, we operate with full transparency, including a
            registered GSTIN and a dedicated support team.
          </li>
          <li>
            <span className="font-medium text-[#2A1B12]">Customer-Centric:</span>{" "}
            We provide comprehensive support, from order tracking to detailed
            consultations, ensuring your journey with us is seamless.
          </li>
        </ul>

        <section
          className="mt-10 rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-6 sm:p-8"
          aria-labelledby="connect-heading"
        >
          <h2 id="connect-heading" className="text-2xl font-bold text-[#2A1B12]">
            Connect With Us
          </h2>
          <p className={bodyText}>
            We operate from our office in Jalandhar, Punjab, and are committed to
            responding to all inquiries within 24 hours. Whether you are looking
            for Vastu consultation or a specific crystal for your home, our team
            is here to help you find the perfect match for your spiritual path.
          </p>
          <p className="mt-6">
            <Link
              href="/contact"
              className="interactive-lift inline-flex rounded-full bg-[linear-gradient(135deg,#FF7A00,#E91E63)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get in touch
            </Link>
          </p>
        </section>
      </article>
    </div>
  );
}
