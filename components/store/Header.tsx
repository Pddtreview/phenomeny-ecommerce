"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cn } from "@/lib/utils";
import {
  MEGA_MENU_CATEGORIES,
  MEGA_MENU_COLLECTIONS,
  MEGA_MENU_FEATURED_PRODUCT,
} from "@/lib/store-mega-menu";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOffsetX, setMenuOffsetX] = useState(0);
  const shopTriggerRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = useCart((s) => s.totalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    const recompute = () => {
      const trigger = shopTriggerRef.current;
      const menu = shopMenuRef.current;
      if (!trigger || !menu) return;
      const gutter = 16;
      const viewportWidth = document.documentElement.clientWidth;
      const menuWidth = menu.offsetWidth;
      const triggerRect = trigger.getBoundingClientRect();
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const naturalLeft = triggerCenter - menuWidth / 2;
      const maxLeft = viewportWidth - gutter - menuWidth;
      const clampedLeft = Math.max(gutter, Math.min(naturalLeft, maxLeft));
      setMenuOffsetX(clampedLeft - naturalLeft);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [shopOpen]);

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (pathname === "/" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-[#F0DEC8] transition-all duration-300",
          scrolled
            ? "bg-[#FFF8F0]/95 shadow-[0_10px_24px_rgba(42,27,18,0.08)] backdrop-blur-sm"
            : "bg-[#FFF8F0]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] lg:px-8">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="relative z-20 inline-flex origin-center shrink-0"
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
              ref={shopTriggerRef}
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-[#2A1B12] hover:text-[#FF7A00]"
              >
                Shop
                <span className={cn("transition-transform duration-200", shopOpen && "rotate-180")}>
                  ▾
                </span>
              </button>
              <div
                className={cn(
                  "absolute left-1/2 top-full z-50 pt-4 transition-[opacity,transform] duration-200",
                  shopOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                )}
                style={{
                  transform: `translateX(calc(-50% + ${menuOffsetX}px)) translateY(${
                    shopOpen ? "0" : "-0.25rem"
                  })`,
                }}
              >
                <div
                  ref={shopMenuRef}
                  className="w-[min(1200px,calc(100vw-2rem))] rounded-3xl border border-[#F0DEC8] bg-[#FFFDF9] p-8 shadow-[0_28px_56px_rgba(42,27,18,0.16)]"
                >
                  <div className="grid items-start gap-8 md:grid-cols-[40%_25%_35%]">
                    <div className="h-full px-2">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6C5B]">
                        Collections
                      </p>
                      <div className="space-y-2">
                        {MEGA_MENU_COLLECTIONS.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block rounded-xl px-3 py-2 hover:bg-[#FFF2E5]"
                          >
                            <p className="text-sm font-semibold text-[#2A1B12]">{link.label}</p>
                            <p className="mt-1 text-xs text-[#6D5447]">{link.description}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="h-full px-2">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6C5B]">
                        Categories
                      </p>
                      <div className="space-y-1">
                        {MEGA_MENU_CATEGORIES.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="link-underline block rounded-lg px-3 py-2 text-sm font-medium text-[#2A1B12] hover:bg-[#FFF2E5]"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="h-full px-2">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6C5B]">
                        Featured
                      </p>
                      <Link
                        href={MEGA_MENU_FEATURED_PRODUCT.href}
                        className="group block overflow-hidden rounded-2xl border border-[#F0DEC8] bg-gradient-to-b from-[#FFF8F0] to-[#FFECD6] transition-all duration-200 hover:border-[#E8A84C] hover:shadow-[0_8px_24px_rgba(42,27,18,0.12)]"
                      >
                        <div className="relative h-[148px] w-full overflow-hidden bg-[#FFF3E0]">
                          <Image
                            src={MEGA_MENU_FEATURED_PRODUCT.image}
                            alt={MEGA_MENU_FEATURED_PRODUCT.title}
                            fill
                            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C08030]">
                            {MEGA_MENU_FEATURED_PRODUCT.subtitle}
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-snug text-[#2A1B12]">
                            {MEGA_MENU_FEATURED_PRODUCT.title}
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#6D5447]">
                            {MEGA_MENU_FEATURED_PRODUCT.description}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C08030] transition-gap duration-200 group-hover:gap-2">
                            {MEGA_MENU_FEATURED_PRODUCT.cta}
                            <span aria-hidden="true">→</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {[
              { href: "/bundles", label: "Bundles" },
              { href: "/about-karan", label: "About Karan" },
              { href: "/journal", label: "Journal" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-sm font-semibold text-[#2A1B12] hover:text-[#FF7A00]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/products"
              className="interactive-lift flex h-11 w-11 items-center justify-center rounded-full text-[#2A1B12] hover:bg-[#FFF2E5]"
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
              className="interactive-lift relative flex h-11 w-11 items-center justify-center rounded-full text-[#2A1B12] hover:bg-[#FFF2E5]"
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
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2A1B12] px-1 text-[10px] font-semibold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="interactive-lift flex h-11 w-11 items-center justify-center rounded-full text-[#2A1B12] hover:bg-[#FFF2E5] md:hidden"
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
            "fixed inset-0 top-16 z-40 overflow-y-auto bg-[#FFF8F0] transition-transform duration-300 md:hidden",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-6 px-6 py-8" aria-label="Mobile">
            <div className="rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6C5B]">
                Shop Collections
              </p>
              <div className="space-y-2">
                {MEGA_MENU_COLLECTIONS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 hover:bg-[#FFF2E5]"
                  >
                    <p className="text-base font-semibold text-[#2A1B12]">{link.label}</p>
                    <p className="mt-1 text-xs text-[#6D5447]">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A6C5B]">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MEGA_MENU_CATEGORIES.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-[#F0DEC8] bg-[#FFF8F0] px-3 py-2 text-sm font-medium text-[#2A1B12]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { href: "/products", label: "All Products" },
                { href: "/bundles", label: "Bundles" },
                { href: "/about-karan", label: "About Karan" },
                { href: "/journal", label: "Journal" },
                { href: "/consult", label: "Book a Consultation" },
                { href: "/track-order", label: "Track My Order" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-semibold text-[#2A1B12]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
