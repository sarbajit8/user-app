import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useAddressStore, UserAddress } from '../../store/addressStore';
import { useDeliveryLocationStore } from '../../store/deliveryLocationStore';

export default function AddressManageScreen({ navigation, route }: any) {
  const isSelectMode = Boolean(route?.params?.selectMode);
  const onSelectAddressId = route?.params?.currentAddressId;

  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { detectCurrentLocation, isDetecting: isDetectingGPS } = useDeliveryLocationStore();

  const handleAutofillWithGPS = async () => {
    const result = await detectCurrentLocation();
    if (result.success && result.location) {
      if (result.location.addressLine) setAddressLine(result.location.addressLine);
      if (result.location.city) setCity(result.location.city);
      if (result.location.state) setState(result.location.state);
      if (result.location.pincode) setPincode(result.location.pincode);
      Alert.alert('Location Detected', 'Address fields filled with your current location.');
    } else {
      Alert.alert('Location Error', result.error || 'Could not detect location. Please check GPS permissions.');
    }
  };

  // Form inputs
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('West Bengal');
  const [pincode, setPincode] = useState('');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setAddressLine('');
    setCity('');
    setState('West Bengal');
    setPincode('');
    setType('Home');
    setIsDefault(addresses.length === 0);
    setModalVisible(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingId(addr.id);
    setName(addr.name);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter recipient name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter a contact phone number.');
      return;
    }
    if (!addressLine.trim()) {
      Alert.alert('Required', 'Please enter street / house address.');
      return;
    }
    if (!city.trim() || !pincode.trim()) {
      Alert.alert('Required', 'Please enter city and 6-digit pincode.');
      return;
    }

    if (editingId) {
      updateAddress(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type,
        isDefault,
      });
      Alert.alert('Updated', 'Address updated successfully.');
    } else {
      const added = addAddress({
        name: name.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        type,
        isDefault,
      });

      if (isSelectMode) {
        setModalVisible(false);
        navigation.navigate('Checkout', { selectedAddressId: added.id });
        return;
      }

      Alert.alert('Added', 'New delivery address saved.');
    }

    setModalVisible(false);
  };

  const handleDelete = (addr: UserAddress) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to remove "${addr.addressLine}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(addr.id),
        },
      ]
    );
  };

  const handleSelect = (addr: UserAddress) => {
    if (isSelectMode) {
      navigation.navigate('Checkout', { selectedAddressId: addr.id });
    }
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
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isSelectMode ? 'Select Delivery Address' : 'My Addresses'}
          </Text>
          <Text style={styles.headerSub}>
            {addresses.length} saved location{addresses.length === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={openAddModal}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addHeaderBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="location-outline" size={38} color={ADONIK_THEME.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySub}>
              Please add a delivery address so we can ship your orders quickly and safely.
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal} activeOpacity={0.88}>
              <Text style={styles.emptyAddBtnText}>+ Add Delivery Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((item) => {
            const isChosen = isSelectMode && onSelectAddressId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.addressCard,
                  item.isDefault && styles.addressCardDefault,
                  isChosen && styles.addressCardChosen,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={isSelectMode ? 0.7 : 1}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={styles.typeBadge}>
                      <Ionicons
                        name={
                          item.type === 'Home'
                            ? 'home'
                            : item.type === 'Work'
                            ? 'briefcase'
                            : 'location'
                        }
                        size={12}
                        color={ADONIK_THEME.primaryDark}
                      />
                      <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                    {item.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default Address</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={styles.iconActionBtn}
                      activeOpacity={0.7}
                    >
                      <Feather name="edit-2" size={15} color="#475569" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={styles.iconActionBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Recipient info */}
                <Text style={styles.recipientName}>{item.name}</Text>
                <Text style={styles.recipientPhone}>Phone: {item.phone}</Text>

                {/* Address string */}
                <Text style={styles.fullAddressText}>
                  {item.addressLine}, {item.city}, {item.state} - {item.pincode}
                </Text>

                {/* Bottom Row Actions */}
                <View style={styles.cardBottomRow}>
                  {!item.isDefault && (
                    <TouchableOpacity
                      onPress={() => setDefaultAddress(item.id)}
                      style={styles.setDefaultBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color={ADONIK_THEME.primary} />
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}

                  {isSelectMode && (
                    <TouchableOpacity
                      style={styles.deliverHereBtn}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.deliverHereBtnText}>Deliver Here →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ─── Add / Edit Modal Sheet ─── */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandleBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>
                {editingId ? 'Edit Address' : 'Add Delivery Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={ADONIK_THEME.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* GPS Auto-fill Button */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#FEF9EE',
                  borderWidth: 1,
                  borderColor: '#FDE68A',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
                activeOpacity={0.8}
                onPress={handleAutofillWithGPS}
                disabled={isDetectingGPS}
              >
                {isDetectingGPS ? (
                  <ActivityIndicator size="small" color={ADONIK_THEME.primary} />
                ) : (
                  <Ionicons name="navigate-circle" size={20} color={ADONIK_THEME.primary} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: ADONIK_THEME.text }}>
                    {isDetectingGPS ? 'Detecting current location...' : 'Auto-fill with Current Location'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>
                    Use GPS to automatically fill city, state and pincode
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Recipient Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Sarbajit Paul"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Street Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>House No., Building, Street / Area *</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, paddingTop: 8 }]}
                  placeholder="Vill - Haripal, P.O - Haripal, Near Station"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={addressLine}
                  onChangeText={setAddressLine}
                />
              </View>

              {/* City & Pincode */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City / District *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Hooghly / Kolkata"
                    placeholderTextColor="#94A3B8"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Pincode *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="712405"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="West Bengal"
                  placeholderTextColor="#94A3B8"
                  value={state}
                  onChangeText={setState}
                />
              </View>

              {/* Address Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Type</Text>
                <View style={styles.typeSelectorRow}>
                  {(['Home', 'Work', 'Other'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typeSelectorBtn,
                        type === t && styles.typeSelectorBtnActive,
                      ]}
                      onPress={() => setType(t)}
                    >
                      <Ionicons
                        name={t === 'Home' ? 'home' : t === 'Work' ? 'briefcase' : 'location'}
                        size={14}
                        color={type === t ? ADONIK_THEME.primaryDark : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.typeSelectorBtnText,
                          type === t && styles.typeSelectorBtnTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Default Address Checkbox */}
              <TouchableOpacity
                style={styles.defaultToggleRow}
                onPress={() => setIsDefault(!isDefault)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isDefault ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isDefault ? ADONIK_THEME.primary : '#94A3B8'}
                />
                <Text style={styles.defaultToggleText}>Make this my default delivery address</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.88}>
              <Text style={styles.submitBtnText}>
                {editingId ? 'Update Address' : 'Save Delivery Address'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  addHeaderBtn: {
    backgroundColor: ADONIK_THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  addHeaderBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  content: { padding: 16, gap: 14, paddingBottom: 60 },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text, marginBottom: 6 },
  emptySub: { fontSize: 12.5, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  emptyAddBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyAddBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700' },

  // Address card
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  addressCardDefault: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFEF7',
  },
  addressCardChosen: {
    borderColor: ADONIK_THEME.primary,
    borderWidth: 2,
    backgroundColor: '#FFFBEB',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: ADONIK_THEME.primaryDark },
  defaultBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  iconActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientName: { fontSize: 14, fontWeight: '700', color: ADONIK_THEME.text },
  recipientPhone: { fontSize: 12, color: '#64748B', marginTop: 2 },
  fullAddressText: { fontSize: 12.5, color: '#334155', lineHeight: 18, marginTop: 6 },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  setDefaultBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  setDefaultText: { fontSize: 12, fontWeight: '600', color: ADONIK_THEME.primary },
  deliverHereBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  deliverHereBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    paddingBottom: 34,
  },
  modalHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeading: { fontSize: 16, fontWeight: '700', color: ADONIK_THEME.text },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11.5, fontWeight: '600', color: '#475569', marginBottom: 5 },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 9,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: ADONIK_THEME.text,
  },
  typeSelectorRow: { flexDirection: 'row', gap: 10 },
  typeSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  typeSelectorBtnActive: { borderColor: ADONIK_THEME.primary, backgroundColor: '#FEF3C7' },
  typeSelectorBtnText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  typeSelectorBtnTextActive: { color: ADONIK_THEME.primaryDark, fontWeight: '700' },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  defaultToggleText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  submitBtn: {
    backgroundColor: ADONIK_THEME.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
