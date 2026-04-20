"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cn } from "@/lib/utils";

const GOLD = "#C8860A";
const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/bundles", label: "Bundles" },
];

const iconBtn =
  "flex h-12 w-12 items-center justify-center rounded-md text-[#1A1A1A] transition-all duration-300 hover:bg-black/5";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const totalItems = useCart((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 8);

      if (currentY > lastScrollY.current + 4 && currentY > 80) {
        setHidden(true);
      } else if (currentY < lastScrollY.current - 2) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-black/5 backdrop-blur-lg transition-transform duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
          scrolled
            ? "bg-[#FDFAF5]/78 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-saturate-150"
            : "bg-[#FDFAF5]/95"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] lg:px-8">
          <Link href="/" className="block" aria-label="Nauvaraha home">
            <Image
              src={GOLDEN_LOGO}
              alt="Nauvaraha"
              width={280}
              height={88}
              quality={90}
              className="h-9 w-auto sm:h-11"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-cormorant text-[13px] font-medium tracking-[0.22em] text-[#1A1A1A] transition-colors duration-300 hover:text-[#C8860A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/products"
              className={iconBtn}
              aria-label="Search products"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              suppressHydrationWarning
              className={cn(iconBtn, "relative")}
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {mounted && totalItems > 0 && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white shadow-sm"
                  style={{ backgroundColor: GOLD }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className={cn(iconBtn, "md:hidden")}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 12h16" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "border-t border-black/5 md:hidden",
            scrolled ? "bg-[#FDFAF5]/80 backdrop-blur-md" : "bg-[#FDFAF5]/95",
            mobileMenuOpen ? "block" : "hidden"
          )}
        >
          <nav className="flex flex-col px-4 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-cormorant py-3 text-sm font-medium tracking-[0.22em] text-[#1A1A1A] transition-colors duration-300 hover:text-[#C8860A]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
