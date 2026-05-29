import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AstraLocalPreferenceState,
  AstraMutedSurfaceRecord,
  AstraPinnedAssetRecord,
  AstraPinnedInsightRecord,
} from './astraLocalTool.types';

const ASTRA_LOCAL_PREFERENCE_STORAGE_KEY = '@orbitx/astra/local-preferences/v1';
const ASTRA_LOCAL_PREFERENCE_SCHEMA_VERSION = 1;

export interface AstraLocalPreferenceStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface AstraLocalPreferenceStoragePayload {
  schemaVersion: number;
  savedAt: string;
  state: AstraLocalPreferenceState;
}

function createInitialState(now: number): AstraLocalPreferenceState {
  return {
    version: ASTRA_LOCAL_PREFERENCE_SCHEMA_VERSION,
    updatedAt: new Date(now).toISOString(),
    pinnedAssets: [],
    pinnedInsights: [],
    mutedSurfaces: [],
  };
}

function createDefaultAdapter(): AstraLocalPreferenceStorageAdapter {
  return {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
    removeItem: AsyncStorage.removeItem,
  };
}

export interface AstraLocalPreferenceServiceOptions {
  adapter?: AstraLocalPreferenceStorageAdapter;
  now?: () => number;
}

export class AstraLocalPreferenceService {
  private readonly adapter;
  private readonly now;

  constructor(options: AstraLocalPreferenceServiceOptions = {}) {
    this.adapter = options.adapter ?? createDefaultAdapter();
    this.now = options.now ?? (() => Date.now());
  }

  async loadState(): Promise<AstraLocalPreferenceState> {
    const raw = await this.adapter.getItem(ASTRA_LOCAL_PREFERENCE_STORAGE_KEY);
    if (!raw) {
      return createInitialState(this.now());
    }

    try {
      const payload = JSON.parse(raw) as AstraLocalPreferenceStoragePayload;
      if (payload.schemaVersion !== ASTRA_LOCAL_PREFERENCE_SCHEMA_VERSION) {
        return createInitialState(this.now());
      }

      return payload.state;
    } catch {
      return createInitialState(this.now());
    }
  }

  async reset(): Promise<AstraLocalPreferenceState> {
    await this.adapter.removeItem(ASTRA_LOCAL_PREFERENCE_STORAGE_KEY);
    return createInitialState(this.now());
  }

  async pinAsset(record: Omit<AstraPinnedAssetRecord, 'pinnedAt'>): Promise<AstraLocalPreferenceState> {
    const state = await this.loadState();
    const pinnedAt = new Date(this.now()).toISOString();
    const nextAssets = [
      { ...record, pinnedAt },
      ...state.pinnedAssets.filter((item) => item.assetSymbol !== record.assetSymbol),
    ].slice(0, 50);

    const nextState: AstraLocalPreferenceState = {
      ...state,
      updatedAt: pinnedAt,
      pinnedAssets: nextAssets,
    };
    await this.saveState(nextState);
    return nextState;
  }

  async pinInsight(record: Omit<AstraPinnedInsightRecord, 'pinnedAt'>): Promise<AstraLocalPreferenceState> {
    const state = await this.loadState();
    const pinnedAt = new Date(this.now()).toISOString();
    const nextInsights = [
      { ...record, pinnedAt },
      ...state.pinnedInsights.filter((item) => item.insightId !== record.insightId),
    ].slice(0, 50);

    const nextState: AstraLocalPreferenceState = {
      ...state,
      updatedAt: pinnedAt,
      pinnedInsights: nextInsights,
    };
    await this.saveState(nextState);
    return nextState;
  }

  async setSurfaceMuted(record: Omit<AstraMutedSurfaceRecord, 'updatedAt'>): Promise<AstraLocalPreferenceState> {
    const state = await this.loadState();
    const updatedAt = new Date(this.now()).toISOString();
    const nextMuted = [
      { ...record, updatedAt },
      ...state.mutedSurfaces.filter((item) => item.surface !== record.surface),
    ];

    const nextState: AstraLocalPreferenceState = {
      ...state,
      updatedAt,
      mutedSurfaces: nextMuted,
    };
    await this.saveState(nextState);
    return nextState;
  }

  private async saveState(state: AstraLocalPreferenceState): Promise<void> {
    const payload: AstraLocalPreferenceStoragePayload = {
      schemaVersion: ASTRA_LOCAL_PREFERENCE_SCHEMA_VERSION,
      savedAt: new Date(this.now()).toISOString(),
      state,
    };

    await this.adapter.setItem(ASTRA_LOCAL_PREFERENCE_STORAGE_KEY, JSON.stringify(payload));
  }
}

export const astraLocalPreferenceService = new AstraLocalPreferenceService();
