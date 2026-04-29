import { FONT, withOpacity } from '../../constants/theme';

export const PROFILE_THEME = {
  colors: {
    background: '#08090B',
    surface: '#14121C',
    surfaceLowest: '#0F0D16',
    surfaceLow: '#1D1A24',
    surfaceMid: '#211E28',
    surfaceHigh: '#2B2833',
    textPrimary: '#E6E0EF',
    textSecondary: '#CAC3D8',
    textMuted: '#9B95A8',
    outline: '#494456',
    primary: '#6F3FF5',
    secondary: '#47F3D1',
    tertiary: '#FFB68D',
    success: '#47F3D1',
    danger: '#FFB4AB',
  },
  spacing: {
    horizontal: 16,
    section: 18,
    block: 16,
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
  bottomSpacing: 142,
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
