import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraConfigService } from '../../config/astraFlags';
import type { AstraRiskWeb3Event } from '../events/astraRiskEvents.types';
import type { AstraRiskInsightViewModel } from './astraRiskInsight.types';

export const ASTRA_RISK_INSIGHT_DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;
export const ASTRA_RISK_INSIGHT_ADAPTER_UNAVAILABLE_COOLDOWN_MS = 15 * 60 * 1000;
export const ASTRA_RISK_INSIGHT_MAX_QUEUE_SIZE = 3;

export function getAstraRiskInsightFlags(overrides?: Partial<AstraFeatureFlags>) {
  const flags = {
    ...astraConfigService.getFlags(),
    ...overrides,
  };

  return {
    hostEnabled: flags.ASTRA_ENABLED && flags.ASTRA_RISK_INSIGHT_HOST_ENABLED,
    cardsEnabled: flags.ASTRA_RISK_INSIGHT_CARDS_ENABLED,
    bannersEnabled: flags.ASTRA_RISK_INSIGHT_BANNERS_ENABLED,
    criticalEnabled: flags.ASTRA_RISK_INSIGHT_CRITICAL_ENABLED,
    relevanceEnabled: flags.ASTRA_RISK_RELEVANCE_ENABLED,
    realExecutionEnabled: flags.ASTRA_RISK_REAL_EXECUTION_ENABLED,
  };
}

export function isRiskInsightDisplayAllowed(
  insight: AstraRiskInsightViewModel,
  flags?: Partial<AstraFeatureFlags>,
): boolean {
  const resolvedFlags = getAstraRiskInsightFlags(flags);

  if (!resolvedFlags.hostEnabled || !resolvedFlags.relevanceEnabled || resolvedFlags.realExecutionEnabled) {
    return false;
  }

  if (insight.displayMode === 'none') {
    return false;
  }

  if (insight.displayMode === 'card') {
    return resolvedFlags.cardsEnabled;
  }

  if (insight.displayMode === 'banner') {
    return resolvedFlags.bannersEnabled;
  }

  return resolvedFlags.criticalEnabled;
}

export function getRiskInsightCooldownMs(
  event: AstraRiskWeb3Event,
  defaultCooldownMs: number = ASTRA_RISK_INSIGHT_DEFAULT_COOLDOWN_MS,
  adapterUnavailableCooldownMs: number = ASTRA_RISK_INSIGHT_ADAPTER_UNAVAILABLE_COOLDOWN_MS,
): number {
  return event.payload.riskEventType === 'adapter_unavailable'
    ? adapterUnavailableCooldownMs
    : defaultCooldownMs;
}

export function shouldShowRiskInsight(
  event: AstraRiskWeb3Event,
  nowMs: number,
  lastShownAtByDedupKey: Map<string, number>,
  cooldownMs: number,
): boolean {
  const dedupKey = event.dedupKey ?? event.id;
  const previousShownAt = lastShownAtByDedupKey.get(dedupKey);

  if (previousShownAt !== undefined && nowMs - previousShownAt < cooldownMs) {
    return false;
  }

  lastShownAtByDedupKey.set(dedupKey, nowMs);
  return true;
}

export function appendRiskInsightToQueue(
  currentQueue: AstraRiskInsightViewModel[],
  insight: AstraRiskInsightViewModel,
): AstraRiskInsightViewModel[] {
  return [...currentQueue, insight].slice(-ASTRA_RISK_INSIGHT_MAX_QUEUE_SIZE);
}
