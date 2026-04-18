export const orbitColors = {
  background: '#0B0B0F',
  backgroundAlt: '#101017',
  surface: '#14141C',
  surfaceElevated: '#1A1A24',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(123,63,228,0.38)',
  text: '#FFFFFF',
  textMuted: '#9C9CB1',
  textSoft: '#D8D8E4',
  primary: '#7B3FE4',
  primarySoft: 'rgba(123,63,228,0.18)',
  buy: '#00FFA3',
  buySoft: 'rgba(0,255,163,0.14)',
  sell: '#FF4D4D',
  sellSoft: 'rgba(255,77,77,0.14)',
  warning: '#FFB84D',
  overlay: 'rgba(8,8,12,0.76)',
} as const;

export type OrbitColorPalette = typeof orbitColors;
