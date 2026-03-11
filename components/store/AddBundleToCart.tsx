"use client";

import { useMemo } from "react";
import { useCart } from "@/hooks/useCart";

const PRIMARY = "#1B3A6B";

export type BundleCartVariant = {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  image: string | null;
  quantity: number;
};

export default function AddBundleToCart({
  variants,
}: {
  variants: BundleCartVariant[];
}) {
  const addItem = useCart((s) => s.addItem);
  const isDisabled = variants.length === 0;

  const totalItems = useMemo(
    () => variants.reduce((sum, v) => sum + v.quantity, 0),
    [variants]
  );

  const onAdd = () => {
    if (isDisabled) return;
    for (const v of variants) {
      addItem(
        {
          variantId: v.variantId,
          productId: v.productId,
          name: v.name,
          sku: v.sku,
          price: v.price,
          image: v.image,
        },
        v.quantity
      );
    }
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isDisabled}
      className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: PRIMARY }}
    >
      {isDisabled ? "Bundle Unavailable" : `Add Bundle to Cart (${totalItems})`}
    </button>
  );
}

