"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cn } from "@/lib/utils";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

const shopLinks = [
  { href: "/category/bracelets", label: "Bracelets" },
  { href: "/category/vastu-decor", label: "Vastu Decor" },
  { href: "/category/crystals", label: "Crystals & Frames" },
  { href: "/products", label: "All Products" },
];

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const totalItems = useCart((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (pathname === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-[#F0F0F0] transition-all duration-300",
          scrolled
            ? "bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm"
            : "bg-[#FFFFFF]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] lg:px-8">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="relative z-20 inline-flex origin-center shrink-0 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-110"
            aria-label="Nauvaraha home"
          >
            <Image
              src={GOLDEN_LOGO}
              alt="Nauvaraha"
              width={226}
              height={36}
              quality={90}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
            <div
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-[#1A1A1A] hover:opacity-70"
              >
                Shop
                <span className={cn("transition-transform duration-200", shopOpen && "rotate-180")}>
                  ▾
                </span>
              </button>
              <div
                className={cn(
                  "absolute left-0 top-full pt-4 transition-all duration-200",
                  shopOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                )}
              >
                <div className="min-w-[200px] rounded-2xl bg-white p-6 shadow-2xl">
                  <div className="flex flex-col gap-1">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F5F5F5]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {[
              { href: "/bundles", label: "Bundles" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#1A1A1A] hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/products"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#1A1A1A] transition-opacity duration-200 hover:opacity-70"
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
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#1A1A1A] transition-opacity duration-200 hover:opacity-70"
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
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1A1A1A] px-1 text-[10px] font-semibold text-white"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#1A1A1A] transition-opacity duration-200 hover:opacity-70 md:hidden"
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
            "fixed inset-0 top-16 z-40 bg-white transition-transform duration-300 md:hidden",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex h-full flex-col justify-center gap-8 px-8" aria-label="Mobile">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl font-extrabold tracking-[-0.03em] text-[#1A1A1A]"
            >
              Shop
            </Link>
            <Link
              href="/bundles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl font-extrabold tracking-[-0.03em] text-[#1A1A1A]"
            >
              Bundles
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl font-extrabold tracking-[-0.03em] text-[#1A1A1A]"
            >
              About
            </Link>
            {shopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#666666] hover:text-[#1A1A1A]"
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
