import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../theme/colors';
import {
  useDeliveryLocationStore,
  PincodeDetails,
} from '../store/deliveryLocationStore';
import { useAddressStore, UserAddress } from '../store/addressStore';

const { height: SCREEN_H } = Dimensions.get('window');

interface DeliveryLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onAddNewAddress?: () => void;
}

const POPULAR_HUBS = [
  { name: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { name: 'Salt Lake', state: 'West Bengal', pincode: '700091' },
  { name: 'Howrah', state: 'West Bengal', pincode: '711101' },
  { name: 'Hooghly', state: 'West Bengal', pincode: '712101' },
  { name: 'South 24 Pgs', state: 'West Bengal', pincode: '743503' },
  { name: 'North 24 Pgs', state: 'West Bengal', pincode: '700124' },
  { name: 'Durgapur', state: 'West Bengal', pincode: '713216' },
  { name: 'Siliguri', state: 'West Bengal', pincode: '734001' },
];

export default function DeliveryLocationModal({
  visible,
  onClose,
  onAddNewAddress,
}: DeliveryLocationModalProps) {
  const {
    currentLocation,
    isDetecting,
    detectCurrentLocation,
    selectSavedAddress,
    setManualLocation,
    lookupPincode,
  } = useDeliveryLocationStore();

  const { addresses } = useAddressStore();

  const [modalRendered, setModalRendered] = useState(visible);
  const [pincodeInput, setPincodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);
  const [verifiedPinData, setVerifiedPinData] = useState<PincodeDetails | null>(null);

  // Smooth Bottom Sheet & Backdrop Animation Values
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  const useDriver = Platform.OS !== 'web';

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setModalRendered(true);
      sheetAnim.setValue(0);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: useDriver,
        }),
        Animated.spring(sheetAnim, {
          toValue: 1,
          damping: 28,
          stiffness: 240,
          mass: 0.85,
          useNativeDriver: useDriver,
        }),
      ]).start();
    } else if (modalRendered && !isClosingRef.current) {
      animateClose(false);
    }
  }, [visible]);

  const animateClose = (triggerOnClose: boolean = true) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: useDriver,
      }),
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: useDriver,
      }),
    ]).start(() => {
      setModalRendered(false);
      isClosingRef.current = false;
      setPincodeInput('');
      setErrorMessage(null);
      setVerifiedPinData(null);
      if (triggerOnClose) {
        onClose();
      }
    });
  };

  // Live lookup whenever a 6-digit pincode is typed
  useEffect(() => {
    const clean = pincodeInput.trim();
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      setIsLookingUpPin(true);
      setVerifiedPinData(null);
      lookupPincode(clean).then((data) => {
        setIsLookingUpPin(false);
        if (data) {
          setVerifiedPinData(data);
          setErrorMessage(null);
        } else {
          setVerifiedPinData(null);
        }
      });
    } else {
      setVerifiedPinData(null);
    }
  }, [pincodeInput, lookupPincode]);

  const handleDetectGPS = async () => {
    setErrorMessage(null);
    const result = await detectCurrentLocation();
    if (result.success && result.location) {
      animateClose(true);
    } else {
      setErrorMessage(
        result.error || 'Could not detect location. Please check your GPS permissions.'
      );
    }
  };

  const handleSelectAddress = (addr: UserAddress) => {
    selectSavedAddress(addr);
    animateClose(true);
  };

  const handleApplyPincode = (overrideData?: PincodeDetails) => {
    const dataToUse = overrideData || verifiedPinData;
    const trimmed = pincodeInput.trim();

    if (dataToUse) {
      const primaryCity = dataToUse.district || dataToUse.region || 'India';
      const postOffice = dataToUse.postOffices?.[0] || '';
      setManualLocation(primaryCity, dataToUse.state, dataToUse.pincode, postOffice);
      animateClose(true);
      return;
    }

    if (!trimmed) {
      Alert.alert('Required', 'Please enter a valid city or 6-digit pincode.');
      return;
    }

    setManualLocation(
      trimmed,
      'West Bengal',
      trimmed.length === 6 && /^\d+$/.test(trimmed) ? trimmed : ''
    );
    animateClose(true);
  };

  const handleQuickSelectHub = (hub: { name: string; state: string; pincode: string }) => {
    setManualLocation(hub.name, hub.state, hub.pincode, hub.name);
    animateClose(true);
  };

  if (!modalRendered) {
    return null;
  }

  return (
    <Modal
      visible={modalRendered}
      animationType="none"
      transparent={true}
      onRequestClose={() => animateClose(true)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        {/* Animated Fluid Backdrop */}
        <TouchableWithoutFeedback onPress={() => animateClose(true)}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Animated Smooth Sliding Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_H * 0.85, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Top Drag Pill Handle */}
          <View style={styles.dragPillContainer}>
            <View style={styles.dragPill} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Choose Delivery Location</Text>
              <Text style={styles.sheetSubtitle}>
                Select address or detect location for delivery & availability
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => animateClose(true)}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Error Message if any */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* GPS Detection Card */}
            <TouchableOpacity
              style={[
                styles.detectCard,
                currentLocation.type === 'gps' && styles.detectCardActive,
              ]}
              activeOpacity={0.85}
              onPress={handleDetectGPS}
              disabled={isDetecting}
            >
              <View style={styles.detectIconWrap}>
                {isDetecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="navigate-circle" size={26} color="#FFFFFF" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.detectTitle}>
                    {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
                  </Text>
                  {currentLocation.type === 'gps' && !isDetecting && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.detectSub}>
                  {isDetecting
                    ? 'Fetching high-accuracy GPS & postal address...'
                    : currentLocation.type === 'gps'
                    ? `${currentLocation.displayShort} • Tap to refresh`
                    : 'High precision GPS • Auto-detects area & postal code'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={ADONIK_THEME.primaryDark}
              />
            </TouchableOpacity>

            {/* Enter Pincode or City */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR ENTER PINCODE / CITY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Pincode Input */}
            <View style={styles.pincodeInputRow}>
              <View style={styles.pincodeInputWrap}>
                <Feather name="map-pin" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.pincodeInput}
                  placeholder="Enter 6-digit Pincode or City"
                  placeholderTextColor="#94A3B8"
                  value={pincodeInput}
                  onChangeText={setPincodeInput}
                  keyboardType="default"
                  onSubmitEditing={() => handleApplyPincode()}
                />
                {isLookingUpPin && (
                  <ActivityIndicator size="small" color={ADONIK_THEME.primary} style={{ marginLeft: 6 }} />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.applyBtn,
                  !pincodeInput.trim() && styles.applyBtnDisabled,
                ]}
                activeOpacity={0.8}
                onPress={() => handleApplyPincode()}
                disabled={!pincodeInput.trim()}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Live Verified Postal Card */}
            {verifiedPinData && (
              <TouchableOpacity
                style={styles.verifiedPinCard}
                activeOpacity={0.8}
                onPress={() => handleApplyPincode(verifiedPinData)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedPinTitle}>
                    {verifiedPinData.district}, {verifiedPinData.state} ({verifiedPinData.pincode})
                  </Text>
                  {verifiedPinData.postOffices?.length > 0 && (
                    <Text style={styles.verifiedPinSub} numberOfLines={1}>
                      Covers: {verifiedPinData.postOffices.slice(0, 3).join(', ')}
                    </Text>
                  )}
                </View>
                <View style={styles.usePinBadge}>
                  <Text style={styles.usePinBadgeText}>Deliver Here</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Quick Popular Cities */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.quickHubLabel}>POPULAR AREAS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {POPULAR_HUBS.map((hub) => (
                    <TouchableOpacity
                      key={hub.name}
                      style={styles.hubChip}
                      activeOpacity={0.75}
                      onPress={() => handleQuickSelectHub(hub)}
                    >
                      <Ionicons name="location-outline" size={13} color="#475569" />
                      <Text style={styles.hubChipText}>{hub.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Saved Addresses Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
              {onAddNewAddress && (
                <TouchableOpacity
                  onPress={() => {
                    animateClose(true);
                    onAddNewAddress();
                  }}
                  style={styles.addBtn}
                >
                  <Ionicons name="add" size={16} color={ADONIK_THEME.primary} />
                  <Text style={styles.addBtnText}>Add New</Text>
                </TouchableOpacity>
              )}
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyAddressBox}>
                <Ionicons name="location-outline" size={26} color="#94A3B8" />
                <Text style={styles.emptyAddressText}>No saved addresses yet</Text>
              </View>
            ) : (
              addresses.map((addr) => {
                const isSelected =
                  currentLocation.type === 'address' &&
                  currentLocation.id === addr.id;

                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addressCard,
                      isSelected && styles.addressCardSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleSelectAddress(addr)}
                  >
                    <View style={styles.addressLeftIcon}>
                      <Ionicons
                        name={
                          addr.type === 'Home'
                            ? 'home'
                            : addr.type === 'Work'
                            ? 'briefcase'
                            : 'location'
                        }
                        size={18}
                        color={isSelected ? ADONIK_THEME.primary : '#64748B'}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text style={styles.addressName}>{addr.name}</Text>
                        <View style={styles.addressTypeBadge}>
                          <Text style={styles.addressTypeText}>{addr.type.toUpperCase()}</Text>
                        </View>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressLine} numberOfLines={2}>
                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                      </Text>
                      <Text style={styles.addressPhone}>Phone: {addr.phone}</Text>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Current Active Location Display Footer */}
            <View style={styles.currentActiveBox}>
              <Ionicons name="checkmark-circle" size={16} color={ADONIK_THEME.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.currentActiveLabel}>Delivering to:</Text>
                <Text style={styles.currentActiveValue} numberOfLines={1}>
                  {currentLocation.displayFull || currentLocation.displayShort}
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 25,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dragPillContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragPill: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '500',
  },
  // Detect card
  detectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9EE',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: ADONIK_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  detectCardActive: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFBEB',
  },
  detectIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ADONIK_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ADONIK_THEME.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
  },
  detectTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  detectSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 12,
    letterSpacing: 0.6,
  },
  // Pincode
  pincodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  pincodeInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  pincodeInput: {
    flex: 1,
    fontSize: 13.5,
    color: ADONIK_THEME.text,
  },
  applyBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ADONIK_THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  applyBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Verified Pincode Card
  verifiedPinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  verifiedPinTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  verifiedPinSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
  },
  usePinBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  usePinBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Popular chips
  quickHubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: ADONIK_THEME.primary,
  },
  emptyAddressBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 4,
  },
  emptyAddressText: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  // Address cards
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  addressCardSelected: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFDF7',
  },
  addressLeftIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  addressTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  addressTypeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  defaultBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  defaultBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B45309',
  },
  addressLine: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 17,
    marginTop: 3,
  },
  addressPhone: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  radioCircleSelected: {
    borderColor: ADONIK_THEME.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ADONIK_THEME.primary,
  },
  // Bottom footer active summary
  currentActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  currentActiveLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  currentActiveValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
});
