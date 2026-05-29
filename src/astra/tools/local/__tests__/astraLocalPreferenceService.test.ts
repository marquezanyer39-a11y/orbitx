import { describe, expect, it } from 'vitest';

import { AstraLocalPreferenceService } from '../astraLocalPreferenceService';

interface AstraLocalPreferenceStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function createAdapter() {
  const store = new Map<string, string>();
  const adapter: AstraLocalPreferenceStorageAdapter = {
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

describe('AstraLocalPreferenceService', () => {
  it('guarda pins locales de assets e insights', async () => {
    const { adapter } = createAdapter();
    const service = new AstraLocalPreferenceService({
      adapter,
      now: () => 1000,
    });

    await service.pinAsset({
      assetSymbol: 'SOL',
      source: 'astra',
      surface: 'market',
    });
    await service.pinInsight({
      insightId: 'insight-1',
      source: 'astra',
      surface: 'trade',
    });

    const state = await service.loadState();
    expect(state.pinnedAssets[0]?.assetSymbol).toBe('SOL');
    expect(state.pinnedInsights[0]?.insightId).toBe('insight-1');
  });

  it('actualiza mute por surface sin afectar otras surfaces', async () => {
    const { adapter } = createAdapter();
    const service = new AstraLocalPreferenceService({
      adapter,
      now: () => 2000,
    });

    await service.setSurfaceMuted({
      surface: 'market',
      muted: true,
      source: 'astra',
    });
    await service.setSurfaceMuted({
      surface: 'wallet',
      muted: false,
      source: 'astra',
    });

    const state = await service.loadState();
    const market = state.mutedSurfaces.find((item) => item.surface === 'market');
    const wallet = state.mutedSurfaces.find((item) => item.surface === 'wallet');
    expect(market?.muted).toBe(true);
    expect(wallet?.muted).toBe(false);
  });
});
