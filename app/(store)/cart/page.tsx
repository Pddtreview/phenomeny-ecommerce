"use client";

import Link from "next/link";
import { useCart, getCartLineKey } from "@/hooks/useCart";
import { RupeeSymbol } from "@/components/ui/RupeeSymbol";

const PRIMARY = "#1A1A1A";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
          Your Cart ({totalItems()})
        </h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <p className="text-zinc-600">Your cart is empty.</p>
            <Link
              href="/products"
              className="mt-4 inline-flex rounded-full bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {items.map((item) => {
                const lineKey = getCartLineKey(item);
                return (
                  <article
                    key={lineKey}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{item.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{item.sku}</p>
                        <p className="mt-2 text-sm font-bold text-[#1A1A1A]">
                          <RupeeSymbol />
                          {Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(lineKey)}
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 inline-flex items-center rounded-full border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(lineKey, item.quantity - 1)}
                        className="px-3 py-1 text-sm"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-2 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(lineKey, item.quantity + 1)}
                        className="px-3 py-1 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Subtotal</span>
                <span className="text-xl font-bold" style={{ color: PRIMARY }}>
                  <RupeeSymbol />
                  {totalPrice().toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Free: Karan&apos;s guide included with your order
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/checkout"
                  className="btn-gradient inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
                >
                  Checkout
                </Link>
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-[#1A1A1A]"
                >
                  Continue Shopping
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
