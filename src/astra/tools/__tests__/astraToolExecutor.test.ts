import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { AstraToolConfirmationStore } from '../astraToolConfirmation';
import { executeAstraTool } from '../astraToolExecutor';
import { getAstraToolFlags } from '../astraToolFlags';

const enabledToolFlags = {
  ...astraFlagsDefaults,
  ASTRA_ENABLED: true,
  ASTRA_TOOL_EXECUTION_ENABLED: true,
  ASTRA_TOOL_REGISTRY_ENABLED: true,
  ASTRA_TOOL_CONFIRMATION_ENABLED: true,
  ASTRA_TOOL_AUDIT_ENABLED: true,
  ASTRA_TOOL_MOCK_EXECUTION_ENABLED: true,
};

describe('executeAstraTool', () => {
  it('bloquea si flags estan apagadas', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'astra.open_insight',
        params: { insightId: 'insight-1' },
      },
      { flags: astraFlagsDefaults },
    );

    expect(result.status).toBe('blocked');
    expect(result.errorCode).toBe('ASTRA_TOOLS_DISABLED');
  });

  it('ejecuta tool safe como mock/no-op', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'astra.open_insight',
        params: { insightId: 'insight-1' },
      },
      { flags: enabledToolFlags },
    );

    expect(result.status).toBe('success');
    expect(result.message).toContain('Mock/no-op');
  });

  it('crea pending para tool sensible sin ejecutar fondos', async () => {
    const confirmationStore = new AstraToolConfirmationStore({ now: () => 1_000 });
    const result = await executeAstraTool(
      {
        toolId: 'web3.review_approval_mock',
        params: {
          chainId: 1,
          tokenSymbol: 'USDT',
          spenderLabel: 'Mock spender',
        },
      },
      {
        flags: enabledToolFlags,
        confirmationStore,
      },
    );

    expect(result.status).toBe('pending_confirmation');
    expect(result.confirmationToken).toBeTruthy();
    expect(confirmationStore.getPendingCount()).toBe(1);
  });

  it('rechaza params invalidos', async () => {
    const result = await executeAstraTool(
      {
        toolId: 'trade.prepare_order_mock',
        params: {
          symbol: 'BTC/USDT',
          side: 'hold',
          orderType: 'limit',
        },
      },
      { flags: enabledToolFlags },
    );

    expect(result.status).toBe('failed');
    expect(result.errorCode).toBe('ASTRA_TOOL_VALIDATION_FAILED');
  });
});

describe('getAstraToolFlags', () => {
  it('lee flags desde el contrato ASTRA existente', () => {
    const flags = getAstraToolFlags(enabledToolFlags);

    expect(flags.enabled).toBe(true);
    expect(flags.registryEnabled).toBe(true);
    expect(flags.confirmationEnabled).toBe(true);
  });
});
