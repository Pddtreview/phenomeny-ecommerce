import Link from "next/link";

const PRIMARY = "#1B3A6B";

export function StoreFooter() {
  return (
    <footer
      className="mt-auto px-4 py-8 text-sm text-zinc-200 sm:px-6"
      style={{ backgroundColor: PRIMARY }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-white">Nauvarah</p>
          <p className="text-xs text-zinc-300">
            Align Your Energy. Attract Your Abundance.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            © {new Date().getFullYear()} Nauvarah. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
          <Link
            href="/privacy-policy"
            className="transition hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
          <Link
            href="/refund-policy"
            className="transition hover:text-white"
          >
            Refund Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
