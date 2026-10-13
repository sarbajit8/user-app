import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

interface AddressState {
  addresses: UserAddress[];
  addAddress: (address: Omit<UserAddress, 'id'>) => UserAddress;
  updateAddress: (id: string, updated: Partial<UserAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => UserAddress | undefined;
}

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr_1',
    name: 'Sarbajit Paul',
    phone: '+91 98765 43210',
    addressLine: 'Vill - Haripal, P.O - Haripal, Hooghly',
    city: 'Hooghly',
    state: 'West Bengal',
    pincode: '712405',
    type: 'Home',
    isDefault: true,
  },
];

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: DEFAULT_ADDRESSES,

      addAddress: (newAddr) => {
        const id = 'addr_' + Date.now();
        const fullAddr: UserAddress = {
          ...newAddr,
          id,
          isDefault: newAddr.isDefault || get().addresses.length === 0,
        };

        set((state) => {
          let updatedList = state.addresses;
          if (fullAddr.isDefault) {
            updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
          }
          return {
            addresses: [fullAddr, ...updatedList],
          };
        });

        return fullAddr;
      },

      updateAddress: (id, updated) => {
        set((state) => {
          let list = state.addresses.map((a) => (a.id === id ? { ...a, ...updated } : a));
          if (updated.isDefault) {
            list = list.map((a) => (a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
          }
          return { addresses: list };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          // If the deleted one was default, assign the first available as default
          if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
            filtered[0].isDefault = true;
          }
          return { addresses: filtered };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        const list = get().addresses;
        return list.find((a) => a.isDefault) || list[0];
      },
    }),
    {
      name: 'adonik-user-addresses',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
