import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigation.navigate('Main');
  };

  const MENU_ITEMS = [
    {
      id: 'orders',
      title: 'My Orders',
      icon: 'bag-handle-outline' as const,
      route: 'Orders',
    },
    {
      id: 'addresses',
      title: 'My Addresses',
      icon: 'location-outline' as const,
      route: 'AddressManage',
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: 'heart-outline' as const,
      route: 'Wishlist',
    },
    {
      id: 'wallet',
      title: 'Wallet & Payments',
      icon: 'wallet-outline' as const,
      route: 'WalletPayments',
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline' as const,
      route: 'HelpSupport',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings-outline' as const,
      route: 'Settings',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} nestedScrollEnabled={true}>
        {/* User Profile Header */}
        <View style={styles.userHeader}>
          <Image
            source={{ uri: IMAGES.userAvatar }}
            style={styles.avatarImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Sarbajit Paul'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'sarbajit@example.com'}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={ADONIK_THEME.text} />
          </TouchableOpacity>
        </View>

        {/* Gold Member VIP Card */}
        <TouchableOpacity
          style={styles.goldMemberCard}
          onPress={() => Alert.alert('Adonik Gold', 'You enjoy Free Express Delivery & 5% Cashback on every order.')}
          activeOpacity={0.9}
        >
          <View style={styles.goldBadgeIconBox}>
            <Ionicons name="ribbon" size={22} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.goldTitle}>Gold Member</Text>
            <Text style={styles.goldSubtitle}>You are a Gold Member</Text>
            <Text style={styles.goldNote}>Get exclusive offers & rewards</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={ADONIK_THEME.primaryDark} />
        </TouchableOpacity>

        {/* Guest Banner if not authenticated */}
        {!isAuthenticated && (
          <View style={styles.guestBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.guestTitle}>Guest Mode</Text>
              <Text style={styles.guestDesc}>Sign in to sync your saved items, addresses, and order history.</Text>
            </View>
            <TouchableOpacity
              style={styles.guestSignInBtn}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              activeOpacity={0.85}
            >
              <Text style={styles.guestSignInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                idx < MENU_ITEMS.length - 1 && styles.menuBorder,
              ]}
              onPress={() => {
                const anyItem = item as any;
                if (anyItem.action) {
                  anyItem.action();
                } else if (anyItem.route) {
                  navigation.navigate(anyItem.route);
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color={ADONIK_THEME.text} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={ADONIK_THEME.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout or Account Action */}
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={ADONIK_THEME.error} style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Sign In to Account</Text>
          </TouchableOpacity>
        )}

        {/* Footer info */}
        <Text style={styles.footerVersion}>Adonik v2.4.0 • Shop More, Live Better</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Universal Sign Out Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="log-out-outline" size={28} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Sign Out of Adonik?</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to sign out? You will need to log back in to access your orders, saved addresses, and wallet.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ADONIK_THEME.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: ADONIK_THEME.primaryLight,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
  userEmail: {
    fontSize: 13,
    color: ADONIK_THEME.textSecondary,
    marginTop: 2,
  },
  settingsIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ADONIK_THEME.surface,
    borderWidth: 1,
    borderColor: ADONIK_THEME.borderLight,
  },
  goldMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 14,
  },
  goldBadgeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  goldSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 1,
  },
  goldNote: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
    gap: 12,
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  guestDesc: {
    fontSize: 12,
    color: ADONIK_THEME.textSecondary,
    marginTop: 2,
  },
  guestSignInBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  guestSignInText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  menuContainer: {
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  menuIcon: {
    marginRight: 14,
    width: 24,
  },
  menuTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: ADONIK_THEME.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },
  logoutText: {
    color: ADONIK_THEME.error,
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: ADONIK_THEME.textMuted,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
