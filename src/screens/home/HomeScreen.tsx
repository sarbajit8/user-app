import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  TextInput, FlatList, StyleSheet, Dimensions, Platform,
  ActivityIndicator, Alert, Modal, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';
import { useCartStore, useWishlistStore } from '../../store/authStore';
import { useSettingsStore, DEFAULT_BANNERS, DEFAULT_MID_PROMO_BANNER } from '../../store/settingsStore';
import { getAppLogoSource } from '../../constants/branding';
import { useDeliveryLocationStore } from '../../store/deliveryLocationStore';
import DeliveryLocationModal from '../../components/DeliveryLocationModal';
import { ALL_PRODUCTS_CATALOG } from '../../constants/productsCatalog';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 36) / 2;
const BANNER_GAP = 12;
const BANNER_W = SCREEN_W - 44;
const BANNER_INTERVAL = BANNER_W + BANNER_GAP;

export interface FeaturedCategory {
  id: string | number;
  name: string;
  slug?: string;
  image: string;
  is_featured?: boolean;
  isFeatured?: boolean;
}

const DEFAULT_FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 'mobiles',
    name: 'Mobiles',
    slug: 'mobiles',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'home',
    name: 'Home & Living',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    slug: 'beauty-personal-care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'footwear',
    name: 'Footwear',
    slug: 'footwear-shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'sports',
    name: 'Sports',
    slug: 'sports-fitness',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'smart_gadgets',
    name: 'Smart Gadgets',
    slug: 'smart-gadgets',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
  {
    id: 'appliances',
    name: 'Appliances',
    slug: 'appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    is_featured: true,
  },
];

export interface FeaturedBrand {
  id: string | number;
  name: string;
  slug?: string;
  logo?: string;
  image: string;
  discount: string;
  tagline: string;
  isAd?: boolean;
  tag?: string;
}

const DEFAULT_FEATURED_BRANDS: FeaturedBrand[] = [
  {
    id: 'fastrack',
    name: 'fastrack',
    slug: 'fastrack',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    discount: 'Up to 30% Off',
    tagline: 'Shop your fixation',
    isAd: true,
  },
  {
    id: 'crocs',
    name: 'crocs™',
    slug: 'crocs',
    logo: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 50% Off',
    tagline: 'Move in comfort',
    isAd: true,
  },
  {
    id: 'action',
    name: 'ACTION',
    slug: 'action',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 75% Off',
    tagline: 'Push your pace',
    isAd: true,
  },
  {
    id: 'nike',
    name: 'NIKE',
    slug: 'nike',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 40% Off',
    tagline: 'Defy your limits',
    isAd: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    discount: 'Up to 20% Off',
    tagline: 'Pure performance',
    isAd: true,
  },
  {
    id: 'boat',
    name: 'boAt',
    slug: 'boat',
    logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 60% Off',
    tagline: 'Feel the bass',
    isAd: true,
  },
  {
    id: 'puma',
    name: 'Puma',
    slug: 'puma',
    logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 45% Off',
    tagline: 'Forever Faster',
    isAd: true,
  },
  {
    id: 'sony',
    name: 'Sony',
    slug: 'sony',
    logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    discount: 'Up to 25% Off',
    tagline: 'Be Moved',
    isAd: true,
  },
  {
    id: 'samsung',
    name: 'Samsung',
    slug: 'samsung',
    logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=120&auto=format&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    discount: 'Min. 35% Off',
    tagline: 'Unfold your world',
    isAd: true,
  },
];

const SEARCH_PLACEHOLDERS = [
  "Search for 'iPhone 15 Pro Max'...",
  "Search for 'Nike Air Force 1'...",
  "Search for 'ANC Wireless Headphones'...",
  "Search for 'Sony WH-1000XM5'...",
  "Search for 'Samsung 55\" 4K UHD TV'...",
  "Search for 'Seiko Automatic Watch'...",
  "Search for 'Pure Banarasi Silk Saree'...",
  "Search for 'Anker 140W Fast Charger'...",
  "Search for 'Levi\\'s Stretch Denim Jeans'...",
  "Search for 'Philips Smart Lights'...",
  "Search for products, brands and more...",
];

const TRENDING_SEARCHES = [
  { label: 'iPhone 15 Pro Max', icon: '🔥', tag: 'Electronics' },
  { label: 'Nike Air Force 1', icon: '👟', tag: 'Footwear' },
  { label: 'ANC Headphones', icon: '🎧', tag: 'Audio' },
  { label: 'Samsung 4K TV', icon: '📺', tag: 'TVs' },
  { label: 'Seiko Diver Watch', icon: '⌚', tag: 'Watches' },
  { label: 'Banarasi Silk Saree', icon: '👗', tag: 'Fashion' },
  { label: '140W PowerBank', icon: '⚡', tag: 'Accessories' },
  { label: "Levi's 511 Denim", icon: '👖', tag: 'Men' },
];

export default function HomeScreen({ navigation }: any) {
  const { settings } = useSettingsStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const wishlistItems = useWishlistStore((s) => s.items || []);
  const wishlistCount = wishlistItems.length;

  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalItems());

  // Thin/compact header state on scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const mainScrollRef = useRef<ScrollView>(null);

  // Rotating animated placeholder (Flipkart & Amazon style)
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Advanced search overlays
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isLensModalVisible, setIsLensModalVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'iPhone 15 Pro', 'Nike Air Force 1', 'Wireless Headphones', 'Smart TV'
  ]);

  // Live autocomplete results matching genuine catalog products
  const liveSuggestions = useMemo(() => {
    const q = (modalSearchQuery || searchQuery).trim().toLowerCase();
    if (!q) return [];
    return ALL_PRODUCTS_CATALOG.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.vendor && item.vendor.toLowerCase().includes(q))
      );
    });
  }, [modalSearchQuery, searchQuery]);

  const handleSelectProduct = (product: any) => {
    setIsSearchModalVisible(false);
    if (!recentSearches.includes(product.name)) {
      setRecentSearches((prev) => [product.name, ...prev.slice(0, 5)]);
    }
    navigation.navigate('ProductDetail', { productId: product.id, product });
  };

  const handleExecuteSearch = (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;
    setIsSearchModalVisible(false);
    setIsVoiceModalVisible(false);
    setIsLensModalVisible(false);
    if (!recentSearches.includes(q)) {
      setRecentSearches((prev) => [q, ...prev.slice(0, 5)]);
    }
    navigation.navigate('Search', { query: q });
  };

  const {
    currentLocation,
    isDetecting: isDetectingLocation,
    detectCurrentLocation,
  } = useDeliveryLocationStore();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleQuickDetect = async () => {
    const result = await detectCurrentLocation();
    if (!result.success) {
      Alert.alert(
        'Location Access',
        result.error || 'Unable to detect location. Please check your GPS permissions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Choose Manually', onPress: () => setShowLocationModal(true) },
        ]
      );
    }
  };

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

  // Featured Categories state (synced with admin & API, filtered strictly to featured only)
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('adonik_catalog_categories_v2');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const feat = parsed.filter(
              (c: any) =>
                (c.isFeatured === true || c.is_featured === true || c.is_featured === 1) &&
                (c.isActive !== false && c.is_active !== false) &&
                (c.level === 1 || !c.level || c.level === '1')
            );
            if (feat.length > 0) return feat;
          }
        }
      }
    } catch {}
    return DEFAULT_FEATURED_CATEGORIES;
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem('adonik_catalog_categories_v2');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const feat = parsed.filter(
                (c: any) =>
                  (c.isFeatured === true || c.is_featured === true || c.is_featured === 1) &&
                  (c.isActive !== false && c.is_active !== false) &&
                  (c.level === 1 || !c.level || c.level === '1')
              );
              if (feat.length > 0) {
                setFeaturedCategories(feat);
                return;
              }
            }
          }
        }

        const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/categories?featured=1`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            const feat = data.data.filter((c: any) => c.is_featured || c.isFeatured);
            if (feat.length > 0) {
              setFeaturedCategories(feat);
            }
          }
        }
      } catch {}
    };

    loadCategories();

    if (typeof window !== 'undefined') {
      const handleStorageOrCustom = () => loadCategories();
      window.addEventListener('storage', handleStorageOrCustom);
      window.addEventListener('categories_changed', handleStorageOrCustom);
      return () => {
        window.removeEventListener('storage', handleStorageOrCustom);
        window.removeEventListener('categories_changed', handleStorageOrCustom);
      };
    }
  }, []);

  // Featured Brands state
  const [featuredBrands, setFeaturedBrands] = useState<FeaturedBrand[]>(DEFAULT_FEATURED_BRANDS);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/brands?featured=1`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            const formatted = data.data.map((b: any) => {
              const fallback = DEFAULT_FEATURED_BRANDS.find(
                (d) => d.slug === b.slug || d.name.toLowerCase() === b.name?.toLowerCase()
              );
              return {
                id: b.id,
                name: b.name,
                slug: b.slug,
                logo: b.logo || fallback?.logo,
                image: b.image || b.banner || fallback?.image || b.logo,
                discount: b.discount || fallback?.discount || 'Min. 40% Off',
                tagline: b.tagline || fallback?.tagline || b.description || 'Shop collection',
                isAd: b.isAd !== false,
              };
            });
            setFeaturedBrands(formatted);
          }
        }
      } catch {}
    };
    loadBrands();
  }, []);

  interface ActiveFlashDealPayload {
    id: number | string;
    title: string;
    discountBadge: string;
    countdownText: string;
    products: any[];
  }

  // Flash Sales state (persisted from admin / storage)
  const [allFlashSales, setAllFlashSales] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('adonik_flash_sales');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  });

  // Keep synchronized with admin updates and storage events
  useEffect(() => {
    const loadFlashSales = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem('adonik_flash_sales');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setAllFlashSales(parsed);
              return;
            }
          }
        }
        const asyncRaw = await AsyncStorage.getItem('adonik_flash_sales');
        if (asyncRaw) {
          const parsed = JSON.parse(asyncRaw);
          if (Array.isArray(parsed)) {
            setAllFlashSales(parsed);
          }
        }
      } catch {}
    };

    loadFlashSales();

    if (typeof window !== 'undefined') {
      const handleSync = () => loadFlashSales();
      window.addEventListener('storage', handleSync);
      window.addEventListener('adonik_flash_sales_updated', handleSync);
      return () => {
        window.removeEventListener('storage', handleSync);
        window.removeEventListener('adonik_flash_sales_updated', handleSync);
      };
    }
  }, []);

  // Real-time second-by-second evaluation: ONLY show if flash deal is available at this exact moment
  const [activeLiveFlashDeal, setActiveLiveFlashDeal] = useState<ActiveFlashDealPayload | null>(null);

  useEffect(() => {
    const evaluateAvailability = () => {
      if (!Array.isArray(allFlashSales) || allFlashSales.length === 0) {
        setActiveLiveFlashDeal(null);
        return;
      }

      const now = Date.now();

      // Find an event that is currently active and strictly within its time window
      for (const sale of allFlashSales) {
        if (sale.isActive === false || sale.is_active === false) {
          continue;
        }

        const start = new Date(sale.startTime || sale.start_time).getTime();
        const end = new Date(sale.endTime || sale.end_time).getTime();

        if (isNaN(start) || isNaN(end)) {
          continue;
        }

        // Time check: must be live RIGHT NOW (now >= start and now < end)
        if (now >= start && now < end) {
          const rawProducts = Array.isArray(sale.products) ? sale.products : [];
          // Filter approved products only
          const approved = rawProducts.filter(
            (p: any) => p.status === 'approved' || p.status === undefined
          );

          if (approved.length > 0) {
            // Sort by slot position (Slot #1, Slot #2...)
            const sorted = [...approved].sort(
              (a: any, b: any) => (Number(a.position) || 999) - (Number(b.position) || 999)
            );

            // Compute countdown
            const diff = Math.max(0, end - now);
            const totalSec = Math.floor(diff / 1000);
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            const countdownText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            const formattedProducts = sorted.map((p: any) => ({
              id: p.productId || p.id,
              brand: p.vendorName || (p.sellerType === 'admin' ? 'Adonik Official' : 'Vendor'),
              name: p.name,
              price: Number(p.flashPrice) || Number(p.price) || 999,
              mrp:
                Number(p.originalPrice) ||
                Number(p.mrp) ||
                Math.round(Number(p.flashPrice || 999) * 1.3),
              discount:
                Number(p.discountPercent) ||
                Math.round(
                  ((Number(p.originalPrice || 1499) - Number(p.flashPrice || 999)) /
                    Number(p.originalPrice || 1499)) *
                    100
                ) ||
                20,
              rating: p.rating || 4.5,
              reviews: p.reviews || '1,240',
              stockLeft: Math.max(0, (Number(p.flashStock) || 20) - (Number(p.soldStock) || 0)),
              image: p.image,
              category: p.category,
              sellerType: p.sellerType,
              vendor: p.vendorName,
              position: p.position || 1,
            }));

            setActiveLiveFlashDeal({
              id: sale.id,
              title: sale.title || 'Flash Deals',
              discountBadge: sale.discountBadge || 'Special Offer',
              countdownText,
              products: formattedProducts,
            });
            return;
          }
        }
      }

      // No flash deal is live right now: do not show!
      setActiveLiveFlashDeal(null);
    };

    evaluateAvailability();
    const interval = setInterval(evaluateAvailability, 1000);
    return () => clearInterval(interval);
  }, [allFlashSales]);

  // Vendor & Brand extraction helpers to prevent object-as-React-child crashes
  const getVendorName = (v: any, fallback = 'Adonik Merchant'): string => {
    if (!v) return fallback;
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v !== null) {
      return v.business_name || v.name || v.owner_name || fallback;
    }
    return String(v);
  };

  const getBrandName = (b: any, fallback = ''): string => {
    if (!b) return fallback;
    if (typeof b === 'string') return b;
    if (typeof b === 'object' && b !== null) {
      return b.name || fallback;
    }
    return String(b);
  };

  const sanitizeCatalogProduct = (p: any) => {
    if (!p || typeof p !== 'object') return p;
    const vendorName = getVendorName(p.vendor || p.vendorName, 'Adonik Merchant');
    const brandName = getBrandName(p.brand, vendorName);
    const categoryName = typeof p.category === 'object' && p.category !== null ? (p.category.name || 'General') : (p.category || 'General');
    const price = Number(p.price || p.selling_price || 0);
    const mrp = Number(p.mrp || p.original_price || p.price || 0);
    const img = p.image || p.thumbnail || (Array.isArray(p.images) && (p.images[0]?.image_path || (typeof p.images[0] === 'string' && p.images[0]))) || '';

    return {
      ...p,
      vendor: vendorName,
      vendorName,
      brand: brandName,
      category: categoryName,
      price: isNaN(price) ? 0 : price,
      mrp: isNaN(mrp) ? 0 : mrp,
      image: img || p.image,
    };
  };

  // Featured & Catalog Products state initialized with genuine products
  const [catalogProducts, setCatalogProducts] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('adonik_catalog_products');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeCatalogProduct);
        }
      }
    } catch {}
    return ALL_PRODUCTS_CATALOG.map(sanitizeCatalogProduct);
  });

  useEffect(() => {
    const loadCatalogProducts = async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem('adonik_catalog_products');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCatalogProducts(parsed.map(sanitizeCatalogProduct));
              return;
            }
          }
        }
        const asyncRaw = await AsyncStorage.getItem('adonik_catalog_products');
        if (asyncRaw) {
          const parsed = JSON.parse(asyncRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCatalogProducts(parsed.map(sanitizeCatalogProduct));
            return;
          }
        }
        const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/products?per_page=50`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            setCatalogProducts(data.data.map(sanitizeCatalogProduct));
          }
        }
      } catch {}
    };

    loadCatalogProducts();

    if (typeof window !== 'undefined') {
      const handleProductSync = () => loadCatalogProducts();
      window.addEventListener('storage', handleProductSync);
      window.addEventListener('adonik_products_updated', handleProductSync);
      return () => {
        window.removeEventListener('storage', handleProductSync);
        window.removeEventListener('adonik_products_updated', handleProductSync);
      };
    }
  }, []);

  // Filter strictly ONLY products that the admin has marked as is_featured === true
  const featuredProducts = catalogProducts.filter(
    (p: any) =>
      (p.is_featured === true || p.isFeatured === true || p.is_featured === 1) &&
      (p.status === 'approved' || p.status === 'active' || p.status === undefined)
  );

  const banners = (settings.home_banners && settings.home_banners.length > 0)
    ? settings.home_banners.filter((b) => b.is_active !== false)
    : DEFAULT_BANNERS;

  const midPromo = settings.mid_promo_banner || DEFAULT_MID_PROMO_BANNER;
  const isMidPromoActive = midPromo.is_active !== false;
  const midPromoBtnText = midPromo.buttonText || midPromo.button_text || 'Shop Now →';
  const midPromoHasText = Boolean(
    midPromo.show_text_overlay !== false &&
    (
      (midPromo.tag && midPromo.tag.trim()) ||
      (midPromo.title && midPromo.title.trim()) ||
      (midPromo.subtitle && midPromo.subtitle.trim()) ||
      (midPromoBtnText && midPromoBtnText.trim())
    )
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const next = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({
          x: next * BANNER_INTERVAL,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_INTERVAL);
    if (index !== activeBannerIndex && index >= 0 && index < banners.length) {
      setActiveBannerIndex(index);
    }
  };

  const handleAddToCart = (product: any) => {
    const vName = getVendorName(product.vendor || product.vendorName, 'Adonik Merchant');
    addItem({
      id: product.id,
      product_id: product.id,
      variant_id: null,
      vendor_id: typeof product.vendor === 'object' && product.vendor?.id ? product.vendor.id : (product.vendor_id || 1),
      name: product.name,
      image: product.image,
      price: product.price,
      mrp: product.mrp,
      quantity: 1,
      vendor_name: vName,
      variant_name: null,
    });
  };

  const renderBrandLogo = (brand: FeaturedBrand) => {
    const slug = (brand.slug || brand.name).toLowerCase();

    if (slug.includes('fastrack')) {
      return (
        <View style={styles.logoRow}>
          <Text style={styles.brandFastrackText}>fastrack</Text>
          <View style={styles.falconMark}>
            <Ionicons name="play" size={8} color="#EA580C" style={{ transform: [{ rotate: '-20deg' }] }} />
          </View>
        </View>
      );
    }
    if (slug.includes('crocs')) {
      return <Text style={styles.brandCrocsText}>crocs™</Text>;
    }
    if (slug.includes('action')) {
      return (
        <View style={styles.logoRow}>
          <Text style={styles.brandActionText}>ACTI</Text>
          <Ionicons name="flash" size={10} color="#DC2626" style={{ marginHorizontal: -1 }} />
          <Text style={styles.brandActionText}>N</Text>
        </View>
      );
    }
    if (slug.includes('apple')) {
      return <Ionicons name="logo-apple" size={16} color="#0F172A" />;
    }
    if (slug.includes('nike')) {
      return <Text style={styles.brandNikeText}>NIKE</Text>;
    }
    if (slug.includes('boat')) {
      return (
        <View style={styles.logoRow}>
          <Text style={styles.brandBoatText}>bo</Text>
          <Ionicons name="boat" size={11} color="#DC2626" style={{ marginHorizontal: -1 }} />
          <Text style={styles.brandBoatText}>t</Text>
        </View>
      );
    }
    if (slug.includes('puma')) {
      return <Text style={styles.brandPumaText}>PUMA</Text>;
    }
    if (slug.includes('sony')) {
      return <Text style={styles.brandSonyText}>SONY</Text>;
    }
    if (slug.includes('samsung')) {
      return <Text style={styles.brandSamsungText}>SAMSUNG</Text>;
    }

    if (brand.logo && (brand.logo.startsWith('http') || brand.logo.startsWith('data:'))) {
      return (
        <Image
          source={{ uri: brand.logo }}
          style={styles.spotlightBrandLogo}
          resizeMode="contain"
        />
      );
    }

    return <Text style={styles.spotlightBrandText}>{brand.name}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header - Transforms between Standard and Thin Compact Mode on Scroll */}
      {!isScrolled ? (
        <View style={styles.header}>
          {/* Row 1: Brand Logo & Right Action Icons */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.brandRow}
              activeOpacity={0.8}
              onPress={() => mainScrollRef.current?.scrollTo({ y: 0, animated: true })}
            >
              <Image
                source={getAppLogoSource(settings.app_logo)}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
              <View style={styles.brandTextWrap}>
                <View style={styles.brandNameRow}>
                  <Text style={styles.brandTitleText}>adonik</Text>
                  <View style={styles.brandPlusBadge}>
                    <Text style={styles.brandPlusText}>PLUS</Text>
                  </View>
                </View>
                <Text style={styles.brandTagline}>Explore <Text style={styles.brandTaglineGold}>Plus</Text> ✦</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Wishlist')}
                activeOpacity={0.7}
              >
                <Feather name="heart" size={20} color={ADONIK_THEME.text} />
                {wishlistCount > 0 && (
                  <View style={styles.wishlistBadge}>
                    <Text style={styles.badgeText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <Feather name="bell" size={20} color={ADONIK_THEME.text} />
                <View style={styles.notifDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.7}
              >
                <Feather name="shopping-bag" size={20} color={ADONIK_THEME.text} />
                {cartCount > 0 && (
                  <View style={styles.cartBadgeSmall}>
                    <Text style={styles.cartBadgeSmallText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Row 2: Advanced Search Bar (Flipkart & Amazon Style) */}
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.9}
            onPress={() => {
              setModalSearchQuery(searchQuery);
              setIsSearchModalVisible(true);
            }}
          >
            <Feather name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
            <View style={styles.searchPlaceholderWrap}>
              <Text style={styles.animatedPlaceholderText} numberOfLines={1}>
                {searchQuery || SEARCH_PLACEHOLDERS[placeholderIndex]}
              </Text>
            </View>
            <View style={styles.searchActionGroup}>
              <TouchableOpacity
                style={styles.searchActionBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsVoiceModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="mic-outline" size={20} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchActionBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setIsLensModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Row 3: Deliver To Bar */}
          <View style={styles.locationBar}>
            <TouchableOpacity
              style={styles.locationLeftTouch}
              activeOpacity={0.75}
              onPress={() => setShowLocationModal(true)}
            >
              <Ionicons
                name={currentLocation.type === 'gps' ? 'navigate-circle' : 'location-sharp'}
                size={15}
                color={ADONIK_THEME.primary}
              />
              <Text style={styles.deliverLabel}>Deliver to</Text>
              <Text style={styles.deliverAddress} numberOfLines={1}>
                {isDetectingLocation
                  ? 'Detecting location...'
                  : (currentLocation.displayShort || 'Select Location')}
              </Text>
              {isDetectingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={ADONIK_THEME.primary}
                  style={{ transform: [{ scale: 0.7 }], marginLeft: 2 }}
                />
              ) : (
                <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickDetectBtn, isDetectingLocation && styles.quickDetectBtnActive]}
              activeOpacity={0.7}
              onPress={handleQuickDetect}
              disabled={isDetectingLocation}
            >
              {isDetectingLocation ? (
                <ActivityIndicator size="small" color="#B45309" style={{ transform: [{ scale: 0.65 }] }} />
              ) : (
                <Ionicons name="locate" size={12} color="#B45309" />
              )}
              <Text style={styles.quickDetectText}>
                {isDetectingLocation ? 'Locating...' : 'Detect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Scrolled Thin Compact Navbar (Single sleek row like Flipkart/Amazon) */
        <View style={styles.scrolledHeader}>
          <TouchableOpacity
            style={styles.scrolledLogoTouch}
            activeOpacity={0.8}
            onPress={() => mainScrollRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Image
              source={getAppLogoSource(settings.app_logo)}
              style={styles.scrolledLogoImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scrolledSearchBar}
            activeOpacity={0.9}
            onPress={() => {
              setModalSearchQuery(searchQuery);
              setIsSearchModalVisible(true);
            }}
          >
            <Feather name="search" size={16} color="#64748B" style={{ marginRight: 6 }} />
            <View style={styles.searchPlaceholderWrap}>
              <Text style={styles.scrolledPlaceholderText} numberOfLines={1}>
                {searchQuery || SEARCH_PLACEHOLDERS[placeholderIndex]}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.searchActionBtnSmall}
              onPress={(e) => {
                e.stopPropagation();
                setIsVoiceModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={18} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchActionBtnSmall}
              onPress={(e) => {
                e.stopPropagation();
                setIsLensModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.scrolledHeaderIcons}>
            <TouchableOpacity
              style={styles.iconBtnCompact}
              onPress={() => navigation.navigate('Wishlist')}
              activeOpacity={0.7}
            >
              <Feather name="heart" size={19} color={ADONIK_THEME.text} />
              {wishlistCount > 0 && (
                <View style={styles.wishlistBadge}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtnCompact}
              onPress={() => navigation.navigate('Cart')}
              activeOpacity={0.7}
            >
              <Feather name="shopping-bag" size={19} color={ADONIK_THEME.text} />
              {cartCount > 0 && (
                <View style={styles.cartBadgeSmall}>
                  <Text style={styles.cartBadgeSmallText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          if (offsetY > 45 && !isScrolled) {
            setIsScrolled(true);
          } else if (offsetY <= 25 && isScrolled) {
            setIsScrolled(false);
          }
        }}
      >
        {/* Hero Banner Slider (Full Show Image with Optional Text & Button) */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.sliderContentContainer}
            onMomentumScrollEnd={handleBannerScroll}
            scrollEventThrottle={16}
          >
            {banners.map((item, idx) => {
              const hasTextOrBtn = Boolean(
                (item.title && item.title.trim()) ||
                (item.subtitle && item.subtitle.trim()) ||
                (item.buttonText && item.buttonText.trim()) ||
                (item.button_text && item.button_text.trim())
              );
              const btnLabel = item.buttonText || item.button_text;

              return (
                <TouchableOpacity
                  key={item.id || idx}
                  style={[
                    styles.slideCard,
                    {
                      width: BANNER_W,
                      marginRight: idx === banners.length - 1 ? 0 : BANNER_GAP,
                    },
                  ]}
                  activeOpacity={0.92}
                  onPress={() => {
                    if (item.link) {
                      navigation.navigate(item.link);
                    } else {
                      navigation.navigate('Categories');
                    }
                  }}
                >
                  {/* Full Show Image */}
                  <Image
                    source={{ uri: item.image }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />

                  {/* ONLY show text overlay & button if title, subtitle, or button are provided */}
                  {hasTextOrBtn && (
                    <View style={styles.slideOverlay}>
                      <View style={styles.slideTextContent}>
                        {item.title && item.title.trim() ? (
                          <Text style={styles.slideTitle} numberOfLines={2}>
                            {item.title}
                          </Text>
                        ) : null}

                        {item.subtitle && item.subtitle.trim() ? (
                          <Text style={styles.slideSubtitle} numberOfLines={2}>
                            {item.subtitle}
                          </Text>
                        ) : null}

                        {btnLabel && btnLabel.trim() ? (
                          <View style={styles.slideBtn}>
                            <Text style={styles.slideBtnText}>{btnLabel}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Pagination Dots (Active gold pill indicator) */}
          {banners.length > 1 && (
            <View style={styles.dotsContainer}>
              {banners.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeBannerIndex === idx ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Featured Categories Slider (Shows only featured categories with set images) */}
        {featuredCategories.length > 0 && (
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categorySliderContent}
            >
              {featuredCategories.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.id || idx}
                  style={styles.categorySlideItem}
                  onPress={() =>
                    navigation.navigate('Categories', {
                      categoryId: cat.id,
                      categorySlug: cat.slug,
                      categoryName: cat.name,
                    })
                  }
                  activeOpacity={0.82}
                >
                  <View style={styles.categoryImageWrapper}>
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.categorySliderName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Flash Deals Section (Strictly displayed only if a flash deal is available at this exact moment) */}
        {activeLiveFlashDeal && activeLiveFlashDeal.products.length > 0 && (
          <View>
            <View style={styles.flashSectionHeader}>
              <View style={styles.flashHeaderLeft}>
                <View style={styles.flashIconPill}>
                  <Ionicons name="flash" size={13} color="#EA580C" />
                </View>
                <Text style={styles.flashHeaderTitle}>
                  {activeLiveFlashDeal.title || 'Flash Deals'}
                </Text>
                <View style={styles.countdownPill}>
                  <Ionicons name="time-outline" size={11.5} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.countdownText}>{activeLiveFlashDeal.countdownText}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')} activeOpacity={0.7}>
                <Text style={styles.flashSeeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeLiveFlashDeal.products}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flashList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.flashCard}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
                  activeOpacity={0.92}
                >
                  {/* Product Image Frame with Cover Fit & Overlay Badges */}
                  <View style={styles.flashImgWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.flashImg}
                      resizeMode="cover"
                    />

                    {/* Floating Discount Pill */}
                    <View style={styles.flashDiscountBadge}>
                      <Ionicons name="flash" size={9.5} color="#FFFFFF" style={{ marginRight: 2 }} />
                      <Text style={styles.flashDiscountBadgeText}>{item.discount}% OFF</Text>
                    </View>

                    {/* Rating Badge */}
                    {item.rating && (
                      <View style={styles.flashRatingPill}>
                        <Text style={styles.flashRatingText}>{item.rating} ★</Text>
                      </View>
                    )}
                  </View>

                  {/* Card Body */}
                  <View style={styles.flashCardBody}>
                    {item.brand && (
                      <Text style={styles.flashBrandText}>{item.brand}</Text>
                    )}

                    <Text style={styles.flashName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Price Row */}
                    <View style={styles.flashPriceRow}>
                      <Text style={styles.flashPrice}>₹{item.price.toLocaleString()}</Text>
                      <Text style={styles.flashMrp}>₹{item.mrp.toLocaleString()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Featured Products Slider Section (Styled matching Flash Sale cards) */}
        {featuredProducts.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.featuredHeader}>
              <View style={styles.featuredHeaderLeft}>
                <View style={styles.featuredIconPill}>
                  <Ionicons name="sparkles" size={13} color="#D97706" />
                </View>
                <Text style={styles.featuredHeaderTitle}>Featured Products</Text>
                <View style={styles.featuredTagPill}>
                  <Text style={styles.featuredTagText}>Curated</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Categories')}
                activeOpacity={0.7}
              >
                <Text style={styles.featuredSeeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={featuredProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              keyExtractor={(item) => (item.id || item.productId || Math.random()).toString()}
              renderItem={({ item }) => {
                const discountPercent =
                  item.discount ||
                  (item.mrp && item.price && item.mrp > item.price
                    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                    : 0);

                return (
                  <TouchableOpacity
                    style={styles.featuredCard}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: item.id,
                        product: item,
                      })
                    }
                    activeOpacity={0.92}
                  >
                    {/* Product Image Frame matching Flash Sale */}
                    <View style={styles.featuredImgWrapper}>
                      <Image
                        source={{
                          uri:
                            item.image ||
                            item.thumbnail ||
                            item.images?.[0] ||
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                        }}
                        style={styles.featuredImg}
                        resizeMode="cover"
                      />

                      {/* Floating Featured Badge */}
                      <View style={styles.featuredBadge}>
                        <Ionicons name="sparkles" size={9.5} color="#FFFFFF" style={{ marginRight: 2.5 }} />
                        <Text style={styles.featuredBadgeText}>FEATURED</Text>
                      </View>

                      {/* Optional Floating Discount Badge */}
                      {discountPercent > 0 && (
                        <View style={styles.featuredDiscountBadge}>
                          <Text style={styles.featuredDiscountBadgeText}>{discountPercent}% OFF</Text>
                        </View>
                      )}

                      {/* Dark Rating Pill matching Flash Sale */}
                      {item.rating && (
                        <View style={styles.featuredRatingPill}>
                          <Text style={styles.featuredRatingText}>{item.rating} ★</Text>
                        </View>
                      )}
                    </View>

                    {/* Card Body matching Flash Sale */}
                    <View style={styles.featuredCardBody}>
                      {Boolean(item.vendor || item.vendorName || item.brand) && (
                        <Text style={styles.featuredBrandText} numberOfLines={1}>
                          {getVendorName(item.vendor || item.vendorName, getBrandName(item.brand, 'Adonik Merchant'))}
                        </Text>
                      )}

                      <Text style={styles.featuredName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      {/* Price Row */}
                      <View style={styles.featuredPriceRow}>
                        <Text style={styles.featuredPrice}>₹{Number(item.price).toLocaleString()}</Text>
                        {item.mrp && item.mrp > item.price && (
                          <Text style={styles.featuredMrp}>₹{Number(item.mrp).toLocaleString()}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Mid Promo Banner (Proper Fit Hero Style, Admin Configurable) */}
        {isMidPromoActive && (
          <TouchableOpacity
            style={styles.megaBanner}
            onPress={() => {
              if (midPromo.link && midPromo.link !== 'ProductList') {
                navigation.navigate(midPromo.link);
              } else {
                navigation.navigate('ProductList', { category: midPromo.category || 'Fashion' });
              }
            }}
            activeOpacity={0.92}
          >
            {/* Full Card Fitted Image (Hero Style) */}
            <Image
              source={{ uri: midPromo.image || IMAGES.trendyFashionBanner }}
              style={styles.megaBannerImg}
              resizeMode="cover"
            />

            {/* ONLY show text overlay & button if title, subtitle, or button are provided */}
            {midPromoHasText && (
              <View style={styles.megaBannerOverlay}>
                <View style={styles.megaBannerTextContent}>
                  {midPromo.tag && midPromo.tag.trim() ? (
                    <Text style={styles.megaBannerTag}>{midPromo.tag}</Text>
                  ) : null}

                  {midPromo.title && midPromo.title.trim() ? (
                    <Text style={styles.megaBannerTitle} numberOfLines={2}>
                      {midPromo.title}
                    </Text>
                  ) : null}

                  {midPromo.subtitle && midPromo.subtitle.trim() ? (
                    <Text style={styles.megaBannerSub} numberOfLines={2}>
                      {midPromo.subtitle}
                    </Text>
                  ) : null}

                  {midPromoBtnText && midPromoBtnText.trim() ? (
                    <View style={styles.megaBannerBtn}>
                      <Text style={styles.megaBannerBtnText}>{midPromoBtnText}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Featured Brands */}
        <View style={styles.spotlightSection}>
          <Text style={styles.spotlightHeaderTitle}>Featured Brands</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotlightRailContent}
          >
            {featuredBrands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.spotlightCard}
                onPress={() => navigation.navigate('ProductList', { brand: brand.name, category: brand.name })}
                activeOpacity={0.88}
              >
                {/* Image Frame with Logo and AD badge */}
                <View style={styles.spotlightImgContainer}>
                  <Image
                    source={{ uri: brand.image }}
                    style={styles.spotlightImg}
                    resizeMode="cover"
                  />

                  {/* Brand Logo / Tag on Top-Left */}
                  <View style={styles.spotlightBrandBadge}>
                    {renderBrandLogo(brand)}
                  </View>

                  {/* AD pill on Top-Right */}
                  {brand.isAd !== false && (
                    <View style={styles.spotlightAdPill}>
                      <Text style={styles.spotlightAdText}>AD</Text>
                    </View>
                  )}
                </View>

                {/* Tagline Below the Card */}
                {brand.tagline ? (
                  <Text style={styles.spotlightTagline} numberOfLines={1}>
                    {brand.tagline}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section Header matching provided screenshot */}
        <View style={[styles.sectionHeader, { marginTop: 14, marginBottom: 4 }]}>
          <Text style={styles.sectionTitle}>More products for you</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Product Grid with Dynamic Products */}
        <View style={styles.productsGrid}>
          {(catalogProducts.length > 0 ? catalogProducts : ALL_PRODUCTS_CATALOG).map((product: any) => {
            const isWish = isInWishlist(product.id);
            const brandLabel = getVendorName(product.vendor || product.vendorName, getBrandName(product.brand, 'Adonik Merchant'));
            const isAssured = Boolean(
              product.is_assured ||
              product.is_admin_product ||
              String(brandLabel).toLowerCase().includes('assured') ||
              String(product.vendor).toLowerCase().includes('assured') ||
              String(product.vendor).toLowerCase().includes('admin')
            );
            const displayImg =
              product.image ||
              product.thumbnail ||
              product.images?.[0] ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product })}
                activeOpacity={0.88}
              >
                {/* Product Image Frame with Floating Rating Pill */}
                <View style={styles.productImgContainer}>
                  <Image
                    source={{ uri: displayImg }}
                    style={styles.productImg}
                    resizeMode="cover"
                  />

                  {/* Assured Badge in Top-Left */}
                  {isAssured && (
                    <View style={styles.assuredBadge}>
                      <Ionicons name="shield-checkmark" size={10} color="#0284C7" />
                      <Text style={styles.assuredBadgeText}>Assured</Text>
                    </View>
                  )}

                  {/* Wishlist Heart Button in Top-Right */}
                  <TouchableOpacity
                    style={styles.wishlistIconBtn}
                    onPress={() => toggleWishlist(product)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isWish ? 'heart' : 'heart-outline'}
                      size={16}
                      color={isWish ? '#EF4444' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {/* Rating Pill in Bottom-Left */}
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingScore}>{product.rating || 4.8}</Text>
                    <Ionicons name="star" size={11} color="#059669" style={styles.ratingStarIcon} />
                    <Text style={styles.ratingCount}>({product.reviews || product.review_count || 120})</Text>
                  </View>
                </View>

                {/* Product Info below image */}
                <View style={styles.productDetails}>
                  {/* Brand (Bold) + Title */}
                  <Text style={styles.productTitleRow} numberOfLines={1}>
                    <Text style={styles.productBrand}>{brandLabel} </Text>
                    <Text style={styles.productName}>{product.name}</Text>
                  </Text>

                  {/* Pricing Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.priceContainer}>
                      {product.mrp && product.mrp > product.price && (
                        <Text style={styles.mrpText}>₹{Number(product.mrp).toLocaleString()}</Text>
                      )}
                      <Text style={styles.currentPrice}>₹{Number(product.price).toLocaleString()}</Text>
                    </View>
                    {isAssured && (
                      <View style={styles.inlineAssuredPill}>
                        <Ionicons name="shield-checkmark" size={10} color="#0284C7" />
                        <Text style={styles.inlineAssuredText}>Assured</Text>
                      </View>
                    )}
                  </View>

                  {/* Bank Offer / Offer text */}
                  {product.bankOfferPrice ? (
                    <Text style={styles.bankOfferText} numberOfLines={1}>
                      ₹{Number(product.bankOfferPrice).toLocaleString()} {product.bankOfferText || 'with Bank offer'}
                    </Text>
                  ) : product.delivery ? (
                    <Text style={styles.deliveryBadge}>{product.delivery}</Text>
                  ) : (
                    <Text style={styles.deliveryBadge}>Free Delivery</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Delivery Location Selection & GPS Detection Sheet */}
      <DeliveryLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onAddNewAddress={() => navigation.navigate('AddressManage')}
      />

      {/* 1. Advanced Live Autocomplete Search Modal (Flipkart & Amazon Style) */}
      <Modal
        visible={isSearchModalVisible}
        animationType="fade"
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <SafeAreaView style={styles.searchModalContainer}>
          {/* Search Header Bar */}
          <View style={styles.searchModalHeader}>
            <TouchableOpacity
              style={styles.searchModalBackBtn}
              onPress={() => setIsSearchModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <View style={styles.searchModalInputWrap}>
              <Feather name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchModalInput}
                placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
                placeholderTextColor="#94A3B8"
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
                autoFocus={true}
                returnKeyType="search"
                onSubmitEditing={() => handleExecuteSearch(modalSearchQuery)}
              />
              {modalSearchQuery.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => setModalSearchQuery('')}
                  style={{ padding: 4, marginRight: 2 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.searchModalActionBtn}
              onPress={() => setIsVoiceModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="mic-outline" size={21} color="#2563EB" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchModalActionBtn}
              onPress={() => setIsLensModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={21} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Suggestions & Live Results Content */}
          <ScrollView
            style={styles.searchModalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {modalSearchQuery.trim().length === 0 ? (
              <View style={styles.searchPreContent}>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View style={styles.searchSection}>
                    <View style={styles.searchSectionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="clock" size={14} color="#64748B" />
                        <Text style={styles.searchSectionTitle}>Recent Searches</Text>
                      </View>
                      <TouchableOpacity onPress={() => setRecentSearches([])}>
                        <Text style={styles.clearAllText}>Clear All</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.recentTagsWrap}>
                      {recentSearches.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.recentTagPill}
                          onPress={() => {
                            setModalSearchQuery(item);
                            handleExecuteSearch(item);
                          }}
                        >
                          <Text style={styles.recentTagText}>{item}</Text>
                          <TouchableOpacity
                            onPress={() =>
                              setRecentSearches((prev) => prev.filter((_, i) => i !== idx))
                            }
                            style={{ paddingLeft: 4 }}
                          >
                            <Ionicons name="close" size={14} color="#94A3B8" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Trending Searches (Flipkart / Amazon Style) */}
                <View style={styles.searchSection}>
                  <View style={styles.searchSectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14 }}>🔥</Text>
                      <Text style={styles.searchSectionTitle}>Trending on Adonik</Text>
                    </View>
                    <View style={styles.verifiedLivePill}>
                      <Text style={styles.verifiedLiveText}>POPULAR</Text>
                    </View>
                  </View>

                  <View style={styles.trendingGrid}>
                    {TRENDING_SEARCHES.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.trendingChip}
                        activeOpacity={0.7}
                        onPress={() => {
                          setModalSearchQuery(item.label);
                          handleExecuteSearch(item.label);
                        }}
                      >
                        <Text style={styles.trendingIcon}>{item.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.trendingLabel} numberOfLines={1}>
                            {item.label}
                          </Text>
                          <Text style={styles.trendingTag}>{item.tag}</Text>
                        </View>
                        <Feather name="arrow-up-left" size={14} color="#94A3B8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Popular Categories Shortcut */}
                <View style={styles.searchSection}>
                  <Text style={[styles.searchSectionTitle, { marginBottom: 10 }]}>
                    Explore Top Categories
                  </Text>
                  <View style={styles.catPillRow}>
                    {['Mobiles', 'Electronics', 'Footwear', 'Fashion', 'Watches', 'Appliances'].map(
                      (cat, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.catPillBtn}
                          onPress={() => {
                            setModalSearchQuery(cat);
                            handleExecuteSearch(cat);
                          }}
                        >
                          <Text style={styles.catPillText}>{cat}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              </View>
            ) : (
              /* Live Autocomplete Instant Matches */
              <View style={styles.searchLiveList}>
                <View style={styles.liveResultsHeader}>
                  <Text style={styles.liveResultsCount}>
                    {liveSuggestions.length} genuine product{liveSuggestions.length === 1 ? '' : 's'} found
                  </Text>
                  <TouchableOpacity onPress={() => handleExecuteSearch(modalSearchQuery)}>
                    <Text style={styles.seeAllSearchLink}>See full results →</Text>
                  </TouchableOpacity>
                </View>

                {liveSuggestions.length > 0 ? (
                  liveSuggestions.map((item) => {
                    const discountVal =
                      item.discount ||
                      (item.mrp && item.mrp > item.price
                        ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                        : null);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.liveSuggestCard}
                        activeOpacity={0.75}
                        onPress={() => handleSelectProduct(item)}
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.liveSuggestThumb}
                          resizeMode="contain"
                        />
                        <View style={styles.liveSuggestInfo}>
                          <View style={styles.liveSuggestMeta}>
                            {item.brand && (
                              <Text style={styles.liveSuggestBrand}>{item.brand.toUpperCase()}</Text>
                            )}
                            {item.category && (
                              <Text style={styles.liveSuggestCat}>• {item.category}</Text>
                            )}
                          </View>
                          <Text style={styles.liveSuggestTitle} numberOfLines={2}>
                            {item.name}
                          </Text>
                          <View style={styles.liveSuggestPriceRow}>
                            <Text style={styles.liveSuggestPrice}>₹{item.price.toLocaleString()}</Text>
                            {item.mrp && item.mrp > item.price && (
                              <Text style={styles.liveSuggestMrp}>₹{item.mrp.toLocaleString()}</Text>
                            )}
                            {discountVal && (
                              <View style={styles.liveSuggestDiscountBadge}>
                                <Text style={styles.liveSuggestDiscountText}>{discountVal}% OFF</Text>
                              </View>
                            )}
                          </View>
                          {item.delivery && (
                            <Text style={styles.liveSuggestDelivery}>🟢 {item.delivery}</Text>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.noResultsBox}>
                    <Ionicons name="search-outline" size={44} color="#CBD5E1" />
                    <Text style={styles.noResultsTitle}>No exact products found</Text>
                    <Text style={styles.noResultsSub}>
                      Try checking spelling or search for popular items like "iPhone", "Nike", "Headphones", "Watch".
                    </Text>
                    <TouchableOpacity
                      style={styles.searchAllBtn}
                      onPress={() => handleExecuteSearch(modalSearchQuery)}
                    >
                      <Text style={styles.searchAllBtnText}>
                        Search whole catalog for "{modalSearchQuery}"
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 2. Interactive Voice Search Modal (Flipkart / Amazon Voice Search) */}
      <Modal
        visible={isVoiceModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsVoiceModalVisible(false)}
      >
        <View style={styles.voiceModalBackdrop}>
          <View style={styles.voiceModalCard}>
            <TouchableOpacity
              style={styles.voiceModalCloseBtn}
              onPress={() => setIsVoiceModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>

            {/* Glowing animated microphone visualizer */}
            <View style={styles.voiceMicOuterRing}>
              <View style={styles.voiceMicMiddleRing}>
                <View style={styles.voiceMicCore}>
                  <Ionicons name="mic" size={36} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <Text style={styles.voiceListeningTitle}>Listening...</Text>
            <Text style={styles.voiceListeningSub}>
              Speak now or tap a voice prompt below:
            </Text>

            <View style={styles.voicePillsWrap}>
              {[
                'iPhone 15 Pro Max',
                'Nike Air Force 1',
                'ANC Headphones',
                'Smart 4K TV',
                'Banarasi Silk Saree',
                'Seiko Diver Watch',
              ].map((queryText, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.voiceQueryPill}
                  activeOpacity={0.7}
                  onPress={() => {
                    setModalSearchQuery(queryText);
                    setSearchQuery(queryText);
                    handleExecuteSearch(queryText);
                  }}
                >
                  <Ionicons name="mic" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.voiceQueryPillText}>{queryText}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.voiceCancelBtn}
              onPress={() => setIsVoiceModalVisible(false)}
            >
              <Text style={styles.voiceCancelText}>Cancel Voice Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Visual / Lens Search Modal (Flipkart / Amazon Camera Search) */}
      <Modal
        visible={isLensModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLensModalVisible(false)}
      >
        <View style={styles.voiceModalBackdrop}>
          <View style={styles.lensModalCard}>
            <TouchableOpacity
              style={styles.voiceModalCloseBtn}
              onPress={() => setIsLensModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.lensIconBox}>
              <Ionicons name="camera" size={32} color={ADONIK_THEME.primary} />
            </View>

            <Text style={styles.lensTitle}>Adonik Visual Search</Text>
            <Text style={styles.lensSubtitle}>
              Find products by taking a photo or uploading an image of what you love.
            </Text>

            <View style={styles.lensActionsRow}>
              <TouchableOpacity
                style={styles.lensActionPrimary}
                activeOpacity={0.8}
                onPress={() => {
                  setIsLensModalVisible(false);
                  handleExecuteSearch('Sneakers');
                }}
              >
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.lensActionPrimaryText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.lensActionSecondary}
                activeOpacity={0.8}
                onPress={() => {
                  setIsLensModalVisible(false);
                  handleExecuteSearch('Headphones');
                }}
              >
                <Ionicons name="image-outline" size={20} color="#0F172A" style={{ marginRight: 6 }} />
                <Text style={styles.lensActionSecondaryText}>From Gallery</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.lensQuickLabel}>Or search by visual style:</Text>
            <View style={styles.lensStylesGrid}>
              {[
                { label: '👟 Sneakers', query: 'Nike' },
                { label: '⌚ Watches', query: 'Watch' },
                { label: '🎧 Audio', query: 'Headphones' },
                { label: '👗 Ethnic', query: 'Saree' },
              ].map((styleItem, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.lensStyleChip}
                  activeOpacity={0.7}
                  onPress={() => {
                    setIsLensModalVisible(false);
                    handleExecuteSearch(styleItem.query);
                  }}
                >
                  <Text style={styles.lensStyleText}>{styleItem.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 24, backgroundColor: '#F8F9FA' },

  // Standard Professional Header (Flipkart / Amazon Style)
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandPlusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  brandPlusText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -2,
  },
  brandTaglineGold: {
    color: '#D97706',
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  wishlistBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  cartBadgeSmall: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: ADONIK_THEME.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeSmallText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // Thin Compact Navbar on Scroll (Takes only 52px!)
  scrolledHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
  },
  scrolledLogoTouch: {
    padding: 2,
  },
  scrolledLogoImg: {
    width: 30,
    height: 30,
    borderRadius: 7,
  },
  scrolledSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrolledPlaceholderText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  scrolledHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtnCompact: {
    padding: 6,
    position: 'relative',
  },

  // Standard Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginTop: 2,
  },
  searchPlaceholderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  animatedPlaceholderText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  searchActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchActionBtn: {
    padding: 5,
    borderRadius: 6,
  },
  searchActionBtnSmall: {
    padding: 4,
  },

  // Deliver To Location Bar
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  locationLeftTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
    marginRight: 6,
  },
  deliverLabel: { fontSize: 11, color: '#64748B' },
  deliverAddress: { fontSize: 12, fontWeight: '700', color: ADONIK_THEME.text, flexShrink: 1 },
  quickDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  quickDetectBtnActive: {
    backgroundColor: '#FDE68A',
  },
  quickDetectText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },

  // Advanced Search Overlay Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  searchModalBackBtn: {
    padding: 4,
  },
  searchModalInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchModalInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  searchModalActionBtn: {
    padding: 6,
  },
  searchModalBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchPreContent: {
    padding: 16,
    gap: 20,
  },
  searchSection: {
    gap: 10,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  recentTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentTagText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  verifiedLivePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedLiveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingChip: {
    width: (SCREEN_W - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  trendingIcon: {
    fontSize: 18,
  },
  trendingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  trendingTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  catPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPillBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  searchLiveList: {
    padding: 16,
    gap: 12,
  },
  liveResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  liveResultsCount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  seeAllSearchLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: ADONIK_THEME.primary,
  },
  liveSuggestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  liveSuggestThumb: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  liveSuggestInfo: {
    flex: 1,
    gap: 2,
  },
  liveSuggestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveSuggestBrand: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  liveSuggestCat: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  liveSuggestTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
  },
  liveSuggestPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveSuggestPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveSuggestMrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  liveSuggestDiscountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  liveSuggestDiscountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  liveSuggestDelivery: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 1,
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  noResultsSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  searchAllBtn: {
    marginTop: 8,
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchAllBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Voice Search Modal Styles
  voiceModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voiceModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  voiceModalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  voiceMicOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  voiceMicMiddleRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#93C5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceMicCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceListeningTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  voiceListeningSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  voicePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 18,
  },
  voiceQueryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  voiceQueryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  voiceCancelBtn: {
    paddingVertical: 8,
  },
  voiceCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Visual / Lens Search Modal Styles
  lensModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  lensIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  lensTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  lensSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  lensActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  lensActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ADONIK_THEME.primary,
    borderRadius: 12,
    paddingVertical: 11,
  },
  lensActionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lensActionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lensActionSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lensQuickLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  lensStylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  lensStyleChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lensStyleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Hero Banner Slider
  sliderContainer: {
    paddingTop: 12,
  },
  sliderContentContainer: {
    paddingHorizontal: 16,
  },
  slideCard: {
    height: 165,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingLeft: 22,
    paddingRight: 16,
    paddingVertical: 16,
  },
  slideTextContent: {
    maxWidth: '74%',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
  },
  slideSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 4,
    lineHeight: 16,
    fontWeight: '500',
  },
  slideBtn: {
    backgroundColor: '#C89B53',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  slideBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#C89B53',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },

  // Featured Categories Horizontal Slider (Showing set image only for featured categories)
  categoriesSection: {
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categorySliderContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySlideItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 68,
  },
  categoryImageWrapper: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  categorySliderName: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 70,
  },

  // Flash Section Header
  flashSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  flashHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  flashSeeAll: {
    fontSize: 12.5,
    fontWeight: '700',
    color: ADONIK_THEME.primary,
  },

  // Flash List & Professional Cards
  flashList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 12,
  },
  flashCard: {
    width: 154,
    backgroundColor: 'transparent',
  },
  flashImgWrapper: {
    width: 154,
    height: 144,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  flashImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  flashDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6.5,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  flashDiscountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  flashRatingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flashRatingText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  flashCardBody: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: 'transparent',
  },
  flashBrandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  flashName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
    marginTop: 2,
    height: 32,
  },
  flashPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  flashPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  flashMrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // Featured Products Slider (Styled matching Flash Sale cards)
  featuredSection: {
    marginTop: 6,
    marginBottom: 4,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  featuredHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredIconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  featuredTagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  featuredTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  featuredSeeAll: {
    fontSize: 12.5,
    fontWeight: '700',
    color: ADONIK_THEME.primary,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 12,
  },
  featuredCard: {
    width: 154,
    backgroundColor: 'transparent',
  },
  featuredImgWrapper: {
    width: 154,
    height: 144,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6.5,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  featuredDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5.5,
    paddingVertical: 2.5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredDiscountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  featuredRatingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 5.5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredRatingText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  featuredCardBody: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: 'transparent',
  },
  featuredBrandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featuredName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
    marginTop: 2,
    height: 32,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  featuredPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  featuredMrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: ADONIK_THEME.text },
  seeAllText: { fontSize: 12, fontWeight: '700', color: ADONIK_THEME.primary },

  // Mega Banner (Proper Fit Hero Style)
  megaBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    height: 160,
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  megaBannerImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  megaBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.44)',
    justifyContent: 'center',
    paddingLeft: 22,
    paddingRight: 16,
    paddingVertical: 16,
  },
  megaBannerTextContent: {
    maxWidth: '74%',
    justifyContent: 'center',
  },
  megaBannerTag: {
    color: '#FCD34D',
    fontSize: 11.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  megaBannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
  },
  megaBannerSub: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 16,
  },
  megaBannerBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    alignSelf: 'flex-start',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  megaBannerBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Products Grid (Matching Flipkart-style 2-column layout in screenshot)
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (SCREEN_W - 36) / 2,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  productImgContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
    overflow: 'hidden',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  wishlistIconBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  assuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  assuredBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.2,
  },
  inlineAssuredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#BAE6FD',
  },
  inlineAssuredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
  },
  ratingScore: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingStarIcon: {
    marginHorizontal: 2.5,
  },
  ratingCount: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  productDetails: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  productTitleRow: {
    fontSize: 13,
    lineHeight: 18,
  },
  productBrand: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },
  productName: {
    fontWeight: '400',
    color: '#475569',
    fontSize: 13,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  mrpText: {
    fontSize: 12.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginRight: 6,
    fontWeight: '400',
  },
  currentPrice: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  bankOfferText: {
    fontSize: 11.5,
    color: '#1D4ED8',
    marginTop: 2,
    fontWeight: '600',
  },
  deliveryBadge: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },

  // Brands in Spotlight (Matching user's provided screenshot)
  spotlightSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  spotlightHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  spotlightRailContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 2,
  },
  spotlightCard: {
    width: 144,
    alignItems: 'center',
  },
  spotlightImgContainer: {
    width: 144,
    height: 175,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  spotlightImg: {
    width: '100%',
    height: '100%',
  },
  spotlightBrandBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  spotlightBrandLogo: {
    width: 52,
    height: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  falconMark: {
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandFastrackText: {
    fontSize: 10.5,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandCrocsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  brandActionText: {
    fontSize: 10.5,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0F172A',
  },
  brandNikeText: {
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandBoatText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandPumaText: {
    fontSize: 10.5,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandSonyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1,
  },
  brandSamsungText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  spotlightBrandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  spotlightAdPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 4.5,
    paddingVertical: 1.5,
    borderRadius: 3.5,
  },
  spotlightAdText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  spotlightDiscountBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3730A3',
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightDiscountText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  spotlightTagline: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 140,
  },
});
