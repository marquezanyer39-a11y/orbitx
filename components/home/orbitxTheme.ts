export const ORBITX_THEME = {
  colors: {
    background: '#08090B',
    surface: '#141518',
    border: '#2D3139',
    primaryGreen: '#00C853',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    lossRed: '#FF5252',
    accentGlow: 'rgba(0, 200, 83, 0.15)',
  },
  spacing: {
    screenMargin: 20,
    smallScreenMargin: 18,
    cardPadding: 16,
  },
} as const;

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
