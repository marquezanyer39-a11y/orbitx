import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { createMarketEvent } from '../../events/handlers/marketEventHandler';
import { AstraMemoryService } from '../astraMemoryService';
import type { AstraMemoryStorageAdapter } from '../astraMemory.types';

function createInMemoryAdapter() {
  const store = new Map<string, string>();

  const adapter: AstraMemoryStorageAdapter = {
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

  return { adapter, store };
}

const enabledFlags = {
  ...astraFlagsDefaults,
  ASTRA_ENABLED: true,
  ASTRA_NOTIFICATIONS_ENABLED: true,
  ASTRA_MEMORY_ENABLED: true,
  ASTRA_MEMORY_LOCAL_ENABLED: true,
  ASTRA_MEMORY_DISMISSALS_ENABLED: true,
  ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED: true,
  ASTRA_NOTIFICATION_ENGINE_ENABLED: true,
  ASTRA_NOTIFICATION_QUEUE_ENABLED: true,
  ASTRA_NOTIFICATION_COOLDOWN_ENABLED: true,
};

describe('AstraMemoryService', () => {
  it('resetMemory limpia estado persistido', async () => {
    const { adapter } = createInMemoryAdapter();
    const service = new AstraMemoryService({
      adapter,
      getFlags: () => enabledFlags,
      now: () => 10_000,
    });

    await service.setCooldown('surface:btc', 'surface');
    const reset = await service.resetMemory();

    expect(reset.cooldowns).toHaveLength(0);
  });

  it('si flags estan apagadas, no produce efectos', async () => {
    const { adapter, store } = createInMemoryAdapter();
    const service = new AstraMemoryService({
      adapter,
      getFlags: () => ({
        ...enabledFlags,
        ASTRA_MEMORY_ENABLED: false,
      }),
      now: () => 10_000,
    });

    await service.setCooldown('surface:btc', 'surface');

    expect(store.size).toBe(0);
  });

  it('persistir dismissals sanitizados y recuperarlos', async () => {
    const { adapter } = createInMemoryAdapter();
    const service = new AstraMemoryService({
      adapter,
      getFlags: () => enabledFlags,
      now: () => 20_000,
    });
    const event = createMarketEvent({
      id: 'service-1',
      title: 'BTC',
      message: 'Evento',
      severity: 'warning',
    });

    await service.recordDismissal(event, 'market');
    const count = await service.getDismissalCountForEvent(event, 'market');

    expect(count).toBe(1);
  });
});
