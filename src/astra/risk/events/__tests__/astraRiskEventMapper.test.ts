import { describe, expect, it } from 'vitest';

import { scanApprovalRisk, scanTokenRisk } from '../../astraRiskEngine';
import { criticalTokenFixture, infiniteApprovalFixture } from '../../ui/astraRiskSandboxFixtures';
import { mapRiskResultToAstraEvent, mapRiskResultToEventPayload } from '../astraRiskEventMapper';

const FLAGS = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_ENGINE_ENABLED: true,
  ASTRA_RISK_READ_ONLY_ENABLED: true,
  ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
  ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
  ASTRA_RISK_EVENT_PUBLISHING_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

describe('astraRiskEventMapper', () => {
  it('convierte token scan result en evento seguro', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, { flags: FLAGS });
    const event = mapRiskResultToAstraEvent(result, {
      surface: 'wallet',
      eventSource: 'risk_sandbox',
    });

    expect(event.type).toBe('web3');
    expect(event.payload.riskEventType).toBe('critical_risk_detected');
    expect(event.payload.tokenPreview).toBe('0x1234...5678');
    expect(event.dedupKey).toBe(`risk:${result.chainId}:${result.tokenPreview}:${result.riskLevel}:${result.recommendedAction}`);
  });

  it('convierte approval scan result en evento seguro', async () => {
    const result = await scanApprovalRisk(infiniteApprovalFixture.approvalInput!, { flags: FLAGS });
    const event = mapRiskResultToAstraEvent(result, {
      surface: 'wallet',
      eventSource: 'manual_test',
    });

    expect(event.payload.riskEventType).toBe('approval_scanned');
    expect(event.payload.recommendedAction).toBe('review_approval');
  });

  it('payload no contiene direcciones completas ni balances exactos', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, { flags: FLAGS });
    const payload = mapRiskResultToEventPayload(result);
    const rendered = JSON.stringify(payload);

    expect(rendered).not.toContain(criticalTokenFixture.tokenInput!.tokenAddress);
    expect(rendered).not.toMatch(/\b(balance|saldo)\b[^a-zA-Z]{0,8}[0-9]+(?:[.,][0-9]+)?/i);
  });
});
