 'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function AccountAddressesPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<AuthCustomer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    label: "",
  });

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

  const reloadAddresses = async () => {
    try {
      const addrRes = await fetch("/api/account/addresses", {
        method: "GET",
      });
      const addrJson = await addrRes.json();
      setAddresses((addrJson.addresses ?? []) as Address[]);
    } catch {
      // ignore
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/addresses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to save address.");
        return;
      }
      setForm({
        name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        label: "",
      });
      setFormOpen(false);
      await reloadAddresses();
    } catch {
      setError("Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/account/addresses/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return;
      }
      await reloadAddresses();
    } catch {
      // ignore
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/account/addresses/set-default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return;
      }
      await reloadAddresses();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600">
          Loading addresses...
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">My Addresses</h1>
          <button
            type="button"
            onClick={() => setFormOpen((o) => !o)}
            className="rounded-full px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            {formOpen ? "Cancel" : "Add address"}
          </button>
        </div>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Address line 1
                </label>
                <input
                  name="line1"
                  value={form.line1}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Address line 2
                </label>
                <input
                  name="line2"
                  value={form.line2}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  City
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  State
                </label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Pincode
                </label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Label
                </label>
                <select
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-1 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: PRIMARY }}
            >
              {saving ? "Saving..." : "Save address"}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No saved addresses yet. Add your first address above.
            </p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {addr.name}
                    </p>
                    {addr.label && (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                        {addr.label}
                      </span>
                    )}
                    {addr.is_default && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Default
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
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="rounded-full border border-zinc-200 px-3 py-1 font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-full border border-red-200 px-3 py-1 font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

