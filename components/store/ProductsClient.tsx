'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { RupeeSymbol } from '@/components/ui/RupeeSymbol';
import { productHasDbCategory } from '@/lib/product-categories';
import { getProductRecommendationMetadata } from '@/lib/product-recommendation-metadata';
import { useCart } from '@/hooks/useCart';

const PRIMARY = '#FF7A00';

const RECENTLY_VIEWED_KEY = 'recently_viewed';

export type ProductVariantPreview = {
  price: number;
  compare_price?: number | null;
};

export type ProductImagePreview = {
  cloudinary_url: string;
  is_primary?: boolean;
};

export type ProductsClientProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  compare_price: number | null;
  variant_id: string | null;
  variant_sku: string | null;
  image_url: string | null;
  variants?: ProductVariantPreview[];
  images?: ProductImagePreview[];
};

type RecentItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
};

type CategoryKey = 'all' | 'frames' | 'crystals' | 'vastu' | 'bundles';

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'frames', label: 'Frames' },
  { key: 'crystals', label: 'Crystals' },
  { key: 'vastu', label: 'Vastu' },
  { key: 'bundles', label: 'Bundles' },
];

function matchesCategory(product: ProductsClientProduct, filter: CategoryKey): boolean {
  if (filter === 'all') return true;
  return productHasDbCategory(product.category, filter);
}

function getPrimaryImage(p: ProductsClientProduct): string | null {
  if (p.image_url) return p.image_url;
  const imgs = p.images;
  if (!imgs?.length) return null;
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0];
  return primary?.cloudinary_url ?? null;
}

function getDisplayPrice(p: ProductsClientProduct): number | null {
  const v0 = p.variants?.[0];
  if (v0 && typeof v0.price === 'number') return v0.price;
  return p.price ?? null;
}

function getDisplayComparePrice(p: ProductsClientProduct, fallbackDiscount: number): number | null {
  if (typeof p.compare_price === 'number' && p.compare_price > 0) return p.compare_price;
  const price = getDisplayPrice(p);
  if (!price || fallbackDiscount <= 0 || fallbackDiscount >= 100) return null;
  return Math.round(price / (1 - fallbackDiscount / 100));
}

function getDiscountPercent(price: number | null, comparePrice: number | null): number | null {
  if (!price || !comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

type Props = {
  products: ProductsClientProduct[];
  hideCategoryFilters?: boolean;
};

export default function ProductsClient({
  products,
  hideCategoryFilters = false,
}: Props) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryKey>('all');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const loadRecent = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      const list: RecentItem[] = raw ? JSON.parse(raw) : [];
      setRecentItems(Array.isArray(list) ? list.slice(0, 6) : []);
    } catch {
      setRecentItems([]);
    }
  }, []);

  useEffect(() => {
    loadRecent();
    window.addEventListener('focus', loadRecent);
    return () => window.removeEventListener('focus', loadRecent);
  }, [loadRecent]);

  const categoryFiltered = useMemo(
    () => products.filter((p) => matchesCategory(p, category)),
    [products, category]
  );

  const fuse = useMemo(
    () =>
      new Fuse(categoryFiltered, {
        keys: ['name', 'description'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [categoryFiltered]
  );

  const displayed = useMemo(() => {
    const q = search.trim();
    if (!q) return categoryFiltered;
    return fuse.search(q).map((r) => r.item);
  }, [categoryFiltered, search, fuse]);

  const productBySlug = useMemo(() => {
    const m = new Map<string, ProductsClientProduct>();
    for (const p of products) m.set(p.slug, p);
    return m;
  }, [products]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const addProductToCart = (product: ProductsClientProduct) => {
    const price = getDisplayPrice(product);
    const variantId = product.variant_id;
    const sku = product.variant_sku;
    if (!variantId || !sku || !price || price <= 0) {
      setToastType('error');
      setToastMessage('Open product details to select an option.');
      return false;
    }
    addItem(
      {
        variantId,
        productId: product.id,
        name: product.name,
        sku,
        price,
        image: getPrimaryImage(product),
        itemType: 'variant',
      },
      1
    );
    setToastType('success');
    setToastMessage(`${product.name} added to cart`);
    return true;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12">
      <div className="mt-8">
        <label htmlFor="products-search" className="sr-only">
          Search products
        </label>
        <input
          id="products-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or description…"
          className="w-full rounded-xl border border-[#F0DEC8] bg-[#FFFDF9] px-4 py-3 text-sm text-[#2A1B12] shadow-sm outline-none ring-0 placeholder:text-[#B59885] focus:border-[#FFC247]"
        />
      </div>

      {!hideCategoryFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === key
                  ? 'text-white shadow-sm btn-gradient'
                  : 'border border-[#F0DEC8] bg-[#FFFDF9] text-[#6D5447] hover:bg-[#FFF2E5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <section className="mt-10">
          <p className="mb-4 text-sm text-[#6D5447]">
          {displayed.length} product{displayed.length === 1 ? '' : 's'}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((p) => {
            const img = getPrimaryImage(p);
            const price = getDisplayPrice(p);
            const metadata = getProductRecommendationMetadata(p);
            const comparePrice = getDisplayComparePrice(p, metadata?.discount ?? 40);
            const discount = getDiscountPercent(price, comparePrice);
            const isFeatured = Boolean(metadata?.featured);
            const savingsPercent = discount ?? metadata?.discount ?? null;
            return (
              <article
                key={p.id}
                className={`group card-hover flex flex-col overflow-hidden rounded-2xl border bg-[#FFFDF9] shadow-sm transition ${
                  isFeatured
                    ? "border-[#FFC247] shadow-[0_14px_30px_rgba(255,122,0,0.16)] hover:-translate-y-[6px]"
                    : "border-[#F0DEC8] hover:-translate-y-[6px] hover:border-[#FFC247] hover:shadow-[0_20px_36px_rgba(255,122,0,0.16)]"
                }`}
              >
                <div className="relative aspect-[4/3] w-full bg-[#FFF2E5]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addProductToCart(p);
                    }}
                    className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#FFD3B3] bg-white/95 text-[#D76618] shadow-md transition duration-200 hover:scale-105 hover:shadow-[0_0_0_5px_rgba(255,122,0,0.15)]"
                    aria-label={`Add ${p.name} to cart`}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L22 7H7.2" />
                      <circle cx="10" cy="20" r="1.5" />
                      <circle cx="18" cy="20" r="1.5" />
                      <path d="M16.5 4.5v4M14.5 6.5h4" />
                    </svg>
                  </button>
                  {isFeatured ? (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-[#FFC247] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6A3A0E]">
                      Featured
                    </span>
                  ) : null}
                  {discount ? (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-[#E91E63] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                      {discount}% OFF
                    </span>
                  ) : null}
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#FFF2E8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#D76618]">
                      Karan Recommended
                    </span>
                    <span className="rounded-full bg-[#EEF8EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#15803D]">
                      Fast Dispatch
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-base font-semibold text-[#2A1B12] group-hover:underline">
                    <Link href={`/products/${encodeURIComponent(p.slug)}`}>
                      {p.name ?? <span className="text-red-600">No name</span>}
                    </Link>
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-[#6D5447]">
                    <p className="line-clamp-1">
                      <span className="font-semibold text-[#2A1B12]">For:</span>{" "}
                      {metadata?.primaryPurpose ?? "Recommended by Karan"}
                    </p>
                    <p className="line-clamp-2">
                      <span className="font-semibold text-[#2A1B12]">Recommended When:</span>{" "}
                      {metadata?.recommendedWhen ?? "You need practical support for this life area"}
                    </p>
                    {metadata?.bestFor ? (
                      <p className="line-clamp-1 text-xs">
                        <span className="font-semibold text-[#2A1B12]">Best For:</span> {metadata.bestFor}
                      </p>
                    ) : null}
                  </div>
                  {price != null && price > 0 ? (
                    <div className="mt-3 flex items-end gap-2">
                      <p className="text-lg font-bold" style={{ color: PRIMARY }}>
                        <RupeeSymbol />
                        {Number(price).toLocaleString('en-IN')}
                      </p>
                      {comparePrice && comparePrice > price ? (
                        <p className="text-sm font-medium text-[#8A7A6D] line-through">
                          <RupeeSymbol />
                          {Number(comparePrice).toLocaleString('en-IN')}
                        </p>
                      ) : null}
                      {savingsPercent ? (
                        <p className="text-xs font-semibold text-[#15803D]">Save {savingsPercent}%</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-medium text-[#6D5447]">Price on request</p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const added = addProductToCart(p);
                      if (added) router.push('/checkout');
                    }}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A00] to-[#E91E63] text-sm font-semibold text-white transition duration-200 hover:scale-[1.01]"
                  >
                    Buy Now
                  </button>
                  <Link
                    href={`/products/${encodeURIComponent(p.slug)}`}
                    className="mt-2 inline-flex w-fit text-xs font-semibold uppercase tracking-[0.08em] text-[#D76618] hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        {displayed.length === 0 && (
          <p className="py-12 text-center text-sm text-[#6D5447]">
            No products match your filters. Try another category or search term.
          </p>
        )}
      </section>

      {recentItems.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gradient-accent">
            Recently viewed
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentItems.map((item) => {
              const full = productBySlug.get(item.slug);
              const img = full ? getPrimaryImage(full) : item.image_url;
              const price = full ? getDisplayPrice(full) : item.price;
              return (
                <Link
                  key={`${item.id}-${item.slug}`}
                  href={`/products/${encodeURIComponent(item.slug)}`}
                  className="card-hover w-40 shrink-0 rounded-xl border border-[#F0DEC8] bg-[#FFFDF9] p-2 shadow-sm transition hover:border-[#FFC247]"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#FFF2E5]">
                    {img ? (
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="160px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-[#2A1B12]">
                    {item.name ?? <span className="text-red-600">No name</span>}
                  </p>
                  {price != null && price > 0 && (
                    <p className="mt-1 text-xs font-semibold" style={{ color: PRIMARY }}>
                      <RupeeSymbol />
                      {Number(price).toLocaleString('en-IN')}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
      {toastMessage ? (
        <div
          className={`fixed bottom-20 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 ${
            toastType === 'success' ? 'bg-[#2A1B12]' : 'bg-[#9F1239]'
          }`}
        >
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}
