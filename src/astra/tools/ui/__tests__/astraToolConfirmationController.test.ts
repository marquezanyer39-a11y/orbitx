import { describe, expect, it } from 'vitest';

import { AstraToolConfirmationStore } from '../../astraToolConfirmation';
import { createAstraToolConfirmationController } from '../astraToolConfirmationController';

function createPendingInput(token: string) {
  return {
    result: {
      status: 'pending_confirmation' as const,
      toolId: 'web3.review_approval_mock' as const,
      message: 'pending',
      confirmationToken: token,
    },
    params: {
      chainId: 1,
      tokenSymbol: 'USDT',
      spenderLabel: 'Mock spender',
    },
  };
}

describe('astraToolConfirmationController', () => {
  it('no abre si el token ya expiro', () => {
    const store = new AstraToolConfirmationStore({ ttlMs: 1, now: () => 10 });
    const record = store.createPending(
      {
        id: 'web3.review_approval_mock',
        label: 'Review approval mock',
        description: 'desc',
        category: 'web3',
        riskLevel: 'sensitive',
        executionMode: 'noop',
        requiresConfirmation: true,
        schema: { parse: () => ({}) } as never,
      },
      {
        toolId: 'web3.review_approval_mock',
        params: {},
      },
    );
    const controller = createAstraToolConfirmationController({
      confirmationStore: store,
      now: () => new Date(record.expiresAt).getTime() + 1,
    });

    const state = controller.openFromPendingConfirmation(createPendingInput(record.token));
    expect(state.status).toBe('expired');
  });

  it('approve resuelve una sola vez como confirmed_noop', () => {
    const now = () => 1000;
    const store = new AstraToolConfirmationStore({ ttlMs: 1000 * 60, now });
    const record = store.createPending(
      {
        id: 'web3.review_approval_mock',
        label: 'Review approval mock',
        description: 'desc',
        category: 'web3',
        riskLevel: 'sensitive',
        executionMode: 'noop',
        requiresConfirmation: true,
        schema: { parse: () => ({}) } as never,
      },
      {
        toolId: 'web3.review_approval_mock',
        params: {},
      },
    );
    const controller = createAstraToolConfirmationController({
      confirmationStore: store,
      now,
    });

    controller.openFromPendingConfirmation(createPendingInput(record.token));
    const firstApprove = controller.approve();
    const secondApprove = controller.approve();

    expect(firstApprove.didResolve).toBe(true);
    expect(firstApprove.state.status).toBe('approved_mock');
    expect(firstApprove.state.resolution).toBe('confirmed_noop');
    expect(secondApprove.didResolve).toBe(false);
  });

  it('reject resuelve una sola vez y limpia pending visible', () => {
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

    controller.openFromPendingConfirmation({
      result: {
        status: 'pending_confirmation',
        toolId: 'trade.prepare_order_mock',
        message: 'pending',
        confirmationToken: record.token,
      },
      params: {
        symbol: 'BTC/USDT',
        side: 'buy',
        orderType: 'limit',
      },
    });
    const rejected = controller.reject();

    expect(rejected.didResolve).toBe(true);
    expect(rejected.state.status).toBe('rejected');
    expect(rejected.state.viewModel).toBeNull();
  });

  it('tools prohibidos no generan sheet', () => {
    const controller = createAstraToolConfirmationController();
    const state = controller.openFromPendingConfirmation({
      result: {
        status: 'pending_confirmation',
        toolId: 'astra.open_insight',
        message: 'pending',
        confirmationToken: 'token-3',
      },
      params: {
        insightId: 'insight-1',
      },
    });

    expect(state.status).toBe('error');
    expect(state.errorMessage).toContain('no esta permitido');
  });
});
