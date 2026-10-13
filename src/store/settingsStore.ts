import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';

export interface BannerItem {
  id: string | number;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  button_text?: string;
  image: string;
  link?: string;
  is_active?: boolean;
}

export interface MidPromoBanner {
  tag?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  button_text?: string;
  image: string;
  link?: string;
  category?: string;
  is_active?: boolean;
  show_text_overlay?: boolean;
}

export interface AppSettings {
  app_name: string;
  app_tagline: string;
  app_logo: string;
  app_starting_image: string;
  app_primary_color: string;
  app_accent_color: string;
  starting_page_enabled: boolean;
  starting_page_title: string;
  starting_page_subtitle: string;
  guest_browse_enabled: boolean;
  free_shipping_min: number;
  home_banners?: BannerItem[];
  mid_promo_banner?: MidPromoBanner;
}

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Big Deals Better Living',
    subtitle: 'Top Brands | Best Prices',
    buttonText: 'Shop Now →',
    button_text: 'Shop Now →',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    link: 'Categories',
    is_active: true,
  },
  {
    id: 2,
    title: '',
    subtitle: '',
    buttonText: '',
    button_text: '',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
    link: 'Categories',
    is_active: true,
  },
  {
    id: 3,
    title: 'Festive Luxury Sale',
    subtitle: 'Up to 50% Off On Premium Designer Wear',
    buttonText: 'Explore →',
    button_text: 'Explore →',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80',
    link: 'Categories',
    is_active: true,
  },
];

export const DEFAULT_MID_PROMO_BANNER: MidPromoBanner = {
  tag: 'Megga Sale',
  title: 'Up to 60% OFF',
  subtitle: 'On Top Brands',
  buttonText: 'Shop Now →',
  button_text: 'Shop Now →',
  image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
  link: 'ProductList',
  category: 'Fashion',
  is_active: true,
  show_text_overlay: true,
};

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateLocalSettings: (newSettings: Partial<AppSettings>) => void;
}

export const DEFAULT_SETTINGS: AppSettings = {
  app_name: 'Adonik',
  app_tagline: 'Shop More  Live Better',
  app_logo: '',
  app_starting_image: '/adonik_welcome_splash.png',
  app_primary_color: '#0F172A',
  app_accent_color: '#C89B53',
  starting_page_enabled: true,
  starting_page_title: 'Shop More  Live Better',
  starting_page_subtitle: 'Discover trending styles, authentic electronics & daily flash deals.',
  guest_browse_enabled: true,
  free_shipping_min: 999,
  home_banners: DEFAULT_BANNERS,
  mid_promo_banner: DEFAULT_MID_PROMO_BANNER,
};

const getBackendUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1/app-settings';
  }
  return 'http://localhost:8000/api/v1/app-settings';
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => {
      // Periodic background sync if online
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', () => {
          try {
            const raw = localStorage.getItem('adonik_user_app_settings') || localStorage.getItem('adonik_app_settings');
            const promoRaw = localStorage.getItem('adonik_mid_promo_banner');
            if (raw || promoRaw) {
              const parsed = raw ? JSON.parse(raw) : {};
              const promoParsed = promoRaw ? JSON.parse(promoRaw) : null;
              set((state) => ({
                settings: {
                  ...state.settings,
                  ...parsed,
                  app_logo: parsed.app_logo || parsed.logoUrl || state.settings.app_logo,
                  mid_promo_banner: promoParsed || parsed.mid_promo_banner || parsed.midPromoBanner || state.settings.mid_promo_banner,
                },
              }));
            }
          } catch {}
        });

        window.addEventListener('focus', () => {
          get().fetchSettings();
        });

        setInterval(() => {
          get().fetchSettings();
        }, 5000);
      }

      return {
        settings: DEFAULT_SETTINGS,
        isLoading: false,

        fetchSettings: async () => {
          try {
            set({ isLoading: true });
            const url = getBackendUrl();
            const res = await axios.get(url, { timeout: 3500 });
            if (res.data?.success && res.data?.data) {
              const d = res.data.data;
              const current = get().settings;
              const merged: AppSettings = {
                app_name: d.app_name || d.appName || current.app_name || DEFAULT_SETTINGS.app_name,
                app_tagline: d.app_tagline || d.appTagline || current.app_tagline || DEFAULT_SETTINGS.app_tagline,
                app_logo: d.app_logo || d.logoUrl || current.app_logo || '',
                app_starting_image: d.app_starting_image || d.startingArtworkUrl || current.app_starting_image || '',
                app_primary_color: d.app_primary_color || d.primaryDark || current.app_primary_color,
                app_accent_color: d.app_accent_color || d.accentColor || current.app_accent_color,
                starting_page_enabled: d.starting_page_enabled ?? current.starting_page_enabled,
                starting_page_title: d.starting_page_title || d.app_tagline || current.starting_page_title,
                starting_page_subtitle: d.starting_page_subtitle || current.starting_page_subtitle,
                guest_browse_enabled: d.guest_browse_enabled ?? current.guest_browse_enabled,
                free_shipping_min: Number(d.free_shipping_min) || current.free_shipping_min,
                home_banners:
                  Array.isArray(d.home_banners) && d.home_banners.length > 0
                    ? d.home_banners
                    : Array.isArray(d.homeBanners) && d.homeBanners.length > 0
                    ? d.homeBanners
                    : current.home_banners || DEFAULT_BANNERS,
                mid_promo_banner:
                  d.mid_promo_banner || d.midPromoBanner || current.mid_promo_banner || DEFAULT_MID_PROMO_BANNER,
              };

              try {
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem('adonik_user_app_settings', JSON.stringify(merged));
                }
              } catch {}

              set({ settings: merged, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } catch {
            // CRITICAL: Do NOT reset settings on network failure! Retain persisted settings.
            set({ isLoading: false });
          }
        },

        updateLocalSettings: (newSettings) =>
          set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      };
    },
    {
      name: 'adonik-user-app-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
