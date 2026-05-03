"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PRIMARY = "#1B3A6B";

type Line = {
  product_variant_id: string;
  quantity: number;
  label: string;
};

type SearchVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  product_name: string;
};

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "bundle";
}

export function BundleEditor({ bundleId }: { bundleId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(bundleId);

  const [loading, setLoading] = useState(!!bundleId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [lines, setLines] = useState<Line[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchVariant[]>([]);
  const [searching, setSearching] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!bundleId) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/bundles/${bundleId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");
        if (cancel) return;
        const b = data.bundle;
        setName(b.name ?? "");
        setSlug(b.slug ?? "");
        setDescription(b.description ?? "");
        setPrice(String(b.price ?? ""));
        setComparePrice(
          b.compare_price != null ? String(b.compare_price) : ""
        );
        setIsActive(b.is_active !== false);
        setImages(Array.isArray(b.images) ? b.images : []);
        setLines(
          (data.items ?? []).map((it: any) => ({
            product_variant_id: it.product_variant_id,
            quantity: Number(it.quantity ?? 1),
            label: it.variant_label ?? it.product_variant_id,
          }))
        );
      } catch (e) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [bundleId]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const t = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/admin/product-variants/search?q=${encodeURIComponent(search.trim())}`
        );
        const data = await res.json();
        setSearchResults(data.variants ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [search]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && (!slug || slug === slugify(name))) {
      setSlug(slugify(value));
    }
  };

  const addVariant = useCallback((v: SearchVariant) => {
    setLines((prev) => {
      if (prev.some((p) => p.product_variant_id === v.id)) return prev;
      const label = `${v.product_name} — ${v.name} (${v.sku})`;
      return [
        ...prev,
        {
          product_variant_id: v.id,
          quantity: 1,
          label,
        },
      ];
    });
    setSearch("");
    setSearchResults([]);
  }, []);

  const uploadToBundle = async (file: File, bid: string) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/bundles/${bid}/upload-image`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    if (Array.isArray(data.images)) setImages(data.images);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fileInput = document.getElementById(
      "bundle-image-file"
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        price: Number(price),
        compare_price:
          comparePrice.trim() === "" ? null : Number(comparePrice),
        is_active: isActive,
        items: lines.map((l) => ({
          product_variant_id: l.product_variant_id,
          quantity: l.quantity,
        })),
      };

      if (!payload.name) throw new Error("Name is required");
      if (!Number.isFinite(payload.price) || payload.price < 0) {
        throw new Error("Valid price is required");
      }
      if (payload.items.length === 0) {
        throw new Error("Add at least one variant from search");
      }

      let bid = bundleId;

      if (isEdit && bid) {
        const res = await fetch(`/api/admin/bundles/${bid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Save failed");
        if (file) {
          setImageUploading(true);
          try {
            await uploadToBundle(file, bid);
          } finally {
            setImageUploading(false);
          }
        }
        router.push("/admin/bundles");
        router.refresh();
        return;
      }

      const res = await fetch("/api/admin/bundles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      bid = data.bundleId as string;
      if (file && bid) {
        setImageUploading(true);
        try {
          await uploadToBundle(file, bid);
        } finally {
          setImageUploading(false);
        }
      }
      router.push("/admin/bundles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-zinc-500">
        {isEdit ? "Loading bundle…" : ""}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/bundles"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Bundles
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">
        {isEdit ? "Edit bundle" : "New bundle"}
      </h1>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Slug
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Bundle price (INR)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Compare-at price (optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="bundle_is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <label htmlFor="bundle_is_active" className="text-sm text-zinc-700">
                Active (visible on store)
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            Bundle images
          </h2>
          {isEdit && images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {images.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover ring-1 ring-zinc-200"
                />
              ))}
            </div>
          )}
          <input
            id="bundle-image-file"
            type="file"
            accept="image/*"
            className="text-sm"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Optional. On save, the image uploads to Cloudinary and is appended
            to this bundle&apos;s gallery.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            Products in bundle
          </h2>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Search variants (SKU, variant name, product name)
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type at least 2 characters…"
            className="mb-2 w-full max-w-md rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
          {searching && (
            <p className="mb-2 text-xs text-zinc-500">Searching…</p>
          )}
          {searchResults.length > 0 && (
            <ul className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50">
              {searchResults.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => addVariant(v)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-100"
                  >
                    <span className="text-zinc-800">
                      {v.product_name} — {v.name}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {v.sku} · <span className="font-inter rupee">₹</span>
                      {v.price} · stock {v.stock_quantity}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mb-2 text-xs font-medium text-zinc-600">Included lines</p>
          {lines.length === 0 ? (
            <p className="text-sm text-zinc-500">No variants yet.</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((line) => (
                <li
                  key={line.product_variant_id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-100 bg-white px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-sm text-zinc-800">
                    {line.label}
                  </span>
                  <label className="flex items-center gap-1 text-xs text-zinc-600">
                    Qty
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => {
                        const q = Math.max(
                          1,
                          parseInt(e.target.value, 10) || 1
                        );
                        setLines((prev) =>
                          prev.map((l) =>
                            l.product_variant_id === line.product_variant_id
                              ? { ...l, quantity: q }
                              : l
                          )
                        );
                      }}
                      className="w-16 rounded border border-zinc-200 px-2 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) =>
                        prev.filter(
                          (l) =>
                            l.product_variant_id !== line.product_variant_id
                        )
                      )
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || imageUploading}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: PRIMARY }}
          >
            {saving || imageUploading ? "Saving…" : isEdit ? "Save bundle" : "Create bundle"}
          </button>
          <Link
            href="/admin/bundles"
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
