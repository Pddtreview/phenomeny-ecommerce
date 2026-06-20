import Link from "next/link";

const screens = [
  {
    href: "/wireframes/home",
    title: "Homepage V2 Wireframe",
    note: "Guidance merged into Daily Wisdom; Meet Karan above Recommendations.",
  },
  {
    href: "/wireframes/recommendations",
    title: "Recommendations Landing Wireframe",
    note: "Curated recommendation page (not product filter page).",
  },
  {
    href: "/wireframes/products/sample-product",
    title: "Product Detail Wireframe",
    note: "Includes new 'Who This Is For' section in PDP flow.",
  },
];

export default function WireframesIndexPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full bg-[#1A1A1A] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          V2 Wireframes
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#1A1A1A]">
          Nauvarah Redesign Screens
        </h1>
        <p className="mt-3 text-sm text-[#666666]">
          Wireframe-only routes. Existing production pages remain untouched.
        </p>

        <div className="mt-8 space-y-4">
          {screens.map((screen) => (
            <Link
              key={screen.href}
              href={screen.href}
              className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
            >
              <p className="text-lg font-bold text-[#1A1A1A]">{screen.title}</p>
              <p className="mt-1 text-sm text-[#666666]">{screen.note}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
