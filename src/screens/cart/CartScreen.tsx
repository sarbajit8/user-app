import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useCartStore, useWishlistStore, CartItem } from '../../store/authStore';

export default function CartScreen({ navigation }: any) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const { addItem: addToWishlist, items: wishlistItems } = useWishlistStore();

  const subtotal = items.reduce((acc, curr) => acc + curr.mrp * curr.quantity, 0);
  const discountedTotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalDiscount = subtotal - discountedTotal;

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
      ]
    );
  };

  const handleMoveToWishlist = (item: CartItem) => {
    const alreadyInWishlist = wishlistItems.some((w) => w.product_id === item.product_id);
    if (!alreadyInWishlist) {
      addToWishlist({
        id: Date.now(),
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        image: item.image || '',
        vendor: item.vendor_name,
      });
    }
    removeItem(item.id);
    Alert.alert('Moved to Wishlist', `"${item.name}" has been saved to your wishlist.`);
  };

  // ─── Empty Cart UI ───
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
              style={{ padding: 4 }}
            >
              <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart (0)</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cart-outline" size={56} color={ADONIK_THEME.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything yet.{'\n'}Start shopping and add items here!
          </Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.88}
          >
            <Ionicons name="bag-handle-outline" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.shopNowBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
            style={{ padding: 4 }}
          >
            <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart ({items.length})</Text>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cartCard}>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/88' }}
              style={styles.itemImg}
              resizeMode="cover"
            />

            <View style={styles.itemInfo}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                {/* Move to Wishlist (heart) */}
                <TouchableOpacity
                  onPress={() => handleMoveToWishlist(item)}
                  style={styles.wishlistIconBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="heart-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {item.variant_name ? (
                <View style={styles.variantBadge}>
                  <Text style={styles.variantBadgeText}>{item.variant_name}</Text>
                </View>
              ) : null}

              <View style={styles.priceRow}>
                <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                {item.mrp > item.price && (
                  <Text style={styles.itemMrp}>₹{item.mrp.toLocaleString()}</Text>
                )}
                {item.mrp > item.price && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>
                      {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% off
                    </Text>
                  </View>
                )}
              </View>

              {/* Quantity Controls + Delete */}
              <View style={styles.qtyRow}>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="minus"
                      size={14}
                      color={item.quantity <= 1 ? '#CBD5E1' : ADONIK_THEME.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus" size={14} color={ADONIK_THEME.text} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotalPrice}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Text>

                {/* Delete */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemoveItem(item)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.soldBy}>
                Sold by: {(item.vendor_name as any)?.business_name || (item.vendor_name as any)?.name || item.vendor_name || 'Seller'}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.priceDetailsCard}>
            <Text style={styles.priceDetailsTitle}>Price Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                MRP Total ({items.reduce((a, i) => a + i.quantity, 0)} items)
              </Text>
              <Text style={styles.detailVal}>₹{subtotal.toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Product Discount</Text>
              <Text style={[styles.detailVal, { color: '#15803D' }]}>- ₹{totalDiscount.toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivery Charge</Text>
              <Text style={[styles.detailVal, { color: '#15803D', fontWeight: '700' }]}>FREE</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{discountedTotal.toLocaleString()}</Text>
            </View>

            {totalDiscount > 0 && (
              <View style={styles.savingsBar}>
                <Ionicons name="pricetag" size={13} color="#15803D" style={{ marginRight: 4 }} />
                <Text style={styles.savingsText}>
                  You save ₹{totalDiscount.toLocaleString()} on this order!
                </Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Bottom Checkout Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotalBox}>
          <Text style={styles.bottomTotalLabel}>Total Payable</Text>
          <Text style={styles.bottomTotalVal}>₹{discountedTotal.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: ADONIK_THEME.text },
  clearAllText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 28,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  shopNowBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // List
  listContent: { padding: 12, gap: 12, paddingBottom: 120 },

  // Cart Card
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECEF',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImg: {
    width: 88,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    flex: 1,
    marginRight: 6,
    lineHeight: 18,
  },
  wishlistIconBtn: { padding: 2 },
  variantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 2,
  },
  variantBadgeText: { fontSize: 10.5, color: '#475569', fontWeight: '600' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  itemPrice: { fontSize: 15.5, fontWeight: '700', color: ADONIK_THEME.text },
  itemMrp: { fontSize: 11.5, color: '#94A3B8', textDecorationLine: 'line-through' },
  saveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  saveBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#15803D' },
  soldBy: { fontSize: 10.5, color: '#94A3B8', marginTop: 5, fontStyle: 'italic' },

  // Qty Row
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  qtyBtn: { paddingHorizontal: 9, paddingVertical: 5 },
  qtyText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotalPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: ADONIK_THEME.primaryDark,
    flex: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Price Details Card
  priceDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECEF',
    marginTop: 4,
  },
  priceDetailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    marginBottom: 14,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 13, color: '#64748B' },
  detailVal: { fontSize: 13, fontWeight: '600', color: ADONIK_THEME.text },
  divider: { height: 1, backgroundColor: '#F1F3F5', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: ADONIK_THEME.text },
  totalVal: { fontSize: 18, fontWeight: '800', color: ADONIK_THEME.text },
  savingsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  savingsText: { fontSize: 12, fontWeight: '600', color: '#15803D' },

  // Bottom Checkout Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomTotalBox: { flex: 1 },
  bottomTotalLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  bottomTotalVal: { fontSize: 18, fontWeight: '800', color: ADONIK_THEME.text },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
