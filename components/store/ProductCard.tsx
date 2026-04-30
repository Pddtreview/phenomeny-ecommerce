"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  href: string;
  productId: string;
  name: string;
  image: string | null;
  price: number | null;
  comparePrice: number | null;
  variantId: string | null;
  sku: string | null;
  fallbackImage: string;
  className?: string;
};

function formatPrice(value: number | null) {
  if (value === null) return "Price on request";
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ProductCard({
  href,
  productId,
  name,
  image,
  price,
  comparePrice,
  variantId,
  sku,
  fallbackImage,
  className,
}: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const product = { name };

  const canQuickAdd = Boolean(variantId && sku && typeof price === "number" && price > 0);

  const handleQuickAdd = () => {
    if (!canQuickAdd || !variantId || !sku || typeof price !== "number") return;

    addItem({
      variantId,
      productId,
      name,
      sku,
      price,
      image,
      itemType: "variant",
    });
  };

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      variants={{
        rest: { y: 0 },
        hover: { y: -4 },
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
        aria-label={`View ${name}`}
      />

      <div className="relative m-3 aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5]">
        <Image
          src={image || fallbackImage}
          alt={name}
          fill
          quality={90}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <p className="font-semibold text-[#1A1A1A] text-sm leading-snug line-clamp-2 px-4 mt-2 mb-1 relative z-20">
        {product.name ?? <span className="text-red-600">No name</span>}
      </p>

      <div className="px-4 pb-4 pt-2">
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-[#1A1A1A]">
            {formatPrice(price)}
          </p>
          {typeof comparePrice === "number" && comparePrice > 0 ? (
            <p className="text-sm text-[#999999] line-through">
              {formatPrice(comparePrice)}
            </p>
          ) : null}
        </div>
        <div className="relative z-20 mt-3">
          {canQuickAdd ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="btn-gradient w-full py-2.5 text-sm font-semibold hover:scale-105 hover:opacity-90"
            >
              Add to Cart
            </button>
          ) : (
            <Link
              href={href}
              className="btn-gradient inline-flex w-full items-center justify-center py-2.5 text-sm font-semibold hover:scale-105 hover:opacity-90"
            >
              View Product
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
