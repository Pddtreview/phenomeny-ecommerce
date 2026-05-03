'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductDescriptionAiButton } from "@/components/admin/ProductDescriptionAiButton";

const PRIMARY = "#1B3A6B";
const CATEGORIES = [
  { value: "frames", label: "Frames" },
  { value: "crystals", label: "Crystals" },
  { value: "vastu", label: "Vastu" },
  { value: "bundles", label: "Bundles" },
];

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  hsn_code: string | null;
  weight_grams: number | null;
  is_active: boolean;
};

type Variant = {
  id: string;
  name: string | null;
  sku: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock_quantity: number;
};

type ImageRow = {
  id: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  is_primary: boolean;
};

export default function AdminEditProductPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [images, setImages] = useState<ImageRow[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("frames");
  const [description, setDescription] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [variantName, setVariantName] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantComparePrice, setVariantComparePrice] = useState("");
  const [variantCostPrice, setVariantCostPrice] = useState("");
  const [variantStock, setVariantStock] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load product");
        }
        setProduct(data.product);
        setVariant(data.variant);
        setImages(data.images || []);

        const p: Product = data.product;
        setName(p.name ?? "");
        setSlug(p.slug ?? "");
        setCategory((p.category as string) || "frames");
        setDescription(p.description ?? "");
        setHsnCode(p.hsn_code ?? "");
        setWeightGrams(
          typeof p.weight_grams === "number" ? String(p.weight_grams) : ""
        );
        setIsActive(Boolean(p.is_active));

        if (data.variant) {
          const v: Variant = data.variant;
          setVariant(v);
          setVariantName(v.name ?? "");
          setVariantSku(v.sku ?? "");
          setVariantPrice(String(v.price ?? ""));
          setVariantComparePrice(
            v.compare_price != null ? String(v.compare_price) : ""
          );
          setVariantCostPrice(
            v.cost_price != null ? String(v.cost_price) : ""
          );
          setVariantStock(String(v.stock_quantity ?? ""));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !variant) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          category,
          description: description.trim() || null,
          hsn_code: hsnCode.trim() || null,
          weight_grams:
            weightGrams.trim() === "" ? null : Number(weightGrams),
          is_active: isActive,
          variant: {
            id: variant.id,
            name: variantName.trim() || "Default",
            sku: variantSku.trim(),
            price: Number(variantPrice),
            compare_price:
              variantComparePrice.trim() === ""
                ? null
                : Number(variantComparePrice),
            cost_price:
              variantCostPrice.trim() === ""
                ? null
                : Number(variantCostPrice),
            stock_quantity:
              variantStock.trim() === "" ? 0 : Number(variantStock),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update product");
      }
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/products/${id}/upload-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to upload image");
      }
      if (data.image) {
        setImages((prev) => [...prev, data.image]);
      }
      e.target.value = "";
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Failed to upload image"
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/products/${id}/set-primary`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to set primary");
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Failed to set primary"
      );
    }
  };

  const handleDeleteImage = async (image: ImageRow) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/admin/products/${id}/delete-image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          cloudinary_public_id: image.cloudinary_public_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete image");
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Failed to delete image"
      );
    }
  };

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Invalid product id.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-sm text-zinc-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Products
        </Link>
        <p className="text-sm text-red-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Products
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">
        Edit: {product.name}
      </h1>

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
                onChange={(e) => setName(e.target.value)}
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
                required
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

        {/* 2. Variant */}
        {variant && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">
              Variant
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
        )}

        {/* 3. Images */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Images</h2>
          <div className="flex flex-wrap items-center gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex w-40 flex-col items-center gap-2 rounded-lg border border-zinc-200 p-2"
              >
                <img
                  src={img.cloudinary_url}
                  alt="Product image"
                  className="h-24 w-full rounded-md object-cover"
                />
                {img.is_primary && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Primary
                  </span>
                )}
                <div className="flex gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img.id)}
                      className="rounded border border-zinc-200 px-2 py-1 text-xs"
                    >
                      Set as primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <label className="flex h-24 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-400">
              <span>{imageUploading ? "Uploading…" : "Upload image"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={imageUploading}
              />
            </label>
          </div>
          {imageError && (
            <p className="mt-2 text-sm text-red-600">{imageError}</p>
          )}
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
            style={{ backgroundColor: PRIMARY }}
          >
            {saving ? "Saving…" : "Save changes"}
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

