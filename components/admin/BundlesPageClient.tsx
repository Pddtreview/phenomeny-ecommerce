"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BundleToggle } from "./BundleToggle";

const PRIMARY = "#1B3A6B";

export type BundleListRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  is_active: boolean;
  created_at: string | null;
  thumbnail: string | null;
};

export function BundlesPageClient({ bundles }: { bundles: BundleListRow[] }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Bundles</h1>
        <Link
          href="/admin/bundles/new"
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          Add bundle
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Bundle</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Price</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Created</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((b) => (
              <tr key={b.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {b.thumbnail ? (
                      <img
                        src={b.thumbnail}
                        alt={b.name}
                        className="h-10 w-10 rounded-md object-cover ring-1 ring-zinc-200"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        —
                      </div>
                    )}
                    <span className="font-medium text-zinc-900">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{b.slug}</td>
                <td className="px-4 py-3 text-zinc-900">
                  <span className="font-inter rupee">₹</span>
                  {Number(b.price).toLocaleString("en-IN")}
                  {b.compare_price != null && b.compare_price > b.price && (
                    <span className="ml-2 text-xs text-zinc-400 line-through">
                      <span className="font-inter rupee">₹</span>
                      {Number(b.compare_price).toLocaleString("en-IN")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {b.created_at
                    ? new Date(b.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <BundleToggle
                    bundleId={b.id}
                    isActive={b.is_active}
                    onToggle={() => router.refresh()}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/bundles/${b.id}/edit`}
                    className="font-medium hover:underline"
                    style={{ color: PRIMARY }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bundles.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No bundles yet. Create one to sell on the store.
          </p>
        )}
      </div>
    </div>
  );
}
