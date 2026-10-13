import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useOrderStore, PlacedOrder } from '../../store/orderStore';

export default function OrderDetailScreen({ route, navigation }: any) {
  const routeOrder: PlacedOrder = route?.params?.order;
  const orderId = routeOrder?.id || routeOrder?.orderNumber;

  const getOrderById = useOrderStore((s) => s.getOrderById);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);

  const order: PlacedOrder = getOrderById(orderId) || routeOrder || {
    id: 'ADK-892104',
    orderNumber: 'ADK-892104',
    date: 'Placed on 25 Sep, 2026',
    status: 'Processing',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    total: 2399,
    subtotal: 2999,
    discount: 600,
    shipping: 0,
    couponCode: 'ADONIK10',
    itemsCount: 1,
    vendorName: 'Shruti Creation',
    deliveryOption: 'standard',
    deliveryAddress: {
      name: 'Sarbajit Paul',
      phone: '+91 98765 43210',
      addressLine: 'Vill - Haripal, P.O - Haripal',
      city: 'Hooghly',
      state: 'West Bengal',
      pincode: '712405',
      type: 'Home',
    },
    thumbnails: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    ],
    items: [
      {
        id: 100,
        product_id: 100,
        variant_id: null,
        vendor_id: 1,
        name: 'Banarasi Silk Saree',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        price: 2399,
        mrp: 2999,
        quantity: 1,
        vendor_name: 'Shruti Creation',
        variant_name: '(Gold | Free Size)',
      },
    ],
    trackingSteps: [],
  };

  const getStatusBadge = (status: PlacedOrder['status']) => {
    switch (status) {
      case 'Delivered':
        return { color: '#10B981', bg: '#ECFDF5', label: 'Delivered' };
      case 'Shipped':
      case 'Out for Delivery':
        return { color: '#2563EB', bg: '#EFF6FF', label: status };
      case 'Cancelled':
        return { color: '#EF4444', bg: '#FEF2F2', label: 'Cancelled' };
      default:
        return { color: '#D97706', bg: '#FFFBEB', label: 'Processing' };
    }
  };

  interface TrackingTimelineStep {
    title: string;
    desc?: string;
    time: string;
    done: boolean;
    isError?: boolean;
  }

  // Generate dynamic tracking steps based on actual order status
  const buildTrackingSteps = (): TrackingTimelineStep[] => {
    const isCancelled = order.status === 'Cancelled';
    if (isCancelled) {
      return [
        { title: 'Order Placed', desc: 'Order was submitted', time: order.date, done: true },
        { title: 'Order Cancelled', desc: 'Refund processed to source', time: 'Cancelled', done: true, isError: true },
      ];
    }

    const isDelivered = order.status === 'Delivered';
    const isOutForDelivery = isDelivered || order.status === 'Out for Delivery';
    const isShipped = isOutForDelivery || order.status === 'Shipped';
    const isProcessing = true;

    return [
      {
        title: 'Order Placed & Verified',
        desc: 'We received your order successfully',
        time: order.date,
        done: true,
      },
      {
        title: 'Packed & Dispatched from Warehouse',
        desc: `Fulfilled by ${order.vendorName || 'Merchant'}`,
        time: isShipped ? 'Processed within 24h' : 'In Preparation',
        done: isShipped || isProcessing,
      },
      {
        title: 'Shipped via Express Courier',
        desc: 'AWB #ADK-' + Math.floor(100000 + Math.random() * 900000),
        time: isShipped ? 'In Transit' : 'Pending handover',
        done: isShipped,
      },
      {
        title: 'Out for Doorstep Delivery',
        desc: 'Courier executive assigned',
        time: isOutForDelivery ? 'Today, before 7 PM' : 'Upcoming',
        done: isOutForDelivery,
      },
      {
        title: 'Package Delivered',
        desc: 'Delivered to your address with OTP verification',
        time: isDelivered ? 'Delivered successfully' : 'Expected in 3-5 days',
        done: isDelivered,
      },
    ];
  };

  const trackingSteps = buildTrackingSteps();
  const statusMeta = getStatusBadge(order.status);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel Order #${order.orderNumber || order.id}?`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: () => {
            cancelOrder(order.id);
            Alert.alert('Order Cancelled', 'Your order has been cancelled.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Order #{order.orderNumber || order.id}</Text>
          <Text style={styles.headerSub}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Tracking Timeline Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="location-sharp" size={18} color={ADONIK_THEME.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Live Shipment Tracking</Text>
          </View>

          <View style={styles.timeline}>
            {trackingSteps.map((step, idx) => {
              const isLast = idx === trackingSteps.length - 1;
              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.timelineCircle,
                        step.done && styles.timelineCircleDone,
                        (step as any).isError && styles.timelineCircleError,
                      ]}
                    >
                      <Ionicons
                        name={
                          (step as any).isError
                            ? 'close'
                            : step.done
                            ? 'checkmark'
                            : 'radio-button-off'
                        }
                        size={12}
                        color={step.done ? '#FFFFFF' : '#94A3B8'}
                      />
                    </View>
                    {!isLast && (
                      <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                    )}
                  </View>

                  <View style={styles.stepContentCol}>
                    <Text style={[styles.stepTitle, step.done && styles.stepTitleDone]}>
                      {step.title}
                    </Text>
                    {step.desc ? <Text style={styles.stepDesc}>{step.desc}</Text> : null}
                    <Text style={styles.stepTime}>{step.time}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ordered Items */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="bag-check" size={18} color={ADONIK_THEME.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>
              Items in this Order ({order.items?.length || 1})
            </Text>
          </View>

          {(order.items && order.items.length > 0 ? order.items : []).map((item, idx) => (
            <View key={item.id || idx} style={styles.itemRow}>
              <Image
                source={{ uri: item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' }}
                style={styles.itemThumb}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemVariant}>
                  Sold by: {(item.vendor_name as any)?.business_name || (order.vendorName as any)?.business_name || item.vendor_name || order.vendorName || 'Shruti Creation'}
                </Text>
                <View style={styles.itemPriceQtyRow}>
                  <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>Qty: {item.quantity || 1}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="home-outline" size={18} color={ADONIK_THEME.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addrName}>
              {order.deliveryAddress?.name || 'Sarbajit Paul'}
            </Text>
            <Text style={styles.addrDetails}>
              {order.deliveryAddress?.addressLine || 'Vill - Haripal, P.O - Haripal, Hooghly'},{' '}
              {order.deliveryAddress?.city || 'Hooghly'}, {order.deliveryAddress?.state || 'West Bengal'} -{' '}
              {order.deliveryAddress?.pincode || '712405'}
            </Text>
            <Text style={styles.addrPhone}>
              Phone: {order.deliveryAddress?.phone || '+91 98765 43210'}
            </Text>
          </View>
        </View>

        {/* Payment & Price Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="card-outline" size={18} color={ADONIK_THEME.primary} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>Payment & Invoice Breakdown</Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Payment Mode:</Text>
            <Text style={styles.infoVal}>
              {order.paymentMethod === 'razorpay'
                ? 'Online Payment (Razorpay UPI/Cards)'
                : 'Cash on Delivery (COD)'}
            </Text>
          </View>

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Payment Status:</Text>
            <Text
              style={[
                styles.infoVal,
                { color: order.paymentStatus === 'paid' ? '#16A34A' : '#D97706', fontWeight: '700' },
              ]}
            >
              {order.paymentStatus === 'paid' ? 'PAID (Verified)' : 'PENDING (Pay upon delivery)'}
            </Text>
          </View>

          {order.couponCode ? (
            <View style={styles.infoLine}>
              <Text style={styles.infoLabel}>Coupon Applied:</Text>
              <Text style={[styles.infoVal, { color: '#16A34A', fontWeight: '700' }]}>
                {order.couponCode} (-₹{order.discount || 0})
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.infoLine}>
            <Text style={styles.infoLabel}>Total Order Amount:</Text>
            <Text style={styles.infoPrice}>₹{order.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.invoiceBtn}
            onPress={() => Alert.alert('Tax Invoice Downloaded', `Invoice for Order #${order.orderNumber || order.id} has been saved to your downloads.`)}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={16} color={ADONIK_THEME.primaryDark} style={{ marginRight: 6 }} />
            <Text style={styles.invoiceBtnText}>Download Invoice</Text>
          </TouchableOpacity>

          {order.status === 'Processing' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelOrder}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: ADONIK_THEME.text },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: ADONIK_THEME.text },

  // Timeline
  timeline: { paddingLeft: 4, marginTop: 4 },
  timelineRow: { flexDirection: 'row', marginBottom: 14 },
  indicatorCol: { alignItems: 'center', width: 24, marginRight: 12 },
  timelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleDone: { backgroundColor: '#10B981' },
  timelineCircleError: { backgroundColor: '#EF4444' },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    minHeight: 28,
  },
  timelineLineDone: { backgroundColor: '#10B981' },
  stepContentCol: { flex: 1, paddingTop: 1 },
  stepTitle: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  stepTitleDone: { color: ADONIK_THEME.text, fontWeight: '700' },
  stepDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  stepTime: { fontSize: 10.5, color: '#94A3B8', marginTop: 3 },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemThumb: {
    width: 64,
    height: 74,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemTitle: { fontSize: 13, fontWeight: '600', color: ADONIK_THEME.text },
  itemVariant: { fontSize: 11, color: '#64748B', marginTop: 2 },
  itemPriceQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  itemPrice: { fontSize: 13.5, fontWeight: '700', color: ADONIK_THEME.text },
  qtyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qtyBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  // Address
  addressBox: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12 },
  addrName: { fontSize: 13.5, fontWeight: '700', color: ADONIK_THEME.text },
  addrDetails: { fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 4 },
  addrPhone: { fontSize: 11.5, color: '#64748B', marginTop: 4 },

  // Payment
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 12.5, color: '#64748B' },
  infoVal: { fontSize: 12.5, fontWeight: '600', color: ADONIK_THEME.text },
  infoPrice: { fontSize: 16, fontWeight: '800', color: ADONIK_THEME.primary },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },

  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  invoiceBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceBtnText: { fontSize: 13, fontWeight: '600', color: ADONIK_THEME.primaryDark },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
});
