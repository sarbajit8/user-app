import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useOrderStore, PlacedOrder } from '../../store/orderStore';

const TABS = ['All', 'Processing', 'Shipped', 'Delivered'];

export default function OrdersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('All');
  const orders = useOrderStore((s) => s.orders);

  const getStatusMeta = (status: PlacedOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return {
          color: '#10B981',
          bg: '#ECFDF5',
          icon: 'checkmark-circle' as const,
        };
      case 'Shipped':
      case 'Out for Delivery':
        return {
          color: '#2563EB',
          bg: '#EFF6FF',
          icon: 'car-outline' as const,
        };
      case 'Cancelled':
        return {
          color: '#EF4444',
          bg: '#FEF2F2',
          icon: 'close-circle' as const,
        };
      default:
        return {
          color: '#D97706',
          bg: '#FFFBEB',
          icon: 'time-outline' as const,
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Shipped') {
      return order.status === 'Shipped' || order.status === 'Out for Delivery';
    }
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="shopping-bag" size={20} color={ADONIK_THEME.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = orders.filter((o) => {
            if (tab === 'All') return true;
            if (tab === 'Shipped') return o.status === 'Shipped' || o.status === 'Out for Delivery';
            return o.status.toLowerCase() === tab.toLowerCase();
          }).length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab} {count > 0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id || item.orderNumber}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cube-outline" size={42} color={ADONIK_THEME.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Orders in {activeTab}</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'All'
                ? "You haven't placed any orders yet. Discover trending deals and shop now!"
                : `You don't have any orders currently marked as ${activeTab}.`}
            </Text>
            <TouchableOpacity
              style={styles.startShoppingBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.88}
            >
              <Text style={styles.startShoppingBtnText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const statusMeta = getStatusMeta(item.status);
          const displayThumbnails =
            item.thumbnails && item.thumbnails.length > 0
              ? item.thumbnails
              : item.items && item.items.length > 0
              ? item.items.map((i) => i.image).filter(Boolean) as string[]
              : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'];

          return (
            <View style={styles.orderCard}>
              {/* Header row */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>Order #{item.orderNumber || item.id}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                  <Ionicons
                    name={statusMeta.icon}
                    size={13}
                    color={statusMeta.color}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.statusText, { color: statusMeta.color }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Thumbnail Row */}
              <View style={styles.thumbRow}>
                {displayThumbnails.slice(0, 4).map((uri, idx) => (
                  <View key={idx} style={styles.thumbBox}>
                    <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                  </View>
                ))}
                {displayThumbnails.length > 4 && (
                  <View style={[styles.thumbBox, styles.moreThumbBox]}>
                    <Text style={styles.moreThumbText}>+{displayThumbnails.length - 4}</Text>
                  </View>
                )}
              </View>

              {/* Items & Price Summary */}
              <View style={styles.summaryRow}>
                <Text style={styles.itemsSummary}>
                  {item.itemsCount || item.items?.length || 1}{' '}
                  {(item.itemsCount || item.items?.length || 1) === 1 ? 'item' : 'items'}
                  {item.vendorName ? `  •  ${(item.vendorName as any)?.business_name || item.vendorName}` : ''}
                </Text>
                <Text style={styles.itemsPrice}>₹{item.total.toLocaleString()}</Text>
              </View>

              {/* Payment Method Tag */}
              <View style={styles.paymentTagRow}>
                <View style={styles.paymentMethodPill}>
                  <Text style={styles.paymentMethodPillText}>
                    {item.paymentMethod === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                  </Text>
                </View>
                <Text style={styles.paymentStatusText}>
                  {item.paymentStatus === 'paid' ? '● Paid' : '● Cash on Doorstep'}
                </Text>
              </View>

              {/* Actions row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => navigation.navigate('OrderDetail', { order: item })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => navigation.navigate('OrderDetail', { order: item })}
                  activeOpacity={0.85}
                >
                  <Ionicons name="location-sharp" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.trackBtnText}>Track Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillActive: {
    backgroundColor: ADONIK_THEME.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  startShoppingBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  startShoppingBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    fontFamily: 'monospace',
  },
  orderDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  thumbBox: {
    width: 56,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  moreThumbBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  moreThumbText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  itemsSummary: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  itemsPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: ADONIK_THEME.text,
  },
  paymentTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  paymentMethodPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentMethodPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  paymentStatusText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  trackBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: ADONIK_THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
