'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';

const PRIMARY = '#1B3A6B';
const CATEGORIES = ['All', 'Frames', 'Crystals', 'Vastu', 'Bundles'];
const RECENTLY_VIEWED_KEY = 'recently_viewed';
const RECENTLY_VIEWED_MAX = 6;

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number | null;
  compare_price: number | null;
  image_url: string | null;
};

type ProductsClientProps = {
  products: Product[];
};

function addToRecentlyViewed(item: {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  image_url: string | null;
}) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: typeof item[] = raw ? JSON.parse(raw) : [];
    list = list.filter((x) => x.id !== item.id);
    list.unshift(item);
    list = list.slice(0, RECENTLY_VIEWED_MAX);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (_) {}
}

export default function ProductsClient({ products }: ProductsClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ['name', 'description'],
        threshold: 0.3,
      }),
    [products]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return products;
    return fuse.search(search).map((r) => r.item);
  }, [products, search, fuse]);

  const filtered = useMemo(() => {
    if (category === 'All') return searchResults;
    const cat = category.toLowerCase();
    return searchResults.filter((p) => (p.category ?? '').toLowerCase() === cat);
  }, [searchResults, category]);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(RECENTLY_VIEWED_KEY) : null;
      const list = raw ? JSON.parse(raw) : [];
      const ids = new Set(products.map((p) => p.id));
      const valid = list.filter((x: Product) => ids.has(x.id));
      setRecentlyViewed(valid.slice(0, 4));
    } catch (_) {
      setRecentlyViewed([]);
    }
  }, [products]);

  const handleProductClick = (product: Product) => {
    addToRecentlyViewed({
      id: product.id,
      slug: product.slug ?? product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    setRecentlyViewed((prev) => {
      const next = [
        { ...product, slug: product.slug ?? product.id },
        ...prev.filter((p) => p.id !== product.id),
      ].slice(0, 4);
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition"
                style={
                  isActive
                    ? { backgroundColor: PRIMARY, color: 'white' }
                    : { backgroundColor: '#f4f4f5', color: '#71717a' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">No products found</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => {
            const href = '/products/' + (product.slug || product.id);
            const hasPrice = product.price !== null;
            const formattedPrice = hasPrice
              ? '₹' + (product.price as number).toLocaleString('en-IN')
              : 'Price on request';
            const hasComparePrice =
              product.compare_price !== null && hasPrice;

            return (
              <article
                key={product.id}
                className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <Link
                  href={href}
                  onClick={() => handleProductClick(product)}
                  className="block"
                >
                  <div className="flex h-48 items-center justify-center bg-zinc-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center px-2 text-center"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        <p className="line-clamp-3 text-sm font-medium" style={{ color: '#C8860A' }}>
                          {product.name}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col px-3 py-3">
                  <Link
                    href={href}
                    onClick={() => handleProductClick(product)}
                    className="line-clamp-2 text-sm font-semibold text-gray-900 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 flex items-baseline text-sm">
                    <span className="font-bold" style={{ color: PRIMARY }}>
                      {formattedPrice}
                    </span>
                    {hasComparePrice && (
                      <span className="ml-2 text-xs text-gray-400 line-through">
                        ₹{(product.compare_price as number).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <Link
                    href={href}
                    onClick={() => handleProductClick(product)}
                    className="mt-3 block rounded-lg py-2 text-center text-xs font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    View Product
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <section className="mt-12 border-t border-zinc-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((product) => {
              const href = '/products/' + (product.slug || product.id);
              const hasPrice = product.price !== null;
              const formattedPrice = hasPrice
                ? '₹' + (product.price as number).toLocaleString('en-IN')
                : 'Price on request';
              return (
                <Link
                  key={product.id}
                  href={href}
                  onClick={() => handleProductClick(product)}
                  className="flex w-40 shrink-0 flex-col overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <div className="h-32 w-full bg-zinc-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center px-2 text-center text-xs font-medium"
                        style={{ backgroundColor: PRIMARY, color: '#C8860A' }}
                      >
                        {product.name}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-medium text-zinc-900">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                      {formattedPrice}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
