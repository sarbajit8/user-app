import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Visual Artwork */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: IMAGES.onboardingBags }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.artworkGradient} />
        </View>

        {/* Brand & Tagline */}
        <View style={styles.brandContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoEmblem}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Adonik</Text>
          </View>
          <Text style={styles.tagline}>Shop More  •  Live Better</Text>
        </View>

        {/* 3 Trust Feature Badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={ADONIK_THEME.primaryDark} />
            </View>
            <Text style={styles.trustText}>Quality Products</Text>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconBox}>
              <Ionicons name="card-outline" size={20} color={ADONIK_THEME.primaryDark} />
            </View>
            <Text style={styles.trustText}>Secure Payments</Text>
          </View>

          <View style={styles.trustItem}>
            <View style={styles.trustIconBox}>
              <Ionicons name="speedometer-outline" size={20} color={ADONIK_THEME.primaryDark} />
            </View>
            <Text style={styles.trustText}>Fast Delivery</Text>
          </View>
        </View>

        {/* Bottom CTA Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.88}
          >
            <Text style={styles.startBtnText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  artworkContainer: {
    width: SCREEN_W,
    height: SCREEN_W * 0.95,
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  artworkGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  brandContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoEmblem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: ADONIK_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: ADONIK_THEME.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  trustItem: {
    alignItems: 'center',
    width: 96,
  },
  trustIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: ADONIK_THEME.text,
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  startBtn: {
    backgroundColor: ADONIK_THEME.primary,
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ADONIK_THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
