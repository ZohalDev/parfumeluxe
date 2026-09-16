import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: number[];
  toggle: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        set((state) => {
          if (state.items.includes(productId)) {
            return { items: state.items.filter((id) => id !== productId) };
          }
          return { items: [...state.items, productId] };
        });
      },
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    { name: "wishlist-storage" }
  )
);
