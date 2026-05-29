import { astraConfigService, type AstraFeatureFlags } from '../config/astraFlags';
import type { AstraEvent } from '../events/astraEvents.types';
import type { AstraNotificationIntent } from '../notifications/astraNotification.types';
import type { AstraSurface } from '../ui/containers/astraSurfaceMappers';
import { createCooldownRecord, createDismissalRecord, createInboxItemFromIntent } from './astraMemoryMappers';
import {
  createInitialAstraMemoryState,
  getDismissalCount,
  isCooldownActive,
  markInboxItemRead,
  pruneExpiredMemory,
  resetAstraMemory,
  setExplicitPreferences,
  setInferredPreferences,
  upsertCooldownRecord,
  upsertDismissalRecord,
  upsertInboxItem,
} from './astraMemoryReducers';
import { createMemoryStorage } from './astraMemoryStorage';
import type {
  AstraMemoryExplicitPreferences,
  AstraMemoryInferredPreferences,
  AstraMemoryState,
  AstraMemoryStorageAdapter,
} from './astraMemory.types';

interface AstraMemoryServiceOptions {
  adapter?: AstraMemoryStorageAdapter;
  getFlags?: () => AstraFeatureFlags;
  now?: () => number;
}

export class AstraMemoryService {
  private readonly storage;
  private readonly getFlags;
  private readonly now;

  constructor(options: AstraMemoryServiceOptions = {}) {
    this.storage = createMemoryStorage(options.adapter);
    this.getFlags = options.getFlags ?? (() => astraConfigService.getFlags());
    this.now = options.now ?? (() => Date.now());
  }

  async loadState(): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return createInitialAstraMemoryState(this.now());
    }

    const state = await this.storage.load(this.now());
    return pruneExpiredMemory(state, this.now());
  }

  async resetMemory(): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return createInitialAstraMemoryState(this.now());
    }

    await this.storage.reset();
    return resetAstraMemory(this.now());
  }

  async recordDismissal(event: AstraEvent, surface?: AstraSurface): Promise<AstraMemoryState> {
    if (!this.isDismissalsEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const key = `${event.type}:${event.dedupKey ?? event.id}:${surface ?? event.targetScreen ?? 'global'}`;
    const nextState = upsertDismissalRecord(
      state,
      createDismissalRecord({
        event,
        surface,
        previousCount: getDismissalCount(state, key),
        now: this.now(),
      }),
      this.now(),
    );
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async setCooldown(key: string, channel: 'surface' | 'notification'): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const nextState = upsertCooldownRecord(
      state,
      createCooldownRecord({ key, channel, now: this.now() }),
      this.now(),
    );
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async saveInboxIntent(intent: AstraNotificationIntent): Promise<AstraMemoryState> {
    if (!this.isInboxPersistenceEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const nextState = upsertInboxItem(
      state,
      createInboxItemFromIntent(intent, this.now()),
      this.now(),
    );
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async markInboxRead(id: string): Promise<AstraMemoryState> {
    if (!this.isInboxPersistenceEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const nextState = markInboxItemRead(state, id, this.now());
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async setExplicitPreferencesLocal(
    preferences: AstraMemoryExplicitPreferences,
  ): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const nextState = setExplicitPreferences(state, preferences, this.now());
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async setInferredPreferencesLocal(
    preferences: AstraMemoryInferredPreferences,
  ): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return this.loadState();
    }

    const state = await this.loadState();
    const nextState = setInferredPreferences(state, preferences, this.now());
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async cleanupExpired(): Promise<AstraMemoryState> {
    if (!this.isMemoryEnabled()) {
      return this.loadState();
    }

    const state = await this.storage.load(this.now());
    const nextState = pruneExpiredMemory(state, this.now());
    await this.storage.save(nextState, this.now());
    return nextState;
  }

  async getDismissalCountForEvent(event: AstraEvent, surface?: AstraSurface): Promise<number> {
    const state = await this.loadState();
    const key = `${event.type}:${event.dedupKey ?? event.id}:${surface ?? event.targetScreen ?? 'global'}`;
    return getDismissalCount(state, key);
  }

  async isCooldownActive(key: string): Promise<boolean> {
    const state = await this.loadState();
    return isCooldownActive(state, key, this.now());
  }

  private isMemoryEnabled(): boolean {
    const flags = this.getFlags();
    return flags.ASTRA_ENABLED && flags.ASTRA_MEMORY_ENABLED && flags.ASTRA_MEMORY_LOCAL_ENABLED;
  }

  private isDismissalsEnabled(): boolean {
    const flags = this.getFlags();
    return this.isMemoryEnabled() && flags.ASTRA_MEMORY_DISMISSALS_ENABLED;
  }

  private isInboxPersistenceEnabled(): boolean {
    const flags = this.getFlags();
    return this.isMemoryEnabled() && flags.ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED;
  }
}

export const astraMemoryService = new AstraMemoryService();
