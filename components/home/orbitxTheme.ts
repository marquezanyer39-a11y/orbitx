import { Platform } from 'react-native';

export const ORBITX_THEME = {
  colors: {
    background: '#08090B',
    surfaceSoft: '#111318',
    surface: '#141518',
    border: '#2D3139',
    primaryGreen: '#00C853',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    lossRed: '#FF5252',
    accentGlow: 'rgba(0, 200, 83, 0.15)',
  },
  spacing: {
    screenMargin: Platform.OS === 'android' ? 10 : 12,
    smallScreenMargin: 8,
    cardPadding: 14,
  },
} as const;

export const SCREEN_PADDING = Platform.OS === 'android' ? 10 : 12;
export const SCREEN_PADDING_SMALL = 8;
export const BLOCK_GAP = 14;
export const SECTION_GAP = BLOCK_GAP;
export const CARD_RADIUS = 18;

export function getHomeLayoutMetrics(screenWidth: number) {
  const isSmallPhone = screenWidth < 380;
  const horizontalMargin = isSmallPhone
    ? ORBITX_THEME.spacing.smallScreenMargin
    : ORBITX_THEME.spacing.screenMargin;

  return {
    screenWidth,
    isSmallPhone,
    horizontalMargin,
    contentWidth: Math.max(screenWidth - horizontalMargin * 2, 0),
  };
}
