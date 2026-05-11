'use client'

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  order_count: number;
  total_spent: number;
  is_rto_risk: boolean;
  last_order_at: string | null;
  rto_count: number;
  created_at: string | null;
};

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    if (!q) return customers;
    return customers.filter((c) => {
      const nameMatch = (c.name ?? "").toLowerCase().includes(q);
      const phoneMatch = (c.phone ?? "")
        .replace(/\D/g, "")
        .includes(qDigits);
      return nameMatch || phoneMatch;
    });
  }, [customers, query]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Search by name or phone
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Priya or 98765…"
          className="w-full max-w-xs rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Orders</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Total spent</th>
              <th className="px-4 py-3 font-medium text-zinc-600">
                Last order
              </th>
              <th className="px-4 py-3 font-medium text-zinc-600">RTO count</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className={cn(
                  "border-b border-zinc-100 last:border-0",
                  c.is_rto_risk && "bg-red-50"
                )}
              >
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.phone}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {c.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-900">{c.order_count}</td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <RupeeSymbol />
                  {Number(c.total_spent).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {c.last_order_at
                    ? new Date(c.last_order_at).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.rto_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No customers match
          </p>
        )}
      </div>
    </div>
  );
}
