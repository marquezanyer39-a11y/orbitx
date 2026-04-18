import type { Href } from 'expo-router';

export interface OrbitTabItem {
  key: 'home' | 'market' | 'spot' | 'wallet' | 'profile';
  label: string;
  href: Href;
  icon: string;
  accent?: boolean;
}

export const TAB_NAV_ITEMS: OrbitTabItem[] = [
  { key: 'home', label: 'Inicio', href: '/home', icon: 'home' },
  { key: 'market', label: 'Mercados', href: '/market', icon: 'stats-chart' },
  { key: 'spot', label: 'Operar', href: '/spot', icon: 'swap-horizontal', accent: true },
  { key: 'wallet', label: 'Billetera', href: '/wallet', icon: 'wallet' },
  { key: 'profile', label: 'Perfil', href: '/profile', icon: 'person-circle' },
];
