import Link from "next/link";

export const metadata = {
  title: "Homepage V3 Preview",
  robots: { index: false, follow: false },
};

export default function PreviewV3IndexPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full bg-[#1A1A1A] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          V3 Preview
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#1A1A1A]">
          New Homepage V3
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Separate preview-only implementation. Existing pages remain untouched.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/preview-v3/desktop"
            className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
          >
            <p className="text-lg font-bold text-[#1A1A1A]">Desktop Homepage Preview</p>
            <p className="mt-1 text-sm text-[#666666]">Full-width desktop wire-to-visual implementation.</p>
          </Link>
          <Link
            href="/preview-v3/mobile"
            className="block rounded-2xl border border-[#E8E8E8] bg-white p-5 transition hover:bg-[#FAFAFA]"
          >
            <p className="text-lg font-bold text-[#1A1A1A]">Mobile Homepage Preview</p>
            <p className="mt-1 text-sm text-[#666666]">Constrained mobile canvas for readability checks.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
