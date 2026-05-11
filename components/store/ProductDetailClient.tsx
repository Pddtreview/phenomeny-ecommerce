"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

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

export type ProductImage = {
  cloudinary_url: string;
  is_primary: boolean;
};

type ProductDetailClientProps = {
  productId: string;
  productName: string;
  productCategory: string | null;
  variants: ProductVariant[];
  images: ProductImage[];
};

export default function ProductDetailClient({
  productId,
  productName,
  productCategory,
  variants,
  images,
}: ProductDetailClientProps) {
  const sortedImages = useMemo(() => {
    const primaryFirst = [...(images ?? [])].sort((a, b) =>
      a.is_primary ? -1 : b.is_primary ? 1 : 0
    );
    return primaryFirst;
  }, [images]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImageUrl =
    sortedImages.length > 0
      ? sortedImages[selectedImageIndex]?.cloudinary_url ?? sortedImages[0].cloudinary_url
      : null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const addItem = useCart((s) => s.addItem);

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const hasMultipleVariants = variants.length > 1;
  const stockQty = selectedVariant ? Number(selectedVariant.stock_quantity) : 0;
  const hasPrice =
    selectedVariant && typeof selectedVariant.price === "number"
      ? selectedVariant.price > 0
      : false;
  const comingSoon = !hasPrice;
  const isOutOfStock = stockQty === 0 && !comingSoon;
  const lowStock = !comingSoon && stockQty > 0 && stockQty <= 10;
  const highStock = !comingSoon && stockQty > 10;

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
      itemType: "variant",
    });
  };

  return (
    <>
      {/* Left column: image gallery */}
      <div className="flex flex-col gap-3">
        <div
          className="flex h-64 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 sm:h-80"
        >
          {selectedImageUrl ? (
            <img
              src={selectedImageUrl}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-xl px-4 text-center"
              style={{ backgroundColor: PRIMARY }}
            >
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                {productName}
              </p>
            </div>
          )}
        </div>
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sortedImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-100 transition"
                style={{
                  borderColor: selectedImageIndex === idx ? PRIMARY : "transparent",
                }}
              >
                <img
                  src={img.cloudinary_url}
                  alt={productName + " " + (idx + 1)}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right column: details */}
      <div className="flex flex-col">
        {productCategory && (
          <span
            className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: GOLD }}
          >
            {productCategory}
          </span>
        )}
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
          {productName}
        </h1>

        <div className="mt-6 space-y-4">
          {/* Price row */}
          <div className="price flex flex-wrap items-baseline gap-2">
            {selectedVariant ? (
              <>
                <span
                  className="text-2xl font-bold"
                  style={{ color: PRIMARY }}
                >
                  <RupeeSymbol />
                  {selectedVariant.price.toLocaleString("en-IN")}
                </span>
                {selectedVariant.compare_price != null &&
                  selectedVariant.compare_price > selectedVariant.price && (
                    <span className="price text-sm text-gray-400 line-through">
                      <RupeeSymbol />
                      {selectedVariant.compare_price.toLocaleString("en-IN")}
                    </span>
                  )}
              </>
            ) : (
              <span className="text-2xl font-bold text-zinc-400">—</span>
            )}
          </div>

          {/* Stock status badge */}
          <div className="text-xs">
            {comingSoon ? (
              <span
                className="inline-flex rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: "#e8eef8", color: PRIMARY }}
              >
                Coming Soon
              </span>
            ) : isOutOfStock ? (
              <span
                className="inline-flex rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
              >
                Out of Stock
              </span>
            ) : lowStock ? (
              <span
                className="inline-flex rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: "#fef3c7", color: "#b45309" }}
              >
                {"Only " + stockQty + " left"}
              </span>
            ) : (
              <span
                className="inline-flex rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
              >
                In Stock
              </span>
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
      </div>
    </>
  );
}
