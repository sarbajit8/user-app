import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    icon: 'flash-outline' as const,
  },
  {
    id: 'cards',
    title: 'Cards',
    subtitle: 'Visa, MasterCard, Rupay',
    icon: 'card-outline' as const,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All Indian Banks',
    icon: 'business-outline' as const,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay at your doorstep',
    icon: 'cash-outline' as const,
  },
];

export default function WalletPaymentsScreen({ navigation }: any) {
  const [balance, setBalance] = useState(1250);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const handleAddMoney = () => {
    Alert.alert(
      'Add Money to Adonik Wallet',
      'Choose amount to top up:',
      [
        { text: '+ ₹500', onPress: () => setBalance((b) => b + 500) },
        { text: '+ ₹1,000', onPress: () => setBalance((b) => b + 1000) },
        { text: '+ ₹2,000', onPress: () => setBalance((b) => b + 2000) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet & Payments</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
      >
        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹ {balance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.addMoneyBtn}
            onPress={handleAddMoney}
            activeOpacity={0.85}
          >
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods Section */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((item, idx) => {
            const isSelected = selectedMethod === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.methodRow,
                  idx < PAYMENT_METHODS.length - 1 && styles.methodBorder,
                ]}
                onPress={() => setSelectedMethod(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.methodIconBox}>
                  <Ionicons name={item.icon} size={22} color={ADONIK_THEME.primary} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{item.title}</Text>
                  <Text style={styles.methodSubtitle}>{item.subtitle}</Text>
                </View>

                {/* Radio selection */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Security badge */}
        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={ADONIK_THEME.success} />
          <Text style={styles.securityText}>
            256-Bit Bank-grade encryption. Your payment details are strictly secured.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ADONIK_THEME.background,
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: ADONIK_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  backBtn: {
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 26,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 4,
  },
  addMoneyBtn: {
    backgroundColor: ADONIK_THEME.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addMoneyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    marginTop: 6,
  },
  methodsContainer: {
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
    paddingHorizontal: 16,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  methodBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  methodIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: ADONIK_THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  methodSubtitle: {
    fontSize: 12,
    color: ADONIK_THEME.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ADONIK_THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: ADONIK_THEME.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ADONIK_THEME.primary,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 10,
    marginTop: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
});
