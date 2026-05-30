export const SOCIAL_COLORS = {
  background: '#08090B',
  backgroundAlt: '#0D150D',
  surface: 'rgba(20,21,24,0.72)',
  surfaceSoft: 'rgba(20,21,24,0.58)',
  surfaceStrong: 'rgba(25,34,25,0.88)',
  surfaceBlur: 'rgba(20,21,24,0.65)',
  overlay: 'rgba(8,9,11,0.88)',
  border: 'rgba(255,255,255,0.08)',
  borderSoft: 'rgba(60,74,60,0.24)',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textSoft: '#DCE5D7',
  accentGreen: '#00C853',
  accentGreenSoft: '#3FE56C',
  accentPurple: '#A855F7',
  accentBlue: '#7FE9FF',
  danger: '#FF5252',
  live: '#FF4D4D',
  warning: '#FFD76A',
  glowGreen: 'rgba(0,200,83,0.15)',
} as const;

export const SOCIAL_GRADIENTS = {
  topVignette: ['rgba(8,16,8,0.88)', 'transparent'] as const,
  bottomVignette: ['rgba(8,16,8,0)', 'rgba(8,16,8,1)'] as const,
  heroOverlay: ['rgba(0,0,0,0.14)', 'rgba(8,16,8,0.9)'] as const,
} as const;

export const SOCIAL_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 24,
} as const;

export const SOCIAL_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const SOCIAL_TYPOGRAPHY = {
  display: 32,
  headline: 20,
  title: 18,
  body: 16,
  label: 14,
  caption: 12,
  micro: 10,
} as const;

export const SOCIAL_LAYOUT = {
  bottomSafeContent: 132,
  liveInteractiveZone: 0.3,
  maxModalWidth: 480,
} as const;

export const SOCIAL_SHADOWS = {
  premiumGlow: {
    shadowColor: '#00C853',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  liveGlow: {
    shadowColor: '#FF4D4D',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
} as const;

export const socialTheme = {
  colors: {
    background: SOCIAL_COLORS.background,
    surface: SOCIAL_COLORS.surfaceStrong,
    surfaceBlur: SOCIAL_COLORS.surfaceBlur,
    green: SOCIAL_COLORS.accentGreen,
    greenGlow: SOCIAL_COLORS.glowGreen,
    textPrimary: SOCIAL_COLORS.textPrimary,
    textSecondary: SOCIAL_COLORS.textSecondary,
    danger: SOCIAL_COLORS.danger,
    borderSoft: SOCIAL_COLORS.borderSoft,
  },
  spacing: SOCIAL_SPACING,
  radius: SOCIAL_RADIUS,
  glows: SOCIAL_SHADOWS,
} as const;
