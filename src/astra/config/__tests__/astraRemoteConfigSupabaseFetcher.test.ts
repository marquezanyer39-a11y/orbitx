import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../astraFlags.defaults';
import { AstraRemoteConfigCache } from '../astraRemoteConfigCache';
import { AstraRemoteConfigClient } from '../astraRemoteConfigClient';
import {
  createAstraRemoteConfigSupabaseFetcher,
  mapSupabaseRowsToRemoteConfig,
  type AstraSupabaseLikeClient,
} from '../astraRemoteConfigSupabaseFetcher';

function createSupabaseClient(rows: unknown[] | null, error: { message?: string } | null = null): AstraSupabaseLikeClient {
  return {
    from() {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        async order() {
          return {
            data: rows as never,
            error,
          };
        },
      };
    },
  };
}

function createDefaults(overrides: Partial<typeof astraFlagsDefaults> = {}) {
  return {
    ...astraFlagsDefaults,
    ASTRA_REMOTE_CONFIG_ENABLED: true,
    ASTRA_SYNC_READ_ENABLED: true,
    ...overrides,
  };
}

describe('astraRemoteConfigSupabaseFetcher', () => {
  it('fetcher mapea filas Supabase a objeto plano seguro', async () => {
    const fetcher = createAstraRemoteConfigSupabaseFetcher({
      client: createSupabaseClient([
        {
          namespace: 'astra',
          key: 'ASTRA_ENABLED',
          value_boolean: false,
          enabled: true,
          environment: 'preview',
          updated_at: '2026-05-24T12:00:00.000Z',
        },
      ]),
      environment: 'preview',
    });

    await expect(fetcher()).resolves.toEqual({ ASTRA_ENABLED: false });
  });

  it('fetcher ignora filas con namespace distinto', async () => {
    const result = mapSupabaseRowsToRemoteConfig(
      [
        {
          namespace: 'other',
          key: 'ASTRA_ENABLED',
          value_boolean: false,
          enabled: true,
        },
      ],
      'astra',
    );

    expect(result).toEqual({});
  });

  it('fetcher ignora filas disabled', async () => {
    const result = mapSupabaseRowsToRemoteConfig(
      [
        {
          namespace: 'astra',
          key: 'ASTRA_ENABLED',
          value_boolean: false,
          enabled: false,
        },
      ],
      'astra',
    );

    expect(result).toEqual({});
  });

  it('fetcher ignora keys desconocidas despues de validar', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: createAstraRemoteConfigSupabaseFetcher({
        client: createSupabaseClient([
          {
            namespace: 'astra',
            key: 'UNKNOWN_FLAG',
            value_boolean: true,
            enabled: true,
            environment: 'preview',
          },
        ]),
        environment: 'preview',
      }),
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    const flags = await client.refreshFlags();
    expect(flags).toEqual(createDefaults());
  });

  it('fetcher ignora value_boolean no booleano', async () => {
    const result = mapSupabaseRowsToRemoteConfig(
      [
        {
          namespace: 'astra',
          key: 'ASTRA_ENABLED',
          value_boolean: 'true',
          enabled: true,
        },
      ],
      'astra',
    );

    expect(result).toEqual({});
  });

  it('fetcher maneja respuesta vacia sin crash', async () => {
    const fetcher = createAstraRemoteConfigSupabaseFetcher({
      client: createSupabaseClient([]),
      environment: 'preview',
    });

    await expect(fetcher()).resolves.toEqual({});
  });

  it('fetcher maneja error Supabase sin crash', async () => {
    const fetcher = createAstraRemoteConfigSupabaseFetcher({
      client: createSupabaseClient(null, { message: 'relation does not exist' }),
      environment: 'preview',
    });

    await expect(fetcher()).resolves.toEqual({});
  });

  it('refreshFlags actualiza cache con config valida', async () => {
    const cache = new AstraRemoteConfigCache();
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: createAstraRemoteConfigSupabaseFetcher({
        client: createSupabaseClient([
          {
            namespace: 'astra',
            key: 'ASTRA_ENABLED',
            value_boolean: false,
            enabled: true,
            environment: 'preview',
            updated_at: '2026-05-24T12:00:00.000Z',
          },
        ]),
        environment: 'preview',
      }),
      cache,
      now: () => 1_000,
    });

    const result = await client.refreshFlags();

    expect(result.ASTRA_ENABLED).toBe(false);
    expect(cache.get(1_001)?.flags.ASTRA_ENABLED).toBe(false);
  });

  it('getFlags sigue devolviendo defaults antes de refresh exitoso', () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: createAstraRemoteConfigSupabaseFetcher({
        client: createSupabaseClient([
          {
            namespace: 'astra',
            key: 'ASTRA_ENABLED',
            value_boolean: false,
            enabled: true,
            environment: 'preview',
          },
        ]),
        environment: 'preview',
      }),
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    expect(client.getCachedFlags()).toEqual(createDefaults());
  });

  it('remote config parcial se mezcla con defaults', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults({ ASTRA_MEMORY_ENABLED: false }),
      fetchRemoteConfig: createAstraRemoteConfigSupabaseFetcher({
        client: createSupabaseClient([
          {
            namespace: 'astra',
            key: 'ASTRA_ENABLED',
            value_boolean: false,
            enabled: true,
            environment: 'preview',
          },
        ]),
        environment: 'preview',
      }),
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    const result = await client.refreshFlags();

    expect(result.ASTRA_ENABLED).toBe(false);
    expect(result.ASTRA_MEMORY_ENABLED).toBe(false);
  });

  it('ASTRA_KILL_SWITCH remoto desactiva capas sensibles', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults({
        ASTRA_ENABLED: true,
        ASTRA_NOTIFICATION_ENGINE_ENABLED: true,
        ASTRA_NOTIFICATION_PUSH_ENABLED: true,
      }),
      fetchRemoteConfig: createAstraRemoteConfigSupabaseFetcher({
        client: createSupabaseClient([
          {
            namespace: 'astra',
            key: 'ASTRA_KILL_SWITCH',
            value_boolean: true,
            enabled: true,
            environment: 'preview',
          },
        ]),
        environment: 'preview',
      }),
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    const result = await client.refreshFlags();

    expect(result.ASTRA_KILL_SWITCH).toBe(true);
    expect(result.ASTRA_ENABLED).toBe(false);
    expect(result.ASTRA_NOTIFICATION_ENGINE_ENABLED).toBe(false);
    expect(result.ASTRA_NOTIFICATION_PUSH_ENABLED).toBe(false);
  });

  it('fetcher undefined no genera crash', async () => {
    const client = new AstraRemoteConfigClient({
      defaults: createDefaults(),
      fetchRemoteConfig: undefined,
      cache: new AstraRemoteConfigCache(),
      now: () => 1_000,
    });

    await expect(client.refreshFlags()).resolves.toEqual(createDefaults());
  });
});
