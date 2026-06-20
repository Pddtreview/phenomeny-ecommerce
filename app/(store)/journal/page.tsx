const posts = [
  {
    slug: "how-to-cleanse-crystals-at-home",
    title: "How to Cleanse Your Crystals at Home",
    excerpt:
      "A practical weekly ritual to keep your stones clear, active, and aligned.",
  },
  {
    slug: "vastu-for-better-money-flow",
    title: "Simple Vastu Shifts for Better Money Flow",
    excerpt:
      "Small placement changes that can improve energy movement in your home office.",
  },
  {
    slug: "how-karan-prescribes-remedies",
    title: "How Karan Prescribes Remedies",
    excerpt:
      "What factors are considered before recommending a tool for your situation.",
  },
];

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full border border-[#F0DEC8] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6D5447]">
          Journal
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.02em] text-[#2A1B12]">
          Learn with intention
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6D5447]">
          Educational guidance, spiritual hygiene routines, and practical Vastu insights.
        </p>

        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="card-hover rounded-2xl border border-[#F0DEC8] bg-[#FFFDF9] p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-[#2A1B12]">{post.title}</h2>
              <p className="mt-2 text-sm text-[#6D5447]">{post.excerpt}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#2A1B12]">
                Coming soon
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
