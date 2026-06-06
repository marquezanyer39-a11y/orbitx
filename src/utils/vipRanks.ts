import { VIP_RANKS } from '../constants/vipRanks';
import type {
  VipBenefit,
  VipBenefitState,
  VipProgressResult,
  VipRank,
  VipRankDisplayState,
  VipRankId,
  VipRequirement,
  VipRequirementStatus,
  VipUserStats,
} from '../types/vip';

const REQUIREMENT_WEIGHTS: Record<VipRequirement['kind'], number> = {
  verification: 20,
  deposit_usdt: 40,
  trade_volume_usd: 40,
  monthly_volume_usd: 20,
  spot_futures_volume_usd: 70,
  internal_review: 20,
  monthly_limit: 0,
};

function getRankIndex(rankId: VipRankId) {
  return getAllVipRanks().findIndex((rank) => rank.id === rankId);
}

function getMetricValue(userStats: VipUserStats, requirement: VipRequirement) {
  switch (requirement.kind) {
    case 'deposit_usdt':
      return userStats.totalDepositUsdt;
    case 'trade_volume_usd':
      return userStats.totalTradeVolumeUsd;
    case 'monthly_volume_usd':
      return userStats.monthlyTradeVolumeUsd;
    case 'spot_futures_volume_usd':
      return userStats.spotAndFuturesVolumeUsd;
    default:
      return undefined;
  }
}

function getRequirementStatus(
  userStats: VipUserStats,
  requirement: VipRequirement,
): VipRequirementStatus {
  if (requirement.kind === 'verification') {
    const completed = userStats.verificationStatus === 'verified';
    return {
      requirement,
      state: completed ? 'completed' : 'missing',
      completed,
      progressFraction: completed ? 1 : 0,
      helperText: completed ? 'Verificacion completada' : 'Completa tu verificacion para desbloquear este nivel',
    };
  }

  if (requirement.kind === 'internal_review') {
    const completed = userStats.granDuqueReviewStatus === 'approved';
    const inProgress = userStats.granDuqueReviewStatus === 'in_review';
    const eligible = userStats.granDuqueReviewStatus === 'eligible';

    return {
      requirement,
      state: completed ? 'completed' : inProgress ? 'in_progress' : 'external',
      completed,
      progressFraction: completed ? 1 : inProgress ? 0.6 : eligible ? 0.35 : 0,
      helperText: completed
        ? 'Revision interna aprobada'
        : inProgress
          ? 'Tu revision interna sigue en proceso'
          : eligible
            ? 'Ya puedes solicitar revision interna'
            : 'Este beneficio requiere revision interna QVEX',
    };
  }

  if (requirement.kind === 'monthly_limit') {
    return {
      requirement,
      state: 'external',
      completed: false,
      progressFraction: 0,
      helperText: 'QVEX limita este rango a 2 usuarios por mes',
    };
  }

  const currentValue = Number(getMetricValue(userStats, requirement) ?? 0);
  const targetValue = Number(requirement.value ?? 0);
  const progressFraction = targetValue > 0 ? Math.min(currentValue / targetValue, 1) : 0;
  const completed = targetValue > 0 ? currentValue >= targetValue : false;

  return {
    requirement,
    state: completed ? 'completed' : currentValue > 0 ? 'in_progress' : 'missing',
    completed,
    progressFraction,
    currentValue,
    targetValue,
    missingValue: completed ? 0 : Math.max(targetValue - currentValue, 0),
    helperText: completed
      ? 'Requisito cumplido'
      : `${formatVipMoney(currentValue, inferRequirementCurrency(requirement))} de ${formatVipMoney(targetValue, inferRequirementCurrency(requirement))}`,
  };
}

function inferRequirementCurrency(requirement: VipRequirement): 'USDT' | 'USD' | 'users' {
  if (requirement.kind === 'deposit_usdt') return 'USDT';
  if (
    requirement.kind === 'trade_volume_usd' ||
    requirement.kind === 'monthly_volume_usd' ||
    requirement.kind === 'spot_futures_volume_usd'
  ) {
    return 'USD';
  }
  return 'users';
}

function meetsRank(userStats: VipUserStats, rank: VipRank) {
  return getVipRequirementStatus(userStats, rank.id)
    .filter((item) => item.requirement.kind !== 'monthly_limit')
    .every((item) => item.completed);
}

function getHighestUnlockedRank(userStats: VipUserStats) {
  const ranks = getAllVipRanks();
  let highestUnlocked = ranks[0];

  for (const rank of ranks) {
    if (rank.id === 'gran_duque') {
      if (userStats.granDuqueReviewStatus === 'approved' && meetsRank(userStats, rank)) {
        highestUnlocked = rank;
      }
      continue;
    }

    if (meetsRank(userStats, rank)) {
      highestUnlocked = rank;
    }
  }

  return highestUnlocked;
}

function shouldUseOverride(userStats: VipUserStats, calculatedRank: VipRank) {
  if (!userStats.currentRankOverride) return false;

  const overrideRank = getVipRankById(userStats.currentRankOverride);
  if (!overrideRank) return false;

  if (overrideRank.id === 'gran_duque') {
    return userStats.granDuqueReviewStatus === 'approved' && meetsRank(userStats, overrideRank);
  }

  return overrideRank.level === calculatedRank.level;
}

function resolveRankForBenefit(benefit: VipBenefit) {
  return getAllVipRanks().find((rank) =>
    rank.benefits.some((item) => item.id === benefit.id || item.kind === benefit.kind),
  );
}

export function getVipRankById(rankId: VipRankId) {
  return getAllVipRanks().find((rank) => rank.id === rankId) ?? getAllVipRanks()[0];
}

export function getAllVipRanks() {
  return [...VIP_RANKS].sort((left, right) => left.order - right.order);
}

export function getNextVipRank(currentRankId: VipRankId) {
  const currentIndex = getRankIndex(currentRankId);
  return currentIndex >= 0 ? getAllVipRanks()[currentIndex + 1] ?? null : null;
}

export function calculateVipRank(userStats: VipUserStats) {
  const calculatedRank = getHighestUnlockedRank(userStats);

  if (shouldUseOverride(userStats, calculatedRank) && userStats.currentRankOverride) {
    return getVipRankById(userStats.currentRankOverride);
  }

  return calculatedRank;
}

export function getVipRequirementStatus(userStats: VipUserStats, targetRankId: VipRankId) {
  const rank = getVipRankById(targetRankId);
  return rank.requirements.map((requirement) => getRequirementStatus(userStats, requirement));
}

export function getMissingVipRequirements(userStats: VipUserStats, targetRankId: VipRankId) {
  return getVipRequirementStatus(userStats, targetRankId).filter((item) => !item.completed);
}

export function isEligibleForGranDuqueReview(userStats: VipUserStats) {
  return (
    userStats.verificationStatus === 'verified' &&
    userStats.spotAndFuturesVolumeUsd >= 5000000 &&
    userStats.granDuqueReviewStatus !== 'approved'
  );
}

export function getVipProgress(userStats: VipUserStats): VipProgressResult {
  const currentRank = calculateVipRank(userStats);
  const currentRankUnlocked = meetsRank(userStats, currentRank);
  const targetRank = currentRankUnlocked ? getNextVipRank(currentRank.id) : currentRank;

  if (!targetRank) {
    return {
      currentRank,
      targetRank: null,
      progressPercent: 100,
      completedRequirements: [],
      missingRequirements: [],
      primaryMessage: 'Ya alcanzaste el nivel maximo disponible.',
      nextActionLabel: 'Esperar nuevas ventajas',
    };
  }

  const requirementStatuses = getVipRequirementStatus(userStats, targetRank.id);
  const totalWeight = requirementStatuses.reduce(
    (sum, item) => sum + REQUIREMENT_WEIGHTS[item.requirement.kind],
    0,
  );

  const weightedProgress = requirementStatuses.reduce((sum, item) => {
    const weight = REQUIREMENT_WEIGHTS[item.requirement.kind];
    return sum + weight * item.progressFraction;
  }, 0);

  const progressPercent = totalWeight > 0 ? Math.round((weightedProgress / totalWeight) * 100) : 0;
  const completedRequirements = requirementStatuses.filter((item) => item.completed);
  const missingRequirements = requirementStatuses.filter((item) => !item.completed);

  if (targetRank.id === 'gran_duque' && isEligibleForGranDuqueReview(userStats)) {
    return {
      currentRank,
      targetRank,
      progressPercent,
      completedRequirements,
      missingRequirements,
      primaryMessage: 'Ya puedes solicitar revision para Gran Duque.',
      nextActionLabel: 'Solicitar revision',
    };
  }

  if (
    currentRank.id === 'vizconde' &&
    currentRank.maintenanceRequirement &&
    userStats.monthlyTradeVolumeUsd < Number(currentRank.maintenanceRequirement.value ?? 0)
  ) {
    return {
      currentRank,
      targetRank,
      progressPercent,
      completedRequirements,
      missingRequirements,
      primaryMessage: 'Manten tu volumen mensual para conservar beneficios activos.',
      nextActionLabel: 'Subir volumen mensual',
    };
  }

  return {
    currentRank,
    targetRank,
    progressPercent,
    completedRequirements,
    missingRequirements,
    primaryMessage: 'Completa los requisitos para desbloquear beneficios VIP avanzados.',
    nextActionLabel: 'Completar requisitos',
  };
}

export function getActiveVipBenefits(
  userStats: VipUserStats,
  currentRankId: VipRankId = calculateVipRank(userStats).id,
) {
  const currentRank = getVipRankById(currentRankId);

  if (
    currentRank.id === 'vizconde' &&
    currentRank.maintenanceRequirement &&
    userStats.monthlyTradeVolumeUsd < Number(currentRank.maintenanceRequirement.value ?? 0)
  ) {
    return [] as VipBenefitState[];
  }

  return currentRank.activeBenefits.map((benefit) => ({
    benefit,
    status: 'active' as const,
  }));
}

export function getPausedVipBenefits(
  userStats: VipUserStats,
  currentRankId: VipRankId = calculateVipRank(userStats).id,
) {
  const currentRank = getVipRankById(currentRankId);

  if (
    currentRank.id === 'vizconde' &&
    currentRank.maintenanceRequirement &&
    userStats.monthlyTradeVolumeUsd < Number(currentRank.maintenanceRequirement.value ?? 0)
  ) {
    return currentRank.activeBenefits.map((benefit) => ({
      benefit,
      status: 'paused' as const,
      reason: 'Requiere mantenimiento mensual de 1,000 USD en volumen',
    }));
  }

  return [] as VipBenefitState[];
}

export function isVipBenefitActive(userStats: VipUserStats, benefit: VipBenefit) {
  const currentRank = calculateVipRank(userStats);
  const owningRank = resolveRankForBenefit(benefit);

  if (!owningRank || owningRank.level > currentRank.level) {
    return false;
  }

  if (owningRank.lifetimeBenefits.some((item) => item.id === benefit.id || item.kind === benefit.kind)) {
    return true;
  }

  return getActiveVipBenefits(userStats, currentRank.id).some(
    (item) => item.benefit.id === benefit.id || item.benefit.kind === benefit.kind,
  );
}

export function formatVipRequirement(requirement: VipRequirement) {
  switch (requirement.kind) {
    case 'deposit_usdt':
      return `${requirement.label}: ${formatVipMoney(Number(requirement.value ?? 0), 'USDT')}`;
    case 'trade_volume_usd':
    case 'monthly_volume_usd':
    case 'spot_futures_volume_usd':
      return `${requirement.label}: ${formatVipMoney(Number(requirement.value ?? 0), 'USD')}`;
    case 'monthly_limit':
      return `${requirement.label}`;
    default:
      return requirement.label;
  }
}

export function formatVipMoney(value: number, currency: 'USDT' | 'USD' | 'users' = 'USD') {
  const formatted = value.toLocaleString('es-PE');
  if (currency === 'users') return `${formatted}`;
  return `${formatted} ${currency}`;
}

export function getVipRankDisplayState(userStats: VipUserStats): VipRankDisplayState {
  const currentRank = calculateVipRank(userStats);
  const nextRank = getNextVipRank(currentRank.id);
  const pausedBenefits = getPausedVipBenefits(userStats, currentRank.id);
  const eligibleForReview = isEligibleForGranDuqueReview(userStats);
  const hasMaintenanceWarning = pausedBenefits.length > 0;
  const currentRankUnlocked = meetsRank(userStats, currentRank);

  let subtitle = `${currentRank.name} activo • Beneficios y progreso`;
  let reviewMessage: string | undefined;

  if (!currentRankUnlocked && currentRank.id === 'basic') {
    subtitle = 'Completa verificacion y deposito para activar tu primer rango.';
  }

  if (currentRank.id === 'vizconde' && hasMaintenanceWarning) {
    subtitle = 'Tu rango se conserva, pero algunos beneficios requieren mantenimiento mensual.';
  }

  if (eligibleForReview) {
    reviewMessage = 'Elegible para revision';
  } else if (userStats.granDuqueReviewStatus === 'in_review') {
    reviewMessage = 'En revision interna';
  } else if (userStats.granDuqueReviewStatus === 'approved') {
    reviewMessage = 'Aprobado';
  } else if (userStats.granDuqueReviewStatus === 'rejected') {
    reviewMessage = 'Revision no aprobada';
  }

  return {
    currentRank,
    nextRank,
    badgeLabel: currentRank.shortLabel,
    subtitle,
    reviewStatus: userStats.granDuqueReviewStatus,
    isEligibleForReview: eligibleForReview,
    hasMaintenanceWarning,
    maintenanceMessage: hasMaintenanceWarning
      ? 'Mantiene el rango Vizconde, pero debe recuperar 1,000 USD mensuales para reactivar beneficios.'
      : undefined,
    reviewMessage,
  };
}
