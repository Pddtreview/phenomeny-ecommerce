'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Fuse from 'fuse.js';

const PRIMARY = '#1A1A1A';

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
  const c = (product.category || '').toLowerCase();
  switch (filter) {
    case 'frames':
      return c.includes('frame');
    case 'crystals':
      return c.includes('crystal');
    case 'vastu':
      return c.includes('vastu');
    case 'bundles':
      return c.includes('bundle');
    default:
      return true;
  }
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

type Props = {
  products: ProductsClientProduct[];
};

export default function ProductsClient({ products }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryKey>('all');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

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
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === key
                ? 'text-white shadow-sm btn-gradient'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {recentItems.length > 0 && (
        <section className="mt-10">
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
                  className="w-36 shrink-0 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition hover:border-zinc-300 hover:shadow"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100">
                    {img ? (
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="144px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-medium text-zinc-900">
                    {item.name ?? <span className="text-red-600">No name</span>}
                  </p>
                  {price != null && price > 0 && (
                    <p className="mt-1 text-xs font-semibold" style={{ color: PRIMARY }}>
                      <span className="font-inter rupee">₹</span>
                      {Number(price).toLocaleString('en-IN')}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-10">
        <p className="mb-4 text-sm text-zinc-500">
          {displayed.length} product{displayed.length === 1 ? '' : 's'}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((p) => {
            const img = getPrimaryImage(p);
            const price = getDisplayPrice(p);
            return (
              <Link
                key={p.id}
                href={`/products/${encodeURIComponent(p.slug)}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-100">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.name}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
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
                  <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 group-hover:underline">
                    {p.name ?? <span className="text-red-600">No name</span>}
                  </h3>
                  {price != null && price > 0 ? (
                    <p className="mt-2 text-lg font-bold" style={{ color: PRIMARY }}>
                      <span className="font-inter rupee">₹</span>
                      {Number(price).toLocaleString('en-IN')}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-medium text-zinc-500">Price on request</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {displayed.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">
            No products match your filters. Try another category or search term.
          </p>
        )}
      </section>
    </div>
  );
}
