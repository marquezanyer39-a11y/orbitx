import { ORBITX_COLORS, withOpacity } from '../../constants/theme';
import type { VipRank } from '../types/vip';

const VIOLET_SOFT = withOpacity(ORBITX_COLORS.purpleSoft, 0.22);
const GOLD_SOFT = withOpacity('#FFB68D', 0.18);
const GOLD_STRONG_SOFT = withOpacity('#D9B84A', 0.18);

export const VIP_RANKS: VipRank[] = [
  {
    id: 'basic',
    order: 1,
    level: 1,
    name: 'Basic',
    shortLabel: 'BASIC',
    description: 'Estado inicial validado dentro del ecosistema QVEX',
    requirements: [
      { id: 'basic-verify', kind: 'verification', label: 'Cuenta verificada' },
      { id: 'basic-deposit', kind: 'deposit_usdt', label: 'Deposito minimo acumulado', value: 100 },
    ],
    benefits: [
      { id: 'basic-status', kind: 'user_validated', label: 'Estado de por vida', lifetime: true },
      { id: 'basic-ring', kind: 'ring_skin', label: 'Anillo skin basico alrededor de la foto', lifetime: true },
      { id: 'basic-user', kind: 'user_validated', label: 'Usuario validado', lifetime: true },
    ],
    lifetimeBenefits: [
      { id: 'basic-status-lifetime', kind: 'user_validated', label: 'Estado de por vida', lifetime: true },
      { id: 'basic-ring-lifetime', kind: 'ring_skin', label: 'Anillo skin basico alrededor de la foto', lifetime: true },
      { id: 'basic-user-lifetime', kind: 'user_validated', label: 'Usuario validado', lifetime: true },
    ],
    activeBenefits: [],
    maintenanceRequirement: null,
    isExclusive: false,
    requiresReview: false,
    monthlyLimit: null,
    badgeLabel: 'BASE',
    visualStyle: {
      accent: '#C8BDD8',
      accentSoft: withOpacity('#C8BDD8', 0.16),
      icon: 'star-outline',
    },
  },
  {
    id: 'plus',
    order: 2,
    level: 2,
    name: 'Plus',
    shortLabel: 'PLUS',
    description: 'Mejora visual y social para usuarios activos',
    requirements: [
      { id: 'plus-verify', kind: 'verification', label: 'Cuenta verificada' },
      { id: 'plus-deposit', kind: 'deposit_usdt', label: 'Deposito minimo acumulado', value: 100 },
      { id: 'plus-volume', kind: 'trade_volume_usd', label: 'Volumen de trade acumulado', value: 1000 },
    ],
    benefits: [
      { id: 'plus-status', kind: 'permanent_plus', label: 'Estado Plus permanente', lifetime: true },
      { id: 'plus-ring', kind: 'ring_skin', label: 'Anillo skin ligero alrededor de la foto', lifetime: true },
      { id: 'plus-social', kind: 'social_highlight', label: 'Resalte leve en social' },
      { id: 'plus-live', kind: 'live_highlight', label: 'Resalte leve en lives' },
    ],
    lifetimeBenefits: [
      { id: 'plus-status-lifetime', kind: 'permanent_plus', label: 'Estado Plus permanente', lifetime: true },
      { id: 'plus-ring-lifetime', kind: 'ring_skin', label: 'Anillo skin ligero alrededor de la foto', lifetime: true },
    ],
    activeBenefits: [
      { id: 'plus-social-active', kind: 'social_highlight', label: 'Resalte leve en social' },
      { id: 'plus-live-active', kind: 'live_highlight', label: 'Resalte leve en lives' },
    ],
    maintenanceRequirement: null,
    isExclusive: false,
    requiresReview: false,
    monthlyLimit: null,
    badgeLabel: 'PLUS',
    visualStyle: {
      accent: ORBITX_COLORS.purpleSoft,
      accentSoft: VIOLET_SOFT,
      icon: 'flash-outline',
    },
  },
  {
    id: 'vizconde',
    order: 3,
    level: 3,
    name: 'Vizconde',
    shortLabel: 'VIZCONDE',
    description: 'Rango VIP avanzado con beneficios comunitarios y airdrops',
    requirements: [
      { id: 'viz-verify', kind: 'verification', label: 'Cuenta verificada' },
      { id: 'viz-deposit', kind: 'deposit_usdt', label: 'Deposito minimo acumulado', value: 10000 },
      { id: 'viz-volume', kind: 'trade_volume_usd', label: 'Volumen de trade acumulado', value: 50000 },
    ],
    benefits: [
      { id: 'viz-airdrops', kind: 'exclusive_airdrops', label: 'Acceso a airdrops exclusivos' },
      { id: 'viz-projects', kind: 'free_projects', label: 'Participacion en hasta 5 proyectos gratis' },
      { id: 'viz-entry', kind: 'live_entry_skin', label: 'Skin especial de entrada en lives' },
      { id: 'viz-chat', kind: 'live_chat_highlight', label: 'Chat resaltado en lives' },
    ],
    lifetimeBenefits: [],
    activeBenefits: [
      { id: 'viz-airdrops-active', kind: 'exclusive_airdrops', label: 'Acceso a airdrops exclusivos' },
      { id: 'viz-projects-active', kind: 'free_projects', label: 'Participacion en hasta 5 proyectos gratis' },
      { id: 'viz-entry-active', kind: 'live_entry_skin', label: 'Skin especial de entrada en lives' },
      { id: 'viz-chat-active', kind: 'live_chat_highlight', label: 'Chat resaltado en lives' },
    ],
    maintenanceRequirement: {
      id: 'viz-maintenance',
      kind: 'monthly_volume_usd',
      label: 'Volumen mensual minimo para mantener beneficios activos',
      value: 1000,
    },
    isExclusive: false,
    requiresReview: false,
    monthlyLimit: null,
    badgeLabel: 'VIZCONDE',
    visualStyle: {
      accent: '#FFB68D',
      accentSoft: GOLD_SOFT,
      icon: 'diamond-outline',
    },
  },
  {
    id: 'gran_duque',
    order: 4,
    level: 4,
    name: 'Gran Duque',
    shortLabel: 'GRAN DUQUE',
    description: 'Rango ultra exclusivo sujeto a revision interna QVEX',
    requirements: [
      { id: 'duke-verify', kind: 'verification', label: 'Cuenta verificada' },
      { id: 'duke-volume', kind: 'spot_futures_volume_usd', label: 'Volumen spot + futuros acumulado', value: 5000000 },
      { id: 'duke-review', kind: 'internal_review', label: 'Revision interna QVEX' },
      { id: 'duke-limit', kind: 'monthly_limit', label: 'Solo 2 usuarios por mes', value: 2 },
    ],
    benefits: [
      { id: 'duke-verification', kind: 'premium_verification', label: 'Verificacion premium tipo exchange' },
      { id: 'duke-airdrops', kind: 'priority_airdrops', label: 'Acceso preferencial a airdrops' },
      { id: 'duke-alerts', kind: 'project_alerts', label: 'Notificaciones unicas para nuevos proyectos' },
      { id: 'duke-skin', kind: 'lifetime_skin', label: 'Skin exclusiva de por vida', lifetime: true },
      { id: 'duke-presence', kind: 'presence_highlight', label: 'Presencia destacada en salas, chats y publicaciones' },
      { id: 'duke-visibility', kind: 'visibility_priority', label: 'Prioridad de visibilidad dentro del ecosistema' },
    ],
    lifetimeBenefits: [
      { id: 'duke-skin-lifetime', kind: 'lifetime_skin', label: 'Skin exclusiva de por vida', lifetime: true },
    ],
    activeBenefits: [
      { id: 'duke-verification-active', kind: 'premium_verification', label: 'Verificacion premium tipo exchange' },
      { id: 'duke-airdrops-active', kind: 'priority_airdrops', label: 'Acceso preferencial a airdrops' },
      { id: 'duke-alerts-active', kind: 'project_alerts', label: 'Notificaciones unicas para nuevos proyectos' },
      { id: 'duke-presence-active', kind: 'presence_highlight', label: 'Presencia destacada en salas, chats y publicaciones' },
      { id: 'duke-visibility-active', kind: 'visibility_priority', label: 'Prioridad de visibilidad dentro del ecosistema' },
    ],
    maintenanceRequirement: null,
    isExclusive: true,
    requiresReview: true,
    monthlyLimit: 2,
    badgeLabel: 'REVISION',
    visualStyle: {
      accent: '#D9B84A',
      accentSoft: GOLD_STRONG_SOFT,
      icon: 'ribbon-outline',
    },
  },
];
