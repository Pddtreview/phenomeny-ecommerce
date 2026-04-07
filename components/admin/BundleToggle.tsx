"use client";

import { useState } from "react";

const PRIMARY = "#1B3A6B";

type BundleToggleProps = {
  bundleId: string;
  isActive: boolean;
  onToggle: () => void;
};

export function BundleToggle({
  bundleId,
  isActive,
  onToggle,
}: BundleToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bundles/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleId, is_active: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      onToggle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full px-2 py-0.5 text-xs font-medium transition disabled:opacity-70 ${
        isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
      }`}
      style={isActive ? undefined : { color: PRIMARY }}
    >
      {loading ? "…" : isActive ? "Active" : "Inactive"}
    </button>
  );
}
