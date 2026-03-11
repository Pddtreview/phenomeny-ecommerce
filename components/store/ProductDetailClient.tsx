"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  image_urls: string[] | null;
};

type ProductDetailClientProps = {
  productId: string;
  productName: string;
  variants: ProductVariant[];
};

export default function ProductDetailClient({
  productId,
  productName,
  variants,
}: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const addItem = useCart((s) => s.addItem);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const hasMultipleVariants = variants.length > 1;
  const isOutOfStock = selectedVariant
    ? selectedVariant.stock_quantity === 0
    : true;
  const lowStock =
    selectedVariant &&
    selectedVariant.stock_quantity > 0 &&
    selectedVariant.stock_quantity < 10;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    const image =
      Array.isArray(selectedVariant.image_urls) &&
      selectedVariant.image_urls[0]
        ? selectedVariant.image_urls[0]
        : null;
    addItem({
      variantId: selectedVariant.id,
      productId,
      name: productName,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      image,
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Price row */}
      <div className="flex flex-wrap items-baseline gap-2">
        {selectedVariant ? (
          <>
            <span
              className="text-2xl font-bold"
              style={{ color: PRIMARY }}
            >
              ₹{selectedVariant.price.toLocaleString("en-IN")}
            </span>
            {selectedVariant.compare_price != null &&
              selectedVariant.compare_price > selectedVariant.price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹
                  {selectedVariant.compare_price.toLocaleString("en-IN")}
                </span>
              )}
          </>
        ) : (
          <span className="text-2xl font-bold text-zinc-400">—</span>
        )}
      </div>

      {/* Variant selector */}
      {hasMultipleVariants && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Variant
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  selectedVariantId === v.id
                    ? "border-[#1B3A6B] text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                }`}
                style={
                  selectedVariantId === v.id
                    ? { backgroundColor: PRIMARY, borderColor: PRIMARY }
                    : undefined
                }
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock display */}
      <div className="text-sm">
        {isOutOfStock ? (
          <p className="font-medium text-red-600">Out of Stock</p>
        ) : lowStock ? (
          <p className="font-medium text-amber-700">
            Only {selectedVariant!.stock_quantity} left
          </p>
        ) : null}
      </div>

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: PRIMARY }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
