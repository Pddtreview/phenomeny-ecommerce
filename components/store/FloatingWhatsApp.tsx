"use client";

const WHATSAPP_NUMBER = "919115490001";
const WHATSAPP_TEXT =
  "Hi Karan, I need help choosing the right tool for my situation.";

export function FloatingWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_TEXT
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition hover:scale-105 md:bottom-6 md:right-6"
      aria-label="Chat on WhatsApp"
    >
      <span>💬</span>
      <span className="hidden sm:inline">Need Help?</span>
    </a>
  );
}
