"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";
import type { ProductRecommendationMetadata } from "@/lib/product-recommendation-metadata";

const PRIMARY = "#FF7A00";
const GOLD = "#FFC247";

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
  recommendationMeta?: ProductRecommendationMetadata | null;
};

export default function ProductDetailClient({
  productId,
  productName,
  productCategory,
  variants,
  images,
  recommendationMeta = null,
}: ProductDetailClientProps) {
  const sortedImages = useMemo(() => {
    const primaryFirst = [...(images ?? [])].sort((a, b) =>
      a.is_primary ? -1 : b.is_primary ? 1 : 0
    );
    return primaryFirst;
  }, [images]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImageUrl =
    sortedImages.length > 0
      ? sortedImages[selectedImageIndex]?.cloudinary_url ?? sortedImages[0].cloudinary_url
      : null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);

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
  const discountPercent =
    selectedVariant &&
    selectedVariant.compare_price &&
    selectedVariant.compare_price > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compare_price - selectedVariant.price) /
            selectedVariant.compare_price) *
            100
        )
      : null;

  const cartItem = () => {
    if (!selectedVariant) return null;
    const image =
      Array.isArray(selectedVariant.image_urls) &&
      selectedVariant.image_urls[0]
        ? selectedVariant.image_urls[0]
        : null;
    return {
      variantId: selectedVariant.id,
      productId,
      name: productName,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      image,
      itemType: "variant" as const,
    };
  };

  const handleAddToCart = () => {
    const item = cartItem();
    if (!item || isOutOfStock) return;
    addItem(item);
  };

  const handleBuyNow = () => {
    const item = cartItem();
    if (!item || isOutOfStock) return;
    clearCart();
    addItem(item);
    router.push("/checkout");
  };

  return (
    <>
      {/* Lightbox overlay */}
      {lightboxOpen && selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
          <img
            src={selectedImageUrl}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Left column: image gallery */}
      <div className="flex flex-col gap-3">
        <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-[#FFF8F0]" onClick={() => selectedImageUrl && setLightboxOpen(true)}>
          {selectedImageUrl ? (
            <>
              <img
                src={selectedImageUrl}
                alt={productName}
                className="h-full w-full object-contain"
              />
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-[#6D5447] opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" />
                </svg>
                View full
              </div>
            </>
          ) : (
            <div
              className="flex h-72 w-full items-center justify-center rounded-xl px-4 text-center"
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
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-[#FFF2E5] transition"
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
            className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-medium text-[#2A1B12]"
            style={{ backgroundColor: GOLD }}
          >
            {productCategory}
          </span>
        )}
        <h1 className="text-2xl font-bold text-[#2A1B12] sm:text-3xl">
          {productName}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
          <span className="rounded-full bg-[#FFF2E8] px-3 py-1 text-[#D76618]">Karan Recommended</span>
          <span className="rounded-full bg-[#EEF8EE] px-3 py-1 text-[#15803D]">Fast Dispatch</span>
          <span className="rounded-full bg-[#FFF4D9] px-3 py-1 text-[#8A4D11]">Secure Checkout</span>
        </div>
        {recommendationMeta ? (
          <div className="mt-4 space-y-2 rounded-xl border border-[#F0DEC8] bg-[#FFFDF9] p-3">
            <p className="text-sm text-[#6D5447]">
              <span className="font-semibold text-[#2A1B12]">For:</span> {recommendationMeta.primaryPurpose}
            </p>
            <p className="text-sm text-[#6D5447]">
              <span className="font-semibold text-[#2A1B12]">Best For:</span> {recommendationMeta.bestFor}
            </p>
            <p className="text-sm text-[#6D5447]">
              <span className="font-semibold text-[#2A1B12]">Recommended When:</span>{" "}
              {recommendationMeta.recommendedWhen}
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {/* Price row */}
          <div className="price flex flex-wrap items-baseline gap-2">
            {selectedVariant ? (
              <>
                {discountPercent ? (
                  <span className="rounded-full bg-[#E91E63] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                    {discountPercent}% OFF
                  </span>
                ) : null}
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
                style={{ backgroundColor: "#FFF2E5", color: "#2A1B12" }}
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
                style={{ backgroundColor: "#FFF4D9", color: "#8A4D11" }}
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6D5447]">
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
                        ? "text-white"
                        : "border-[#F0DEC8] bg-[#FFFDF9] text-[#6D5447] hover:border-[#FFC247]"
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

          {/* Add to Cart + Buy Now */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: PRIMARY, color: PRIMARY, backgroundColor: "transparent" }}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="interactive-lift flex-1 rounded-lg py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-[#F0DEC8] bg-[#FFF8F0]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#2A1B12]">{productName}</p>
            {selectedVariant ? (
              <p className="text-sm font-semibold text-[#FF7A00]">
                <RupeeSymbol />
                {selectedVariant.price.toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="rounded-full border-2 border-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="btn-gradient rounded-full px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}
