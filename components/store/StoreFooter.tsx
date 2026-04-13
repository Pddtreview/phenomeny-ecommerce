import Link from "next/link";
import Image from "next/image";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";
const linkClass =
  "font-inter text-xs uppercase tracking-[0.2em] text-[#9A8F7E] transition-colors hover:text-[#C8860A]";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t-2 border-[#C8860A] bg-[#1A1A1A] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src={GOLDEN_LOGO}
            alt="Nauvaraha"
            width={560}
            height={176}
            quality={90}
            className="h-auto w-[180px]"
          />
          <p className="mt-5 font-cormorant text-lg italic text-[#C8860A]/70">
            Align Your Energy. Attract Your Abundance.
          </p>
          <div className="mt-6 h-px w-20 bg-[#C8860A]/60" />
        </div>

        <div className="mt-10 grid gap-8 text-center sm:grid-cols-3 sm:text-left">
          <div>
            <h3 className="mb-4 font-inter text-[11px] uppercase tracking-[0.24em] text-[#C8860A]">
              Shop
            </h3>
            <div className="space-y-2">
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
            <h3 className="mb-4 font-inter text-[11px] uppercase tracking-[0.24em] text-[#C8860A]">
              Help
            </h3>
            <div className="space-y-2">
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
            <h3 className="mb-4 font-inter text-[11px] uppercase tracking-[0.24em] text-[#C8860A]">
              Legal
            </h3>
            <div className="space-y-2">
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

        <div className="mt-12 border-t border-[#C8860A]/20 pt-5 text-center font-inter text-xs text-[#6B5E4E]">
          <p>Â© 2026 Nauvaraha. All rights reserved.</p>
          <p className="mt-1">GSTIN: 03BGNPK9576K2ZO</p>
        </div>
      </div>
    </footer>
  );
}

