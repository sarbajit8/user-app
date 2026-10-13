import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';
import { useCartStore } from '../../store/authStore';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_ITEM_W = (SCREEN_W - 44) / 2;

const STORE_PRODUCTS = [
  {
    id: 401,
    name: "Men's T-Shirt",
    price: 799,
    originalPrice: 1299,
    rating: 4.4,
    reviewsCount: 86,
    image: IMAGES.mensTshirt,
  },
  {
    id: 402,
    name: "Women's Dress",
    price: 1499,
    originalPrice: 2499,
    rating: 4.6,
    reviewsCount: 112,
    image: IMAGES.womensDress,
  },
  {
    id: 403,
    name: 'Casual Sneakers',
    price: 2499,
    originalPrice: 3999,
    rating: 4.3,
    reviewsCount: 98,
    image: IMAGES.casualSneakers,
  },
  {
    id: 404,
    name: "Women's Handbag",
    price: 1799,
    originalPrice: 2999,
    rating: 4.6,
    reviewsCount: 89,
    image: IMAGES.handbag,
  },
];

const TABS = ['Products', 'About', 'Reviews'];

export default function VendorStoreScreen({ route, navigation }: any) {
  const seller = route?.params?.seller || {
    name: 'Fashion Hub',
    category: 'Fashion & Lifestyle',
    rating: 4.6,
    reviews: '2.3k',
    avatar: IMAGES.sellerFashion,
  };

  const [activeTab, setActiveTab] = useState('Products');
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (prod: any) => {
    addItem({
      id: prod.id,
      product_id: prod.id,
      variant_id: null,
      vendor_id: 1,
      name: prod.name,
      image: prod.image,
      price: prod.price,
      mrp: prod.originalPrice,
      quantity: 1,
      vendor_name: seller.name,
      variant_name: null,
    });
    Alert.alert('Added to Cart', `${prod.name} added to cart.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{seller.name}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Share', `Shared ${seller.name} store link.`)}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Seller Info Header */}
        <View style={styles.sellerHeader}>
          <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} />
          <View style={styles.sellerInfo}>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Seller</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{seller.rating}</Text>
              <Text style={styles.reviewsText}>({seller.reviews} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Store Promo Banner */}
        <View style={styles.bannerCard}>
          <Image source={{ uri: IMAGES.trendyFashionBanner }} style={styles.bannerImage} />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Trendy Fashion{"\n"}For Everyone</Text>
            <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.85}>
              <Text style={styles.bannerBtnText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Controls row: Sort & Filter */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Ionicons name="swap-vertical-outline" size={15} color={ADONIK_THEME.text} style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Sort</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={15} color={ADONIK_THEME.text} style={{ marginRight: 4 }} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Product Grid */}
        <View style={styles.productsGrid}>
          {STORE_PRODUCTS.map((prod) => (
            <View key={prod.id} style={styles.productCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { product: prod })}
                activeOpacity={0.85}
              >
                <Image source={{ uri: prod.image }} style={styles.productImg} resizeMode="cover" />
              </TouchableOpacity>

              <View style={styles.productDetails}>
                <Text style={styles.prodName} numberOfLines={1}>{prod.name}</Text>
                <Text style={styles.prodPrice}>₹ {prod.price.toLocaleString()}</Text>

                <View style={styles.prodRatingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.prodRatingVal}>{prod.rating}</Text>
                  <Text style={styles.prodReviewCount}>({prod.reviewsCount})</Text>
                </View>

                <TouchableOpacity
                  style={styles.addCartBtn}
                  onPress={() => handleAddToCart(prod)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addCartBtnText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ADONIK_THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: ADONIK_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
  },
  sellerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  reviewsText: {
    fontSize: 12,
    color: ADONIK_THEME.textSecondary,
  },
  bannerCard: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3E2723',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.65,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#18181B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: ADONIK_THEME.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: ADONIK_THEME.textSecondary,
  },
  tabTextActive: {
    color: ADONIK_THEME.primaryDark,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ADONIK_THEME.surface,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: GRID_ITEM_W,
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
  },
  productImg: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8F9FA',
  },
  productDetails: {
    padding: 10,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
  prodPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: ADONIK_THEME.text,
    marginTop: 4,
  },
  prodRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  prodRatingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  prodReviewCount: {
    fontSize: 11,
    color: ADONIK_THEME.textMuted,
  },
  addCartBtn: {
    backgroundColor: ADONIK_THEME.primary,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 8,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
