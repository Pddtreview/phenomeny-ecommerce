 'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

const PRIMARY = "#1B3A6B";

type AuthCustomer = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
};

type AuthMeResponse =
  | { authenticated: false }
  | { authenticated: true; customer: AuthCustomer };

type OrderSummary = {
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
};

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  label: string | null;
};

export default function AccountDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const json: AuthMeResponse = await res.json();
        if (!json.authenticated) {
          if (!cancelled) router.replace("/account");
          return;
        }
        if (cancelled) return;
        setCustomer(json.customer);

        const ordersRes = await fetch("/api/orders/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: json.customer.phone }),
        });
        const ordersJson = await ordersRes.json();
        const ordersData = (ordersJson.orders ?? []) as OrderSummary[];
        setOrders(ordersData.slice(0, 5));

        const addrRes = await fetch("/api/account/addresses", {
          method: "GET",
        });
        const addrJson = await addrRes.json();
        setAddresses((addrJson.addresses ?? []) as Address[]);
      } catch {
        router.replace("/account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/account");
    }
  };

  if (loading || !customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600">
          Loading your account...
        </div>
      </div>
    );
  }

  const displayName = customer.name && customer.name.trim().length > 0 ? customer.name : customer.phone;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Account
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">
              Welcome, {displayName}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-900">
                Recent Orders
              </h2>
              <a
                href="/account/orders"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                View all orders
              </a>
            </div>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No orders yet. Start shopping.
              </p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                {orders.map((o) => (
                  <a
                    key={o.order_number}
                    href={"/track/" + encodeURIComponent(o.order_number)}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 hover:border-zinc-300"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {o.order_number}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(o.created_at).toLocaleDateString("en-IN")}{" "}
                        {" • "}
                        {String(o.order_status).replaceAll("_", " ")}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-sm font-bold"
                      style={{ color: PRIMARY }}
                    >
                      <RupeeSymbol />
                      {Number(o.total).toLocaleString("en-IN")}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              My Addresses
            </h2>
            {addresses.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No saved addresses yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3 text-xs text-zinc-700">
                {addresses.slice(0, 3).map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">
                        {addr.name}{" "}
                        {addr.is_default && (
                          <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            Default
                          </span>
                        )}
                      </p>
                      {addr.label && (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                          {addr.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">{addr.phone}</p>
                    <p className="mt-1 text-xs text-zinc-700">{addr.line1}</p>
                    {addr.line2 && (
                      <p className="text-xs text-zinc-700">{addr.line2}</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-700">
                      {addr.city + ", " + addr.state + " " + addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 space-y-2 text-xs">
              <a
                href="/account/addresses"
                className="inline-flex items-center text-xs font-medium text-zinc-700 hover:text-zinc-900"
              >
                Manage addresses
              </a>
            </div>
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <a
            href="/account/orders"
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:border-zinc-300"
          >
            All Orders
          </a>
          <a
            href="/account/addresses"
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:border-zinc-300"
          >
            Manage Addresses
          </a>
          <a
            href="/track"
            className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 hover:border-zinc-300"
          >
            Track an Order
          </a>
        </section>
      </div>
    </div>
  );
}

