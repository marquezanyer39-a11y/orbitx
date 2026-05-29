import { describe, expect, it } from 'vitest';

import { scanTokenRisk } from '../../astraRiskEngine';
import { mapRiskResultToAstraEvent } from '../../events/astraRiskEventMapper';
import { mapRiskResultToEventPayload } from '../../events/astraRiskEventMapper';
import { criticalTokenFixture, safeTokenFixture, suspiciousTokenFixture } from '../../ui/astraRiskSandboxFixtures';
import { computeRiskRelevance } from '../../relevance/astraRiskRelevanceRules';
import { mapRiskInsightToAstraUi } from '../astraRiskInsightMappers';

const FLAGS = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_ENGINE_ENABLED: true,
  ASTRA_RISK_READ_ONLY_ENABLED: true,
  ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
  ASTRA_RISK_RELEVANCE_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

async function createInsightForFixture(fixture: typeof safeTokenFixture) {
  const result = await scanTokenRisk(fixture.tokenInput!, { flags: FLAGS });
  const event = mapRiskResultToAstraEvent(result, {
    surface: 'wallet',
    eventSource: 'manual_test',
  });
  const relevance = computeRiskRelevance({
    payload: mapRiskResultToEventPayload(result),
    intensityMode: 'balanced',
  });

  return mapRiskInsightToAstraUi(event, relevance);
}

describe('astraRiskInsightMappers', () => {
  it('card renderiza props para AstraMicroCard', async () => {
    const insight = await createInsightForFixture(safeTokenFixture);

    expect(['none', 'card']).toContain(insight.displayMode);
    expect(insight.title).toContain('Riesgo');
    expect(insight.metadata.tokenPreview).toBe('0x1234...5678');
  });

  it('banner renderiza props para AstraAlertBanner', async () => {
    const insight = await createInsightForFixture(suspiciousTokenFixture);

    expect(insight.displayMode).toBe('banner');
    expect(insight.actionLabel).toBe('Revisar riesgo');
  });

  it('critical renderiza props critical', async () => {
    const insight = await createInsightForFixture(criticalTokenFixture);

    expect(insight.displayMode).toBe('critical');
    expect(insight.tone).toBe('critical');
  });

  it('mapper no incluye direcciones completas ni balances exactos', async () => {
    const insight = await createInsightForFixture(criticalTokenFixture);
    const rendered = JSON.stringify(insight);

    expect(rendered).not.toContain(criticalTokenFixture.tokenInput!.tokenAddress);
    expect(rendered).not.toMatch(/\b(balance|saldo)\b[^a-zA-Z]{0,8}[0-9]+(?:[.,][0-9]+)?/i);
  });
});
