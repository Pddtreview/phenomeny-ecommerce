import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

type BundleRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  images: string[] | null;
};

async function getBundles(): Promise<BundleRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bundles")
    .select("id, name, slug, description, price, compare_price, images")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("bundles fetch error:", error?.message);
    return [];
  }
  return data as BundleRow[];
}

export default async function BundlesPage() {
  const bundles = await getBundles();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header
        className="w-full px-4 py-12 text-center text-white"
        style={{ backgroundColor: PRIMARY }}
      >
        <h1 className="text-3xl font-semibold">Our Bundles</h1>
        <p className="mt-2 text-sm text-white/70">
          Complete sets curated for maximum abundance
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {bundles.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center text-center">
            <p className="text-sm text-zinc-500">Bundles launching soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => {
              const hasCompare =
                b.compare_price != null && b.compare_price > b.price;
              const savings = hasCompare ? b.compare_price! - b.price : 0;
              const img =
                Array.isArray(b.images) && b.images[0] ? b.images[0] : null;

              return (
                <article
                  key={b.id}
                  className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
                >
                  <Link href={`/bundles/${b.slug}`} className="block">
                    <div className="relative h-56 w-full overflow-hidden bg-zinc-100">
                      {img ? (
                        <img
                          src={img}
                          alt={b.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center px-6 text-center"
                          style={{ backgroundColor: PRIMARY, color: GOLD }}
                        >
                          <p className="text-sm font-medium">{b.name}</p>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {b.name}
                    </h2>
                    {b.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                        {b.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className="text-xl font-bold"
                        style={{ color: GOLD }}
                      >
                        <span className="font-inter rupee">₹</span>
                        {Number(b.price).toLocaleString("en-IN")}
                      </span>
                      {hasCompare && (
                        <>
                          <span className="text-sm text-zinc-400 line-through">
                            <span className="font-inter rupee">₹</span>
                            {Number(b.compare_price).toLocaleString("en-IN")}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Save <span className="font-inter rupee">₹</span>
                            {savings.toLocaleString("en-IN")}
                          </span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/bundles/${b.slug}`}
                      className="mt-5 block w-full rounded-lg py-3 text-center text-sm font-semibold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      View Bundle
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
