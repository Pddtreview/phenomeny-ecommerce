'use client';

import { useEffect } from 'react';

const RECENTLY_VIEWED_KEY = 'recently_viewed';
const RECENTLY_VIEWED_MAX = 6;

type Props = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
};

export default function SaveRecentlyViewed({
  id,
  slug,
  name,
  price,
  image_url,
}: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      let list: Props[] = raw ? JSON.parse(raw) : [];
      list = list.filter((x) => x.id !== id);
      list.unshift({ id, slug, name, price, image_url });
      list = list.slice(0, RECENTLY_VIEWED_MAX);
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
    } catch (_) {}
  }, [id, slug, name, price, image_url]);

  return null;
}
