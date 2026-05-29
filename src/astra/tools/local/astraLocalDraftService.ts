import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAstraToolId } from '../astraToolAudit';
import type {
  AstraLocalDraftServiceLike,
  AstraLocalDraftState,
  AstraLocalDraftStorageAdapter,
  AstraLocalDraftStoragePayload,
  AstraLocalNoteRecord,
  AstraLocalOrderDraftRecord,
} from './astraLocalTool.types';

const ASTRA_LOCAL_DRAFT_STORAGE_KEY = '@orbitx/astra/local-tools/v1';
const ASTRA_LOCAL_DRAFT_SCHEMA_VERSION = 1;

function createInitialLocalDraftState(now: number): AstraLocalDraftState {
  return {
    version: ASTRA_LOCAL_DRAFT_SCHEMA_VERSION,
    updatedAt: new Date(now).toISOString(),
    notes: [],
    orderDrafts: [],
  };
}

function createDefaultAdapter(): AstraLocalDraftStorageAdapter {
  return {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
    removeItem: AsyncStorage.removeItem,
  };
}

export interface AstraLocalDraftServiceOptions {
  adapter?: AstraLocalDraftStorageAdapter;
  now?: () => number;
}

export class AstraLocalDraftService implements AstraLocalDraftServiceLike {
  private readonly adapter;
  private readonly now;

  constructor(options: AstraLocalDraftServiceOptions = {}) {
    this.adapter = options.adapter ?? createDefaultAdapter();
    this.now = options.now ?? (() => Date.now());
  }

  async loadState(): Promise<AstraLocalDraftState> {
    const raw = await this.adapter.getItem(ASTRA_LOCAL_DRAFT_STORAGE_KEY);
    if (!raw) {
      return createInitialLocalDraftState(this.now());
    }

    try {
      const payload = JSON.parse(raw) as AstraLocalDraftStoragePayload;
      if (payload.schemaVersion !== ASTRA_LOCAL_DRAFT_SCHEMA_VERSION) {
        return createInitialLocalDraftState(this.now());
      }

      return payload.state;
    } catch {
      return createInitialLocalDraftState(this.now());
    }
  }

  async reset(): Promise<AstraLocalDraftState> {
    await this.adapter.removeItem(ASTRA_LOCAL_DRAFT_STORAGE_KEY);
    return createInitialLocalDraftState(this.now());
  }

  async saveNote(record: Omit<AstraLocalNoteRecord, 'id' | 'createdAt'>): Promise<AstraLocalNoteRecord> {
    const state = await this.loadState();
    const note: AstraLocalNoteRecord = {
      id: createAstraToolId('astra-note'),
      createdAt: new Date(this.now()).toISOString(),
      ...record,
    };
    const nextState: AstraLocalDraftState = {
      ...state,
      updatedAt: new Date(this.now()).toISOString(),
      notes: [note, ...state.notes].slice(0, 25),
    };
    await this.saveState(nextState);
    return note;
  }

  async saveOrderDraft(
    record: Omit<AstraLocalOrderDraftRecord, 'id' | 'createdAt'>,
  ): Promise<AstraLocalOrderDraftRecord> {
    const state = await this.loadState();
    const draft: AstraLocalOrderDraftRecord = {
      id: createAstraToolId('astra-order-draft'),
      createdAt: new Date(this.now()).toISOString(),
      ...record,
    };
    const nextState: AstraLocalDraftState = {
      ...state,
      updatedAt: new Date(this.now()).toISOString(),
      orderDrafts: [draft, ...state.orderDrafts].slice(0, 25),
    };
    await this.saveState(nextState);
    return draft;
  }

  private async saveState(state: AstraLocalDraftState): Promise<void> {
    const payload: AstraLocalDraftStoragePayload = {
      schemaVersion: ASTRA_LOCAL_DRAFT_SCHEMA_VERSION,
      savedAt: new Date(this.now()).toISOString(),
      state,
    };

    await this.adapter.setItem(ASTRA_LOCAL_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }
}

export const astraLocalDraftService = new AstraLocalDraftService();
