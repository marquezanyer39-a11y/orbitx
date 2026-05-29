import { describe, expect, it } from 'vitest';

import { scanTokenRisk } from '../../astraRiskEngine';
import {
  adapterFailureFixture,
  criticalTokenFixture,
  safeTokenFixture,
  suspiciousTokenFixture,
} from '../../ui/astraRiskSandboxFixtures';
import { mapRiskResultToEventPayload } from '../../events/astraRiskEventMapper';
import { computeRiskRelevance } from '../astraRiskRelevanceRules';

const FLAGS = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_ENGINE_ENABLED: true,
  ASTRA_RISK_READ_ONLY_ENABLED: true,
  ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
  ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

describe('astraRiskRelevanceRules', () => {
  it('risk low produce silent o ambient', async () => {
    const result = await scanTokenRisk(safeTokenFixture.tokenInput!, { flags: FLAGS });
    const relevance = computeRiskRelevance({
      payload: mapRiskResultToEventPayload(result),
      intensityMode: 'balanced',
    });

    expect(['silent', 'ambient']).toContain(relevance.displayMode);
  });

  it('risk high produce alert', async () => {
    const result = await scanTokenRisk(suspiciousTokenFixture.tokenInput!, { flags: FLAGS });
    const relevance = computeRiskRelevance({
      payload: mapRiskResultToEventPayload(result),
      intensityMode: 'balanced',
    });

    expect(relevance.displayMode).toBe('alert');
  });

  it('risk critical produce critical e ignora intensity silent', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, { flags: FLAGS });
    const relevance = computeRiskRelevance({
      payload: mapRiskResultToEventPayload(result),
      intensityMode: 'silent',
    });

    expect(relevance.displayMode).toBe('critical');
    expect(relevance.score).toBe(100);
  });

  it('adapter unavailable no genera critical', async () => {
    const result = await scanTokenRisk(adapterFailureFixture.tokenInput!, { flags: FLAGS });
    const relevance = computeRiskRelevance({
      payload: mapRiskResultToEventPayload(result),
      intensityMode: 'balanced',
    });

    expect(relevance.displayMode).not.toBe('critical');
  });
});
