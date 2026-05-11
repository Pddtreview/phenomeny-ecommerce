import Link from "next/link";
import Image from "next/image";

const GOLDEN_LOGO =
  "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";

const linkClass = "text-sm text-white/50 transition-colors duration-200 hover:text-white";

const colTitle = "mb-4 text-sm font-semibold tracking-wider uppercase text-white";

export function StoreFooter() {
  return (
    <footer className="mx-4 mb-0 mt-auto rounded-t-[3rem] bg-[#1A1A1A] px-4 pt-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src={GOLDEN_LOGO}
            alt="Nauvaraha"
            width={160}
            height={50}
            quality={90}
            className="h-auto w-[160px]"
          />
          <p className="mt-6 text-base font-medium text-white/60">
            Align Your Energy. Attract Your Abundance.
          </p>
          <div className="mt-6 space-y-1 text-center text-xs text-white/50">
            <p>Nauvaraha</p>
            <p>House No 10, Street No 01, Krishna Nagar</p>
            <p>Jalandhar, Punjab - 144008, India</p>
            <p>GSTIN: 03BGNPK9576K2ZO</p>
            <p>Phone: +91 9115490001</p>
            <p>Email: hello@nauvaraha.com</p>
          </div>
        </div>

        <div className="mt-14 grid gap-12 text-center py-4 sm:grid-cols-3 sm:gap-10 sm:text-left">
          <div>
            <h3 className={colTitle}>Shop</h3>
            <div className="flex flex-col gap-3">
              <Link href="/products" className={linkClass}>
                Products
              </Link>
              <Link href="/bundles" className={linkClass}>
                Bundles
              </Link>
              <Link href="/category/bracelets" className={linkClass}>
                Bracelets
              </Link>
              <Link href="/category/vastu-decor" className={linkClass}>
                Vastu Decor
              </Link>
            </div>
          </div>

          <div>
            <h3 className={colTitle}>Help</h3>
            <div className="flex flex-col gap-3">
              <Link href="/track" className={linkClass}>
                Track Order
              </Link>
              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
              <Link href="/refund-policy" className={linkClass}>
                Returns
              </Link>
              <Link href="/shipping-policy" className={linkClass}>
                Shipping
              </Link>
            </div>
          </div>

          <div>
            <h3 className={colTitle}>Legal</h3>
            <div className="flex flex-col gap-3">
              <Link href="/privacy-policy" className={linkClass}>
                Privacy Policy
              </Link>
              <Link href="/terms" className={linkClass}>
                Terms
              </Link>
              <Link href="/refund-policy" className={linkClass}>
                Refund Policy
              </Link>
              <Link href="/cancellation-policy" className={linkClass}>
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-white/30">
          <p>© 2026 Nauvaraha. All rights reserved.</p>
          <p className="mt-1 text-white/20">GSTIN: 03BGNPK9576K2ZO</p>
        </div>
      </div>
    </footer>
  );
}
