"use client";

import { useCart } from "@/hooks/useCart";

const PRIMARY = "#1B3A6B";

export type BundleCartLine = {
  bundleId: string;
  name: string;
  /** URL-friendly slug for SKU label */
  slug: string;
  price: number;
  image: string | null;
};

export default function AddBundleToCart({ bundle }: { bundle: BundleCartLine }) {
  const addBundleLine = useCart((s) => s.addBundleLine);

  const onAdd = () => {
    addBundleLine(
      {
        bundleId: bundle.bundleId,
        name: bundle.name,
        sku: `BUNDLE-${bundle.slug}`,
        price: bundle.price,
        image: bundle.image,
      },
      1
    );
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: PRIMARY }}
    >
      Add bundle to cart
    </button>
  );
}
