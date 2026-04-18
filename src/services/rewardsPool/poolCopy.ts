import {
  formatCurrencyByLanguage,
  formatNumberByLanguage,
  formatRelativeTimeByLanguage,
} from '../../../constants/i18n';
import type { LanguageCode } from '../../../types';
import type { RewardsPoolCopy, RewardsPoolStatus } from '../../types/rewardsPool';

const EN: RewardsPoolCopy = {
  language: 'en',
  headerTitle: 'Rewards Pool',
  headerBody: 'Participate and earn according to your contribution',
  headerBack: 'Back',
  astraLabel: 'Astra',
  countdownSuffix: 'remaining',
  countdownPrefix: '',
  positionTitle: 'YOUR POSITION IN THE POOL',
  realContribution: 'Real contribution',
  rankingContribution: 'Ranking contribution',
  positionLabel: 'Position',
  estimatedReward: 'Estimated gain',
  rankingNote: 'Ranking uses a max of $10. Your full contribution still counts.',
  rewardsTitle: 'REWARDS',
  rewardsExtra: '+ proportional split',
  liveParticipantsTitle: 'LIVE PARTICIPANTS',
  participateLabel: 'Participate',
  participatedLabel: 'You already joined',
  blockedLabel: 'Unavailable',
  openStatus: 'Open',
  fullStatus: 'Pool completed',
  expiredStatus: 'Finished by time',
  distributingStatus: 'Calculating results',
  finalizedStatus: 'Results ready',
  fullBanner: 'Pool completed',
  expiredBanner: 'Finished by time',
  distributingBanner: 'We are calculating the final distribution.',
  finalizedBanner: 'Rewards were assigned successfully.',
  finalResultsTitle: 'FINAL RESULTS',
  totalRaised: 'Total raised',
  houseFee: 'OrbitX fee',
  distributed: 'Distributed',
  yourReward: 'Your reward',
  walletCta: 'View in wallet',
  askAstra: 'Ask Astra',
  modalTitle: 'Join the monthly pool',
  modalBody: 'Send one crypto contribution and secure your final participation.',
  assetSelectorLabel: 'Asset',
  amountLabel: 'Amount',
  usdEquivalent: 'USD equivalent',
  estimatedPosition: 'Estimated position',
  confirmLabel: 'Confirm participation',
  confirmPreviewTitle: 'Participation preview',
  confirmExecuteTitle: 'Sending transaction',
  providerLabel: 'OrbitX Pool',
  spreadLabel: 'OrbitX fee',
  etaLabel: 'Estimated time',
  availabilityLabel: 'Availability',
  recentTitle: 'Recent references',
  favoritesTitle: 'Favorites',
  actionPreview: 'Preview participation',
  actionExecute: 'Confirm participation',
  searchPlaceholder: 'Search asset',
  maxLabel: 'Max',
  currentPoolTitle: 'Monthly pool',
  poolHomeBody: 'Compete with a capped ranking and proportional split.',
  poolHomeCta: 'View pool',
  poolResultsCta: 'View results',
  minMaxLabel: 'Min $1 · Max $50',
  txPending: 'Waiting for confirmation...',
  txSuccess: 'Participation confirmed',
  duplicateError: 'You can only participate once in this pool.',
  poolClosedError: 'This pool is already closed.',
  noBalanceError: 'You do not have enough balance for this asset.',
  invalidAmountError: 'Enter a valid amount.',
  belowMinimumError: 'Minimum contribution is $1.',
  aboveMaximumError: 'Maximum contribution is $50.',
  unavailablePair: 'This asset is not available right now.',
  thisIsYou: 'YOU ARE HERE',
  projectedBadge: 'ESTIMATED',
  oneParticipationRule: 'One participation per user.',
  processedByOrbitX: 'Processed inside OrbitX.',
};

const ES: RewardsPoolCopy = {
  ...EN,
  language: 'es',
  headerTitle: 'Pool de Recompensas',
  headerBody: 'Participa y gana segun tu aporte',
  headerBack: 'Volver',
  positionTitle: 'TU POSICION EN EL POOL',
  realContribution: 'Aporte real',
  rankingContribution: 'Aporte ranking',
  positionLabel: 'Posicion',
  estimatedReward: 'Ganancia estimada',
  rankingNote: 'Ranking usa max. $10. Tu aporte completo si cuenta.',
  rewardsExtra: '+ reparto proporcional',
  liveParticipantsTitle: 'PARTICIPANTES (EN VIVO)',
  participateLabel: 'Participar',
  participatedLabel: 'Ya participaste',
  blockedLabel: 'No disponible',
  openStatus: 'Activo',
  fullStatus: 'Pool completado',
  expiredStatus: 'Finalizado por tiempo',
  distributingStatus: 'Distribuyendo resultados',
  finalizedStatus: 'Resultados listos',
  fullBanner: 'Pool completado',
  expiredBanner: 'Finalizado por tiempo',
  distributingBanner: 'Estamos calculando la distribucion final.',
  finalizedBanner: 'Las recompensas ya fueron asignadas.',
  finalResultsTitle: 'RESULTADOS FINALES',
  totalRaised: 'Total recaudado',
  houseFee: 'Fee OrbitX',
  distributed: 'Distribuido',
  yourReward: 'Tu recompensa',
  walletCta: 'Ver en billetera',
  askAstra: 'Preguntar a Astra',
  modalTitle: 'Participar en el pool mensual',
  modalBody: 'Envias un unico aporte crypto y aseguras tu participacion final.',
  assetSelectorLabel: 'Moneda',
  amountLabel: 'Monto',
  usdEquivalent: 'Equivalente USD',
  estimatedPosition: 'Posicion estimada',
  confirmLabel: 'Confirmar participacion',
  confirmPreviewTitle: 'Vista previa',
  confirmExecuteTitle: 'Enviando transaccion',
  providerLabel: 'Pool OrbitX',
  spreadLabel: 'Fee OrbitX',
  etaLabel: 'Tiempo estimado',
  availabilityLabel: 'Disponibilidad',
  recentTitle: 'Referencias recientes',
  favoritesTitle: 'Favoritos',
  actionPreview: 'Previsualizar participacion',
  actionExecute: 'Confirmar participacion',
  searchPlaceholder: 'Buscar moneda',
  currentPoolTitle: 'Pool mensual',
  poolHomeBody: 'Compite con ranking capado y reparto proporcional.',
  poolHomeCta: 'Ver pool',
  poolResultsCta: 'Ver resultados',
  minMaxLabel: 'Min $1 · Max $50',
  txPending: 'Esperando confirmacion...',
  txSuccess: 'Participacion confirmada',
  duplicateError: 'Solo puedes participar una vez en este pool.',
  poolClosedError: 'Este pool ya esta cerrado.',
  noBalanceError: 'No tienes saldo suficiente en este activo.',
  invalidAmountError: 'Ingresa un monto valido.',
  belowMinimumError: 'El aporte minimo es $1.',
  aboveMaximumError: 'El aporte maximo es $50.',
  unavailablePair: 'Este activo no esta disponible por ahora.',
  thisIsYou: 'TU ESTAS AQUI',
  projectedBadge: 'ESTIMADO',
  oneParticipationRule: 'Una sola participacion por usuario.',
  processedByOrbitX: 'Procesado dentro de OrbitX.',
};

const PT: RewardsPoolCopy = {
  ...EN,
  language: 'pt',
  headerTitle: 'Pool de Recompensas',
  headerBody: 'Participe e ganhe conforme sua contribuicao',
  headerBack: 'Voltar',
  positionTitle: 'SUA POSICAO NO POOL',
  realContribution: 'Aporte real',
  rankingContribution: 'Aporte ranking',
  positionLabel: 'Posicao',
  estimatedReward: 'Ganho estimado',
  rankingNote: 'O ranking usa no maximo $10. Seu aporte completo continua contando.',
  rewardsExtra: '+ divisao proporcional',
  liveParticipantsTitle: 'PARTICIPANTES AO VIVO',
  participateLabel: 'Participar',
  participatedLabel: 'Voce ja entrou',
  blockedLabel: 'Indisponivel',
  fullStatus: 'Pool concluido',
  expiredStatus: 'Finalizado por tempo',
  distributingStatus: 'Calculando resultados',
  finalizedStatus: 'Resultados prontos',
  fullBanner: 'Pool concluido',
  expiredBanner: 'Finalizado por tempo',
  distributingBanner: 'Estamos calculando a distribuicao final.',
  finalizedBanner: 'As recompensas ja foram atribuidas.',
  finalResultsTitle: 'RESULTADOS FINAIS',
  totalRaised: 'Total arrecadado',
  houseFee: 'Fee OrbitX',
  distributed: 'Distribuido',
  yourReward: 'Sua recompensa',
  walletCta: 'Ver na carteira',
  askAstra: 'Perguntar para Astra',
  modalTitle: 'Participar do pool mensal',
  modalBody: 'Envie uma unica contribuicao em crypto e garanta sua participacao.',
  assetSelectorLabel: 'Moeda',
  amountLabel: 'Valor',
  usdEquivalent: 'Equivalente em USD',
  estimatedPosition: 'Posicao estimada',
  confirmLabel: 'Confirmar participacao',
  confirmPreviewTitle: 'Previa da participacao',
  confirmExecuteTitle: 'Enviando transacao',
  providerLabel: 'Pool OrbitX',
  spreadLabel: 'Fee OrbitX',
  etaLabel: 'Tempo estimado',
  availabilityLabel: 'Disponibilidade',
  recentTitle: 'Referencias recentes',
  favoritesTitle: 'Favoritos',
  actionPreview: 'Prever participacao',
  actionExecute: 'Confirmar participacao',
  searchPlaceholder: 'Buscar moeda',
  currentPoolTitle: 'Pool mensal',
  poolHomeBody: 'Compita com ranking limitado e reparticao proporcional.',
  poolHomeCta: 'Ver pool',
  poolResultsCta: 'Ver resultados',
  txPending: 'Aguardando confirmacao...',
  txSuccess: 'Participacao confirmada',
  duplicateError: 'Voce so pode participar uma vez neste pool.',
  poolClosedError: 'Este pool ja esta fechado.',
  noBalanceError: 'Voce nao tem saldo suficiente nesse ativo.',
  invalidAmountError: 'Digite um valor valido.',
  belowMinimumError: 'A contribuicao minima e $1.',
  aboveMaximumError: 'A contribuicao maxima e $50.',
  unavailablePair: 'Este ativo nao esta disponivel agora.',
  thisIsYou: 'VOCE ESTA AQUI',
  projectedBadge: 'ESTIMADO',
  oneParticipationRule: 'Uma participacao por usuario.',
};

const COPY: Record<LanguageCode, RewardsPoolCopy> = {
  en: EN,
  es: ES,
  pt: PT,
  'zh-Hans': EN,
  hi: EN,
  ru: EN,
  ar: EN,
  id: EN,
};

export function getRewardsPoolCopy(language: LanguageCode) {
  return COPY[language] ?? EN;
}

export function formatUsdCents(language: LanguageCode, cents: number) {
  return formatCurrencyByLanguage(language, cents / 100, 'USD', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatPoolPercent(language: LanguageCode, value: number) {
  return `${formatNumberByLanguage(language, value, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatPoolStatus(copy: RewardsPoolCopy, status: RewardsPoolStatus) {
  switch (status) {
    case 'full':
      return copy.fullStatus;
    case 'expired':
      return copy.expiredStatus;
    case 'distributing':
      return copy.distributingStatus;
    case 'finalized':
      return copy.finalizedStatus;
    default:
      return copy.openStatus;
  }
}

export function formatPoolCountdown(
  language: LanguageCode,
  remainingMs: number,
  copy = getRewardsPoolCopy(language),
) {
  const safeMs = Math.max(remainingMs, 0);
  const totalMinutes = Math.floor(safeMs / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const compact = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  if (!safeMs) {
    return language === 'es'
      ? '0d 00h 00m'
      : language === 'pt'
        ? '0d 00h 00m'
        : compact;
  }

  return copy.countdownPrefix
    ? `${copy.countdownPrefix} ${compact} ${copy.countdownSuffix}`.trim()
    : `${compact} ${copy.countdownSuffix}`.trim();
}

export function formatPoolRelativeTime(language: LanguageCode, dateIso: string) {
  return formatRelativeTimeByLanguage(language, dateIso);
}
