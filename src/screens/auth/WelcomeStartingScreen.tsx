import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { FONT_FAMILY, FONT_FAMILY_MEDIUM } from '../../theme/typography';
import { getAppLogoSource, getArtworkSource } from '../../constants/branding';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function WelcomeStartingScreen({ navigation }: any) {
  const { settings, fetchSettings } = useSettingsStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // If user is already authenticated, go directly to Main
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleStartShopping = () => {
    // Allows user to immediately browse the store as a guest without registering
    navigation.replace('Main');
  };

  const handleSignIn = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleRegister = () => {
    navigation.navigate('Auth', { screen: 'Register' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Soft Background Warm Glow Circles */}
        <View style={styles.glowTopRight} />
        <View style={styles.glowMiddleLeft} />

        {/* Top Header: Stylized Brand Logo & Tagline */}
        <View style={styles.header}>
          <View style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={getAppLogoSource(settings.app_logo)}
              style={{ height: 50, width: 220 }}
              resizeMode="contain"
            />
          </View>

          {/* Elegant Tagline */}
          <Text style={styles.taglineText}>
            {settings.app_tagline || 'SHOP MORE  LIVE BETTER'}
          </Text>
        </View>

        {/* Center Artwork: Clean Square Image (Customizable from Admin) */}
        <View style={styles.artworkContainer}>
          <View style={styles.defaultSquareCard}>
            <Image
              source={getArtworkSource(settings.app_starting_image, settings.app_logo)}
              style={{ width: '85%', height: '85%' }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Brand Title & Subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>
            {settings.app_name ? `${settings.app_name} Exclusive` : 'Adonik Exclusive'}
          </Text>
          <Text style={styles.subtitleText}>
            {settings.starting_page_subtitle ||
              'Curated marketplace for verified brands, premium electronics & trending fashion.'}
          </Text>
        </View>

        {/* Bottom Unregistered User CTA Actions */}
        <View style={styles.actionsContainer}>
          {/* Main Action: Start Shopping as Guest */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: settings.app_primary_color || '#0F172A' }]}
            onPress={handleStartShopping}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Start Shopping</Text>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={14} color="#0F172A" />
            </View>
          </TouchableOpacity>

          {/* Secondary Actions: Sign In / Create Account */}
          <View style={styles.authLinksRow}>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7} style={styles.authLinkBtn}>
              <Text style={styles.authLinkSub}>Already a member?</Text>
              <Text style={styles.authLinkMain}> Sign In</Text>
            </TouchableOpacity>

            <View style={styles.authDivider} />

            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7} style={styles.authLinkBtn}>
              <Text style={styles.authLinkSub}>New here?</Text>
              <Text style={styles.authLinkMain}> Register</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  // Ambient Glowing Orbs
  glowTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(235, 215, 185, 0.45)',
  },
  glowMiddleLeft: {
    position: 'absolute',
    top: SCREEN_H * 0.28,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(240, 222, 195, 0.35)',
  },

  // Header & Logo
  header: {
    alignItems: 'center',
    marginTop: 8,
    zIndex: 10,
  },
  brandFallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
  },
  goldEmblemBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#C89B53',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C89B53',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  brandFallbackName: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  taglineText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 4,
    fontWeight: '600',
  },

  // Default Luxury Square Card when no custom artwork
  defaultSquareCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  defaultSquareContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  goldEmblemLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#C89B53',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#C89B53',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  goldEmblemLargeText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
  },
  defaultSquareBrand: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 3,
  },
  defaultSquareSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#C89B53',
    letterSpacing: 2,
    fontWeight: '600',
  },

  // Text container
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
    zIndex: 10,
  },
  titleText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 320,
  },

  // Center Artwork (Clean Square as requested)
  artworkContainer: {
    width: SCREEN_W * 0.72,
    height: SCREEN_W * 0.72,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 5,
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },

  // Actions
  actionsContainer: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 14,
    zIndex: 10,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    paddingHorizontal: 20,
  },
  primaryBtnText: {
    fontFamily: FONT_FAMILY_MEDIUM,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C89B53',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  authLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  authLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authLinkSub: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#64748B',
  },
  authLinkMain: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  authDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
  },
});
