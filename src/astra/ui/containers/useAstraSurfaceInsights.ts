import { useEffect, useMemo, useState } from 'react';

import { astraConfigService } from '../../config/astraFlags';
import type { AstraEvent, AstraEventType } from '../../events/astraEvents.types';
import type { AstraEventBus } from '../../events/astraEventBus';
import type { AstraIntensityMode } from '../../types/context.types';
import type { AstraInsightContent, AstraUiTone } from '../types/astraUi.types';
import {
  type AstraSurface,
  type AstraSurfaceUiComponent,
  resolveSurfaceInsight,
} from './astraSurfaceMappers';

interface UseAstraSurfaceInsightsInput {
  surface: AstraSurface;
  enabled?: boolean;
  eventBus?: AstraEventBus;
  testEvent?: AstraEvent;
  dismissalCount?: number;
  intensityMode?: AstraIntensityMode;
}

interface UseAstraSurfaceInsightsResult {
  isEnabled: boolean;
  insight: AstraInsightContent | null;
  displayMode: 'silent' | 'ambient' | 'alert' | 'critical';
  uiComponent: AstraSurfaceUiComponent;
  tone: AstraUiTone | null;
  reason: string | null;
  event: AstraEvent | null;
}

const EVENT_TYPES: AstraEventType[] = ['market', 'portfolio', 'web3'];

function getSurfaceFlag(surface: AstraSurface): boolean {
  const flags = astraConfigService.getFlags();
  const surfaceFlagMap: Record<AstraSurface, boolean> = {
    market: flags.ASTRA_UI_SURFACE_MARKET_ENABLED,
    trade: flags.ASTRA_UI_SURFACE_TRADE_ENABLED,
    wallet: flags.ASTRA_UI_SURFACE_WALLET_ENABLED,
    portfolio: flags.ASTRA_UI_SURFACE_PORTFOLIO_ENABLED,
  };

  return flags.ASTRA_ENABLED && flags.ASTRA_UI_SURFACE_INSIGHTS_ENABLED && surfaceFlagMap[surface];
}

const EMPTY_RESULT: UseAstraSurfaceInsightsResult = {
  isEnabled: false,
  insight: null,
  displayMode: 'silent',
  uiComponent: 'none',
  tone: null,
  reason: null,
  event: null,
};

export function useAstraSurfaceInsights({
  surface,
  enabled,
  eventBus,
  testEvent,
  dismissalCount = 0,
  intensityMode = 'balanced',
}: UseAstraSurfaceInsightsInput): UseAstraSurfaceInsightsResult {
  const isEnabled = useMemo(
    () => (enabled ?? true) && getSurfaceFlag(surface),
    [enabled, surface],
  );
  const [event, setEvent] = useState<AstraEvent | null>(testEvent ?? null);

  useEffect(() => {
    if (!isEnabled) {
      setEvent(null);
      return;
    }

    if (testEvent) {
      setEvent(testEvent);
      return;
    }

    if (!eventBus) {
      setEvent(null);
      return;
    }

    const unsubscribers = EVENT_TYPES.map((type) =>
      eventBus.subscribe(type, (incomingEvent) => {
        setEvent(incomingEvent);
      }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [eventBus, isEnabled, testEvent]);

  return useMemo(() => {
    if (!isEnabled) {
      return EMPTY_RESULT;
    }

    const resolvedInsight = resolveSurfaceInsight({
      enabled: isEnabled,
      event,
      surface,
      dismissalCount,
      intensityMode,
    });

    if (!resolvedInsight) {
      return {
        isEnabled,
        insight: null,
        displayMode: 'silent',
        uiComponent: 'none',
        tone: null,
        reason: null,
        event,
      };
    }

    return {
      isEnabled,
      insight: resolvedInsight.content,
      displayMode: resolvedInsight.relevance.displayMode,
      uiComponent: resolvedInsight.uiComponent,
      tone: resolvedInsight.tone,
      reason: resolvedInsight.relevance.reason,
      event: resolvedInsight.event,
    };
  }, [dismissalCount, event, intensityMode, isEnabled, surface]);
}
