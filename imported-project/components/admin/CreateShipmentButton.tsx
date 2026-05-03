"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#1B3A6B";

export function CreateShipmentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create shipment");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
        style={{ backgroundColor: PRIMARY }}
      >
        {loading ? "Creating…" : "Create Shipment"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
