import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './authStore';

export interface TrackingStep {
  step: string;
  time: string;
  done: boolean;
  active?: boolean;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid';
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  couponCode?: string | null;
  items: CartItem[];
  itemsCount: number;
  vendorName: string;
  deliveryOption: 'standard' | 'express';
  deliveryAddress: {
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    type?: string;
  };
  trackingSteps: TrackingStep[];
  thumbnails: string[];
}

interface OrderState {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (orderId: string, status: PlacedOrder['status']) => void;
  cancelOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => PlacedOrder | undefined;
}

const DEFAULT_ORDERS: PlacedOrder[] = [
  {
    id: 'ADK-892104',
    orderNumber: 'ADK-892104',
    date: 'Placed on 25 Sep, 2026',
    status: 'Delivered',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    total: 2399,
    subtotal: 2999,
    discount: 600,
    shipping: 0,
    couponCode: 'ADONIK10',
    itemsCount: 1,
    vendorName: 'Shruti Creation',
    deliveryOption: 'standard',
    deliveryAddress: {
      name: 'Sarbajit Paul',
      phone: '+91 98765 43210',
      addressLine: 'Vill - Haripal, P.O - Haripal',
      city: 'Hooghly',
      state: 'West Bengal',
      pincode: '712405',
      type: 'Home',
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    ],
    items: [
      {
        id: 100,
        product_id: 100,
        variant_id: null,
        vendor_id: 1,
        name: 'Banarasi Silk Saree (Gold | Free Size)',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        price: 2399,
        mrp: 2999,
        quantity: 1,
        vendor_name: 'Shruti Creation',
        variant_name: '(Gold | Free Size)',
      },
    ],
    trackingSteps: [
      { step: 'Order Placed', time: '25 Sep, 10:30 AM', done: true },
      { step: 'Order Confirmed & Packed', time: '25 Sep, 02:15 PM', done: true },
      { step: 'Shipped via BlueDart (AWB #BD-88912)', time: '26 Sep, 09:00 AM', done: true },
      { step: 'Out for Delivery', time: '27 Sep, 11:30 AM', done: true },
      { step: 'Delivered', time: '27 Sep, 03:45 PM', done: true },
    ],
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: DEFAULT_ORDERS,

      addOrder: (newOrder) => {
        set((state) => ({
          orders: [newOrder, ...state.orders.filter((o) => o.id !== newOrder.id)],
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? { ...o, status }
              : o
          ),
        }));
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? { ...o, status: 'Cancelled' }
              : o
          ),
        }));
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId || o.orderNumber === orderId);
      },
    }),
    {
      name: 'adonik-user-orders',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
