import { ORBITX_COLORS, withOpacity } from '../../constants/theme';

export const ORBITX_THEME = {
  colors: {
    background: ORBITX_COLORS.background,
    surfaceSoft: ORBITX_COLORS.surfaceSoft,
    surface: ORBITX_COLORS.surface,
    border: '#22314A',
    primaryGreen: '#00FFB2',
    textPrimary: ORBITX_COLORS.textPrimary,
    textSecondary: ORBITX_COLORS.textSecondary,
    lossRed: ORBITX_COLORS.red,
    accentGlow: withOpacity('#00E5FF', 0.08),
  },
  spacing: {
    screenMargin: 14,
    smallScreenMargin: 14,
    cardPadding: 12,
  },
} as const;

export const SCREEN_PADDING = 14;
export const SCREEN_PADDING_SMALL = 14;
export const BLOCK_GAP = 12;
export const SECTION_GAP = BLOCK_GAP;
export const CARD_RADIUS = 17;

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
