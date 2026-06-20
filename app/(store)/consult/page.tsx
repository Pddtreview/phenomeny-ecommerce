import Link from "next/link";

const WHATSAPP_NUMBER = "919115490001";
const WHATSAPP_TEXT =
  "Hi Karan, I would like to book a consultation. Please share available slots.";

export default function ConsultPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_TEXT
  )}`;

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#F0DEC8] bg-[#FFF2E5] p-6 sm:p-8">
        <p className="inline-flex pill-gradient rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
          Consultation
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.02em] text-[#2A1B12] sm:text-4xl">
          Book a session with Karan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6D5447]">
          Personalized guidance for wealth blocks, home energy imbalance, relationship
          stress, and spiritual protection.
        </p>

        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[#6D5447]">
          <li>One-to-one remedy guidance</li>
          <li>Product recommendations based on your situation</li>
          <li>Follow-up action plan after the consultation</li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn-gradient interactive-lift inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
          >
            Book on WhatsApp
          </a>
          <Link
            href="/contact"
            className="interactive-lift inline-flex min-h-12 items-center justify-center rounded-full border border-[#F0DEC8] bg-[#FFFDF9] px-6 text-sm font-semibold text-[#2A1B12]"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
