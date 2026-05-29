import type { AstraFeatureFlags } from './astraFlags';

interface AstraSupabaseRemoteConfigRow {
  namespace?: unknown;
  key?: unknown;
  value_boolean?: unknown;
  enabled?: unknown;
  environment?: unknown;
  updated_at?: unknown;
}

interface AstraSupabaseQueryResult {
  data: AstraSupabaseRemoteConfigRow[] | null;
  error: { message?: string } | null;
}

interface AstraSupabaseQueryBuilder {
  select(columns: string): AstraSupabaseQueryBuilder;
  eq(column: string, value: string | boolean): AstraSupabaseQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): Promise<AstraSupabaseQueryResult>;
}

export interface AstraSupabaseLikeClient {
  from(table: string): AstraSupabaseQueryBuilder;
}

export interface AstraRemoteConfigSupabaseFetcherOptions {
  client?: AstraSupabaseLikeClient;
  environment: 'development' | 'preview' | 'production';
  namespace?: string;
  table?: string;
}

export function mapSupabaseRowsToRemoteConfig(
  rows: AstraSupabaseRemoteConfigRow[] | null | undefined,
  namespace: string,
): Partial<AstraFeatureFlags> {
  if (!rows?.length) {
    return {};
  }

  const mapped: Partial<AstraFeatureFlags> = {};

  rows.forEach((row) => {
    if (row.namespace !== namespace) {
      return;
    }

    if (row.enabled !== true) {
      return;
    }

    if (typeof row.key !== 'string') {
      return;
    }

    if (typeof row.value_boolean !== 'boolean') {
      return;
    }

    mapped[row.key as keyof AstraFeatureFlags] = row.value_boolean;
  });

  return mapped;
}

export function createAstraRemoteConfigSupabaseFetcher(
  options: AstraRemoteConfigSupabaseFetcherOptions,
): () => Promise<Partial<AstraFeatureFlags>> {
  const namespace = options.namespace ?? 'astra';
  const table = options.table ?? 'remote_config';

  return async () => {
    if (!options.client) {
      return {};
    }

    try {
      const result = await options.client
        .from(table)
        .select('namespace,key,value_boolean,enabled,environment,updated_at')
        .eq('namespace', namespace)
        .eq('environment', options.environment)
        .eq('enabled', true)
        .order('updated_at', { ascending: false });

      if (result.error || !result.data) {
        return {};
      }

      return mapSupabaseRowsToRemoteConfig(result.data, namespace);
    } catch {
      return {};
    }
  };
}
