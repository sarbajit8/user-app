import { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useWishlistStore, useCartStore } from '../../store/authStore';
import { ALL_PRODUCTS_CATALOG, CatalogProduct } from '../../constants/productsCatalog';

const CATEGORY_FILTERS = [
  'All',
  'Electronics',
  'Mobiles',
  'Footwear',
  'Fashion',
  'Watches',
  'Appliances',
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
];

export default function SearchScreen({ route, navigation }: any) {
  const initialQuery = route?.params?.query || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [showSortBar, setShowSortBar] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalItems());

  // Backend fetched products combined with catalog
  const [backendProducts, setBackendProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApiProducts = async () => {
      try {
        setLoading(true);
        const host =
          typeof window !== 'undefined' && window.location?.hostname
            ? window.location.hostname
            : '127.0.0.1';
        const res = await fetch(`http://${host}:8000/api/v1/products?per_page=50`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            setBackendProducts(json.data);
          }
        }
      } catch {}
      setLoading(false);
    };

    fetchApiProducts();
  }, []);

  // Combined master catalog
  const allProducts = useMemo(() => {
    const map = new Map<string | number, any>();
    // First seed catalog products
    ALL_PRODUCTS_CATALOG.forEach((p) => map.set(p.id, p));

    // Then merge backend items
    backendProducts.forEach((p: any) => {
      const existing = map.get(p.id) || map.get(Number(p.id));
      const normalizedPrice = Number(p.sale_price || p.price || existing?.price || 999);
      const normalizedMrp = Number(p.regular_price || p.mrp || existing?.mrp || normalizedPrice);
      const discount =
        normalizedMrp > normalizedPrice
          ? Math.round(((normalizedMrp - normalizedPrice) / normalizedMrp) * 100)
          : existing?.discount || null;

      map.set(p.id, {
        id: p.id,
        name: p.name || existing?.name,
        brand: p.brand?.name || p.brand || existing?.brand || 'Adonik Verified',
        vendor: p.vendor?.business_name || p.vendor || existing?.vendor || 'Adonik Direct',
        price: normalizedPrice,
        mrp: normalizedMrp,
        discount: discount,
        rating: Number(p.rating || p.vendor?.rating || existing?.rating || 4.7),
        reviews: p.reviews_count || p.reviews || existing?.reviews || '84',
        image: p.image || p.thumbnail_url || (Array.isArray(p.images) ? p.images[0] : null) || existing?.image,
        category: p.category?.name || p.category || existing?.category || 'General',
        delivery: p.delivery || existing?.delivery || 'Free Express Delivery',
      });
    });

    return Array.from(map.values());
  }, [backendProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // Search query matching
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(q);
        const brandMatch = item.brand?.toLowerCase().includes(q);
        const catMatch = item.category?.toLowerCase().includes(q);
        const vendorMatch = item.vendor?.toLowerCase().includes(q);
        return nameMatch || brandMatch || catMatch || vendorMatch;
      });
    }

    // Category filter
    if (selectedTag !== 'All') {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter((item) => {
        const cat = item.category?.toLowerCase() || '';
        const name = item.name?.toLowerCase() || '';
        if (tagLower === 'mobiles') return cat.includes('mobile') || name.includes('phone') || name.includes('iphone');
        if (tagLower === 'footwear') return cat.includes('footwear') || cat.includes('shoe') || name.includes('sneaker') || name.includes('shoe') || name.includes('nike');
        if (tagLower === 'watches') return cat.includes('watch') || name.includes('watch') || name.includes('seiko');
        if (tagLower === 'electronics') return cat.includes('electronic') || name.includes('headphone') || name.includes('power') || name.includes('tv');
        if (tagLower === 'fashion') return cat.includes('fashion') || cat.includes('ethnic') || name.includes('saree') || name.includes('jean');
        if (tagLower === 'appliances') return cat.includes('appliance') || name.includes('tv') || name.includes('light');
        return cat.includes(tagLower);
      });
    }

    // Sorting
    const sorted = [...list];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return sorted;
  }, [allProducts, query, selectedTag, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Flipkart / Amazon Style Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.searchInputWrap}>
          <Feather name="search" size={17} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands and more..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 2 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortToggleBtn}
          onPress={() => setShowSortBar((prev) => !prev)}
        >
          <Feather name="sliders" size={19} color={showSortBar ? ADONIK_THEME.primary : '#0F172A'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Feather name="shopping-bag" size={20} color="#0F172A" />
          {cartCount > 0 && (
            <View style={styles.cartBadgeSmall}>
              <Text style={styles.cartBadgeSmallText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Pills Row */}
      <View style={styles.pillRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}
          renderItem={({ item }) => {
            const isSelected = selectedTag === item;
            return (
              <TouchableOpacity
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setSelectedTag(item)}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Expandable Sort Bar */}
      {showSortBar && (
        <View style={styles.sortBar}>
          <Text style={styles.sortBarLabel}>Sort by:</Text>
          <View style={styles.sortOptionsRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, sortBy === opt.id && styles.sortChipActive]}
                onPress={() => setSortBy(opt.id)}
              >
                <Text
                  style={[styles.sortChipText, sortBy === opt.id && styles.sortChipTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Count Header */}
      <View style={styles.resultCountBar}>
        <Text style={styles.resultCountText}>
          Showing {filteredProducts.length} genuine product{filteredProducts.length === 1 ? '' : 's'}
          {query ? ` for "${query}"` : ''}
          {selectedTag !== 'All' ? ` in ${selectedTag}` : ''}
        </Text>
      </View>

      {/* Product List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={ADONIK_THEME.primary} />
          <Text style={styles.loadingText}>Searching catalog...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="search-outline" size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySub}>
            We couldn't find any genuine products matching your criteria. Try adjusting your search or filters.
          </Text>
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => {
              setQuery('');
              setSelectedTag('All');
            }}
          >
            <Text style={styles.clearFilterBtnText}>View All Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isWish = isInWishlist(item.id);
            const isAssured = Boolean(
              (item as any).is_assured ||
              (item as any).is_admin_product ||
              String(item.vendor).toLowerCase().includes('assured') ||
              String(item.vendor).toLowerCase().includes('admin') ||
              String(item.brand).toLowerCase().includes('assured')
            );
            const discountVal =
              item.discount ||
              (item.mrp && item.mrp > item.price
                ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                : null);

            return (
              <TouchableOpacity
                style={styles.productRowCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
                activeOpacity={0.88}
              >
                {/* Product Thumbnail */}
                <View style={styles.thumbWrapper}>
                  <Image source={{ uri: item.image }} style={styles.productThumb} resizeMode="contain" />
                  {discountVal && (
                    <View style={styles.thumbDiscountBadge}>
                      <Text style={styles.thumbDiscountText}>{discountVal}% OFF</Text>
                    </View>
                  )}
                </View>

                {/* Info Container */}
                <View style={styles.productInfo}>
                  <View style={styles.titleWishRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      {item.brand && (
                        <Text style={styles.brandNameText}>{item.brand.toUpperCase()}</Text>
                      )}
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                      style={styles.wishBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isWish ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isWish ? '#EF4444' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={11} color="#FFFFFF" />
                      <Text style={styles.ratingNum}>{item.rating || 4.8}</Text>
                    </View>
                    <Text style={styles.reviewNum}>({item.reviews || 86})</Text>
                    {isAssured ? (
                      <View style={styles.fAssuredBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#0284C7" />
                        <Text style={styles.fAssuredText}>Adonik Assured</Text>
                      </View>
                    ) : (
                      <View style={[styles.fAssuredBadge, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[styles.fAssuredText, { color: '#64748B' }]}>Adonik Verified</Text>
                      </View>
                    )}
                  </View>

                  {/* Pricing Row */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{Number(item.price).toLocaleString()}</Text>
                    {item.mrp && item.mrp > item.price && (
                      <Text style={styles.mrp}>₹{Number(item.mrp).toLocaleString()}</Text>
                    )}
                    {discountVal && (
                      <Text style={styles.discountHighlight}>{discountVal}% off</Text>
                    )}
                  </View>

                  {/* Delivery and Quick Add */}
                  <View style={styles.bottomMetaRow}>
                    <Text style={styles.deliveryText}>
                      🟢 {item.delivery || 'Free Express Delivery'}
                    </Text>
                    <TouchableOpacity
                      style={styles.quickAddCartBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        addItem({
                          id: Number(item.id),
                          product_id: Number(item.id),
                          name: item.name,
                          price: item.price,
                          mrp: item.mrp || item.price,
                          image: item.image,
                          vendor_id: 1,
                          vendor_name: item.vendor || 'Adonik Direct',
                          variant_id: null,
                          variant_name: null,
                          quantity: 1,
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Feather name="plus" size={14} color="#FFFFFF" />
                      <Text style={styles.quickAddText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A', fontWeight: '500' },
  sortToggleBtn: {
    padding: 6,
  },
  cartIconBtn: {
    padding: 6,
    position: 'relative',
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
  cartBadgeSmallText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },

  pillRow: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillSelected: {
    backgroundColor: ADONIK_THEME.primary,
    borderColor: ADONIK_THEME.primary,
  },
  pillText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  pillTextSelected: { color: '#FFFFFF', fontWeight: '700' },

  sortBar: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sortBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  sortChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  sortChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  resultCountBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultCountText: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  listContent: { padding: 12, gap: 10, backgroundColor: '#F8F9FA' },

  productRowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbWrapper: {
    width: 96,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  thumbDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbDiscountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: { flex: 1, justifyContent: 'space-between' },
  titleWishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandNameText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
  },
  wishBtn: { padding: 4 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  ratingNum: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF' },
  reviewNum: { fontSize: 10.5, color: '#94A3B8' },
  fAssuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3.5,
  },
  fAssuredText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 5 },
  price: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  mrp: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  discountHighlight: { fontSize: 11.5, fontWeight: '700', color: '#16A34A' },

  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  deliveryText: { fontSize: 10.5, color: '#16A34A', fontWeight: '600' },
  quickAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  clearFilterBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  clearFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
