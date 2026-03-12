"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PRIMARY = "#1B3A6B";
const CATEGORIES = [
  { value: "frames", label: "Frames" },
  { value: "crystals", label: "Crystals" },
  { value: "vastu", label: "Vastu" },
  { value: "bundles", label: "Bundles" },
];

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("frames");
  const [description, setDescription] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [variantName, setVariantName] = useState("Default");
  const [variantSku, setVariantSku] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantComparePrice, setVariantComparePrice] = useState("");
  const [variantCostPrice, setVariantCostPrice] = useState("");
  const [variantStock, setVariantStock] = useState("0");

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === slugify(name)) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          category,
          description: description.trim() || undefined,
          hsn_code: hsnCode.trim() || undefined,
          weight_grams: weightGrams.trim() === "" ? undefined : Number(weightGrams),
          is_active: isActive,
          variant: {
            name: variantName.trim(),
            sku: variantSku.trim(),
            price: Number(variantPrice),
            compare_price:
              variantComparePrice.trim() === ""
                ? undefined
                : Number(variantComparePrice),
            cost_price:
              variantCostPrice.trim() === ""
                ? undefined
                : Number(variantCostPrice),
            stock_quantity:
              variantStock.trim() === "" ? 0 : Number(variantStock),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create product");
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Products
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Product basics */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            Product basics
          </h2>
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
                Slug (auto-generated from name)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="product-name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                HSN code
              </label>
              <input
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Weight (grams)
              </label>
              <input
                type="number"
                min={0}
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <label htmlFor="is_active" className="text-sm text-zinc-700">
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

        {/* 2. First variant */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            First variant
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Variant name
              </label>
              <input
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                SKU
              </label>
              <input
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Compare at price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={variantComparePrice}
                onChange={(e) => setVariantComparePrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Cost price (₹)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={variantCostPrice}
                onChange={(e) => setVariantCostPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Stock quantity
              </label>
              <input
                type="number"
                min={0}
                value={variantStock}
                onChange={(e) => setVariantStock(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
            style={{ backgroundColor: PRIMARY }}
          >
            {loading ? "Creating…" : "Create product"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
