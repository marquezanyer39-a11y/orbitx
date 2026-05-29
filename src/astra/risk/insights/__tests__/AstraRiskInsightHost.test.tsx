import { describe, expect, it } from 'vitest';

import {
  isRiskInsightDisplayAllowed,
  ASTRA_RISK_INSIGHT_DEFAULT_COOLDOWN_MS,
} from '../astraRiskInsightGuards';
import type { AstraRiskInsightViewModel } from '../astraRiskInsight.types';

const baseInsight: AstraRiskInsightViewModel = {
  displayMode: 'banner',
  title: 'Riesgo Web3 high',
  body: 'Token 0x1234...5678 en chain 1.',
  tone: 'warning',
  actionLabel: 'Revisar riesgo',
  metadata: {
    chainId: 1,
    tokenPreview: '0x1234...5678',
    riskLevel: 'high',
    riskScore: '78',
    recommendedAction: 'Revisar contrato',
  },
};

const enabledFlags = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_RELEVANCE_ENABLED: true,
  ASTRA_RISK_INSIGHT_HOST_ENABLED: true,
  ASTRA_RISK_INSIGHT_CARDS_ENABLED: true,
  ASTRA_RISK_INSIGHT_BANNERS_ENABLED: true,
  ASTRA_RISK_INSIGHT_CRITICAL_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

describe('AstraRiskInsightHost contract', () => {
  it('Host retorna null si flag apagada', () => {
    expect(
      isRiskInsightDisplayAllowed(baseInsight, {
        ...enabledFlags,
        ASTRA_RISK_INSIGHT_HOST_ENABLED: false,
      }),
    ).toBe(false);
  });

  it('banner renderiza props para AstraAlertBanner cuando flags activas', () => {
    expect(isRiskInsightDisplayAllowed(baseInsight, enabledFlags)).toBe(true);
  });

  it('card renderiza props para AstraMicroCard cuando flag card activa', () => {
    expect(
      isRiskInsightDisplayAllowed(
        {
          ...baseInsight,
          displayMode: 'card',
        },
        enabledFlags,
      ),
    ).toBe(true);
  });

  it('critical renderiza props critical cuando flag critical activa', () => {
    expect(
      isRiskInsightDisplayAllowed(
        {
          ...baseInsight,
          displayMode: 'critical',
          tone: 'critical',
        },
        enabledFlags,
      ),
    ).toBe(true);
  });

  it('usa cooldown visual por defecto sin ejecutar scans ni publicar eventos', () => {
    expect(ASTRA_RISK_INSIGHT_DEFAULT_COOLDOWN_MS).toBe(5 * 60 * 1000);
  });
});
