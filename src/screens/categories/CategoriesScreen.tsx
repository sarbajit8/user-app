import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM } from '../../theme/typography';

const { width: SCREEN_W } = Dimensions.get('window');

// 10 Left Rail Categories matching the uploaded screenshot exactly
export interface MainRailCategory {
  id: string;
  name: string;
  image: string;
  isSpecialBadge?: boolean;
}

const RAIL_CATEGORIES: MainRailCategory[] = [
  {
    id: 'for_you',
    name: 'For You',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
    isSpecialBadge: true,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'mobiles',
    name: 'Mobiles',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'appliances',
    name: 'Appliances',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'smart_gadgets',
    name: 'Smart Gadgets',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'home',
    name: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'toys',
    name: 'Toys & Baby Care',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'food',
    name: 'Food & Healthcare',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
  },
];

// Content Data mapped for each active category tab
interface StoreCard {
  title: string;
  image: string;
  bgGradient?: string;
  tag?: string;
}

interface ProductLaunchCard {
  id: string;
  title: string;
  image: string;
  badge: 'NOTIFY ME' | 'BUY NOW' | 'SALE IS LIVE' | 'HOT DEAL' | 'BESTSELLER';
  badgeColor?: string;
  isViewAll?: boolean;
}

interface CategoryContentData {
  popularStoreTitle: string;
  popularStores: StoreCard[];
  launchesTitle: string;
  launches: ProductLaunchCard[];
}

const CATEGORY_CONTENT_MAP: Record<string, CategoryContentData> = {
  for_you: {
    popularStoreTitle: 'Popular Store',
    popularStores: [
      {
        title: 'Starts 9th Oct',
        tag: 'THE BIG BILLION DAYS',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Early Bird Deals Live now',
        tag: 'EARLY BIRD DEALS',
        image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Only for today',
        tag: 'Trip & trolley utsav',
        image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Value 365',
        tag: 'VALUE 365',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Prove & Unlock Epic Drops',
        tag: 'Are You really GenZ?',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Flights',
        tag: 'IndiGo & Airlines',
        image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
      },
    ],
    launchesTitle: 'New & Upcoming Launches',
    launches: [
      {
        id: 'l1',
        title: 'Google Fitbit Air',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l2',
        title: 'iPhone 18 Pro',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l3',
        title: 'Acer Iconia Tab',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l4',
        title: 'Ai+ NovaTab',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l5',
        title: 'boltt EVO',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l6',
        title: 'boltt ACE 5G',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l7',
        title: 'Noise REP Fitness Band',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l8',
        title: 'EDT Air Fryers !',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'l9',
        title: 'View All',
        badge: 'HOT DEAL',
        image: '',
        isViewAll: true,
      },
    ],
  },

  fashion: {
    popularStoreTitle: 'Fashion & Luxury Stores',
    popularStores: [
      {
        title: "Men's Luxury Store",
        tag: 'Italian Suits & Polos',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: "Women's Designer",
        tag: 'Silk Sarees & Lehengas',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'GenZ Streetwear',
        tag: 'Oversized Tees & Cargos',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Luxury Footwear',
        tag: 'Sneakers & Oxfords',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Jewelry & Watches',
        tag: 'Diamond & Chronograph',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Handbags & Clutches',
        tag: 'Designer Leather Bags',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80',
      },
    ],
    launchesTitle: 'Trending Fashion Subcategories',
    launches: [
      {
        id: 'f1',
        title: 'Tailored Blazers',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f2',
        title: 'Banarasi Sarees',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f3',
        title: 'Evening Dresses',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f4',
        title: 'Casual Polos',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f5',
        title: 'Selvedge Denim',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f6',
        title: 'Retro Sneakers',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f7',
        title: 'Stilettos & Heels',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f8',
        title: 'Silk Kurtis',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'f9',
        title: 'View All',
        badge: 'HOT DEAL',
        image: '',
        isViewAll: true,
      },
    ],
  },

  mobiles: {
    popularStoreTitle: 'Official Brand Stores',
    popularStores: [
      {
        title: 'Apple Store',
        tag: 'iPhone 15 & 16 Series',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Samsung Galaxy',
        tag: 'S24 Ultra & Fold6',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'OnePlus Flagships',
        tag: '12R & Open 5G',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'iPads & Tablets',
        tag: 'Pro & Air with M2/M3',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Google Pixel',
        tag: '9 Pro & Gemini AI',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Refurbished Deals',
        tag: 'Certified with Warranty',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
      },
    ],
    launchesTitle: 'Phones & Super Subcategories',
    launches: [
      {
        id: 'm1',
        title: 'iPhone 15 Pro Max',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm2',
        title: 'Galaxy S24 Ultra',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm3',
        title: 'iPad Pro M4',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm4',
        title: 'Armored Cases',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm5',
        title: '65W GaN Chargers',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm6',
        title: 'Tempered Glass',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm7',
        title: 'Magnetic Powerbanks',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1609592424079-c52e46e4922f?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm8',
        title: 'Gimbals & Tripods',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'm9',
        title: 'View All',
        badge: 'HOT DEAL',
        image: '',
        isViewAll: true,
      },
    ],
  },

  appliances: {
    popularStoreTitle: 'Home & Kitchen Appliances',
    popularStores: [
      {
        title: 'Smart 4K QLED TVs',
        tag: '65" & 75" Cinema Screen',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Front Load Washers',
        tag: 'AI EcoBubble Tech',
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Inverter ACs',
        tag: '5 Star Heavy Cooling',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Double Door Fridges',
        tag: 'Convertible 5-in-1',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Robotic Vacuums',
        tag: 'LiDAR Auto-Empty',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
      },
      {
        title: 'Air Fryers & Blenders',
        tag: 'Healthy 0-Oil Cooking',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80',
      },
    ],
    launchesTitle: 'Popular Appliance Super Subcategories',
    launches: [
      {
        id: 'a1',
        title: 'Sony Bravia XR 65"',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a2',
        title: 'LG AI Direct Wash',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a3',
        title: 'Daikin Dual Inverter',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a4',
        title: 'Dual Basket Fryer',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a5',
        title: 'Espresso Machine',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a6',
        title: 'Samsung Side-by-Side',
        badge: 'SALE IS LIVE',
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a7',
        title: 'Dyson Air Purifier',
        badge: 'NOTIFY ME',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a8',
        title: 'Microwave Convection',
        badge: 'BUY NOW',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&auto=format&fit=crop&q=80',
      },
      {
        id: 'a9',
        title: 'View All',
        badge: 'HOT DEAL',
        image: '',
        isViewAll: true,
      },
    ],
  },
};

// Fallback for electronics, smart gadgets, home, beauty, toys, food
const DEFAULT_CONTENT = (name: string): CategoryContentData => ({
  popularStoreTitle: `${name} Featured Stores`,
  popularStores: [
    {
      title: 'Trending Stores',
      tag: 'Verified Sellers',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Top Rated Deals',
      tag: '4.5+ Stars',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Special Drop',
      tag: 'Limited Edition',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Flash Discounts',
      tag: 'Up to 60% Off',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Brand Warranty',
      tag: '100% Genuine',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    },
    {
      title: 'Express Delivery',
      tag: 'Ship in 24h',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
    },
  ],
  launchesTitle: `${name} Top Subcategories`,
  launches: [
    {
      id: 'd1',
      title: 'Premium Selection',
      badge: 'BUY NOW',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd2',
      title: 'Bestseller Item',
      badge: 'SALE IS LIVE',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd3',
      title: 'Trending Gadget',
      badge: 'BUY NOW',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd4',
      title: 'Daily Essentials',
      badge: 'NOTIFY ME',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd5',
      title: 'Value Pack',
      badge: 'BUY NOW',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd6',
      title: 'Hot Arrival',
      badge: 'SALE IS LIVE',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd7',
      title: 'Lifestyle Pick',
      badge: 'BUY NOW',
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd8',
      title: 'Collector Edition',
      badge: 'NOTIFY ME',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'd9',
      title: 'View All',
      badge: 'HOT DEAL',
      image: '',
      isViewAll: true,
    },
  ],
});

export default function CategoriesScreen({ navigation, route }: any) {
  const [selectedRailId, setSelectedRailId] = useState('for_you');

  useEffect(() => {
    const slug = route?.params?.categorySlug;
    const catId = route?.params?.categoryId;
    const catName = route?.params?.categoryName;

    if (slug || catId || catName) {
      const match = RAIL_CATEGORIES.find((c) => {
        const cId = c.id.toLowerCase();
        const cName = c.name.toLowerCase();
        if (slug && (cId === String(slug).toLowerCase() || cName.includes(String(slug).toLowerCase()))) return true;
        if (catId && cId === String(catId).toLowerCase()) return true;
        if (catName && (cName.includes(String(catName).toLowerCase()) || String(catName).toLowerCase().includes(cName))) return true;
        return false;
      });

      if (match) {
        setSelectedRailId(match.id);
      }
    }
  }, [route?.params]);

  const selectedCategoryObj = RAIL_CATEGORIES.find((c) => c.id === selectedRailId);
  const content =
    CATEGORY_CONTENT_MAP[selectedRailId] ||
    DEFAULT_CONTENT(selectedCategoryObj?.name || 'Catalog');

  const handleCardPress = (item: ProductLaunchCard | StoreCard) => {
    // Navigate to subcategory-wise product page
    navigation.navigate('ProductList', {
      category: item.title,
      parentCategory: selectedCategoryObj?.name || 'All Categories',
      subCategory: item.title,
      tag: (item as StoreCard).tag,
      image: item.image,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. TOP HEADER matching screenshot: Back arrow, "All Categories", Search, Cart */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
            style={styles.headerIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#18181B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Categories</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerIconBtn}
          >
            <Ionicons name="search-outline" size={22} color="#18181B" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.headerIconBtn}
          >
            <Ionicons name="cart-outline" size={23} color="#18181B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SPLIT LAYOUT: Left Vertical Rail + Right Content Showcase */}
      <View style={styles.splitLayout}>
        {/* LEFT VERTICAL CATEGORY RAIL */}
        <View style={styles.leftRail}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.leftRailContent}
          >
            {RAIL_CATEGORIES.map((cat) => {
              const isActive = selectedRailId === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.railItem,
                    isActive && styles.railItemActive,
                  ]}
                  onPress={() => setSelectedRailId(cat.id)}
                  activeOpacity={0.8}
                >
                  {/* Active Blue Left Pill Bar (as seen in screenshot) */}
                  {isActive && <View style={styles.activePillIndicator} />}

                  {/* Icon / Image Circle */}
                  <View
                    style={[
                      styles.railIconContainer,
                      cat.isSpecialBadge && styles.specialForYouContainer,
                    ]}
                  >
                    {cat.isSpecialBadge ? (
                      // Custom Purple Shopping Bag with discount tag for "For You"
                      <View style={styles.specialBagCircle}>
                        <Ionicons name="pricetag" size={13} color="#FFFFFF" style={{ transform: [{ rotate: '-45deg' }] }} />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: cat.image }}
                        style={styles.railImage}
                        resizeMode="cover"
                      />
                    )}
                  </View>

                  {/* Category Name */}
                  <Text
                    style={[
                      styles.railLabel,
                      isActive ? styles.railLabelActive : styles.railLabelInactive,
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* RIGHT SUB-CATEGORIES & LAUNCHES SHOWCASE */}
        <ScrollView
          style={styles.rightContent}
          contentContainerStyle={styles.rightContentInner}
          showsVerticalScrollIndicator={false}
        >
          {/* SECTION 1: Popular Store (3-column rounded cards) */}
          <Text style={styles.sectionHeading}>{content.popularStoreTitle}</Text>
          <View style={styles.storeGrid}>
            {content.popularStores.map((store, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.storeCard}
                onPress={() => handleCardPress(store)}
                activeOpacity={0.85}
              >
                {/* Store Visual Graphic */}
                <View style={styles.storeImageFrame}>
                  <Image
                    source={{ uri: store.image }}
                    style={styles.storeImage}
                    resizeMode="cover"
                  />
                  {store.tag && (
                    <View style={styles.storeTagOverlay}>
                      <Text style={styles.storeTagText} numberOfLines={1}>
                        {store.tag}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Title */}
                <Text style={styles.storeTitle} numberOfLines={2}>
                  {store.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECTION 2: New & Upcoming Launches (3-column products with badges) */}
          <Text style={styles.sectionHeading}>{content.launchesTitle}</Text>
          <View style={styles.launchesGrid}>
            {content.launches.map((item) => {
              if (item.isViewAll) {
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.launchCard}
                    onPress={() =>
                      navigation.navigate('ProductList', {
                        category: `${selectedCategoryObj?.name || 'All'} Products`,
                        parentCategory: selectedCategoryObj?.name || 'All Categories',
                        subCategory: 'All',
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.viewAllCircle}>
                      <Ionicons name="arrow-down" size={26} color="#2563EB" />
                    </View>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.launchCard}
                  onPress={() => handleCardPress(item)}
                  activeOpacity={0.85}
                >
                  {/* Product Square Image with Teal Badge at Bottom */}
                  <View style={styles.productImageFrame}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />

                    {/* Badge Pill: NOTIFY ME / BUY NOW / SALE IS LIVE */}
                    <View style={styles.tealBadge}>
                      <Text style={styles.tealBadgeText}>{item.badge}</Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text style={styles.launchTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Extra Bottom Spacing */}
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Split Layout
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  // Left Vertical Category Rail
  leftRail: {
    width: 86,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  leftRailContent: {
    paddingBottom: 40,
  },
  railItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  railItemActive: {
    backgroundColor: '#FFFFFF',
  },
  // Blue indicator pill on the left edge
  activePillIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 4.5,
    backgroundColor: '#2563EB',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  railIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  railImage: {
    width: '100%',
    height: '100%',
  },
  specialForYouContainer: {
    backgroundColor: '#EDE9FE',
  },
  specialBagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  railLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 10.5,
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: 13,
  },
  railLabelActive: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontWeight: '700',
    color: '#2563EB',
  },
  railLabelInactive: {
    fontWeight: '500',
    color: '#475569',
  },

  // Right Content Area
  rightContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rightContentInner: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 4,
  },

  // 3-Column Grid for Popular Stores
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    rowGap: 14,
  },
  storeCard: {
    width: (SCREEN_W - 86 - 28 - 16) / 3, // dynamically divides right column by 3
    alignItems: 'center',
  },
  storeImageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeTagOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  storeTagText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 7.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  storeTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // 3-Column Grid for Launches / Subcategories
  launchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  launchCard: {
    width: (SCREEN_W - 86 - 28 - 16) / 3,
    alignItems: 'center',
  },
  productImageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  // Teal badge overlay at the bottom of the image frame (matching screenshot)
  tealBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0D9488', // Teal Green
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tealBadgeText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  launchTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // View All Button
  viewAllCircle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 6,
  },
  viewAllText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
  },
});
