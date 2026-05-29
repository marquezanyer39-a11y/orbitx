import { describe, expect, it } from 'vitest';

import { AstraEventBus } from '../../../events/astraEventBus';
import { resolveRiskInsightFromEvent } from '../useAstraRiskInsights';
import { scanTokenRisk } from '../../astraRiskEngine';
import { mapRiskResultToAstraEvent, mapRiskResultToEventPayload } from '../../events/astraRiskEventMapper';
import { computeRiskRelevance } from '../../relevance/astraRiskRelevanceRules';
import { suspiciousTokenFixture } from '../../ui/astraRiskSandboxFixtures';

const FLAGS = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_ENGINE_ENABLED: true,
  ASTRA_RISK_READ_ONLY_ENABLED: true,
  ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
  ASTRA_RISK_RELEVANCE_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

describe('useAstraRiskInsights helpers', () => {
  it('resuelve insight desde event/relevance', async () => {
    const result = await scanTokenRisk(suspiciousTokenFixture.tokenInput!, { flags: FLAGS });
    const event = mapRiskResultToAstraEvent(result, {
      surface: 'wallet',
      eventSource: 'manual_test',
    });
    const relevance = computeRiskRelevance({
      payload: mapRiskResultToEventPayload(result),
      intensityMode: 'balanced',
    });

    const insight = resolveRiskInsightFromEvent(event, relevance);
    expect(insight?.displayMode).toBe('banner');
  });

  it('hook limpia listener al desmontar via unsubscribe del EventBus inyectado', () => {
    const eventBus = new AstraEventBus();
    const unsubscribe = eventBus.subscribe('web3', () => undefined);

    expect(eventBus.getListenerCount('web3')).toBe(1);
    unsubscribe();
    expect(eventBus.getListenerCount('web3')).toBe(0);
  });

  it('no usa EventBus global por defecto', () => {
    const eventBus = new AstraEventBus();
    expect(eventBus.getListenerCount()).toBe(0);
  });
});
