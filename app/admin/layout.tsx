'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminLogout } from "@/components/admin/AdminLogout";

// Admin layout is completely separate from the store. Do NOT import or use
// components/store/Header or any store layout — /admin must not show the store header.

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
];

function NavIcon() {
  return (
    <span className="mr-3 flex h-2 w-2 shrink-0 rounded-full bg-current opacity-70" />
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 md:hidden"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {sidebarOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 12h16" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
          <Link
            href="/admin"
            className="text-lg font-semibold"
            style={{ color: GOLD }}
          >
            Nauvarah Admin
          </Link>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <AdminLogout />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar: w-64, full height, border-r */}
        <aside
          className={cn(
            "fixed left-0 top-14 z-30 min-h-screen w-64 border-r border-zinc-200 bg-white transition-transform md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav
            className="flex min-h-screen flex-col gap-0 py-4"
            aria-label="Admin"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "text-white"
                      : "text-zinc-600 hover:bg-blue-50 hover:text-zinc-900"
                  )}
                  style={
                    isActive
                      ? { backgroundColor: PRIMARY }
                      : undefined
                  }
                >
                  <NavIcon />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay on mobile when sidebar open */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content - offset by sidebar w-64 (16rem) */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 p-4 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
