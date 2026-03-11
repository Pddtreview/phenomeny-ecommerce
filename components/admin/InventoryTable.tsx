"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PRIMARY = "#1B3A6B";

type VariantRow = {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  stock_quantity: number;
  price: number;
  is_active: boolean;
};

export function InventoryTable({ rows }: { rows: VariantRow[] }) {
  const router = useRouter();
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAdjust = (id: string) => {
    setAdjustingId(id);
    setChange("");
    setReason("");
    setError(null);
  };

  const cancelAdjust = () => {
    setAdjustingId(null);
    setChange("");
    setReason("");
    setError(null);
  };

  const submitAdjust = async () => {
    if (!adjustingId) return;
    const delta = parseInt(change, 10);
    if (Number.isNaN(delta) || delta === 0) {
      setError("Enter a non-zero integer");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: adjustingId,
          change: delta,
          reason: reason || "admin adjust",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      cancelAdjust();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-3 font-medium text-zinc-600">Product</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Variant</th>
            <th className="px-4 py-3 font-medium text-zinc-600">SKU</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Stock</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Price</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
            <th className="px-4 py-3 font-medium text-zinc-600">Adjust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isZero = row.stock_quantity === 0;
            const isLow = row.stock_quantity > 0 && row.stock_quantity < 20;
            const isAdjusting = adjustingId === row.id;

            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-zinc-100 last:border-0",
                  isZero && "bg-red-50",
                  isLow && !isZero && "bg-amber-50"
                )}
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {row.product_name}
                </td>
                <td className="px-4 py-3 text-zinc-700">{row.variant_name}</td>
                <td className="px-4 py-3 text-zinc-600">{row.sku}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  {row.stock_quantity}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  ₹{Number(row.price).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isAdjusting ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={change}
                          onChange={(e) => setChange(e.target.value)}
                          placeholder="+/- qty"
                          className="w-24 rounded border border-zinc-200 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={submitAdjust}
                          disabled={loading}
                          className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-70"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelAdjust}
                          className="rounded border border-zinc-200 px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason (optional)"
                        className="w-full max-w-xs rounded border border-zinc-200 px-2 py-1 text-xs"
                      />
                      {error && (
                        <p className="text-xs text-red-600">{error}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startAdjust(row.id)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: PRIMARY }}
                    >
                      Adjust
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          No variants
        </p>
      )}
    </div>
  );
}
