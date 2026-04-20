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
        hover: { y: -8 },
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-500 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]",
        className
      )}
    >
      <Link
        href={href}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8860A]/35 focus-visible:ring-offset-2"
        aria-label={`View ${name}`}
      />

      <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
        <Image
          src={image || fallbackImage}
          alt={name}
          fill
          quality={90}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <div className="space-y-3 px-5 pb-6 pt-5">
        <h3 className="text-balance font-cormorant text-lg font-medium leading-snug tracking-[0.03em] text-[#1A1A1A]">
          {name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-inter text-sm font-normal tracking-wide text-[#6D553F]">
            {formatPrice(price)}
          </p>
          {typeof comparePrice === "number" && comparePrice > 0 ? (
            <p className="font-inter text-xs font-normal text-[#4A3F35]/70 line-through">
              {formatPrice(comparePrice)}
            </p>
          ) : null}
        </div>
      </div>

      <motion.div
        variants={{
          rest: { y: 20, opacity: 0 },
          hover: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 },
          },
        }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4"
      >
        {canQuickAdd ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="pointer-events-auto min-h-12 w-full rounded-md bg-[#C8860A] px-4 py-3 text-center font-cormorant text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#A86D08]"
          >
            Quick Add
          </button>
        ) : (
          <Link
            href={href}
            className="pointer-events-auto inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#C8860A] px-4 py-3 text-center font-cormorant text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-[#A86D08]"
          >
            View Product
          </Link>
        )}
      </motion.div>
    </motion.article>
  );
}
