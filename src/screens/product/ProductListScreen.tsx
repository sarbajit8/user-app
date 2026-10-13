import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useCartStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import {
  getSubCategoryProducts,
  CatalogProduct,
} from '../../constants/subCategoryProducts';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 36) / 2;

export default function ProductListScreen({ route, navigation }: any) {
  const categoryTitle =
    route?.params?.category ||
    route?.params?.subCategory ||
    route?.params?.query ||
    'Products';
  const parentCategory = route?.params?.parentCategory || '';
  const subCategoryTag = route?.params?.tag || '';

  const initialProducts = useMemo(() => {
    return getSubCategoryProducts(categoryTitle, parentCategory);
  }, [categoryTitle, parentCategory]);

  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [sortOption, setSortOption] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = useCartStore((s) => s.totalItems());
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    const list = getSubCategoryProducts(categoryTitle, parentCategory);
    setProducts(list);
    setSearchQuery('');

    // Fetch live products from backend to ensure any newly added genuine vendor products appear
    const loadLiveProducts = async () => {
      try {
        const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/products?per_page=50`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
            const q = (categoryTitle || '').toLowerCase().trim();
            const p = (parentCategory || '').toLowerCase().trim();
            const liveMatches = json.data.filter((item: any) => {
              const name = (item.name || '').toLowerCase();
              const cat = (item.category?.name || item.category || '').toLowerCase();
              const brand = (item.brand?.name || item.brand || '').toLowerCase();
              const vendor = (item.vendor?.business_name || item.vendor || '').toLowerCase();
              return (
                (q && (name.includes(q) || cat.includes(q) || brand.includes(q) || vendor.includes(q))) ||
                (p && cat.includes(p))
              );
            });
            if (liveMatches.length > 0) {
              setProducts(
                liveMatches.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  brand: item.brand?.name || item.brand || item.vendor?.business_name || 'Adonik Merchant',
                  vendor: item.vendor?.business_name || item.vendor || 'Adonik Merchant',
                  price: Number(item.price || 0),
                  mrp: Number(item.mrp || item.original_price || item.price || 0),
                  discount: Number(item.discount_percentage || 0),
                  rating: Number(item.rating || 4.8),
                  reviews: item.review_count || 120,
                  image: item.thumbnail || item.image || item.images?.[0]?.image_path || '',
                  category: item.category?.name || item.category || 'General',
                  subCategory: categoryTitle,
                  delivery: item.free_shipping ? 'Free Delivery' : 'Standard Delivery',
                }))
              );
            }
          }
        }
      } catch {}
    };

    loadLiveProducts();
  }, [categoryTitle, parentCategory]);

  const handleSort = (type: string) => {
    setSortOption(type);
    let sorted = [...products];
    if (type === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (type === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    if (type === 'rating') sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    setProducts(sorted);
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p: any) => {
      const pName = typeof p.name === 'string' ? p.name.toLowerCase() : '';
      const pVendor = typeof p.vendor === 'object' && p.vendor !== null
        ? (p.vendor.business_name || p.vendor.name || '').toLowerCase()
        : (typeof p.vendor === 'string' ? p.vendor.toLowerCase() : '');
      const pSub = typeof p.subCategory === 'string' ? p.subCategory.toLowerCase() : '';
      return pName.includes(q) || pVendor.includes(q) || pSub.includes(q);
    });
  }, [products, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Fixed Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Categories'))}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {categoryTitle}
          </Text>
          {parentCategory ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {parentCategory} • {filtered.length} {filtered.length === 1 ? 'Item' : 'Items'}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={23} color={ADONIK_THEME.text} />
          {cartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Smooth Full-Page Scroll Container (Top to Bottom) ─── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
      >
        {/* ─── Search & Sort Bar ─── */}
        <View style={styles.topControlBar}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={17} color={ADONIK_THEME.textSecondary} />
            <TextInput
              placeholder={`Search in ${categoryTitle}...`}
              placeholderTextColor={ADONIK_THEME.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Pills Row */}
          <View style={styles.sortRow}>
            {[
              { key: 'popular', label: 'Popular' },
              { key: 'price_asc', label: 'Price: Low' },
              { key: 'price_desc', label: 'Price: High' },
              { key: 'rating', label: 'Rating 4★+' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.sortBtn, sortOption === item.key && styles.sortBtnActive]}
                onPress={() => handleSort(item.key)}
              >
                <Text style={[styles.sortText, sortOption === item.key && styles.sortTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Subcategory Breadcrumb / Tag Banner ─── */}
        <View style={styles.subCategoryMetaBar}>
          <View style={styles.subCategoryMetaLeft}>
            <Ionicons name="sparkles" size={13} color={ADONIK_THEME.primary} />
            <Text style={styles.subCategoryMetaText}>
              {subCategoryTag || `${filtered.length} products found in this collection`}
            </Text>
          </View>
          <View style={styles.fastDeliveryPill}>
            <Ionicons name="flash" size={11} color="#16A34A" />
            <Text style={styles.fastDeliveryText}>Fast Delivery</Text>
          </View>
        </View>

        {/* ─── Product Grid (Matching Home Page Cards Exactly) ─── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={54} color="#94A3B8" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching products found' : 'No products in this category yet'}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? 'Try clearing your search term or exploring another category.'
                : 'This category does not have any products available at the moment. Please explore our other genuine collections!'}
            </Text>
            {searchQuery ? (
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyResetBtnText}>Clear Search Filter</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => navigation.navigate('Categories')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyResetBtnText}>Browse Other Categories</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filtered.map((item) => {
              const isWish = isInWishlist(item.id);
              const isAssured = Boolean(
                (item as any).is_assured ||
                (item as any).is_admin_product ||
                String(item.vendor).toLowerCase().includes('assured') ||
                String(item.vendor).toLowerCase().includes('admin') ||
                String(item.brand).toLowerCase().includes('assured')
              );

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productCard}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: item.id,
                      product: item,
                    })
                  }
                  activeOpacity={0.88}
                >
                  {/* Product Image Frame with Floating Rating Pill */}
                  <View style={styles.productImgContainer}>
                    <Image
                      source={{ uri: item.image }}
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
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
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
                      <Text style={styles.ratingScore}>{item.rating}</Text>
                      <Ionicons name="star" size={11} color="#059669" style={styles.ratingStarIcon} />
                      <Text style={styles.ratingCount}>({item.reviews})</Text>
                    </View>
                  </View>

                  {/* Product Info below image */}
                  <View style={styles.productDetails}>
                    {/* Brand (Bold) + Title */}
                    <Text style={styles.productTitleRow} numberOfLines={1}>
                      <Text style={styles.productBrand}>
                        {(item.vendor as any)?.business_name || (item.vendor as any)?.name || item.vendor || 'Adonik Merchant'}{' '}
                      </Text>
                      <Text style={styles.productName}>{item.name}</Text>
                    </Text>

                    {/* Pricing Row: Strikethrough MRP first, then bold price */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={styles.priceContainer}>
                        {item.mrp && item.mrp > item.price && (
                          <Text style={styles.mrpText}>₹{item.mrp.toLocaleString()}</Text>
                        )}
                        <Text style={styles.currentPrice}>₹{item.price.toLocaleString()}</Text>
                      </View>
                      {isAssured && (
                        <View style={styles.inlineAssuredPill}>
                          <Ionicons name="shield-checkmark" size={10} color="#0284C7" />
                          <Text style={styles.inlineAssuredText}>Assured</Text>
                        </View>
                      )}
                    </View>

                    {/* Bank Offer / Offer text in Blue matching Home page */}
                    {item.bankOfferPrice ? (
                      <Text style={styles.bankOfferText} numberOfLines={1}>
                        ₹{item.bankOfferPrice.toLocaleString()} {item.bankOfferText || 'with Bank offer'}
                      </Text>
                    ) : item.delivery ? (
                      <Text style={styles.deliveryBadge}>{item.delivery}</Text>
                    ) : (
                      <Text style={styles.bankOfferText} numberOfLines={1}>
                        ₹{Math.round(item.price * 0.95).toLocaleString()} with Bank offer
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh' as any,
          maxHeight: '100vh' as any,
          minHeight: 0,
          overflow: 'hidden' as any,
        }
      : {
          height: '100%',
        }),
  },
  scrollView: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          height: '100%' as any,
          maxHeight: '100%' as any,
          overflowY: 'auto' as any,
          WebkitOverflowScrolling: 'touch' as any,
        }
      : {}),
  },
  scrollContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ADONIK_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: 0,
    right: -2,
    backgroundColor: ADONIK_THEME.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  topControlBar: {
    backgroundColor: ADONIK_THEME.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: ADONIK_THEME.text,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  sortBtnActive: {
    backgroundColor: ADONIK_THEME.primaryLight,
  },
  sortText: {
    fontSize: 11.5,
    color: ADONIK_THEME.textSecondary,
    fontWeight: '500',
  },
  sortTextActive: {
    color: ADONIK_THEME.primaryDark,
    fontWeight: '700',
  },
  subCategoryMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFDF7',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  subCategoryMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subCategoryMetaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400E',
  },
  fastDeliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fastDeliveryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },

  // ─── Products Grid (Matching HomeScreen Exactly) ───
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_W,
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

  // ─── Empty State ───
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    minHeight: 250,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyResetBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
