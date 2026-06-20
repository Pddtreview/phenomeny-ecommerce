"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "919115490001";
const WHATSAPP_TEXT =
  "Hi Karan, I need help choosing the right tool for my situation.";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/track-order", label: "Track" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_TEXT
  )}`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F0DEC8] bg-[#FFF8F0]/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center text-[11px] font-medium",
                active ? "text-[#2A1B12]" : "text-[#6D5447]"
              )}
            >
              <span>{link.label}</span>
            </Link>
          );
        })}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 flex-col items-center justify-center text-[11px] font-medium text-[#2A1B12]"
        >
          <span>Chat</span>
        </a>
      </div>
    </nav>
  );
}
