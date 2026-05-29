import { describe, expect, it } from 'vitest';

import { AstraToolConfirmationStore } from '../../astraToolConfirmation';
import { createAstraToolConfirmationController } from '../astraToolConfirmationController';
import {
  createAstraToolConfirmationHarness,
  resolveAstraToolConfirmationVisibility,
} from '../hooks/useAstraToolConfirmation';

describe('useAstraToolConfirmation helpers', () => {
  it('flag apagado no renderiza host', () => {
    expect(
      resolveAstraToolConfirmationVisibility(false, {
        status: 'pending',
        pendingInput: null,
        viewModel: {
          toolId: 'web3.review_approval_mock',
          token: 'token-1',
          expiresAt: '2026-01-01T01:00:00.000Z',
          title: 'title',
          body: 'body',
          tone: 'warning',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          summary: 'summary',
          fields: [],
          redactedKeys: [],
        },
        token: 'token-1',
        resolution: null,
        errorMessage: null,
      }),
    ).toBe(false);
  });

  it('close limpia estado local', () => {
    const now = () => 1000;
    const store = new AstraToolConfirmationStore({ ttlMs: 1000 * 60, now });
    const record = store.createPending(
      {
        id: 'trade.prepare_order_mock',
        label: 'Prepare order mock',
        description: 'desc',
        category: 'trade',
        riskLevel: 'sensitive',
        executionMode: 'noop',
        requiresConfirmation: true,
        schema: { parse: () => ({}) } as never,
      },
      {
        toolId: 'trade.prepare_order_mock',
        params: {},
      },
    );
    const controller = createAstraToolConfirmationController({
      confirmationStore: store,
      now,
    });
    const harness = createAstraToolConfirmationHarness(controller);

    harness.openFromPendingConfirmation({
      result: {
        status: 'pending_confirmation',
        toolId: 'trade.prepare_order_mock',
        message: 'pending',
        confirmationToken: record.token,
      },
      params: {
        symbol: 'BTC/USDT',
        side: 'buy',
        orderType: 'market',
      },
    });

    const closed = harness.close();
    expect(closed.status).toBe('idle');
    expect(closed.viewModel).toBeNull();
  });
});
