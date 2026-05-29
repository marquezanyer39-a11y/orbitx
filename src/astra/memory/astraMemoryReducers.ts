import { ASTRA_MEMORY_SCHEMA_VERSION } from './astraMemory.types';
import type {
  AstraMemoryCooldownRecord,
  AstraMemoryDismissalRecord,
  AstraMemoryInboxItem,
  AstraMemoryInferredPreferences,
  AstraMemoryExplicitPreferences,
  AstraMemoryState,
} from './astraMemory.types';

function toIso(now: number): string {
  return new Date(now).toISOString();
}

export function createInitialAstraMemoryState(now: number = Date.now()): AstraMemoryState {
  return {
    version: ASTRA_MEMORY_SCHEMA_VERSION,
    updatedAt: toIso(now),
    dismissals: [],
    cooldowns: [],
    inbox: [],
    preferences: {
      explicit: {},
      inferred: {},
    },
  };
}

export function pruneExpiredMemory(
  state: AstraMemoryState,
  now: number = Date.now(),
): AstraMemoryState {
  const nowIso = new Date(now).toISOString();

  return {
    ...state,
    updatedAt: nowIso,
    dismissals: state.dismissals.filter((item) => item.expiresAt > nowIso),
    cooldowns: state.cooldowns.filter((item) => item.expiresAt > nowIso),
    inbox: state.inbox.filter((item) => item.expiresAt > nowIso),
  };
}

export function resetAstraMemory(now: number = Date.now()): AstraMemoryState {
  return createInitialAstraMemoryState(now);
}

export function upsertDismissalRecord(
  state: AstraMemoryState,
  record: AstraMemoryDismissalRecord,
  now: number = Date.now(),
): AstraMemoryState {
  const dismissals = state.dismissals.filter((item) => item.key !== record.key);
  return {
    ...state,
    updatedAt: toIso(now),
    dismissals: [...dismissals, record],
  };
}

export function upsertCooldownRecord(
  state: AstraMemoryState,
  record: AstraMemoryCooldownRecord,
  now: number = Date.now(),
): AstraMemoryState {
  const cooldowns = state.cooldowns.filter((item) => item.key !== record.key);
  return {
    ...state,
    updatedAt: toIso(now),
    cooldowns: [...cooldowns, record],
  };
}

export function upsertInboxItem(
  state: AstraMemoryState,
  item: AstraMemoryInboxItem,
  now: number = Date.now(),
): AstraMemoryState {
  const inbox = state.inbox.filter((entry) => entry.id !== item.id);
  return {
    ...state,
    updatedAt: toIso(now),
    inbox: [item, ...inbox],
  };
}

export function markInboxItemRead(
  state: AstraMemoryState,
  id: string,
  now: number = Date.now(),
): AstraMemoryState {
  return {
    ...state,
    updatedAt: toIso(now),
    inbox: state.inbox.map((item) => (item.id === id ? { ...item, read: true } : item)),
  };
}

export function setExplicitPreferences(
  state: AstraMemoryState,
  explicit: AstraMemoryExplicitPreferences,
  now: number = Date.now(),
): AstraMemoryState {
  return {
    ...state,
    updatedAt: toIso(now),
    preferences: {
      ...state.preferences,
      explicit: {
        ...state.preferences.explicit,
        ...explicit,
      },
    },
  };
}

export function setInferredPreferences(
  state: AstraMemoryState,
  inferred: AstraMemoryInferredPreferences,
  now: number = Date.now(),
): AstraMemoryState {
  return {
    ...state,
    updatedAt: toIso(now),
    preferences: {
      ...state.preferences,
      inferred: {
        ...state.preferences.inferred,
        ...inferred,
      },
    },
  };
}

export function getDismissalCount(state: AstraMemoryState, key: string): number {
  return state.dismissals.find((item) => item.key === key)?.count ?? 0;
}

export function isCooldownActive(
  state: AstraMemoryState,
  key: string,
  now: number = Date.now(),
): boolean {
  const nowIso = new Date(now).toISOString();
  return state.cooldowns.some((item) => item.key === key && item.expiresAt > nowIso);
}
