import { describe, expect, it } from 'vitest';

import { AstraToolConfirmationStore } from '../astraToolConfirmation';
import { AstraToolRegistry } from '../astraToolRegistry';

describe('AstraToolConfirmationStore', () => {
  it('crea pending y expira solo con cleanup manual', () => {
    let now = 1_000;
    const store = new AstraToolConfirmationStore({ ttlMs: 500, now: () => now });
    const tool = new AstraToolRegistry().get('web3.review_approval_mock')!;

    const pending = store.createPending(tool, {
      toolId: tool.id,
      params: {
        chainId: 1,
        tokenSymbol: 'USDC',
        spenderLabel: 'Mock spender',
      },
    });

    expect(store.getPendingCount()).toBe(1);
    expect(store.getPending(pending.token)).toEqual(pending);

    now = 1_600;
    store.cleanupExpired();

    expect(store.getPendingCount()).toBe(0);
  });

  it('clear limpia pending manualmente', () => {
    const store = new AstraToolConfirmationStore({ now: () => 2_000 });
    const tool = new AstraToolRegistry().get('trade.prepare_order_mock')!;

    store.createPending(tool, {
      toolId: tool.id,
      params: {
        symbol: 'BTC/USDT',
        side: 'buy',
        orderType: 'limit',
      },
    });
    store.clear();

    expect(store.getPendingCount()).toBe(0);
  });
});
