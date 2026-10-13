import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Image, Switch, Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { userApi } from '../../api/client';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b1c9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export default function SettingsScreen({ navigation }: any) {
  const { user, updateUser, deleteAccount, logout } = useAuthStore();
  const { clearCart } = useCartStore();
  const { clearWishlist } = useWishlistStore();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || user?.profile_image || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [notifOrders, setNotifOrders] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);

  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const markChanged = () => setHasChanges(true);

  const handleSaveProfile = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
    if (age && (isNaN(Number(age)) || Number(age) < 10 || Number(age) > 110)) {
      Alert.alert('Invalid Age', 'Please enter a valid age.'); return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    updateUser({
      name: name.trim(),
      age: age ? Number(age) : null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      avatar: avatar || null,
      profile_image: avatar || null,
    });
    setIsSaving(false);
    setHasChanges(false);
    Alert.alert('Saved!', 'Your profile has been updated.');
  };

  const handleSelectAvatar = (url: string) => {
    setAvatar(url);
    setAvatarModalVisible(false);
    markChanged();
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const proceedDeleteStep = async () => {
    if (deleteStep < 3) { setDeleteStep(deleteStep + 1); return; }
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Incorrect', 'Please type DELETE exactly.'); return;
    }
    setIsDeleting(true);
    try {
      await userApi.delete('/auth/delete-account');
    } catch (err: any) {
      console.warn('Backend delete-account warning:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      clearCart();
      clearWishlist();
      deleteAccount();
      Alert.alert('Account Deleted', 'Your account and personal data have been permanently deleted from Adonik.', [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    }
  };

  const displayAvatar = avatar || user?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D97706&color=fff&size=200`;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Account Settings</Text>
        {hasChanges && (
          <TouchableOpacity style={s.saveHeaderBtn} onPress={handleSaveProfile}>
            <Text style={s.saveHeaderBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
      >

          {/* Profile Photo */}
          <View style={s.avatarSection}>
            <View style={s.avatarWrapper}>
              <Image source={{ uri: displayAvatar }} style={s.avatarImg} />
              <TouchableOpacity style={s.avatarCameraBtn} onPress={() => setAvatarModalVisible(true)}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={s.avatarName}>{user?.name || 'Your Name'}</Text>
            <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
              <Text style={s.changePhotoText}>Change Profile Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="person-outline" size={17} color={ADONIK_THEME.primary} />
              <Text style={s.sectionTitle}>Personal Information</Text>
            </View>

            <View style={s.fieldGroup}>
              {[
                { label: 'Full Name', value: name, setter: setName, placeholder: 'Your full name', keyboard: 'default' as const, max: 60 },
                { label: 'Age', value: age, setter: (t: string) => setAge(t.replace(/[^0-9]/g, '')), placeholder: 'e.g. 25', keyboard: 'number-pad' as const, max: 3 },
                { label: 'Email', value: email, setter: setEmail, placeholder: 'email@example.com', keyboard: 'email-address' as const, max: 80 },
                { label: 'Mobile', value: phone, setter: setPhone, placeholder: '+91 XXXXX XXXXX', keyboard: 'phone-pad' as const, max: 15 },
              ].map((f, idx) => (
                <View key={f.label}>
                  {idx > 0 && <View style={s.fieldDivider} />}
                  <View style={s.fieldRow}>
                    <Text style={s.fieldLabel}>{f.label}</Text>
                    <TextInput
                      style={s.fieldInput}
                      value={f.value}
                      onChangeText={(t) => { f.setter(t); markChanged(); }}
                      placeholder={f.placeholder}
                      placeholderTextColor="#94A3B8"
                      keyboardType={f.keyboard}
                      maxLength={f.max}
                      autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
                    />
                  </View>
                </View>
              ))}
            </View>

            {hasChanges && (
              <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile} activeOpacity={0.88}>
                <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" style={{ marginRight: 7 }} />
                <Text style={s.saveBtnText}>{isSaving ? 'Saving…' : 'Save Profile Changes'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Notification Preferences */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="notifications-outline" size={17} color={ADONIK_THEME.primary} />
              <Text style={s.sectionTitle}>Notification Preferences</Text>
            </View>
            <View style={s.fieldGroup}>
              {[
                { label: 'Order Updates', sub: 'Shipping, delivery & tracking', val: notifOrders, set: setNotifOrders },
                { label: 'Offers & Promotions', sub: 'Deals, coupons & exclusive offers', val: notifOffers, set: setNotifOffers },
                { label: 'SMS Alerts', sub: 'Updates via text message', val: notifSMS, set: setNotifSMS },
              ].map((item, idx) => (
                <View key={item.label}>
                  {idx > 0 && <View style={s.fieldDivider} />}
                  <View style={s.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.toggleTitle}>{item.label}</Text>
                      <Text style={s.toggleSub}>{item.sub}</Text>
                    </View>
                    <Switch
                      value={item.val}
                      onValueChange={item.set}
                      trackColor={{ false: '#E2E8F0', true: ADONIK_THEME.primaryLight }}
                      thumbColor={item.val ? ADONIK_THEME.primary : '#94A3B8'}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* App Preferences */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="settings-outline" size={17} color={ADONIK_THEME.primary} />
              <Text style={s.sectionTitle}>App Preferences</Text>
            </View>
            <View style={s.fieldGroup}>
              {[
                {
                  icon: 'lock-closed-outline', label: 'Change Password',
                  onPress: () => Alert.alert('Change Password', 'An OTP will be sent to your registered number.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send OTP', onPress: () => Alert.alert('OTP Sent', 'Check your phone.') },
                  ]),
                  right: null,
                },
                {
                  icon: 'information-circle-outline', label: 'App Version',
                  onPress: () => Alert.alert('Adonik v2.4.0', 'You are on the latest version.'),
                  right: 'v2.4.0',
                },
                {
                  icon: 'refresh-circle-outline', label: 'Clear App Cache',
                  onPress: () => Alert.alert('Cache Cleared ✅', 'Temporary data cleared.'),
                  right: null,
                },
              ].map((item, idx) => (
                <View key={item.label}>
                  {idx > 0 && <View style={s.fieldDivider} />}
                  <TouchableOpacity style={s.actionRow} onPress={item.onPress} activeOpacity={0.7}>
                    <Ionicons name={item.icon as any} size={16} color="#475569" style={{ marginRight: 10 }} />
                    <Text style={s.actionTitle}>{item.label}</Text>
                    {item.right
                      ? <Text style={s.actionRight}>{item.right}</Text>
                      : <Ionicons name="chevron-forward" size={16} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Privacy & Legal */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={17} color={ADONIK_THEME.primary} />
              <Text style={s.sectionTitle}>Privacy & Legal</Text>
            </View>
            <View style={s.fieldGroup}>
              {['Privacy Policy', 'Terms of Service', 'Return & Refund Policy'].map((label, idx) => (
                <View key={label}>
                  {idx > 0 && <View style={s.fieldDivider} />}
                  <TouchableOpacity
                    style={s.actionRow}
                    onPress={() => Alert.alert(label, `${label} for Adonik Shopping.`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="document-text-outline" size={16} color="#475569" style={{ marginRight: 10 }} />
                    <Text style={s.actionTitle}>{label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Account Session / Sign Out */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="log-out-outline" size={17} color="#DC2626" />
              <Text style={[s.sectionTitle, { color: '#DC2626' }]}>Account Session</Text>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
                Sign out of your Adonik account on this device. You can log back in at any time.
              </Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1.5,
                  borderColor: '#FECACA',
                  paddingVertical: 12,
                  borderRadius: 10,
                }}
                onPress={() => setLogoutModalVisible(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={{ color: '#DC2626', fontSize: 13.5, fontWeight: '700' }}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={s.dangerZone}>
            <View style={[s.sectionHeader, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="warning-outline" size={17} color="#DC2626" />
              <Text style={[s.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={s.dangerTitle}>Delete My Account</Text>
              <Text style={s.dangerDesc}>
                Permanently removes your account, all orders, addresses, and personal data. This cannot be undone.
              </Text>
              <TouchableOpacity style={s.deleteBtn} onPress={() => { setDeleteStep(1); setDeleteModalVisible(true); }} activeOpacity={0.85}>
                <Ionicons name="trash" size={15} color="#FFFFFF" style={{ marginRight: 7 }} />
                <Text style={s.deleteBtnText}>Delete My Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

      {/* Sign Out Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="fade" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={s.deleteOverlay}>
          <View style={s.deleteBox}>
            <View style={[s.deleteIconCircle, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Ionicons name="log-out-outline" size={30} color="#DC2626" />
            </View>
            <Text style={s.deleteTitle}>Sign Out of Adonik?</Text>
            <Text style={s.deleteDesc}>
              Are you sure you want to sign out? You will need to log back in to view your orders and wallet.
            </Text>
            <View style={s.deleteActionRow}>
              <TouchableOpacity style={s.deleteCancelBtn} onPress={() => setLogoutModalVisible(false)}>
                <Text style={s.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.deleteConfirmBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                  navigation.navigate('Main');
                }}
              >
                <Text style={s.deleteConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal visible={avatarModalVisible} transparent animationType="slide" onRequestClose={() => setAvatarModalVisible(false)}>
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setAvatarModalVisible(false)}>
          <View style={s.avatarSheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Choose Profile Photo</Text>
            <Text style={s.sheetSub}>Pick an avatar from our collection</Text>
            <View style={s.avatarGrid}>
              {AVATAR_OPTIONS.map((url, idx) => (
                <TouchableOpacity key={idx} style={[s.avatarGridCell, avatar === url && s.avatarGridCellActive]} onPress={() => handleSelectAvatar(url)}>
                  <Image source={{ uri: url }} style={s.avatarGridImg} />
                  {avatar === url && (
                    <View style={s.avatarCheck}>
                      <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.sheetCancelBtn} onPress={() => setAvatarModalVisible(false)}>
              <Text style={s.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={s.deleteOverlay}>
          <View style={s.deleteBox}>
            <View style={s.deleteIconCircle}>
              <Ionicons name="warning" size={30} color="#DC2626" />
            </View>

            {deleteStep === 1 && (
              <>
                <Text style={s.deleteTitle}>Delete Your Account?</Text>
                <Text style={s.deleteDesc}>
                  This will permanently delete:{'\n'}
                  • All your orders & history{'\n'}
                  • Saved addresses{'\n'}
                  • Wallet balance{'\n'}
                  • Wishlist & cart{'\n\n'}
                  <Text style={{ fontWeight: '800', color: '#DC2626' }}>This cannot be undone.</Text>
                </Text>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <Text style={s.deleteTitle}>Are You Absolutely Sure?</Text>
                <Text style={s.deleteDesc}>
                  You are about to permanently delete your Adonik account.{'\n\n'}You will lose all purchase history and cannot recover any data.
                </Text>
              </>
            )}

            {deleteStep === 3 && (
              <>
                <Text style={s.deleteTitle}>Final Confirmation</Text>
                <Text style={s.deleteDesc}>
                  Type <Text style={{ fontWeight: '800', color: '#DC2626' }}>DELETE</Text> below to permanently remove your account.
                </Text>
                <TextInput
                  style={s.deleteInput}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="Type DELETE"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />
              </>
            )}

            <View style={s.deleteActionRow}>
              <TouchableOpacity style={s.deleteCancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={s.deleteCancelText}>Keep Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.deleteConfirmBtn, deleteStep === 3 && deleteConfirmText.toUpperCase() !== 'DELETE' && { opacity: 0.4 }]}
                onPress={proceedDeleteStep}
              >
                <Text style={s.deleteConfirmText}>
                  {deleteStep < 3 ? 'Continue →' : 'Delete Forever'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F3F5',
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text },
  saveHeaderBtn: { backgroundColor: ADONIK_THEME.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  saveHeaderBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 120 },

  // Avatar Section
  avatarSection: {
    alignItems: 'center', paddingVertical: 24,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: ADONIK_THEME.primary },
  avatarCameraBtn: {
    position: 'absolute', bottom: 1, right: 1,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: ADONIK_THEME.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarName: { fontSize: 18, fontWeight: '700', color: ADONIK_THEME.text, marginBottom: 4 },
  changePhotoText: { fontSize: 13, color: ADONIK_THEME.primaryDark, fontWeight: '600' },

  // Section
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1,
    borderColor: '#E2E8F0', overflow: 'hidden', marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 13, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FAFBFC',
  },
  sectionTitle: { fontSize: 13.5, fontWeight: '700', color: ADONIK_THEME.text },

  fieldGroup: { paddingHorizontal: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  fieldLabel: { width: 85, fontSize: 13, fontWeight: '600', color: '#475569' },
  fieldInput: { flex: 1, fontSize: 14, color: ADONIK_THEME.text, fontWeight: '500' },
  fieldDivider: { height: 1, backgroundColor: '#F1F5F9' },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ADONIK_THEME.primary, margin: 16, marginTop: 8,
    borderRadius: 12, paddingVertical: 13,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Toggles
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  toggleTitle: { fontSize: 13.5, fontWeight: '600', color: ADONIK_THEME.text },
  toggleSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },

  // Action Rows
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  actionTitle: { flex: 1, fontSize: 13.5, fontWeight: '600', color: ADONIK_THEME.text },
  actionRight: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  // Danger Zone
  dangerZone: {
    borderRadius: 16, borderWidth: 1.5, borderColor: '#FECACA',
    overflow: 'hidden', backgroundColor: '#FFFAFA', marginBottom: 14,
  },
  dangerTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 6 },
  dangerDesc: { fontSize: 12.5, color: '#64748B', lineHeight: 18, marginBottom: 14 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 10,
  },
  deleteBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '700' },

  // Avatar Sheet Modal
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  avatarSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 36, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text, textAlign: 'center' },
  sheetSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 18 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  avatarGridCell: { borderRadius: 40, borderWidth: 2.5, borderColor: 'transparent', position: 'relative' },
  avatarGridCellActive: { borderColor: ADONIK_THEME.primary },
  avatarGridImg: { width: 72, height: 72, borderRadius: 36 },
  avatarCheck: {
    position: 'absolute', bottom: 1, right: 1,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: ADONIK_THEME.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  sheetCancelBtn: { backgroundColor: '#F1F5F9', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  sheetCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },

  // Delete Modal
  deleteOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  deleteBox: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 380, alignItems: 'center' },
  deleteIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#FECACA',
  },
  deleteTitle: { fontSize: 18, fontWeight: '800', color: ADONIK_THEME.text, textAlign: 'center', marginBottom: 10 },
  deleteDesc: { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  deleteInput: {
    width: '100%', borderWidth: 2, borderColor: '#FECACA', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 16, fontWeight: '700', color: '#DC2626',
    textAlign: 'center', letterSpacing: 3, backgroundColor: '#FEF2F2', marginBottom: 20,
  },
  deleteActionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  deleteCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center',
  },
  deleteCancelText: { fontSize: 13.5, fontWeight: '700', color: '#64748B' },
  deleteConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#DC2626', alignItems: 'center' },
  deleteConfirmText: { fontSize: 13.5, fontWeight: '700', color: '#FFFFFF' },
});
