import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  bundleId?: string;
  /** Defaults to "variant" for persisted carts from before bundles. */
  itemType?: "variant" | "bundle";
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
};

export function getCartLineKey(
  item: Pick<CartItem, "variantId" | "bundleId" | "itemType">
): string {
  if (item.itemType === "bundle" && item.bundleId) {
    return `b:${item.bundleId}`;
  }
  return `v:${item.variantId}`;
}

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  addBundleLine: (
    payload: {
      bundleId: string;
      name: string;
      sku: string;
      price: number;
      image: string | null;
    },
    quantity?: number
  ) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item, quantity = 1) {
        set((state) => {
          const normalized: Omit<CartItem, "quantity"> = {
            ...item,
            itemType: item.itemType ?? "variant",
          };
          const lineKey = getCartLineKey(normalized);
          const existing = state.items.find(
            (i) => getCartLineKey(i) === lineKey
          );
          const newItems = existing
            ? state.items.map((i) =>
                getCartLineKey(i) === lineKey
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            : [...state.items, { ...normalized, quantity }];
          return { items: newItems };
        });
      },

      addBundleLine(payload, quantity = 1) {
        const line: Omit<CartItem, "quantity"> = {
          variantId: `__bundle__${payload.bundleId}`,
          bundleId: payload.bundleId,
          itemType: "bundle",
          productId: payload.bundleId,
          name: payload.name,
          sku: payload.sku,
          price: payload.price,
          image: payload.image,
        };
        get().addItem(line, quantity);
      },

      removeItem(lineKey) {
        set((state) => ({
          items: state.items.filter((i) => getCartLineKey(i) !== lineKey),
        }));
      },

      updateQuantity(lineKey, quantity) {
        if (quantity < 1) {
          get().removeItem(lineKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            getCartLineKey(i) === lineKey ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    { name: "nauvarah-cart" }
  )
);
