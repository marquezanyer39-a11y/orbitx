import type { AstraFeatureFlags } from '../../config/astraFlags';
import type { AstraMemoryService } from '../../memory/astraMemoryService';
import type { AstraSurface } from '../../ui/containers/astraSurfaceMappers';

export type AstraLocalToolId =
  | 'astra.mark_inbox_item_read_local'
  | 'astra.dismiss_insight_local'
  | 'astra.save_note_local'
  | 'trade.save_order_draft_local'
  | 'astra.set_intensity_mode_local'
  | 'astra.mute_surface_local'
  | 'market.pin_asset_local'
  | 'astra.pin_insight_local';

export interface AstraLocalNoteRecord {
  id: string;
  preview: string;
  noteLength: number;
  createdAt: string;
  source?: string;
  surface?: AstraSurface;
  redactedKeys: string[];
}

export interface AstraLocalOrderDraftRecord {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  thesisPreview?: string;
  thesisLength: number;
  createdAt: string;
  source?: string;
  surface?: AstraSurface;
  isRealExecution: false;
  redactedKeys: string[];
}

export interface AstraLocalDraftState {
  version: number;
  updatedAt: string;
  notes: AstraLocalNoteRecord[];
  orderDrafts: AstraLocalOrderDraftRecord[];
}

export interface AstraLocalDraftStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AstraLocalDraftStoragePayload {
  schemaVersion: number;
  savedAt: string;
  state: AstraLocalDraftState;
}

export interface AstraLocalToolAuditPayload {
  source?: string;
  surface?: string;
  redactedKeys?: string[];
  [key: string]: unknown;
}

export interface AstraLocalToolExecutionResult {
  status: 'success_local' | 'blocked' | 'failed';
  message: string;
  auditParams: AstraLocalToolAuditPayload;
}

export interface AstraLocalDraftServiceLike {
  saveNote(record: Omit<AstraLocalNoteRecord, 'id' | 'createdAt'>): Promise<AstraLocalNoteRecord>;
  saveOrderDraft(
    record: Omit<AstraLocalOrderDraftRecord, 'id' | 'createdAt'>,
  ): Promise<AstraLocalOrderDraftRecord>;
  loadState(): Promise<AstraLocalDraftState>;
  reset(): Promise<AstraLocalDraftState>;
}

export interface AstraPinnedAssetRecord {
  assetSymbol: string;
  pinnedAt: string;
  source?: string;
  surface?: AstraSurface;
}

export interface AstraPinnedInsightRecord {
  insightId: string;
  pinnedAt: string;
  source?: string;
  surface?: AstraSurface;
}

export interface AstraMutedSurfaceRecord {
  surface: AstraSurface;
  muted: boolean;
  updatedAt: string;
  source?: string;
}

export interface AstraLocalPreferenceState {
  version: number;
  updatedAt: string;
  pinnedAssets: AstraPinnedAssetRecord[];
  pinnedInsights: AstraPinnedInsightRecord[];
  mutedSurfaces: AstraMutedSurfaceRecord[];
}

export interface AstraLocalPreferenceServiceLike {
  loadState(): Promise<AstraLocalPreferenceState>;
  reset(): Promise<AstraLocalPreferenceState>;
  pinAsset(record: Omit<AstraPinnedAssetRecord, 'pinnedAt'>): Promise<AstraLocalPreferenceState>;
  pinInsight(record: Omit<AstraPinnedInsightRecord, 'pinnedAt'>): Promise<AstraLocalPreferenceState>;
  setSurfaceMuted(
    record: Omit<AstraMutedSurfaceRecord, 'updatedAt'>,
  ): Promise<AstraLocalPreferenceState>;
}

export interface AstraLocalToolAdapterDependencies {
  memoryService?: AstraMemoryService;
  draftService?: AstraLocalDraftServiceLike;
  preferenceService?: AstraLocalPreferenceServiceLike;
  getFlags?: () => AstraFeatureFlags;
  now?: () => number;
}
