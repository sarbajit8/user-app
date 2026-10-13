import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';
import { useCartStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function WishlistScreen({ navigation }: any) {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalItems());

  const handleRemove = (id: number | string) => {
    removeItem(id);
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: Number(item.id) || Date.now(),
      product_id: Number(item.id) || Date.now(),
      variant_id: null,
      vendor_id: 1,
      name: item.name,
      image: item.image,
      price: item.price,
      mrp: item.mrp || item.originalPrice || item.price,
      quantity: 1,
      vendor_name:
        (typeof item.vendor === 'object' && item.vendor !== null
          ? item.vendor.business_name || item.vendor.name
          : item.vendor) || 'Adonik Merchant',
      variant_name: null,
    });
    Alert.alert('Added to Cart! 🛍️', `${item.name} has been added to your cart.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist ({items.length})</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons name="cart-outline" size={22} color={ADONIK_THEME.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={48} color={ADONIK_THEME.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite items here to purchase later or track discounts.
          </Text>
          <TouchableOpacity
            style={styles.startShopBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.startShopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Product Thumbnail */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.productImage} />
              </TouchableOpacity>

              {/* Product Info */}
              <TouchableOpacity
                style={styles.infoCol}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id, product: item })}
                activeOpacity={0.8}
              >
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>₹ {item.price.toLocaleString()}</Text>
                
                {/* Rating Row */}
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.reviewsCount})</Text>
                </View>
              </TouchableOpacity>

              {/* Right Action Column */}
              <View style={styles.actionCol}>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  style={styles.heartBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="heart" size={22} color="#EF4444" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: ADONIK_THEME.text,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  reviewCount: {
    fontSize: 12,
    color: ADONIK_THEME.textMuted,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 72,
  },
  heartBtn: {
    padding: 2,
  },
  addToCartBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: ADONIK_THEME.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ADONIK_THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: ADONIK_THEME.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  startShopBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  startShopBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
