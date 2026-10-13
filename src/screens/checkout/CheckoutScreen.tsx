import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useCartStore, useAuthStore, CartItem } from '../../store/authStore';
import { useAddressStore, UserAddress } from '../../store/addressStore';
import { useOrderStore, PlacedOrder } from '../../store/orderStore';
import axios from 'axios';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const getBaseApiUrl = () => {
  if (Platform.OS === 'android') {
    return (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000') + '/api/v1';
  }
  return (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1';
};

interface AvailableCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  description: string;
  vendor_id?: number | null;
}

const FALLBACK_AVAILABLE_COUPONS: AvailableCoupon[] = [
  {
    code: 'ADONIK10',
    type: 'percentage',
    value: 10,
    min_order_amount: 999,
    description: '10% OFF on all orders above ₹999',
  },
  {
    code: 'WELCOME50',
    type: 'fixed',
    value: 50,
    min_order_amount: 499,
    description: 'Flat ₹50 OFF for welcome buyers',
  },
  {
    code: 'SHRUTI15',
    type: 'percentage',
    value: 15,
    min_order_amount: 1999,
    description: '15% OFF on Shruti Creation silk & ethnic wear',
    vendor_id: 1,
  },
  {
    code: 'FESTIVE20',
    type: 'percentage',
    value: 20,
    min_order_amount: 2999,
    description: '20% OFF festive mega discount',
  },
];

export default function CheckoutScreen({ navigation, route }: any) {
  // ─── Direct Buy vs Regular Cart Mode ───
  const isDirectBuy: boolean = Boolean(route?.params?.isDirectBuy);
  const directBuyItem: CartItem | undefined = route?.params?.buyNowItem;

  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  // If Direct Buy, ONLY use the passed product; otherwise use the cart items
  const checkoutItems: CartItem[] = isDirectBuy && directBuyItem ? [directBuyItem] : cartItems;

  const { isAuthenticated, user, token, setAuth } = useAuthStore();
  const { addresses, getDefaultAddress } = useAddressStore();
  const selectedAddressId = route?.params?.selectedAddressId;
  const selectedAddress: UserAddress | undefined =
    addresses.find((a) => a.id === selectedAddressId) || getDefaultAddress() || addresses[0];

  // ─── Delivery & Payment State ───
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<PlacedOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Coupon State ───
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>(FALLBACK_AVAILABLE_COUPONS);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // ─── Razorpay Modal & Key State ───
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_1DP5mmOlF5G5ag');
  const [razorpayProcessing, setRazorpayProcessing] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');

  // ─── Auth Gate Popup Modal State ───
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState<'otp' | 'google'>('otp');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [displayedOtp, setDisplayedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isNewUserStep, setIsNewUserStep] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const otpInputsRef = useRef<Array<TextInput | null>>([]);

  // Fetch available coupons and Admin Razorpay Key on mount
  useEffect(() => {
    const fetchCheckoutSettings = async () => {
      try {
        const res = await axios.get(`${getBaseApiUrl()}/app-settings`, { timeout: 3500 });
        if (res.data?.success && res.data?.data) {
          if (res.data.data.razorpay_key_id) {
            setRazorpayKeyId(res.data.data.razorpay_key_id);
          }
        }
      } catch (_) {}

      try {
        const couponRes = await axios.get(`${getBaseApiUrl()}/coupons`, { timeout: 3500 });
        if (couponRes.data?.success && Array.isArray(couponRes.data.data) && couponRes.data.data.length > 0) {
          setAvailableCoupons(couponRes.data.data);
        }
      } catch (_) {}
    };

    fetchCheckoutSettings();
  }, []);

  // Compute pricing strictly based on checkoutItems
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const mrpTotal = checkoutItems.reduce(
    (sum, item) => sum + (item.mrp || item.price) * (item.quantity || 1),
    0
  );
  const catalogSavings = Math.max(0, mrpTotal - subtotal);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = deliveryOption === 'standard' ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  // ─── Coupon Validation ───
  const handleApplyCoupon = async (codeToApply?: string) => {
    const rawCode = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!rawCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const vendorId = checkoutItems[0]?.vendor_id || 1;
      const productId = checkoutItems[0]?.product_id || checkoutItems[0]?.id;

      const res = await axios.post(
        `${getBaseApiUrl()}/coupons/validate`,
        {
          code: rawCode,
          order_amount: subtotal,
          vendor_id: vendorId,
          product_id: productId,
        },
        { timeout: 4000 }
      );

      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setAppliedCoupon({
          code: d.code,
          discount: Number(d.discount_amount) || 0,
          description: d.description || `Coupon ${d.code} applied successfully!`,
        });
        setCouponCodeInput('');
        Alert.alert('Coupon Applied! 🎉', `You saved ₹${d.discount_amount} with ${d.code}!`);
        return;
      }
    } catch (e: any) {
      // Fallback local verification for offline resilience
      const match = availableCoupons.find((c) => c.code.toUpperCase() === rawCode);
      if (match) {
        if (subtotal < match.min_order_amount) {
          setCouponError(`Min order amount for ${match.code} is ₹${match.min_order_amount}`);
          return;
        }

        let calculatedDiscount = 0;
        if (match.type === 'percentage') {
          calculatedDiscount = Math.round((subtotal * match.value) / 100);
        } else {
          calculatedDiscount = match.value;
        }

        setAppliedCoupon({
          code: match.code,
          discount: calculatedDiscount,
          description: match.description,
        });
        setCouponCodeInput('');
        Alert.alert('Coupon Applied! 🎉', `You saved ₹${calculatedDiscount} with ${match.code}!`);
        return;
      }

      const msg = e?.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ─── Final Order Submission ───
  const finalizeOrderPlacement = async (paymentRefId?: string) => {
    setIsSubmitting(true);
    const generatedOrderId = `ADK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await axios.post(
        `${getBaseApiUrl()}/checkout/place-order`,
        {
          items: checkoutItems,
          delivery_option: deliveryOption,
          payment_method: paymentMethod,
          payment_id: paymentRefId || null,
          coupon_code: appliedCoupon?.code || null,
          discount_amount: couponDiscount,
          shipping_amount: shippingFee,
          total_amount: finalTotal,
          is_direct_buy: isDirectBuy,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          timeout: 5000,
        }
      );
    } catch (_) {
      // Offline fallback: order succeeds locally
    } finally {
      setIsSubmitting(false);
      setRazorpayModalVisible(false);
      setConfirmedOrderId(generatedOrderId);

      // Create full PlacedOrder object and persist into useOrderStore
      const newPlacedOrder: PlacedOrder = {
        id: generatedOrderId,
        orderNumber: generatedOrderId,
        date: `Placed on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        status: 'Processing',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
        total: finalTotal,
        subtotal: subtotal,
        discount: couponDiscount,
        shipping: shippingFee,
        couponCode: appliedCoupon?.code || null,
        items: checkoutItems,
        itemsCount: checkoutItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
        vendorName: checkoutItems[0]?.vendor_name || 'Shruti Creation',
        deliveryOption: deliveryOption,
        deliveryAddress: selectedAddress || {
          name: user?.name || 'Sarbajit Paul',
          phone: user?.phone || '+91 98765 43210',
          addressLine: 'Vill - Haripal, P.O - Haripal, Hooghly',
          city: 'Hooghly',
          state: 'West Bengal',
          pincode: '712405',
          type: 'Home',
        },
        trackingSteps: [
          { step: 'Order Placed & Verified', time: 'Just now', done: true },
          { step: 'Packed & Dispatched from Warehouse', time: 'Pending fulfillment', done: false },
          { step: 'Shipped via Express Courier', time: 'Upcoming', done: false },
          { step: 'Out for Doorstep Delivery', time: 'Upcoming', done: false },
          { step: 'Package Delivered', time: 'Expected in 3-5 days', done: false },
        ],
        thumbnails: checkoutItems.map((i) => i.image).filter(Boolean) as string[],
      };

      useOrderStore.getState().addOrder(newPlacedOrder);
      setLastCreatedOrder(newPlacedOrder);

      // CRITICAL: If Direct Buy, DO NOT clear the cart! Only clear if checking out standard cart.
      if (!isDirectBuy) {
        clearCart();
      }

      setOrderPlaced(true);
    }
  };

  // ─── Continue / Place Order CTA ───
  const handleProceed = () => {
    if (checkoutItems.length === 0) {
      Alert.alert('No Items', 'Your checkout has no items. Please select a product to purchase.');
      return;
    }

    // Require Auth Check
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }

    // Require Delivery Address Check
    if (!selectedAddress) {
      Alert.alert(
        'Delivery Address Required',
        'Please add a delivery address before placing your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: '+ Add Address',
            onPress: () => navigation.navigate('AddressManage', { selectMode: true }),
          },
        ]
      );
      return;
    }

    if (paymentMethod === 'razorpay') {
      setRazorpayModalVisible(true);
    } else {
      Alert.alert(
        'Confirm Cash on Delivery',
        `Place order for ₹${finalTotal.toLocaleString()} to be paid in cash upon delivery?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Order',
            onPress: () => finalizeOrderPlacement(),
          },
        ]
      );
    }
  };

  // ─── Razorpay Simulated Online Payment Flow ───
  const handleRazorpayPayment = () => {
    setRazorpayProcessing(true);
    setTimeout(() => {
      setRazorpayProcessing(false);
      const fakePayId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
      finalizeOrderPlacement(fakePayId);
    }, 1800);
  };

  // ─── Auth Gate Popup Handlers ───
  const handleSendOtp = async () => {
    if (!phoneOrEmail.trim()) {
      Alert.alert('Required', 'Please enter your mobile number or email.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(`${getBaseApiUrl()}/auth/send-otp`, {
        phone_or_email: phoneOrEmail.trim(),
        type: 'login',
      });

      const serverOtp = res.data?.data?.otp || '482910';
      setDisplayedOtp(serverOtp);
      setOtpSent(true);
    } catch (_) {
      // Offline demo fallback OTP
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDisplayedOtp(fallbackOtp);
      setOtpSent(true);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFillOtp = () => {
    if (displayedOtp && displayedOtp.length === 6) {
      setEnteredOtp(displayedOtp.split(''));
    }
  };

  const handleOtpChange = (txt: string, index: number) => {
    // If multi-digit pasted (e.g. 6-digit OTP)
    const clean = txt.replace(/[^0-9]/g, '');
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split('');
      const updated = [...enteredOtp];
      digits.forEach((d, idx) => {
        if (idx < 6) updated[idx] = d;
      });
      setEnteredOtp(updated);
      const nextIdx = Math.min(5, digits.length - 1);
      otpInputsRef.current[nextIdx]?.focus();
      return;
    }

    const copy = [...enteredOtp];
    copy[index] = clean;
    setEnteredOtp(copy);

    if (clean && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!enteredOtp[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
        const copy = [...enteredOtp];
        copy[index - 1] = '';
        setEnteredOtp(copy);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const code = enteredOtp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits of the verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await axios.post(`${getBaseApiUrl()}/auth/verify-otp`, {
        phone_or_email: phoneOrEmail.trim(),
        otp: code,
        name: newName.trim() || undefined,
        age: newAge.trim() ? Number(newAge.trim()) : undefined,
      });

      if (res.data?.data?.is_new_user && !res.data?.data?.user) {
        // Prompt for Name and Age
        setIsNewUserStep(true);
        setOtpLoading(false);
        return;
      }

      if (res.data?.data?.user && res.data?.data?.token) {
        setAuth(res.data.data.user, res.data.data.token);
        setAuthModalVisible(false);
        resetAuthModal();
        Alert.alert('Welcome! 👋', `Logged in as ${res.data.data.user.name}. You can now complete your order.`);
        return;
      }
    } catch (_) {}

    // Fallback: If new user needs details
    if (!isNewUserStep && !newName) {
      setIsNewUserStep(true);
      setOtpLoading(false);
      return;
    }

    // Complete local guest login
    const newUserObj = {
      id: Date.now(),
      name: newName.trim() || 'Verified Customer',
      age: newAge.trim() ? Number(newAge.trim()) : 25,
      email: phoneOrEmail.includes('@') ? phoneOrEmail.trim() : null,
      phone: !phoneOrEmail.includes('@') ? phoneOrEmail.trim() : null,
      avatar: null,
    };
    setAuth(newUserObj, `token_${Date.now()}`);
    setAuthModalVisible(false);
    resetAuthModal();
    Alert.alert('Signed In Successfully! 🎉', 'You are now ready to place your order.');
    setOtpLoading(false);
  };

  const handleGoogleDirectLogin = async () => {
    setOtpLoading(true);
    try {
      const res = await axios.post(`${getBaseApiUrl()}/auth/social-login`, {
        provider: 'google',
        provider_token: 'google_mock_token_' + Date.now(),
        email: 'paula.smith@gmail.com',
        name: 'Paula Smith',
      });

      if (res.data?.data?.user && res.data?.data?.token) {
        setAuth(res.data.data.user, res.data.data.token);
      } else {
        throw new Error();
      }
    } catch (_) {
      const googleUser = {
        id: Date.now(),
        name: 'Paula Smith',
        age: 26,
        email: 'paula.smith@gmail.com',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      };
      setAuth(googleUser, `google_token_${Date.now()}`);
    } finally {
      setOtpLoading(false);
      setAuthModalVisible(false);
      resetAuthModal();
      Alert.alert('Signed in with Google! 🚀', 'Ready to complete your checkout.');
    }
  };

  const resetAuthModal = () => {
    setPhoneOrEmail('');
    setOtpSent(false);
    setDisplayedOtp(null);
    setEnteredOtp(['', '', '', '', '', '']);
    setIsNewUserStep(false);
    setNewName('');
    setNewAge('');
  };

  // ─── Order Placed Success Screen ───
  if (orderPlaced) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.successScreen} showsVerticalScrollIndicator={false}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.successHeading}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you! Your order #{confirmedOrderId || 'ADK-784920'} has been placed successfully.
          </Text>

          <View style={styles.orderSummaryCard}>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryVal}>₹{finalTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Payment Method:</Text>
              <Text style={[styles.summaryVal, { color: paymentMethod === 'razorpay' ? '#0D9488' : '#D97706' }]}>
                {paymentMethod === 'razorpay' ? 'Razorpay Online (Paid)' : 'Cash on Delivery (Pending)'}
              </Text>
            </View>
            {appliedCoupon && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Coupon Applied:</Text>
                <Text style={[styles.summaryVal, { color: '#16A34A' }]}>
                  {appliedCoupon.code} (-₹{appliedCoupon.discount})
                </Text>
              </View>
            )}
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Purchase Type:</Text>
              <Text style={styles.summaryVal}>
                {isDirectBuy ? 'Single Item Buy Now' : `Cart Checkout (${checkoutItems.length} items)`}
              </Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Estimated Delivery:</Text>
              <Text style={[styles.summaryVal, { color: '#15803D' }]}>
                {deliveryOption === 'express' ? '1-2 Days (Express)' : '3-5 Days (Standard)'}
              </Text>
            </View>
          </View>

          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity
              style={styles.trackOrderSuccessBtn}
              onPress={() => {
                if (lastCreatedOrder) {
                  navigation.navigate('OrderDetail', { order: lastCreatedOrder });
                } else {
                  navigation.navigate('Orders');
                }
              }}
              activeOpacity={0.88}
            >
              <Ionicons name="location-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.trackOrderSuccessBtnText}>Track Order Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewMyOrdersBtn}
              onPress={() => navigation.navigate('Orders')}
              activeOpacity={0.85}
            >
              <Ionicons name="cube-outline" size={16} color={ADONIK_THEME.primaryDark} style={{ marginRight: 6 }} />
              <Text style={styles.viewMyOrdersBtnText}>View in My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueShoppingBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.88}
            >
              <Text style={styles.continueShoppingBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={{ padding: 6 }}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Order Checkout</Text>
          <Text style={styles.headerSub}>
            {isDirectBuy ? '⚡ Single-Item Instant Buy' : `🛍️ Cart Checkout (${checkoutItems.length} items)`}
          </Text>
        </View>
        {isDirectBuy && (
          <View style={styles.buyNowTagPill}>
            <Ionicons name="flash" size={11} color="#B45309" />
            <Text style={styles.buyNowTagText}>Buy Now</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>1</Text>
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Items & Addr</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>Payment</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Review</Text>
          </View>
        </View>

        {/* Guest Warning / Login Prompt Banner if unauthenticated */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.guestBanner}
            onPress={() => setAuthModalVisible(true)}
            activeOpacity={0.88}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="lock-closed" size={14} color="#B45309" />
                <Text style={styles.guestBannerTitle}>Sign In / Register Required</Text>
              </View>
              <Text style={styles.guestBannerText}>
                Tap here to sign in with Google or Mobile OTP with Name & Age.
              </Text>
            </View>
            <View style={styles.guestLoginBtn}>
              <Text style={styles.guestLoginBtnText}>Sign In</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ─── 1. Items in this Checkout ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isDirectBuy ? 'Selected Product (Only this item)' : `Items to Purchase (${checkoutItems.length})`}
            </Text>
            {isDirectBuy && (
              <Text style={styles.directBuyIsolatedText}>Cart items preserved</Text>
            )}
          </View>

          {checkoutItems.length === 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>No items to check out.</Text>
            </View>
          ) : (
            checkoutItems.map((item, idx) => (
              <View key={item.id || idx} style={styles.checkoutItemRow}>
                <Image
                  source={{ uri: item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' }}
                  style={styles.checkoutItemThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.checkoutItemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.checkoutItemVendor}>
                    Sold by: {(item.vendor_name as any)?.business_name || (item.vendor_name as any)?.name || item.vendor_name || 'Shruti Creation'}
                  </Text>
                  <View style={styles.itemPriceQtyRow}>
                    <Text style={styles.checkoutItemPrice}>
                      ₹{item.price.toLocaleString()}
                    </Text>
                    {item.mrp && item.mrp > item.price && (
                      <Text style={styles.checkoutItemMrp}>
                        ₹{item.mrp.toLocaleString()}
                      </Text>
                    )}
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyBadgeText}>Qty: {item.quantity || 1}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ─── 2. Delivery Address ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-sharp" size={17} color={ADONIK_THEME.primaryDark} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddressManage', {
                  selectMode: true,
                  currentAddressId: selectedAddress?.id,
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.addNewText}>
                {selectedAddress ? 'Change / Manage' : '+ Add Address'}
              </Text>
            </TouchableOpacity>
          </View>

          {!selectedAddress || addresses.length === 0 ? (
            <View style={styles.noAddressWarningBox}>
              <View style={styles.noAddressIconBox}>
                <Ionicons name="alert-circle" size={24} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noAddressTitle}>No delivery address saved</Text>
                <Text style={styles.noAddressSubtitle}>
                  Please add your shipping address so we can deliver your order to your doorstep.
                </Text>
                <TouchableOpacity
                  style={styles.addAddressPromptBtn}
                  onPress={() => navigation.navigate('AddressManage', { selectMode: true })}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addAddressPromptBtnText}>Add Delivery Address Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addressBox}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('AddressManage', {
                  selectMode: true,
                  currentAddressId: selectedAddress.id,
                })
              }
            >
              <View style={styles.radioSelected}>
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.receiverName}>{selectedAddress.name}</Text>
                  <View style={styles.homeBadge}>
                    <Text style={styles.homeBadgeText}>{selectedAddress.type.toUpperCase()}</Text>
                  </View>
                  {selectedAddress.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.fullAddress}>
                  {selectedAddress.addressLine}{'\n'}
                  {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                </Text>
                <Text style={styles.addressPhone}>📞 {selectedAddress.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── 3. Delivery Speed Option ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping Method</Text>

          <TouchableOpacity
            style={[styles.deliveryOptionRow, deliveryOption === 'standard' && styles.deliveryOptionRowSelected]}
            onPress={() => setDeliveryOption('standard')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioCircle, deliveryOption === 'standard' && styles.radioCircleActive]}>
              {deliveryOption === 'standard' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deliveryOptionTitle}>Standard Delivery (3-5 days)</Text>
              <Text style={styles.deliverySub}>Reliable surface shipping across all pincodes</Text>
            </View>
            <Text style={styles.deliveryFreeText}>FREE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deliveryOptionRow, deliveryOption === 'express' && styles.deliveryOptionRowSelected]}
            onPress={() => setDeliveryOption('express')}
            activeOpacity={0.8}
          >
            <View style={[styles.radioCircle, deliveryOption === 'express' && styles.radioCircleActive]}>
              {deliveryOption === 'express' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deliveryOptionTitle}>Express Air Delivery (1-2 days)</Text>
              <Text style={styles.deliverySub}>Priority dispatch with real-time SMS tracking</Text>
            </View>
            <Text style={styles.deliveryPaidText}>₹99</Text>
          </TouchableOpacity>
        </View>

        {/* ─── 4. Coupon Code Section ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pricetag" size={16} color={ADONIK_THEME.primary} />
              <Text style={styles.cardTitle}>Apply Promo Coupon</Text>
            </View>
            {appliedCoupon && (
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {appliedCoupon ? (
            <View style={styles.appliedCouponBanner}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                  <Text style={styles.appliedCodeText}>{appliedCoupon.code}</Text>
                  <View style={styles.savingTag}>
                    <Text style={styles.savingTagText}>Saved ₹{appliedCoupon.discount}</Text>
                  </View>
                </View>
                <Text style={styles.appliedDescText}>{appliedCoupon.description}</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} style={styles.appliedRemoveBtn}>
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code (e.g. ADONIK10)"
                  placeholderTextColor="#94A3B8"
                  value={couponCodeInput}
                  onChangeText={(t) => {
                    setCouponCodeInput(t.toUpperCase());
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.applyCouponBtn,
                    (!couponCodeInput.trim() || validatingCoupon) && styles.applyCouponBtnDisabled,
                  ]}
                  onPress={() => handleApplyCoupon()}
                  disabled={!couponCodeInput.trim() || validatingCoupon}
                  activeOpacity={0.85}
                >
                  {validatingCoupon ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyCouponBtnText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>

              {couponError ? (
                <Text style={styles.couponErrorText}>{couponError}</Text>
              ) : null}

              {/* Quick Available Coupon Pills */}
              <View style={styles.availableCouponsWrap}>
                <Text style={styles.availableCouponsLabel}>Tap to apply offers:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 6 }}>
                  {availableCoupons.map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      style={styles.couponPill}
                      onPress={() => handleApplyCoupon(c.code)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.couponPillCode}>{c.code}</Text>
                      <Text style={styles.couponPillValue}>
                        {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}
        </View>

        {/* ─── 5. Payment Options: COD vs Razorpay ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <Text style={styles.paymentMethodNotice}>
            Select your preferred method to complete this order:
          </Text>

          {/* Option A: Cash on Delivery */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              paymentMethod === 'cod' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, paymentMethod === 'cod' && styles.radioCircleActive]}>
              {paymentMethod === 'cod' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={styles.paymentIconBox}>
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#15803D" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.paymentOptionTitle}>Cash on Delivery (COD)</Text>
                <View style={styles.zeroFeePill}>
                  <Text style={styles.zeroFeePillText}>No Fee</Text>
                </View>
              </View>
              <Text style={styles.paymentOptionSubtitle}>
                Pay cash upon doorstep delivery after inspecting package.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option B: Online Payment (Razorpay) */}
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              paymentMethod === 'razorpay' && styles.paymentMethodCardSelected,
            ]}
            onPress={() => setPaymentMethod('razorpay')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, paymentMethod === 'razorpay' && styles.radioCircleActive]}>
              {paymentMethod === 'razorpay' && <View style={styles.radioInnerDot} />}
            </View>
            <View style={[styles.paymentIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="card-outline" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.paymentOptionTitle}>Online Payment (Razorpay)</Text>
                <View style={styles.secureBadgePill}>
                  <Ionicons name="shield-checkmark" size={10} color="#0D9488" />
                  <Text style={styles.secureBadgeText}>Instant</Text>
                </View>
              </View>
              <Text style={styles.paymentOptionSubtitle}>
                UPI (GPay / PhonePe / Paytm), Credit / Debit Cards, NetBanking.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── 6. Bill Summary Breakdown ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>MRP Total:</Text>
            <Text style={styles.billValStrikethrough}>₹{mrpTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Catalog Selling Price:</Text>
            <Text style={styles.billVal}>₹{subtotal.toLocaleString()}</Text>
          </View>
          {catalogSavings > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Product Discount:</Text>
              <Text style={[styles.billVal, { color: '#16A34A' }]}>-₹{catalogSavings.toLocaleString()}</Text>
            </View>
          )}
          {appliedCoupon && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Coupon ({appliedCoupon.code}):</Text>
              <Text style={[styles.billVal, { color: '#16A34A', fontWeight: '700' }]}>
                -₹{appliedCoupon.discount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Shipping & Delivery:</Text>
            <Text style={[styles.billVal, shippingFee === 0 && { color: '#16A34A' }]}>
              {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
            </Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable Amount:</Text>
            <Text style={styles.totalVal}>₹{finalTotal.toLocaleString()}</Text>
          </View>
          <Text style={styles.taxNotice}>* All taxes included. Free returns within 7 days.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Bottom Action Bar ─── */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomBarTotalLabel}>Amount to Pay</Text>
          <Text style={styles.bottomBarTotalAmount}>₹{finalTotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleProceed}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons
                name={paymentMethod === 'razorpay' ? 'lock-closed' : 'checkmark-circle'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.continueBtnText}>
                {paymentMethod === 'razorpay' ? 'Pay Online' : 'Place COD Order'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── Razorpay Online Payment Gateway Modal ─── */}
      <Modal
        visible={razorpayModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRazorpayModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.razorpayModalCard}>
            {/* Razorpay Brand Header */}
            <View style={styles.razorpayHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.rzpLogoBox}>
                  <Text style={styles.rzpLogoText}>R</Text>
                </View>
                <View>
                  <Text style={styles.rzpMerchantTitle}>Adonik Marketplace</Text>
                  <Text style={styles.rzpSecureSub}>Secured by Razorpay • 256-bit SSL</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setRazorpayModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Amount Bar */}
            <View style={styles.rzpAmountBar}>
              <Text style={styles.rzpAmountLabel}>Payable Amount</Text>
              <Text style={styles.rzpAmountValue}>₹{finalTotal.toLocaleString()}</Text>
            </View>

            {/* Gateway Key Indicator (Shows live admin configured key ID) */}
            <View style={styles.rzpKeyBadge}>
              <Ionicons name="key-outline" size={12} color="#0284C7" />
              <Text style={styles.rzpKeyBadgeText}>
                Gateway Key: {razorpayKeyId || 'rzp_test_1DP5mmOlF5G5ag'}
              </Text>
            </View>

            {/* Payment Method Tabs */}
            <View style={styles.rzpTabsRow}>
              <TouchableOpacity
                style={[styles.rzpTabItem, razorpayTab === 'upi' && styles.rzpTabItemActive]}
                onPress={() => setRazorpayTab('upi')}
              >
                <Text style={[styles.rzpTabText, razorpayTab === 'upi' && styles.rzpTabTextActive]}>
                  UPI / QR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rzpTabItem, razorpayTab === 'card' && styles.rzpTabItemActive]}
                onPress={() => setRazorpayTab('card')}
              >
                <Text style={[styles.rzpTabText, razorpayTab === 'card' && styles.rzpTabTextActive]}>
                  Cards
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rzpTabItem, razorpayTab === 'netbanking' && styles.rzpTabItemActive]}
                onPress={() => setRazorpayTab('netbanking')}
              >
                <Text style={[styles.rzpTabText, razorpayTab === 'netbanking' && styles.rzpTabTextActive]}>
                  NetBanking
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            <View style={styles.rzpTabContent}>
              {razorpayTab === 'upi' && (
                <View style={{ gap: 10 }}>
                  <Text style={styles.rzpOptionHeading}>Select UPI Application:</Text>
                  {[
                    { key: 'gpay', name: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
                    { key: 'phonepe', name: 'PhonePe UPI', icon: 'flash', color: '#6739B7' },
                    { key: 'paytm', name: 'Paytm UPI', icon: 'wallet', color: '#00BAF2' },
                    { key: 'bhim', name: 'Any BHIM / UPI ID', icon: 'qr-code', color: '#16A34A' },
                  ].map((app) => (
                    <TouchableOpacity
                      key={app.key}
                      style={[styles.upiAppRow, upiApp === app.key && styles.upiAppRowSelected]}
                      onPress={() => setUpiApp(app.key as any)}
                    >
                      <Ionicons name={app.icon as any} size={20} color={app.color} />
                      <Text style={styles.upiAppName}>{app.name}</Text>
                      {upiApp === app.key && (
                        <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {razorpayTab === 'card' && (
                <View style={{ gap: 10 }}>
                  <TextInput
                    style={styles.rzpInput}
                    placeholder="Card Number (4000 1234 5678 9010)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                      style={[styles.rzpInput, { flex: 1 }]}
                      placeholder="MM / YY"
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={[styles.rzpInput, { flex: 1 }]}
                      placeholder="CVV (3 digits)"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      keyboardType="numeric"
                    />
                  </View>
                  <TextInput
                    style={styles.rzpInput}
                    placeholder="Cardholder Name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {razorpayTab === 'netbanking' && (
                <View style={{ gap: 8 }}>
                  <Text style={styles.rzpOptionHeading}>Popular Banks:</Text>
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((b) => (
                    <TouchableOpacity key={b} style={styles.bankRow}>
                      <Ionicons name="business" size={16} color="#64748B" />
                      <Text style={styles.bankNameText}>{b}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Pay CTA */}
            <TouchableOpacity
              style={styles.rzpSubmitBtn}
              onPress={handleRazorpayPayment}
              disabled={razorpayProcessing}
              activeOpacity={0.88}
            >
              {razorpayProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.rzpSubmitBtnText}>
                  Pay ₹{finalTotal.toLocaleString()} with Razorpay
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Auth Gate Modal Popup (Google Direct & Mobile OTP) ─── */}
      <Modal
        visible={authModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.authModalCard}>
            {/* Modal Top Handle */}
            <View style={styles.sheetHandleBar} />

            <View style={styles.authModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.authModalTitle}>Sign In / Register</Text>
                <Text style={styles.authModalSub}>
                  Quick authentication required to complete your checkout
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAuthModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={ADONIK_THEME.text} />
              </TouchableOpacity>
            </View>

            {/* Auth Method Tabs */}
            <View style={styles.authTabs}>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === 'otp' && styles.authTabBtnActive]}
                onPress={() => setAuthTab('otp')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color={authTab === 'otp' ? ADONIK_THEME.primary : '#64748B'}
                />
                <Text style={[styles.authTabText, authTab === 'otp' && styles.authTabTextActive]}>
                  Mobile / Email OTP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authTabBtn, authTab === 'google' && styles.authTabBtnActive]}
                onPress={() => setAuthTab('google')}
              >
                <Ionicons
                  name="logo-google"
                  size={16}
                  color={authTab === 'google' ? '#EA4335' : '#64748B'}
                />
                <Text style={[styles.authTabText, authTab === 'google' && styles.authTabTextActive]}>
                  Google 1-Tap
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: Mobile OTP Flow */}
            {authTab === 'otp' && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
                {!otpSent ? (
                  <View style={{ gap: 12, marginTop: 10 }}>
                    <Text style={styles.authFieldLabel}>Enter Mobile Number or Email</Text>
                    <TextInput
                      style={styles.authInput}
                      placeholder="+91 98765 43210 or you@example.com"
                      placeholderTextColor="#94A3B8"
                      value={phoneOrEmail}
                      onChangeText={setPhoneOrEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <TouchableOpacity
                      style={styles.authActionBtn}
                      onPress={handleSendOtp}
                      disabled={otpLoading}
                      activeOpacity={0.88}
                    >
                      {otpLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.authActionBtnText}>Send Verification Code</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 14, marginTop: 10 }}>
                    {/* CRITICAL REQUIREMENT: Show OTP directly on screen/website */}
                    {displayedOtp && (
                      <TouchableOpacity
                        style={styles.onScreenOtpBanner}
                        onPress={handleFillOtp}
                        activeOpacity={0.85}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="notifications" size={16} color="#B45309" />
                            <Text style={styles.onScreenOtpTitle}>Verification Code (Test Mode)</Text>
                          </View>
                          <Text style={styles.onScreenOtpCode}>
                            {displayedOtp.split('').join('  ')}
                          </Text>
                          <Text style={styles.onScreenOtpSub}>Tap here to auto-fill code</Text>
                        </View>
                        <View style={styles.tapToFillBtn}>
                          <Text style={styles.tapToFillBtnText}>Auto-Fill</Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    <Text style={styles.authFieldLabel}>Enter 6-Digit Verification Code</Text>
                    <View style={styles.otpBoxesRow}>
                      {enteredOtp.map((digit, i) => (
                        <TextInput
                          key={i}
                          ref={(r) => {
                            otpInputsRef.current[i] = r;
                          }}
                          style={[styles.otpDigitBox, digit ? styles.otpDigitBoxFilled : null]}
                          keyboardType="number-pad"
                          maxLength={6}
                          value={digit}
                          onChangeText={(txt) => handleOtpChange(txt, i)}
                          onKeyPress={(e) => handleOtpKeyPress(e, i)}
                          selectTextOnFocus
                        />
                      ))}
                    </View>

                    {/* If new user, prompt for Name and Age */}
                    {isNewUserStep && (
                      <View style={styles.newUserFieldsBox}>
                        <Text style={styles.newUserFieldsTitle}>New Customer Details</Text>
                        <View style={{ gap: 10, marginTop: 8 }}>
                          <TextInput
                            style={styles.authInput}
                            placeholder="Full Name (e.g. Priya Sharma) *"
                            placeholderTextColor="#94A3B8"
                            value={newName}
                            onChangeText={setNewName}
                          />
                          <TextInput
                            style={styles.authInput}
                            placeholder="Age (e.g. 24) *"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={newAge}
                            onChangeText={setNewAge}
                          />
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.authActionBtn}
                      onPress={handleVerifyOtp}
                      disabled={otpLoading}
                      activeOpacity={0.88}
                    >
                      {otpLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.authActionBtnText}>
                          {isNewUserStep ? 'Complete Registration & Continue' : 'Verify & Continue'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setOtpSent(false);
                        setDisplayedOtp(null);
                      }}
                      style={{ alignItems: 'center', marginTop: 4 }}
                    >
                      <Text style={styles.changeNumberText}>← Change Number or Email</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* TAB 2: Google 1-Tap Flow */}
            {authTab === 'google' && (
              <View style={{ gap: 14, paddingVertical: 14 }}>
                <Text style={styles.googleSubText}>
                  Instant 1-tap sign-in with your Google account. No password or OTP needed!
                </Text>

                <TouchableOpacity
                  style={styles.googleDirectBtn}
                  onPress={handleGoogleDirectLogin}
                  disabled={otpLoading}
                  activeOpacity={0.88}
                >
                  <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 10 }} />
                  <Text style={styles.googleDirectBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <Text style={styles.googleSecurityNote}>
                  Your account details are securely encrypted and protected under Adonik's Privacy Guarantee.
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  buyNowTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  buyNowTagText: { fontSize: 10, fontWeight: '800', color: '#B45309' },
  content: { padding: 16, gap: 14, backgroundColor: '#F8FAFC' },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAECEF',
  },
  stepItem: { alignItems: 'center', gap: 3 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: ADONIK_THEME.primary },
  stepNumber: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  stepNumberActive: { color: '#FFFFFF', fontWeight: '700', fontSize: 11 },
  stepLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  stepLabelActive: { color: ADONIK_THEME.text, fontWeight: '700' },
  stepLine: { width: 32, height: 1.5, backgroundColor: '#E2E8F0', marginHorizontal: 6, marginBottom: 14 },
  stepLineActive: { width: 32, height: 1.5, backgroundColor: ADONIK_THEME.primary, marginHorizontal: 6, marginBottom: 14 },

  // Guest banner
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  guestBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  guestBannerText: { fontSize: 11, color: '#B45309', marginTop: 2 },
  guestLoginBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  guestLoginBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: ADONIK_THEME.text },
  directBuyIsolatedText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  addNewText: { fontSize: 12, color: ADONIK_THEME.primary, fontWeight: '700' },

  // Checkout Items List
  checkoutItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkoutItemThumb: {
    width: 60,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  checkoutItemName: { fontSize: 13, fontWeight: '600', color: ADONIK_THEME.text },
  checkoutItemVendor: { fontSize: 11, color: '#64748B', marginTop: 2 },
  itemPriceQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  checkoutItemPrice: { fontSize: 13, fontWeight: '700', color: ADONIK_THEME.text },
  checkoutItemMrp: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  qtyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  qtyBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  // Address
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
  },
  radioSelected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ADONIK_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  receiverName: { fontSize: 13, fontWeight: '700', color: ADONIK_THEME.text },
  homeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  homeBadgeText: { color: '#2563EB', fontSize: 10, fontWeight: '700' },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  defaultBadgeText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  fullAddress: { fontSize: 11.5, color: '#64748B', lineHeight: 17, marginTop: 3 },
  addressPhone: { fontSize: 11.5, color: '#334155', fontWeight: '600', marginTop: 4 },
  noAddressWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 14,
  },
  noAddressIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 3,
  },
  noAddressSubtitle: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
    marginBottom: 10,
  },
  addAddressPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addAddressPromptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Delivery options
  deliveryOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  deliveryOptionRowSelected: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFBEB',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: ADONIK_THEME.primary },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ADONIK_THEME.primary,
  },
  deliveryOptionTitle: { fontSize: 13, fontWeight: '600', color: ADONIK_THEME.text },
  deliverySub: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  deliveryFreeText: { fontSize: 12, fontWeight: '700', color: '#15803D' },
  deliveryPaidText: { fontSize: 13, fontWeight: '700', color: ADONIK_THEME.text },

  // Coupon
  couponInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  couponInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: ADONIK_THEME.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  applyCouponBtn: {
    backgroundColor: ADONIK_THEME.primary,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnDisabled: { opacity: 0.5 },
  applyCouponBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  couponErrorText: { fontSize: 11, color: '#EF4444', marginTop: 4 },
  removeCouponText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  appliedCouponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 10,
  },
  appliedCodeText: { fontSize: 13, fontWeight: '800', color: '#15803D', fontFamily: 'monospace' },
  savingTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  savingTagText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  appliedDescText: { fontSize: 11, color: '#166534', marginTop: 2 },
  appliedRemoveBtn: { padding: 4 },
  availableCouponsWrap: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  availableCouponsLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  couponPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  couponPillCode: { fontSize: 11, fontWeight: '800', color: '#1E40AF', fontFamily: 'monospace' },
  couponPillValue: { fontSize: 9.5, color: '#2563EB', fontWeight: '600' },

  // Payment Options
  paymentMethodNotice: { fontSize: 11.5, color: '#64748B', marginBottom: 10 },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  paymentMethodCardSelected: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFBEB',
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  paymentOptionTitle: { fontSize: 13.5, fontWeight: '700', color: ADONIK_THEME.text },
  paymentOptionSubtitle: { fontSize: 10.5, color: '#64748B', marginTop: 2 },
  zeroFeePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  zeroFeePillText: { fontSize: 9, fontWeight: '800', color: '#15803D' },
  secureBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  secureBadgeText: { fontSize: 9, fontWeight: '800', color: '#0F766E' },

  // Bill Summary
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontSize: 12.5, color: '#64748B' },
  billVal: { fontSize: 12.5, fontWeight: '600', color: ADONIK_THEME.text },
  billValStrikethrough: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  billDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: ADONIK_THEME.text },
  totalVal: { fontSize: 17, fontWeight: '800', color: ADONIK_THEME.primary },
  taxNotice: { fontSize: 10, color: '#94A3B8', marginTop: 6, fontStyle: 'italic' },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 6,
  },
  bottomBarTotalLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  bottomBarTotalAmount: { fontSize: 18, fontWeight: '800', color: ADONIK_THEME.primary },
  continueBtn: {
    backgroundColor: ADONIK_THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Modals Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },

  // Razorpay Modal
  razorpayModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rzpLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0C2340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rzpLogoText: { color: '#3395FF', fontWeight: '900', fontSize: 18 },
  rzpMerchantTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  rzpSecureSub: { fontSize: 10, color: '#64748B' },
  rzpAmountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 12,
  },
  rzpAmountLabel: { fontSize: 12, color: '#64748B' },
  rzpAmountValue: { fontSize: 18, fontWeight: '800', color: '#0C2340' },
  rzpKeyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  rzpKeyBadgeText: { fontSize: 10, color: '#0369A1', fontFamily: 'monospace' },
  rzpTabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  rzpTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  rzpTabItemActive: { borderColor: '#3395FF', backgroundColor: '#EFF6FF' },
  rzpTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  rzpTabTextActive: { color: '#1D4ED8', fontWeight: '700' },
  rzpTabContent: { minHeight: 150 },
  rzpOptionHeading: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  upiAppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  upiAppRowSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  upiAppName: { flex: 1, fontSize: 12.5, fontWeight: '600', color: '#1E293B' },
  rzpInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 12,
    color: '#0F172A',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  bankNameText: { flex: 1, fontSize: 12, color: '#1E293B' },
  rzpSubmitBtn: {
    backgroundColor: '#3395FF',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  rzpSubmitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Auth Gate Modal
  authModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  authModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  authModalTitle: { fontSize: 17, fontWeight: '800', color: ADONIK_THEME.text },
  authModalSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  authTabs: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  authTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authTabBtnActive: { borderColor: ADONIK_THEME.primary, backgroundColor: '#FEF3C7' },
  authTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  authTabTextActive: { color: ADONIK_THEME.primaryDark, fontWeight: '700' },
  authFieldLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
  authInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: ADONIK_THEME.text,
  },
  authActionBtn: {
    backgroundColor: ADONIK_THEME.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  authActionBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700' },

  // On-screen OTP banner
  onScreenOtpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
  },
  onScreenOtpTitle: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  onScreenOtpCode: {
    fontSize: 19,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 2,
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  onScreenOtpSub: { fontSize: 9.5, color: '#B45309', marginTop: 2 },
  tapToFillBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tapToFillBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  otpBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
    width: '100%',
  },
  otpDigitBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: ADONIK_THEME.text,
    backgroundColor: '#F8FAFC',
    minWidth: 40,
    maxWidth: 46,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  otpDigitBoxFilled: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFBEB',
    color: ADONIK_THEME.primaryDark,
    borderWidth: 2,
  },
  newUserFieldsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 4,
  },
  newUserFieldsTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  changeNumberText: { fontSize: 11.5, color: ADONIK_THEME.primaryDark, fontWeight: '600' },

  // Google Tab
  googleSubText: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  googleDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  googleDirectBtnText: { fontSize: 13.5, fontWeight: '700', color: '#1E293B' },
  googleSecurityNote: { fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 15 },

  // Success screen
  successScreen: { alignItems: 'center', justifyContent: 'center', padding: 24, paddingVertical: 50 },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successHeading: { fontSize: 22, fontWeight: '800', color: ADONIK_THEME.text, marginBottom: 6 },
  successSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECEF',
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12.5, color: '#64748B' },
  summaryVal: { fontSize: 12.5, fontWeight: '700', color: ADONIK_THEME.text },
  trackOrderSuccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ADONIK_THEME.primary,
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  trackOrderSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  viewMyOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: ADONIK_THEME.primary,
    width: '100%',
    height: 46,
    borderRadius: 12,
  },
  viewMyOrdersBtnText: {
    color: ADONIK_THEME.primaryDark,
    fontSize: 13.5,
    fontWeight: '700',
  },
  continueShoppingBtn: {
    backgroundColor: '#F1F5F9',
    width: '100%',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueShoppingBtnText: { color: '#475569', fontSize: 13.5, fontWeight: '700' },
});
