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
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:scale-105 md:bottom-6 md:right-6"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7A19.9 19.9 0 0 0 24 44c11 0 20-9 20-20S35 4 24 4Zm0 36.4a16.3 16.3 0 0 1-8.4-2.3l-.6-.4-6.2 1.6 1.7-6-.4-.6A16.4 16.4 0 1 1 24 40.4Zm9-12.3c-.5-.2-2.9-1.4-3.3-1.6-.5-.2-.8-.2-1.1.3-.4.5-1.4 1.6-1.7 1.9-.3.3-.6.4-1.1.1-.5-.2-2.1-.8-4-2.5a15 15 0 0 1-2.8-3.5c-.3-.5 0-.8.2-1 .2-.2.5-.6.7-.9.2-.3.3-.5.5-.8.1-.3 0-.6-.1-.9-.2-.2-1.1-2.7-1.5-3.7-.4-.9-.8-.8-1.1-.8h-1c-.3 0-.8.1-1.2.6C15.8 16 14.6 17.1 14.6 19.5s1.6 4.8 1.8 5.1c.2.4 3.2 4.9 7.7 6.8 1.1.5 1.9.7 2.6.9 1.1.3 2 .3 2.8.2.9-.1 2.9-1.2 3.3-2.3.4-1.1.4-2.1.3-2.3-.2-.2-.5-.3-1-.5Z"
          fill="white"
        />
      </svg>
    </a>
  );
}
