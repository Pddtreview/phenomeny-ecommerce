import Link from "next/link";
import Image from "next/image";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

const linkClass =
  "font-inter text-[11px] font-light uppercase tracking-[0.22em] text-[#9A8F7E] transition-colors duration-300 hover:text-[#C8860A]";

const colTitle =
  "mb-5 font-inter text-[10px] font-medium uppercase tracking-[0.32em] text-[#C8860A]/90";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-[#1A1A1A] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src={GOLDEN_LOGO}
            alt="Nauvaraha"
            width={560}
            height={176}
            quality={90}
            className="h-auto w-[min(180px,48vw)] opacity-95"
          />
          <p className="mt-8 max-w-md font-cormorant text-lg font-light italic leading-relaxed tracking-[0.06em] text-[#C8860A]/75">
            Align Your Energy. Attract Your Abundance.
          </p>
          <div className="mt-8 h-px w-16 bg-[#C8860A]/35" />
        </div>

        <div className="mt-16 grid gap-12 text-center sm:grid-cols-3 sm:gap-10 sm:text-left">
          <div>
            <h3 className={colTitle}>Shop</h3>
            <div className="space-y-3">
              <Link href="/products" className={linkClass}>
                Products
              </Link>
              <br />
              <Link href="/bundles" className={linkClass}>
                Bundles
              </Link>
              <br />
              <Link href="/category/bracelets" className={linkClass}>
                Bracelets
              </Link>
              <br />
              <Link href="/category/vastu-decor" className={linkClass}>
                Vastu
              </Link>
            </div>
          </div>

          <div>
            <h3 className={colTitle}>Help</h3>
            <div className="space-y-3">
              <Link href="/about" className={linkClass}>
                About Us
              </Link>
              <br />
              <Link href="/track" className={linkClass}>
                Track Order
              </Link>
              <br />
              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
              <br />
              <Link href="/refund-policy" className={linkClass}>
                Returns
              </Link>
              <br />
              <Link href="/shipping-policy" className={linkClass}>
                Shipping
              </Link>
            </div>
          </div>

          <div>
            <h3 className={colTitle}>Legal</h3>
            <div className="space-y-3">
              <Link href="/privacy-policy" className={linkClass}>
                Privacy Policy
              </Link>
              <br />
              <Link href="/terms" className={linkClass}>
                Terms
              </Link>
              <br />
              <Link href="/refund-policy" className={linkClass}>
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center font-inter text-[11px] font-light leading-relaxed tracking-wide text-[#6B5E4E]">
          <p>© 2026 Nauvaraha. All rights reserved.</p>
          <p className="mt-2 text-[#6B5E4E]/80">GSTIN: 03BGNPK9576K2ZO</p>
        </div>
      </div>
    </footer>
  );
}
