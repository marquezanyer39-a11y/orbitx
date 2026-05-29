import { describe, expect, it, vi } from 'vitest';

import { astraFlagsDefaults } from '../astraFlags.defaults';
import { AstraRemoteConfigCache } from '../astraRemoteConfigCache';
import { AstraRemoteConfigClient } from '../astraRemoteConfigClient';

function createDefaults(overrides: Partial<typeof astraFlagsDefaults> = {}) {
  return {
    ...astraFlagsDefaults,
    ASTRA_REMOTE_CONFIG_ENABLED: true,
    ASTRA_SYNC_READ_ENABLED: true,
    ...overrides,
  };
}

describe('AstraRemoteConfigClient', () => {
  it('fallback a defaults si remote config falla', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: async () => {
        throw new Error('offline');
      },
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    const result = await client.getFlags();

    expect(result).toEqual(createDefaults());
  });

  it('TTL cache funciona', async () => {
    let now = 1_000;
    const fetchRemoteConfig = vi.fn(async () => ({
      ASTRA_ENABLED: false,
    }));
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig,
      cache: new AstraRemoteConfigCache(),
      now: () => now,
      ttlMs: 500,
    });

    const first = await client.getFlags();
    now = 1_200;
    const second = await client.getFlags();
    now = 1_600;
    const third = await client.getFlags();

    expect(first.ASTRA_ENABLED).toBe(false);
    expect(second.ASTRA_ENABLED).toBe(false);
    expect(third.ASTRA_ENABLED).toBe(false);
    expect(fetchRemoteConfig).toHaveBeenCalledTimes(2);
  });

  it('si Supabase no esta disponible, no hay crash', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: undefined,
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    await expect(client.getFlags()).resolves.toEqual(createDefaults());
  });
});
