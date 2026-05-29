import type { AstraIntensityMode } from '../types/context.types';
import type { AstraEvent, AstraEventSeverity } from '../events/astraEvents.types';

export type AstraDisplayMode = 'silent' | 'ambient' | 'alert' | 'critical';

export interface RelevanceRuleInput {
  event: AstraEvent;
  activeScreen: string;
  intensityMode: AstraIntensityMode;
  dismissalCount: number;
}

export const BASE_RELEVANCE_BY_SEVERITY: Record<AstraEventSeverity, number> = {
  info: 36,
  warning: 64,
  critical: 100,
};

const TYPE_BOOST: Record<AstraEvent['type'], number> = {
  market: 10,
  portfolio: 12,
  web3: 18,
};

const SCREEN_MATCH_BOOST = 14;
const DISMISSAL_PENALTY_STEP = 12;
const DISMISSAL_PENALTY_CAP = 48;

export const INTENSITY_THRESHOLDS: Record<
  AstraIntensityMode,
  { ambient: number; alert: number; critical: number }
> = {
  silent: { ambient: 101, alert: 101, critical: 100 },
  balanced: { ambient: 42, alert: 68, critical: 90 },
  active: { ambient: 24, alert: 52, critical: 84 },
};

export function getDismissalPenalty(dismissalCount: number): number {
  return Math.min(Math.max(dismissalCount, 0) * DISMISSAL_PENALTY_STEP, DISMISSAL_PENALTY_CAP);
}

export function getEventTypeBoost(event: AstraEvent): number {
  let score = TYPE_BOOST[event.type];

  if (event.type === 'market' && event.payload.direction === 'bullish') {
    score += 4;
  }

  if (event.type === 'portfolio' && event.payload.drawdownPercent) {
    score += 6;
  }

  if (event.type === 'web3' && event.payload.riskCode) {
    score += 8;
  }

  return score;
}

export function getScreenMatchBoost(event: AstraEvent, activeScreen: string): number {
  if (!event.targetScreen) {
    return 0;
  }

  return event.targetScreen === activeScreen ? SCREEN_MATCH_BOOST : 0;
}

export function getBaseRelevanceScore(input: RelevanceRuleInput): number {
  const severityBase = BASE_RELEVANCE_BY_SEVERITY[input.event.severity];
  const typeBoost = getEventTypeBoost(input.event);
  const screenBoost = getScreenMatchBoost(input.event, input.activeScreen);
  const dismissalPenalty = getDismissalPenalty(input.dismissalCount);

  return Math.max(0, Math.min(100, severityBase + typeBoost + screenBoost - dismissalPenalty));
}

export function resolveDisplayMode(score: number, intensityMode: AstraIntensityMode): AstraDisplayMode {
  const thresholds = INTENSITY_THRESHOLDS[intensityMode];

  if (score >= thresholds.critical) {
    return 'critical';
  }

  if (score >= thresholds.alert) {
    return 'alert';
  }

  if (score >= thresholds.ambient) {
    return 'ambient';
  }

  return 'silent';
}
