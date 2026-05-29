import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASTRA_MEMORY_STORAGE_KEY } from './astraMemoryKeys';
import { createInitialAstraMemoryState } from './astraMemoryReducers';
import {
  ASTRA_MEMORY_SCHEMA_VERSION,
  type AstraMemoryState,
  type AstraMemoryStorageAdapter,
  type AstraMemoryStoragePayload,
} from './astraMemory.types';

export function createAsyncStorageAdapter(): AstraMemoryStorageAdapter {
  return {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
    removeItem: AsyncStorage.removeItem,
  };
}

export function createMemoryStorage(adapter: AstraMemoryStorageAdapter = createAsyncStorageAdapter()) {
  return {
    async load(now: number = Date.now()): Promise<AstraMemoryState> {
      const raw = await adapter.getItem(ASTRA_MEMORY_STORAGE_KEY);
      if (!raw) {
        return createInitialAstraMemoryState(now);
      }

      try {
        const payload = JSON.parse(raw) as AstraMemoryStoragePayload;
        if (payload.schemaVersion !== ASTRA_MEMORY_SCHEMA_VERSION) {
          return createInitialAstraMemoryState(now);
        }
        return payload.state;
      } catch {
        return createInitialAstraMemoryState(now);
      }
    },

    async save(state: AstraMemoryState, now: number = Date.now()): Promise<void> {
      const payload: AstraMemoryStoragePayload = {
        schemaVersion: ASTRA_MEMORY_SCHEMA_VERSION,
        savedAt: new Date(now).toISOString(),
        state,
      };
      await adapter.setItem(ASTRA_MEMORY_STORAGE_KEY, JSON.stringify(payload));
    },

    async reset(): Promise<void> {
      await adapter.removeItem(ASTRA_MEMORY_STORAGE_KEY);
    },
  };
}
