import type { AstraEvent } from '../events/astraEvents.types';
import type { AstraContext } from '../types/context.types';
import {
  getBaseRelevanceScore,
  resolveDisplayMode,
  type AstraDisplayMode,
} from './relevanceRules';

export interface ComputeRelevanceInput {
  event: AstraEvent;
  context: Pick<AstraContext, 'activeScreen' | 'userProfile'>;
  dismissalCount?: number;
}

export interface RelevanceResult {
  score: number;
  displayMode: AstraDisplayMode;
  reason: string;
}

export function computeRelevance(input: ComputeRelevanceInput): RelevanceResult {
  const dismissalCount = input.dismissalCount ?? 0;
  const intensityMode = input.context.userProfile.intensityMode;

  if (input.event.severity === 'critical') {
    return {
      score: 100,
      displayMode: 'critical',
      reason: 'critical severity overrides intensity and dismissal rules',
    };
  }

  const score = getBaseRelevanceScore({
    event: input.event,
    activeScreen: input.context.activeScreen,
    intensityMode,
    dismissalCount,
  });

  if (intensityMode === 'silent') {
    return {
      score,
      displayMode: 'silent',
      reason: 'silent intensity hides non-critical events',
    };
  }

  const displayMode = resolveDisplayMode(score, intensityMode);

  return {
    score,
    displayMode,
    reason: `severity=${input.event.severity}; intensity=${intensityMode}; dismissals=${dismissalCount}`,
  };
}
