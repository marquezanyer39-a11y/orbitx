import { astraFlagsDefaults } from './astraFlags.defaults';
import { astraRemoteConfigCache, ASTRA_REMOTE_CONFIG_CACHE_TTL_MS } from './astraRemoteConfigCache';
import type { AstraFeatureFlags } from './astraFlags';
import type { AstraRemoteConfigClientOptions } from './astraRemoteConfig.types';
import { mergeAstraRemoteConfig, validateAstraRemoteConfig } from './astraRemoteConfigValidator';

export class AstraRemoteConfigClient {
  private fetchRemoteConfig?: () => Promise<unknown>;
  private readonly defaults: AstraFeatureFlags;
  private readonly cache;
  private readonly ttlMs: number;
  private readonly now: () => number;

  constructor(options: AstraRemoteConfigClientOptions) {
    this.defaults = options.defaults;
    this.fetchRemoteConfig = options.fetchRemoteConfig;
    this.cache = options.cache ?? astraRemoteConfigCache;
    this.ttlMs = options.ttlMs ?? ASTRA_REMOTE_CONFIG_CACHE_TTL_MS;
    this.now = options.now ?? (() => Date.now());
  }

  setFetcher(fetchRemoteConfig?: () => Promise<unknown>): void {
    this.fetchRemoteConfig = fetchRemoteConfig;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCachedFlags(): AstraFeatureFlags {
    return this.cache.get(this.now())?.flags ?? this.defaults;
  }

  async getFlags(): Promise<AstraFeatureFlags> {
    const cached = this.cache.get(this.now());
    if (cached) {
      return cached.flags;
    }

    const currentFlags = this.getCachedFlags();
    if (!currentFlags.ASTRA_REMOTE_CONFIG_ENABLED || !currentFlags.ASTRA_SYNC_READ_ENABLED) {
      return this.defaults;
    }

    return this.refreshFlags();
  }

  async refreshFlags(): Promise<AstraFeatureFlags> {
    if (!this.fetchRemoteConfig) {
      return this.defaults;
    }

    try {
      const remote = await this.fetchRemoteConfig();
      const validated = validateAstraRemoteConfig(remote);
      const merged = mergeAstraRemoteConfig(this.defaults, validated);
      const fetchedAt = this.now();

      this.cache.set({
        flags: merged,
        fetchedAt,
        expiresAt: fetchedAt + this.ttlMs,
        source: 'remote',
      });

      return merged;
    } catch {
      return this.getCachedFlags();
    }
  }
}

export const astraRemoteConfigClient = new AstraRemoteConfigClient({
  defaults: astraFlagsDefaults,
});
