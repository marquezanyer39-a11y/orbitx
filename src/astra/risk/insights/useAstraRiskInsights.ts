import { useCallback, useEffect, useRef, useState } from 'react';

import type { AstraRiskWeb3Event } from '../events/astraRiskEvents.types';
import type { AstraRiskRelevanceResult } from '../relevance/astraRiskRelevanceRules';
import { mapRiskInsightToAstraUi } from './astraRiskInsightMappers';
import type {
  AstraRiskInsightHostProps,
  AstraRiskInsightState,
  AstraRiskInsightViewModel,
} from './astraRiskInsight.types';
import {
  appendRiskInsightToQueue,
  getRiskInsightCooldownMs,
  isRiskInsightDisplayAllowed,
  shouldShowRiskInsight,
} from './astraRiskInsightGuards';

export function resolveRiskInsightFromEvent(
  event: AstraRiskWeb3Event | null | undefined,
  relevance: AstraRiskRelevanceResult | null | undefined,
): AstraRiskInsightViewModel | null {
  if (!event || !relevance) {
    return null;
  }

  return mapRiskInsightToAstraUi(event, relevance);
}

export function useAstraRiskInsights({
  enabled = false,
  event,
  relevance,
  eventBus,
  surface,
  flags,
  now = () => Date.now(),
  cooldownMs,
  adapterUnavailableCooldownMs,
}: AstraRiskInsightHostProps): AstraRiskInsightState & {
  dismissActiveInsight: () => void;
} {
  const [state, setState] = useState<AstraRiskInsightState>({
    activeInsight: null,
    queue: [],
  });
  const lastShownAtByDedupKeyRef = useRef(new Map<string, number>());

  const processInsight = useCallback(
    (nextEvent: AstraRiskWeb3Event, nextRelevance: AstraRiskRelevanceResult) => {
      const insight = mapRiskInsightToAstraUi(nextEvent, nextRelevance);
      const visualCooldownMs = getRiskInsightCooldownMs(
        nextEvent,
        cooldownMs,
        adapterUnavailableCooldownMs,
      );

      if (!isRiskInsightDisplayAllowed(insight, flags)) {
        return;
      }

      if (!shouldShowRiskInsight(nextEvent, now(), lastShownAtByDedupKeyRef.current, visualCooldownMs)) {
        return;
      }

      setState((current) => ({
        activeInsight: current.activeInsight ?? insight,
        queue: current.activeInsight ? appendRiskInsightToQueue(current.queue, insight) : current.queue,
      }));
    },
    [adapterUnavailableCooldownMs, cooldownMs, flags, now],
  );

  useEffect(() => {
    if (!enabled || !event || !relevance) {
      return;
    }

    processInsight(event, relevance);
  }, [enabled, event, processInsight, relevance]);

  useEffect(() => {
    if (!enabled || !eventBus || !surface || !relevance) {
      return undefined;
    }

    return eventBus.subscribe('web3', (nextEvent) => {
      if (nextEvent.targetScreen !== surface) {
        return;
      }

      processInsight(nextEvent as AstraRiskWeb3Event, relevance);
    });
  }, [enabled, eventBus, processInsight, relevance, surface]);

  const dismissActiveInsight = useCallback(() => {
    setState((current) => {
      const [nextInsight, ...rest] = current.queue;
      return {
        activeInsight: nextInsight ?? null,
        queue: rest,
      };
    });
  }, []);

  return {
    ...state,
    dismissActiveInsight,
  };
}
