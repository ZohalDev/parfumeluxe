import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@db/schema";

interface RecentStore {
  items: Product[];
  add: (product: Product) => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      items: [],
      add: (product) => set((state) => {
        const filtered = state.items.filter((p) => p.id !== product.id);
        return { items: [product, ...filtered].slice(0, 4) };
      }),
    }),
    {
      name: "recent-storage",
    }
  )
);
