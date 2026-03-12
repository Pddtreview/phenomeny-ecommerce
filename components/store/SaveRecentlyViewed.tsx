'use client';

import { useEffect } from "react";

const KEY = "recently_viewed";
const MAX_ITEMS = 6;

type SaveRecentlyViewedProps = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
};

export default function SaveRecentlyViewed(props: SaveRecentlyViewedProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      const list: SaveRecentlyViewedProps[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((item) => item.id !== props.id);
      const next = [props].concat(filtered).slice(0, MAX_ITEMS);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, [props.id, props.slug, props.name, props.price, props.image_url]);

  return null;
}

