"use client";

import Link from "next/link";
import { useCart, getCartLineKey } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

const PRIMARY = "#1A1A1A";
const GOLD = "#E91E8C";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close cart"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className={cn(
          "fixed inset-0 z-[100] bg-black/40 transition-opacity duration-200",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-zinc-500">Your cart is empty.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Add products from the collection.
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="btn-gradient mt-4 inline-block px-4 py-2 text-sm font-medium hover:scale-105 hover:opacity-90"
              >
                Shop Products
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={getCartLineKey(item)}
                  className="flex gap-3 border-b border-zinc-100 pb-4 last:border-0"
                >
                  <div
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg flex items-center justify-center text-[10px] font-medium text-center text-[#C8860A] bg-[#1B3A6B]"
                    style={{ backgroundColor: PRIMARY, color: GOLD }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.name.slice(0, 12)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.itemType === "bundle" ? "Bundle" : item.sku}
                    </p>
                    <p
                      className="mt-0.5 text-sm font-semibold"
                      style={{ color: PRIMARY }}
                    >
                      <span className="font-inter rupee">₹</span>
                      {item.price.toLocaleString("en-IN")} × {item.quantity}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-zinc-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              getCartLineKey(item),
                              item.quantity - 1
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center text-zinc-600 hover:bg-zinc-100"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="flex h-7 min-w-[28px] items-center justify-center border-x border-zinc-200 px-2 text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              getCartLineKey(item),
                              item.quantity + 1
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center text-zinc-600 hover:bg-zinc-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(getCartLineKey(item))}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty && (
          <div className="border-t border-zinc-200 px-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-900">Subtotal</span>
              <span
                className="text-lg font-bold"
                style={{ color: PRIMARY }}
              >
                <span className="font-inter rupee">₹</span>
                {totalPrice().toLocaleString("en-IN")}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-gradient mt-3 block w-full py-3 text-center text-sm font-medium hover:scale-105 hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
