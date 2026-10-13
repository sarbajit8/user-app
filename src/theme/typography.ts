import { Platform, TextStyle } from 'react-native';

export const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
  default: 'System',
});

export const FONT_FAMILY_MEDIUM = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif',
  default: 'System',
});

export const TYPOGRAPHY: Record<string, TextStyle> = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    fontWeight: '600',
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '400',
  },
  captionMedium: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 11,
    fontWeight: '500',
  },
  button: {
    fontFamily: FONT_FAMILY_MEDIUM,
    fontSize: 14,
    fontWeight: '600',
  },
};
