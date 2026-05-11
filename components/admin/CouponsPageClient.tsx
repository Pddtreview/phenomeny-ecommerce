"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponForm } from "./CouponForm";
import { CouponToggle } from "./CouponToggle";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

const PRIMARY = "#1B3A6B";

type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  used_count: number;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
};

export function CouponsPageClient({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Coupons</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          {showForm ? "Cancel" : "Add Coupon"}
        </button>
      </div>

      {showForm && (
        <CouponForm
          onSuccess={() => {
            setShowForm(false);
            router.refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Code</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Type</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Discount</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Usage</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Limit</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Expiry</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{c.code}</td>
                <td className="px-4 py-3 text-zinc-600">{c.type}</td>
                <td className="px-4 py-3 text-zinc-900">
                  {c.type === "percent"
                    ? `${c.value}%`
                    : (
                        <>
                          <RupeeSymbol />
                          {c.value}
                        </>
                      )}
                </td>
                <td className="px-4 py-3 text-zinc-900">{c.used_count}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {c.max_uses != null ? c.max_uses : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {c.expires_at ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <CouponToggle
                    couponId={c.id}
                    isActive={c.is_active}
                    onToggle={() => router.refresh()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No coupons. Click Add Coupon to create one.
          </p>
        )}
      </div>
    </div>
  );
}
