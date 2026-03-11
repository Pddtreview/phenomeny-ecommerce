import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AddBundleToCart, {
  type BundleCartVariant,
} from "@/components/store/AddBundleToCart";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

type BundleRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
};

type BundleItemRow = {
  id: string;
  bundle_id: string;
  variant_id: string;
  quantity: number;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  compare_price: number | null;
  image_urls: string[] | null;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
};

async function getBundleData(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data: bundle, error: bundleErr } = await supabase
    .from("bundles")
    .select("id, name, slug, description, price, compare_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (bundleErr || !bundle) return null;

  const { data: bundleItems, error: biErr } = await supabase
    .from("bundle_items")
    .select("id, bundle_id, variant_id, quantity")
    .eq("bundle_id", bundle.id);

  if (biErr) {
    console.error("bundle_items fetch error:", biErr.message);
  }

  const items = (bundleItems ?? []) as BundleItemRow[];
  const variantIds = Array.from(new Set(items.map((i) => i.variant_id))).filter(
    Boolean
  );

  const { data: variantsData } = variantIds.length
    ? await supabase
        .from("product_variants")
        .select("id, product_id, name, sku, price, compare_price, image_urls")
        .in("id", variantIds)
        .eq("is_active", true)
    : { data: [] as unknown[] };

  const variants = (variantsData ?? []) as VariantRow[];
  const productIds = Array.from(new Set(variants.map((v) => v.product_id)));

  const { data: productsData } = productIds.length
    ? await supabase.from("products").select("id, name, slug").in("id", productIds)
    : { data: [] as unknown[] };

  const products = (productsData ?? []) as ProductRow[];

  const variantById = new Map(variants.map((v) => [v.id, v] as const));
  const productById = new Map(products.map((p) => [p.id, p] as const));

  const included = items
    .map((it) => {
      const v = variantById.get(it.variant_id);
      if (!v) return null;
      const p = productById.get(v.product_id);
      return {
        bundleItemId: it.id,
        quantity: Number(it.quantity ?? 1),
        productId: v.product_id,
        productName: p?.name ?? "Product",
        productSlug: p?.slug ?? "",
        variantId: v.id,
        variantName: v.name ?? "Default",
        sku: v.sku ?? "",
        price: Number(v.price),
        image:
          Array.isArray(v.image_urls) && v.image_urls[0] ? v.image_urls[0] : null,
      };
    })
    .filter(Boolean) as Array<{
    bundleItemId: string;
    quantity: number;
    productId: string;
    productName: string;
    productSlug: string;
    variantId: string;
    variantName: string;
    sku: string;
    price: number;
    image: string | null;
  }>;

  return { bundle: bundle as BundleRow, included };
}

export default async function BundleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getBundleData(slug);
  if (!data) notFound();

  const { bundle, included } = data;
  const hasCompare =
    bundle.compare_price != null && bundle.compare_price > bundle.price;
  const savings = hasCompare ? bundle.compare_price! - bundle.price : 0;
  const individualValue = included.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  const cartVariants: BundleCartVariant[] = included.map((it) => ({
    variantId: it.variantId,
    productId: it.productId,
    name: `${it.productName} • ${it.variantName}`,
    sku: it.sku,
    price: it.price,
    image: it.image,
    quantity: it.quantity,
  }));

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/bundles"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to bundles
        </Link>

        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div
            className="flex h-64 items-center justify-center rounded-xl px-6 text-center"
            style={{ backgroundColor: PRIMARY, color: GOLD }}
          >
            <p className="text-sm font-medium">{bundle.name}</p>
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              {bundle.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: GOLD }}>
                ₹{Number(bundle.price).toLocaleString("en-IN")}
              </span>
              {hasCompare && (
                <>
                  <span className="text-sm text-zinc-400 line-through">
                    ₹{Number(bundle.compare_price).toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Save ₹{savings.toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Total value vs bundle price
              </h2>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-zinc-600">Individual value</span>
                <span className="font-semibold text-zinc-900">
                  ₹{individualValue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-zinc-600">Bundle price</span>
                <span className="font-semibold" style={{ color: GOLD }}>
                  ₹{Number(bundle.price).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <AddBundleToCart variants={cartVariants} />
            </div>
          </div>
        </div>

        <section className="mt-10 border-t border-zinc-200 pt-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            What&apos;s included
          </h2>
          {included.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              This bundle is being curated. Please check back shortly.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {included.map((it) => (
                <li
                  key={it.bundleItemId}
                  className="rounded-xl border border-zinc-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                        {it.productName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Variant: {it.variantName} • Qty: {it.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold" style={{ color: PRIMARY }}>
                      ₹{Number(it.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {bundle.description && (
          <section className="mt-10 border-t border-zinc-200 pt-8">
            <h2 className="text-lg font-semibold text-zinc-900">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-600">
              {bundle.description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

