import type { OrbitChartHtmlColors } from './lightweightChartHtml';

export type QvexChartPreset = 'qvexDarkPro' | 'qvexNeon' | 'qvexMinimal' | 'qvexBinanceLike';

export interface QvexChartTheme extends OrbitChartHtmlColors {
  volumeProfit: string;
  volumeLoss: string;
  crosshair: string;
  priceLine: string;
  watermark?: string;
  ma5: string;
  ma10: string;
  ma30: string;
  priceScaleBorder: string;
  timeScaleBorder: string;
}

export const qvexDarkPro: QvexChartTheme = {
  background: '#080B10',
  backgroundAlt: '#0B101B',
  text: '#F8FBFF',
  textMuted: '#8A94A6',
  border: 'rgba(34, 49, 74, 0.6)',
  borderStrong: 'rgba(34, 49, 74, 0.9)',
  grid: 'rgba(34, 49, 74, 0.3)',
  gridStrong: 'rgba(0, 229, 255, 0.16)',
  primary: '#00E5FF',
  profit: '#00FFB2',
  loss: '#FF3B6B',
  volumeProfit: 'rgba(0, 255, 178, 0.22)',
  volumeLoss: 'rgba(255, 59, 107, 0.22)',
  crosshair: 'rgba(0, 229, 255, 0.16)',
  priceLine: '#00E5FF',
  watermark: 'rgba(248, 251, 255, 0.04)',
  ma5: '#FACC15',
  ma10: '#38BDF8',
  ma30: '#A855F7',
  priceScaleBorder: 'rgba(34, 49, 74, 0.9)',
  timeScaleBorder: 'rgba(34, 49, 74, 0.9)',
};

export const qvexNeon: QvexChartTheme = {
  ...qvexDarkPro,
  background: '#050505',
  profit: '#00FF9D',
  loss: '#FF0055',
  primary: '#D000FF',
  gridStrong: 'rgba(208, 0, 255, 0.2)',
  crosshair: 'rgba(208, 0, 255, 0.2)',
  priceLine: '#D000FF',
  volumeProfit: 'rgba(0, 255, 157, 0.25)',
  volumeLoss: 'rgba(255, 0, 85, 0.25)',
};

export const qvexMinimal: QvexChartTheme = {
  ...qvexDarkPro,
  background: '#FFFFFF',
  backgroundAlt: '#F3F4F6',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  grid: '#F3F4F6',
  gridStrong: '#E5E7EB',
  primary: '#3B82F6',
  profit: '#10B981',
  loss: '#EF4444',
  volumeProfit: 'rgba(16, 185, 129, 0.15)',
  volumeLoss: 'rgba(239, 68, 68, 0.15)',
  crosshair: '#9CA3AF',
  priceLine: '#3B82F6',
  watermark: 'rgba(17, 24, 39, 0.03)',
  ma5: '#F59E0B',
  ma10: '#0EA5E9',
  ma30: '#8B5CF6',
  priceScaleBorder: '#D1D5DB',
  timeScaleBorder: '#D1D5DB',
};

export const qvexBinanceLike: QvexChartTheme = {
  ...qvexDarkPro,
  background: '#161A1E',
  backgroundAlt: '#1E2329',
  text: '#B7BDC6',
  textMuted: '#848E9C',
  border: '#2B3139',
  borderStrong: '#2B3139',
  grid: '#1C2127',
  gridStrong: '#2B3139',
  primary: '#FCD535',
  profit: '#0ECB81',
  loss: '#F6465D',
  volumeProfit: 'rgba(14, 203, 129, 0.3)',
  volumeLoss: 'rgba(246, 70, 93, 0.3)',
  crosshair: '#848E9C',
  priceLine: '#FCD535',
  watermark: 'rgba(183, 189, 198, 0.05)',
  ma5: '#FCD535',
  ma10: '#46C0E9',
  ma30: '#D272EB',
  priceScaleBorder: '#2B3139',
  timeScaleBorder: '#2B3139',
};

export const CHART_THEMES: Record<QvexChartPreset, QvexChartTheme> = {
  qvexDarkPro,
  qvexNeon,
  qvexMinimal,
  qvexBinanceLike,
};
