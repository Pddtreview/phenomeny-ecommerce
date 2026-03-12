'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PRIMARY = "#1B3A6B";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "rto",
] as const;

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus ?? "confirmed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (newStatus: string) => {
    setStatus(newStatus);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Update failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-600">
        Order status
      </label>
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={cn(
          "w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        )}
        style={{ outlineColor: PRIMARY }}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
