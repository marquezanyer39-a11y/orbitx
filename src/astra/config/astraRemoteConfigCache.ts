import type { AstraRemoteConfigCacheLike, AstraRemoteConfigSnapshot } from './astraRemoteConfig.types';

export const ASTRA_REMOTE_CONFIG_CACHE_TTL_MS = 1000 * 60 * 5;

export class AstraRemoteConfigCache implements AstraRemoteConfigCacheLike {
  private snapshot: AstraRemoteConfigSnapshot | null = null;

  get(now: number = Date.now()): AstraRemoteConfigSnapshot | null {
    if (!this.snapshot) {
      return null;
    }

    if (this.snapshot.expiresAt <= now) {
      this.snapshot = null;
      return null;
    }

    return this.snapshot;
  }

  set(snapshot: AstraRemoteConfigSnapshot): void {
    this.snapshot = snapshot;
  }

  clear(): void {
    this.snapshot = null;
  }
}

export const astraRemoteConfigCache = new AstraRemoteConfigCache();
