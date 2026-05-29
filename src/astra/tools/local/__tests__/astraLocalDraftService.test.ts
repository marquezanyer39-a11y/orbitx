import { describe, expect, it } from 'vitest';

import { AstraLocalDraftService } from '../astraLocalDraftService';
import type { AstraLocalDraftStorageAdapter } from '../astraLocalTool.types';

function createAdapter() {
  const store = new Map<string, string>();
  const adapter: AstraLocalDraftStorageAdapter = {
    async getItem(key) {
      return store.get(key) ?? null;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
  };

  return { adapter };
}

describe('AstraLocalDraftService', () => {
  it('guarda nota local sanitizada', async () => {
    const { adapter } = createAdapter();
    const service = new AstraLocalDraftService({
      adapter,
      now: () => 1000,
    });

    await service.saveNote({
      preview: 'Nota segura',
      noteLength: 24,
      source: 'astra',
      surface: 'market',
      redactedKeys: [],
    });

    const state = await service.loadState();
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]?.preview).toBe('Nota segura');
  });

  it('guarda draft local sin ejecutar orden', async () => {
    const { adapter } = createAdapter();
    const service = new AstraLocalDraftService({
      adapter,
      now: () => 2000,
    });

    await service.saveOrderDraft({
      symbol: 'BTC/USDT',
      side: 'buy',
      orderType: 'limit',
      thesisPreview: 'Breakout seguro',
      thesisLength: 16,
      source: 'astra',
      surface: 'trade',
      isRealExecution: false,
      redactedKeys: [],
    });

    const state = await service.loadState();
    expect(state.orderDrafts).toHaveLength(1);
    expect(state.orderDrafts[0]?.isRealExecution).toBe(false);
  });
});
