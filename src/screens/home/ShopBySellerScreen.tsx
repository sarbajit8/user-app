import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';

const SELLERS = [
  {
    id: 1,
    name: 'Fashion Hub',
    category: 'Fashion & Lifestyle',
    rating: 4.6,
    reviews: '2.3k',
    avatar: IMAGES.sellerFashion,
    isFollowing: false,
  },
  {
    id: 2,
    name: 'ElectroMart',
    category: 'Electronics & Gadgets',
    rating: 4.5,
    reviews: '2.1k',
    avatar: IMAGES.sellerElectro,
    isFollowing: false,
  },
  {
    id: 3,
    name: 'Home Essentials',
    category: 'Home & Living',
    rating: 4.4,
    reviews: '1.2k',
    avatar: IMAGES.sellerHome,
    isFollowing: false,
  },
  {
    id: 4,
    name: 'Beauty World',
    category: 'Beauty & Personal Care',
    rating: 4.3,
    reviews: '860',
    avatar: IMAGES.sellerBeauty,
    isFollowing: false,
  },
];

const TABS = ['Popular', 'Top Rated', 'New Sellers'];

export default function ShopBySellerScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('Popular');
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  const toggleFollow = (id: number) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
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
        <Text style={styles.headerTitle}>Shop by Seller</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sellers List */}
      <FlatList
        data={SELLERS}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isFollowing = followingMap[item.id];
          return (
            <TouchableOpacity
              style={styles.sellerCard}
              onPress={() => navigation.navigate('VendorStore', { seller: item })}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.avatar }} style={styles.sellerAvatar} />

              <View style={styles.infoCol}>
                <Text style={styles.sellerName}>{item.name}</Text>
                <Text style={styles.sellerCategory}>{item.category}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>
              </View>

              {/* Follow Button */}
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={() => toggleFollow(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ADONIK_THEME.surface,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: ADONIK_THEME.borderLight,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabPillActive: {
    backgroundColor: ADONIK_THEME.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: ADONIK_THEME.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ADONIK_THEME.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ADONIK_THEME.border,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8F9FA',
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: ADONIK_THEME.text,
  },
  sellerCategory: {
    fontSize: 12,
    color: ADONIK_THEME.textSecondary,
    marginTop: 2,
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
  reviewsText: {
    fontSize: 11,
    color: ADONIK_THEME.textMuted,
  },
  followBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: ADONIK_THEME.primary,
    backgroundColor: '#FFFFFF',
  },
  followingBtn: {
    backgroundColor: ADONIK_THEME.primaryLight,
    borderColor: ADONIK_THEME.primary,
  },
  followBtnText: {
    color: ADONIK_THEME.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  followingBtnText: {
    color: ADONIK_THEME.primaryDark,
  },
});
