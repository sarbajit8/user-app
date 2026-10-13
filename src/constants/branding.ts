import { ImageSourcePropType } from 'react-native';

/**
 * Permanent Adonik Brand Assets
 * Bundled locally so the logo is ALWAYS permanently available even without backend or network.
 */
export const LOCAL_APP_LOGO: ImageSourcePropType = require('../../assets/app_logo.png');
export const LOCAL_WELCOME_SPLASH: ImageSourcePropType = require('../../assets/adonik_welcome_splash.png');

/**
 * Resolves the app logo image source reliably across all environments (mobile & web).
 * If admin has set a custom URL or base64 image, it uses that.
 * Otherwise, it falls back to the permanent bundled Adonik logo.
 */
export function getAppLogoSource(logoUrl?: string | null): ImageSourcePropType {
  if (logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 0) {
    if (
      logoUrl.startsWith('data:') ||
      logoUrl.startsWith('http://') ||
      logoUrl.startsWith('https://') ||
      logoUrl.startsWith('file://')
    ) {
      return { uri: logoUrl };
    }
  }
  return LOCAL_APP_LOGO;
}

/**
 * Resolves the starting page center artwork source.
 */
export function getArtworkSource(
  artworkUrl?: string | null,
  logoUrl?: string | null
): ImageSourcePropType {
  if (artworkUrl && typeof artworkUrl === 'string' && artworkUrl.trim().length > 0) {
    if (
      artworkUrl.startsWith('data:') ||
      artworkUrl.startsWith('http://') ||
      artworkUrl.startsWith('https://') ||
      artworkUrl.startsWith('file://')
    ) {
      return { uri: artworkUrl };
    }
  }
  // Fall back to custom logo or permanent bundled logo
  return getAppLogoSource(logoUrl);
}
