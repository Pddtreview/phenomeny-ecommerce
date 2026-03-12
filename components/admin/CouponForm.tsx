"use client";

import { useState } from "react";

const PRIMARY = "#1B3A6B";

type CouponFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function CouponForm({ onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"flat" | "percent">("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          discount_value: Number(discountValue),
          usage_limit: usageLimit.trim() === "" ? null : Number(usageLimit),
          expiry_date: expiryDate.trim() === "" ? null : expiryDate.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create coupon");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-zinc-900">Add coupon</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm uppercase"
            placeholder="SAVE10"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "flat" | "percent")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="flat">Flat (₹)</option>
            <option value="percent">Percent (%)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Discount value {type === "percent" ? "(%)" : "(₹)"}
          </label>
          <input
            type="number"
            min={0}
            max={type === "percent" ? 100 : undefined}
            step={type === "percent" ? 0.01 : 1}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Usage limit (optional)
          </label>
          <input
            type="number"
            min={0}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            placeholder="Leave empty for unlimited"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Expiry date (optional)
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          style={{ backgroundColor: PRIMARY }}
        >
          {loading ? "Creating…" : "Create coupon"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
