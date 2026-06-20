import Link from "next/link";

export default async function ProductWireframePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
            PDP Wireframe: {slug}
          </h1>
          <Link
            href="/wireframes"
            className="rounded-full border border-[#E8E8E8] px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            Back
          </Link>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">1. Product Hero</h2>
            <p className="mt-2 text-sm text-[#666666]">Image gallery + title + price + primary CTAs</p>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-[#F7F7F7] p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">2. Why Karan Recommends This</h2>
            <p className="mt-2 text-sm text-[#666666]">Authority note + recommendation context</p>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">3. Who This Is For</h2>
            <p className="mt-2 text-sm text-[#666666]">
              New section approved: persona-based fit indicators and symptom mapping.
            </p>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">4. Benefits</h2>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">5. How To Use</h2>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">6. Frequently Recommended With</h2>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">7. Reviews</h2>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-white p-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">8. FAQ</h2>
          </section>

          <section className="rounded-3xl border border-[#E8E8E8] bg-[#111111] p-6 text-white">
            <h2 className="text-2xl font-black">9. Related Guidance</h2>
          </section>
        </div>
      </div>
    </div>
  );
}
