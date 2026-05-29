import type { AstraFeatureFlags } from './astraFlags';

export type AstraRemoteConfigAllowedKey = keyof AstraFeatureFlags;

export type AstraRemoteConfigPayload = Record<string, unknown>;

export interface AstraRemoteConfigSnapshot {
  flags: AstraFeatureFlags;
  fetchedAt: number;
  expiresAt: number;
  source: 'defaults' | 'cache' | 'remote' | 'fallback';
}

export interface AstraRemoteConfigCacheLike {
  get(now?: number): AstraRemoteConfigSnapshot | null;
  set(snapshot: AstraRemoteConfigSnapshot): void;
  clear(): void;
}

export interface AstraRemoteConfigClientOptions {
  defaults: AstraFeatureFlags;
  fetchRemoteConfig?: () => Promise<unknown>;
  cache?: AstraRemoteConfigCacheLike;
  ttlMs?: number;
  now?: () => number;
}
