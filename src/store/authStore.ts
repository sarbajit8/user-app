import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  age?: number | null;
  profile_image?: string | null;
  wallet_balance?: number;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },
      deleteAccount: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'bazario-user-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  vendor_id: number;
  name: string;
  image: string | null;
  price: number;
  mrp: number;
  quantity: number;
  vendor_name: string;
  variant_name: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.product_id === item.product_id && (i.variant_id === item.variant_id || (!i.variant_id && !item.variant_id && i.variant_name === item.variant_name))
        );
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.product_id === item.product_id && (i.variant_id === item.variant_id || (!i.variant_id && !item.variant_id && i.variant_name === item.variant_name))
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, { ...item, id: item.id || Date.now() }] }));
        }
      },
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        }));
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'adonik-user-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { useWishlistStore } from './wishlistStore';
export type { WishlistItem } from './wishlistStore';
