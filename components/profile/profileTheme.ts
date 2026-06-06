import { FONT, withOpacity } from '../../constants/theme';

export const PROFILE_THEME = {
  colors: {
    background: '#08090B',
    surface: '#111318',
    surfaceLowest: '#0B0B0F',
    surfaceLow: '#141518',
    surfaceMid: '#191B22',
    surfaceHigh: '#20232B',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#7C8492',
    outline: '#FFFFFF',
    primary: '#7B3FE4',
    secondary: '#00C853',
    tertiary: '#FFB68D',
    success: '#00C853',
    danger: '#FF5252',
  },
  spacing: {
    horizontal: 12,
    section: 14,
    block: 12,
  },
  radius: {
    hero: 22,
    card: 20,
    secondary: 18,
    pill: 999,
  },
  typography: {
    title: FONT.bold,
    body: FONT.regular,
    bodyMedium: FONT.medium,
    bodyStrong: FONT.semibold,
  },
  bottomSpacing: 118,
} as const;

export function withProfileAlpha(color: string, alpha: number) {
  return withOpacity(color, alpha);
}

export function getMetricToneColor(
  tone: 'positive' | 'negative' | 'neutral' | 'warning',
) {
  if (tone === 'positive') return PROFILE_THEME.colors.secondary;
  if (tone === 'negative') return PROFILE_THEME.colors.danger;
  if (tone === 'warning') return PROFILE_THEME.colors.tertiary;
  return PROFILE_THEME.colors.textPrimary;
}
