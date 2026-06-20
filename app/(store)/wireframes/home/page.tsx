import Link from "next/link";

function WireBlock({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666666]">
        Section
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-[#1A1A1A]">{title}</h2>
      {children}
    </section>
  );
}

export default function HomeWireframePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
            Homepage V2 Wireframe
          </h1>
          <Link
            href="/wireframes"
            className="rounded-full border border-[#E8E8E8] px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <WireBlock title="Navigation">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              <p>
                <strong>Desktop:</strong> Logo | Daily Wisdom | Recommendations |
                Consultation | About Karan | Search | Account | Cart
              </p>
              <p className="mt-3">
                <strong>Mobile:</strong> Logo + Search + Cart + Menu, with sticky
                bottom nav.
              </p>
            </div>
          </WireBlock>

          <WireBlock title="1. Hero">
            <div className="mt-4 rounded-2xl bg-[#111111] p-5 text-sm text-white">
              Headline + subheadline + 2 CTAs + trust line
            </div>
          </WireBlock>

          <WireBlock title="2. Choose Your Intention">
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {["Wealth & Career", "Protection", "Home & Vastu", "Focus & Clarity"].map(
                (item) => (
                  <div key={item} className="rounded-xl bg-[#F7F7F7] px-4 py-3 text-sm font-semibold">
                    {item}
                  </div>
                )
              )}
            </div>
          </WireBlock>

          <WireBlock title="3. Meet Karan (moved above Recommendations)">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Authority-led profile block, credentials, social proof, CTA to About Karan
            </div>
          </WireBlock>

          <WireBlock title="4. Karan's Recommendations">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Editorial recommendation cards + CTA to curated{" "}
              <code>/recommendations</code> page
            </div>
          </WireBlock>

          <WireBlock title="5. Client Stories">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Testimonials carousel/grid with outcomes
            </div>
          </WireBlock>

          <WireBlock title="6. Daily Wisdom (Guidance merged here)">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Unified content hub snippets: rituals, how-to, guidance notes
            </div>
          </WireBlock>

          <WireBlock title="7. Collections">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Intention-led collections (multi-assignment products)
            </div>
          </WireBlock>

          <WireBlock title="8. Consultation CTA">
            <div className="mt-4 rounded-2xl bg-[#111111] p-4 text-sm text-white">
              Premium CTA strip to consultation route
            </div>
          </WireBlock>

          <WireBlock title="9. Join Karan's Circle">
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4 text-sm text-[#1A1A1A]">
              Email / WhatsApp opt-in section
            </div>
          </WireBlock>
        </div>
      </div>
    </div>
  );
}
