import { describe, expect, it } from 'vitest';

import { AstraEventBus } from '../../../events/astraEventBus';
import { scanTokenRisk } from '../../astraRiskEngine';
import { adapterFailureFixture, criticalTokenFixture } from '../../ui/astraRiskSandboxFixtures';
import { publishRiskScanEvent } from '../astraRiskEventPublisher';

const ENABLED_FLAGS = {
  ASTRA_ENABLED: true,
  ASTRA_RISK_ENGINE_ENABLED: true,
  ASTRA_RISK_READ_ONLY_ENABLED: true,
  ASTRA_RISK_TOKEN_SCAN_ENABLED: true,
  ASTRA_RISK_APPROVAL_SCAN_ENABLED: true,
  ASTRA_RISK_EVENT_PUBLISHING_ENABLED: true,
  ASTRA_RISK_REAL_EXECUTION_ENABLED: false,
};

describe('astraRiskEventPublisher', () => {
  it('no publica si flag apagada', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, { flags: ENABLED_FLAGS });
    const eventBus = new AstraEventBus();
    let count = 0;
    eventBus.subscribe('web3', () => {
      count += 1;
    });

    const published = publishRiskScanEvent(result, {
      eventBus,
      surface: 'wallet',
      eventSource: 'manual_test',
      flags: {
        ...ENABLED_FLAGS,
        ASTRA_RISK_EVENT_PUBLISHING_ENABLED: false,
      },
    });

    expect(published.published).toBe(false);
    expect(published.skipped).toBe('flags_disabled');
    expect(count).toBe(0);
  });

  it('publica si flag activada y usa dedupKey', async () => {
    const result = await scanTokenRisk(criticalTokenFixture.tokenInput!, { flags: ENABLED_FLAGS });
    const eventBus = new AstraEventBus();
    let count = 0;
    eventBus.subscribe('web3', () => {
      count += 1;
    });

    const published = publishRiskScanEvent(result, {
      eventBus,
      surface: 'wallet',
      eventSource: 'risk_sandbox',
      flags: ENABLED_FLAGS,
    });

    expect(published.published).toBe(true);
    expect(published.event?.dedupKey).toBe(`risk:${result.chainId}:${result.tokenPreview}:${result.riskLevel}:${result.recommendedAction}`);
    expect(count).toBe(1);
  });

  it('adapter failure produce evento adapter_unavailable', async () => {
    const result = await scanTokenRisk(adapterFailureFixture.tokenInput!, { flags: ENABLED_FLAGS });
    const published = publishRiskScanEvent(result, {
      eventBus: new AstraEventBus(),
      surface: 'market',
      eventSource: 'manual_test',
      flags: ENABLED_FLAGS,
    });

    expect(published.event?.payload.riskEventType).toBe('adapter_unavailable');
  });
});
