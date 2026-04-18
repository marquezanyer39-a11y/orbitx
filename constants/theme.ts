import type { AppearanceMode, OrbitAccentPreset, OrbitTextPreset } from '../types';

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  profit: string;
  profitSoft: string;
  loss: string;
  lossSoft: string;
  warning: string;
  overlay: string;
  fieldBackground: string;
  chipBackground: string;
  cardGradient: [string, string];
  highlightGradient: [string, string];
  orbPrimary: string;
  orbSecondary: string;
  statusBarStyle: 'light' | 'dark';
}

export const THEMES: Record<AppearanceMode, ThemeColors> = {
  night: {
    background: '#000000',
    backgroundAlt: '#050505',
    surface: '#090909',
    surfaceElevated: '#111111',
    card: 'rgba(10,10,10,0.96)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.22)',
    text: '#FFFFFF',
    textMuted: '#999999',
    textSoft: '#DADADA',
    primary: '#FFFFFF',
    primaryDeep: '#CFCFCF',
    primarySoft: 'rgba(255,255,255,0.14)',
    profit: '#00E78A',
    profitSoft: 'rgba(0,231,138,0.14)',
    loss: '#FF5252',
    lossSoft: 'rgba(255,82,82,0.14)',
    warning: '#F0C56B',
    overlay: 'rgba(0,0,0,0.82)',
    fieldBackground: 'rgba(255,255,255,0.04)',
    chipBackground: 'rgba(255,255,255,0.06)',
    cardGradient: ['rgba(10,10,10,0.98)', 'rgba(4,4,4,0.98)'],
    highlightGradient: ['rgba(255,255,255,0.10)', 'rgba(10,10,10,0.98)'],
    orbPrimary: 'transparent',
    orbSecondary: 'transparent',
    statusBarStyle: 'light',
  },
  day: {
    background: '#FFFFFF',
    backgroundAlt: '#F6F6F8',
    surface: '#F2F2F5',
    surfaceElevated: '#EBEBEF',
    card: 'rgba(255,255,255,0.98)',
    border: 'rgba(15,15,20,0.10)',
    borderStrong: 'rgba(15,15,20,0.18)',
    text: '#0B0B0F',
    textMuted: '#6E6E7C',
    textSoft: '#3A3A46',
    primary: '#0B0B0F',
    primaryDeep: '#000000',
    primarySoft: 'rgba(11,11,15,0.08)',
    profit: '#00A86B',
    profitSoft: 'rgba(0,168,107,0.12)',
    loss: '#E54848',
    lossSoft: 'rgba(229,72,72,0.12)',
    warning: '#C98B2B',
    overlay: 'rgba(20,20,28,0.22)',
    fieldBackground: 'rgba(15,15,20,0.04)',
    chipBackground: 'rgba(15,15,20,0.06)',
    cardGradient: ['rgba(255,255,255,0.98)', 'rgba(246,246,248,0.98)'],
    highlightGradient: ['rgba(0,0,0,0.04)', 'rgba(255,255,255,0.98)'],
    orbPrimary: 'transparent',
    orbSecondary: 'transparent',
    statusBarStyle: 'dark',
  },
  orbit: {
    background: '#050505',
    backgroundAlt: '#0B0B0F',
    surface: '#101015',
    surfaceElevated: '#17171F',
    card: 'rgba(14,14,18,0.96)',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.16)',
    text: '#FFFFFF',
    textMuted: '#8E8EA0',
    textSoft: '#C8C8D2',
    primary: '#FFFFFF',
    primaryDeep: '#D9D9E0',
    primarySoft: 'rgba(255,255,255,0.08)',
    profit: '#00FFA3',
    profitSoft: 'rgba(0,255,163,0.14)',
    loss: '#FF4D4D',
    lossSoft: 'rgba(255,77,77,0.14)',
    warning: '#FFB84D',
    overlay: 'rgba(5,5,8,0.78)',
    fieldBackground: 'rgba(255,255,255,0.04)',
    chipBackground: 'rgba(255,255,255,0.05)',
    cardGradient: ['rgba(18,18,22,0.98)', 'rgba(8,8,10,0.98)'],
    highlightGradient: ['rgba(255,255,255,0.10)', 'rgba(12,12,15,0.98)'],
    orbPrimary: withOpacity('#7B3FE4', 0.20),
    orbSecondary: withOpacity('#FFFFFF', 0.08),
    statusBarStyle: 'light',
  },
};

export const ORBIT_ACCENTS: Record<OrbitAccentPreset, string> = {
  violet: '#7B3FE4',
  cyan: '#00E5FF',
  lime: '#8CFF4D',
  sunset: '#FF8A3D',
  rose: '#FF5FA2',
};

export const ORBIT_TEXTS: Record<
  OrbitTextPreset,
  { text: string; textSoft: string; textMuted: string }
> = {
  default: {
    text: '#FFFFFF',
    textSoft: '#C8C8D2',
    textMuted: '#8E8EA0',
  },
  ice: {
    text: '#E9FCFF',
    textSoft: '#C8F7FF',
    textMuted: '#8BC7D2',
  },
  neon: {
    text: '#E9FFF8',
    textSoft: '#B7FFE9',
    textMuted: '#79CFAE',
  },
  gold: {
    text: '#FFF4D6',
    textSoft: '#FFE6A6',
    textMuted: '#D2B977',
  },
};

export function getOrbitCustomizedTheme(
  accentPreset: OrbitAccentPreset,
  textPreset: OrbitTextPreset,
) {
  const accent = ORBIT_ACCENTS[accentPreset] ?? ORBIT_ACCENTS.violet;
  const textTone = ORBIT_TEXTS[textPreset] ?? ORBIT_TEXTS.default;
  const base = THEMES.orbit;

  return {
    ...base,
    text: textTone.text,
    textSoft: textTone.textSoft,
    textMuted: textTone.textMuted,
    primary: accent,
    primaryDeep: accent,
    primarySoft: withOpacity(accent, 0.18),
    borderStrong: withOpacity(accent, 0.34),
    warning: accentPreset === 'sunset' ? '#FFB84D' : accentPreset === 'rose' ? '#FF86B8' : base.warning,
    orbPrimary: withOpacity(accent, 0.24),
    orbSecondary: withOpacity(textTone.text, 0.08),
    highlightGradient: [withOpacity(accent, 0.18), 'rgba(12,12,15,0.98)'] as [string, string],
  };
}

export const COLORS = THEMES.orbit;

export const FONT = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADII = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const SHADOWS = {
  glow: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
} as const;

export function withOpacity(hexColor: string, alpha: number) {
  const hex = hexColor.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex;
  const opacity = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${normalized}${opacity}`;
}
