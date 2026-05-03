"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteProductButtonProps = {
  productId: string;
};

const CONFIRM_MESSAGE =
  "Are you sure? This will delete the product and all\nits variants. This cannot be undone.";

export default function DeleteProductButton({
  productId,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Delete failed"
        );
      }
      router.refresh();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
