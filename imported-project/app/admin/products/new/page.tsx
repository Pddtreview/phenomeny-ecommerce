"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductDescriptionAiButton } from "@/components/admin/ProductDescriptionAiButton";

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

function makeAutoSku(slugForId: string): string {
  const base = slugForId.replace(/-/g, "").slice(0, 20) || "SKU";
  return `NAU-${base}-${Date.now().toString(36)}`.toUpperCase();
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugManual = useRef(false);

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManual.current) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    slugManual.current = true;
    setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const effectiveSlug = slug.trim() || slugify(name);
      const sku =
        variantSku.trim() || makeAutoSku(effectiveSlug);

      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: effectiveSlug,
          category,
          description: description.trim() || undefined,
          hsn_code: hsnCode.trim() || undefined,
          weight_grams: weightGrams.trim() === "" ? undefined : Number(weightGrams),
          is_active: isActive,
          variant: {
            name: variantName.trim(),
            sku,
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

      const productId = data?.productId as string | undefined;
      if (!productId) {
        throw new Error("Create succeeded but no product id returned");
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const up = await fetch(
          `/api/admin/products/${productId}/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );
        const upData = await up.json();
        if (!up.ok) {
          throw new Error(
            upData?.error ||
              "Product was created but image upload failed. You can add an image from the product edit page."
          );
        }
      }

      router.push(`/admin/products/${productId}/edit`);
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
                onChange={(e) => handleSlugChange(e.target.value)}
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
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="block text-xs font-medium text-zinc-600">
                  Description
                </label>
                <ProductDescriptionAiButton
                  name={name}
                  categoryLabel={
                    CATEGORIES.find((c) => c.value === category)?.label ??
                    category
                  }
                  hsnCode={hsnCode}
                  setDescription={setDescription}
                />
              </div>
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
                placeholder="Auto-generated if empty"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Unique code for inventory; leave blank to generate one.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Price (INR)
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
                Compare at price (INR)
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
                Cost price (INR)
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

        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Image</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Uploads to Cloudinary after the product is created (saved as the
            primary image if it&apos;s the first).
          </p>
          <div className="flex flex-wrap items-start gap-4">
            {imagePreviewUrl && (
              <div className="flex w-40 flex-col gap-2">
                <img
                  src={imagePreviewUrl}
                  alt="Selected product preview"
                  className="h-24 w-full rounded-md border border-zinc-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                >
                  Remove
                </button>
              </div>
            )}
            <label className="flex h-24 min-w-[10rem] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-4 text-center text-xs text-zinc-500 hover:border-zinc-400">
              <span>{imageFile ? "Choose a different image" : "Choose image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                  e.target.value = "";
                }}
                disabled={loading}
              />
            </label>
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
