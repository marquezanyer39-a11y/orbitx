import type { AstraIntensityMode } from '../../types/context.types';
import type { AstraRiskEventPayload } from '../events/astraRiskEvents.types';
import type { AstraRiskLevel } from '../astraRisk.types';

export type AstraRiskRelevanceDisplayMode = 'silent' | 'ambient' | 'alert' | 'critical';

export interface AstraRiskRelevanceInput {
  payload: AstraRiskEventPayload;
  intensityMode: AstraIntensityMode;
  dismissalCount?: number;
}

export interface AstraRiskRelevanceResult {
  score: number;
  displayMode: AstraRiskRelevanceDisplayMode;
  reason: string;
}

const BASE_SCORE_BY_RISK_LEVEL: Record<AstraRiskLevel, number> = {
  low: 28,
  medium: 52,
  high: 78,
  critical: 100,
};

function getDismissalPenalty(dismissalCount: number = 0): number {
  return Math.min(Math.max(dismissalCount, 0) * 10, 40);
}

export function computeRiskRelevance(input: AstraRiskRelevanceInput): AstraRiskRelevanceResult {
  const { payload, intensityMode } = input;

  if (payload.riskEventType === 'adapter_unavailable') {
    return {
      score: 24,
      displayMode: intensityMode === 'active' ? 'ambient' : 'silent',
      reason: 'adapter_unavailable is non-critical and anti-spam safe',
    };
  }

  if (payload.riskLevel === 'critical') {
    return {
      score: 100,
      displayMode: 'critical',
      reason: 'critical risk overrides silent intensity',
    };
  }

  const rawScore = Math.max(
    BASE_SCORE_BY_RISK_LEVEL[payload.riskLevel],
    payload.riskScore,
  );
  const score = Math.max(0, Math.min(100, rawScore - getDismissalPenalty(input.dismissalCount)));

  if (intensityMode === 'silent') {
    return {
      score,
      displayMode: 'silent',
      reason: 'silent intensity hides non-critical risk events',
    };
  }

  if (payload.riskLevel === 'high' || score >= 70) {
    return {
      score,
      displayMode: 'alert',
      reason: `riskLevel=${payload.riskLevel}; score=${score}`,
    };
  }

  if (payload.riskLevel === 'medium' || score >= 35 || intensityMode === 'active') {
    return {
      score,
      displayMode: 'ambient',
      reason: `riskLevel=${payload.riskLevel}; intensity=${intensityMode}`,
    };
  }

  return {
    score,
    displayMode: 'silent',
    reason: `low risk; score=${score}`,
  };
}
