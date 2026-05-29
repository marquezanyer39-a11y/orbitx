import { describe, expect, it } from 'vitest';

import type { AstraRiskWeb3Event } from '../../events/astraRiskEvents.types';
import {
  appendRiskInsightToQueue,
  getRiskInsightCooldownMs,
  isRiskInsightDisplayAllowed,
  shouldShowRiskInsight,
} from '../astraRiskInsightGuards';
import type { AstraRiskInsightViewModel } from '../astraRiskInsight.types';

const baseFlags = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_RELEVANCE_ENABLED: true,
  ASTRA_RISK_INSIGHT_HOST_ENABLED: true,
  ASTRA_RISK_INSIGHT_CARDS_ENABLED: true,
  ASTRA_RISK_INSIGHT_BANNERS_ENABLED: true,
  ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

const baseInsight: AstraRiskInsightViewModel = {
  displayMode: 'card',
  title: 'Riesgo Web3',
  body: 'Body',
  tone: 'warning',
  actionLabel: 'Revisar riesgo',
  metadata: {
    chainId: 1,
    tokenPreview: '0x1234...5678',
    riskLevel: 'high',
    riskScore: '78',
    recommendedAction: 'Revisar contrato',
  },
  dedupKey: 'risk:1:0x1234...5678:high:review_contract',
};

const baseEvent = {
  id: 'event-1',
  type: 'web3',
  severity: 'warning',
  title: 'Risk',
  message: 'Risk',
  timestamp: '2026-01-01T00:00:00.000Z',
  source: 'manual_test',
  dedupKey: 'risk:1:0x1234...5678:high:review_contract',
  targetScreen: 'wallet',
  payload: {
    riskEventType: 'high_risk_detected',
    chainId: 1,
    tokenPreview: '0x1234...5678',
    riskScore: 78,
    riskLevel: 'high',
    reasons: ['ownership_not_renounced'],
    warnings: ['Ownership no renunciado'],
    recommendedAction: 'review_contract',
    confidence: 0.8,
    source: 'mock',
    scannedAt: '2026-01-01T00:00:00.000Z',
  },
} satisfies AstraRiskWeb3Event;

describe('astraRiskInsightGuards', () => {
  it('host retorna false si flag apagada', () => {
    expect(
      isRiskInsightDisplayAllowed(baseInsight, {
        ...baseFlags,
        ASTRA_RISK_INSIGHT_HOST_ENABLED: false,
      }),
    ).toBe(false);
  });

  it('none no renderiza', () => {
    expect(
      isRiskInsightDisplayAllowed(
        {
          ...baseInsight,
          displayMode: 'none',
        },
        baseFlags,
      ),
    ).toBe(false);
  });

  it('dedup visual ignora evento repetido y cooldown bloquea spam', () => {
    const shown = new Map<string, number>();
    expect(shouldShowRiskInsight(baseEvent, 1000, shown, 5000)).toBe(true);
    expect(shouldShowRiskInsight(baseEvent, 2000, shown, 5000)).toBe(false);
    expect(shouldShowRiskInsight(baseEvent, 7000, shown, 5000)).toBe(true);
  });

  it('critical no se repite dentro cooldown', () => {
    const shown = new Map<string, number>();
    const criticalEvent = {
      ...baseEvent,
      severity: 'critical',
      payload: {
        ...baseEvent.payload,
        riskEventType: 'critical_risk_detected',
        riskLevel: 'critical',
      },
    } satisfies AstraRiskWeb3Event;

    expect(shouldShowRiskInsight(criticalEvent, 1000, shown, 5000)).toBe(true);
    expect(shouldShowRiskInsight(criticalEvent, 2000, shown, 5000)).toBe(false);
  });

  it('adapter_unavailable usa cooldown extendido y queue se limita a 3', () => {
    const adapterEvent = {
      ...baseEvent,
      payload: {
        ...baseEvent.payload,
        riskEventType: 'adapter_unavailable',
      },
    } satisfies AstraRiskWeb3Event;
    expect(getRiskInsightCooldownMs(adapterEvent, 10, 20)).toBe(20);
    expect(appendRiskInsightToQueue([baseInsight, baseInsight, baseInsight], baseInsight)).toHaveLength(3);
  });
});
