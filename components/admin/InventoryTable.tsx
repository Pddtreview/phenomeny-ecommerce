"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PRIMARY = "#1B3A6B";

type VariantRow = {
  id: string;
  product_id: string;
  product_name: string;
  product_category?: string | null;
  variant_name: string;
  sku: string;
  stock_quantity: number;
  price: number;
  is_active: boolean;
};

export function InventoryTable({ rows }: { rows: VariantRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQty, setNewQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (id: string, currentQty: number) => {
    setEditingId(id);
    setNewQty(String(currentQty));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewQty("");
    setError(null);
  };

  const submitUpdate = async (row: VariantRow) => {
    if (!editingId) return;
    const parsed = parseInt(newQty, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a non-negative quantity");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: row.id,
          newQuantity: parsed,
          oldQuantity: row.stock_quantity,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed");
      cancelEdit();
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
            <th className="px-4 py-3 font-medium text-zinc-600">Update</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isZero = row.stock_quantity === 0;
            const isLow = row.stock_quantity > 0 && row.stock_quantity <= 20;
            const isEditing = editingId === row.id;

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
                  {row.product_category && (
                    <span className="ml-2 text-xs text-zinc-500">
                      ({row.product_category})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-700">{row.variant_name}</td>
                <td className="px-4 py-3 text-zinc-600">{row.sku}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  <div className="flex items-center gap-2">
                    <span>{row.stock_quantity}</span>
                    {isZero && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        Out of Stock
                      </span>
                    )}
                    {!isZero && isLow && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Low Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  <span className="font-inter rupee">₹</span>
                  {Number(row.price).toLocaleString("en-IN")}
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
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
                          className="w-24 rounded border border-zinc-200 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => submitUpdate(row)}
                          disabled={loading}
                          className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-70"
                          style={{ backgroundColor: PRIMARY }}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded border border-zinc-200 px-2 py-1 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      {error && (
                        <p className="text-xs text-red-600">{error}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(row.id, row.stock_quantity)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: PRIMARY }}
                    >
                      Update
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
