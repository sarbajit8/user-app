import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WishlistItem {
  id: number | string;
  product_id?: number | string;
  name: string;
  price: number;
  mrp?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: string | number;
  reviewsCount?: string | number;
  image: string;
  vendor?: string;
  brand?: string;
  category?: string;
  discount?: number;
  delivery?: string;
  description?: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => boolean; // returns true if added, false if removed
  isInWishlist: (id: number | string) => boolean;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number | string) => void;
  clearWishlist: () => void;
  totalCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: 1,
          name: 'iPhone 15 (Blue, 256 GB)',
          price: 69900,
          mrp: 79900,
          rating: 4.6,
          reviewsCount: '2,49,032',
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
          vendor: 'Apple Store',
          brand: 'Apple',
        },
        {
          id: 5,
          name: "Air Max 270 React Running Shoes - White",
          price: 1999,
          mrp: 3499,
          rating: 4.5,
          reviewsCount: '1,240',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
          vendor: 'Nike Official',
          brand: 'Nike',
        },
        {
          id: 104,
          name: 'Sony WH-CH520 Wireless Bluetooth Headphones',
          price: 2999,
          mrp: 4990,
          rating: 4.5,
          reviewsCount: '6,280',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          vendor: 'Sony Official',
          brand: 'Sony',
        },
      ],

      isInWishlist: (id: number | string) => {
        return get().items.some((i) => String(i.id) === String(id));
      },

      toggleWishlist: (item: WishlistItem) => {
        const exists = get().items.some((i) => String(i.id) === String(item.id));
        if (exists) {
          set((s) => ({
            items: s.items.filter((i) => String(i.id) !== String(item.id)),
          }));
          return false;
        } else {
          set((s) => ({
            items: [
              ...s.items,
              {
                ...item,
                id: item.id,
                originalPrice: item.originalPrice || item.mrp,
                mrp: item.mrp || item.originalPrice,
              },
            ],
          }));
          return true;
        }
      },

      addItem: (item: WishlistItem) => {
        if (!get().isInWishlist(item.id)) {
          set((s) => ({ items: [...s.items, item] }));
        }
      },

      removeItem: (id: number | string) => {
        set((s) => ({ items: s.items.filter((i) => String(i.id) !== String(id)) }));
      },

      clearWishlist: () => set({ items: [] }),

      totalCount: () => get().items.length,
    }),
    {
      name: 'adonik-user-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
