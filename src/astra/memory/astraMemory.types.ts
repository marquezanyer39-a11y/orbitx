import type { AstraEventSeverity, AstraEventType } from '../events/astraEvents.types';
import type { AstraIntensityMode } from '../types/context.types';
import type { AstraSurface } from '../ui/containers/astraSurfaceMappers';
import type { AstraUiDisplayMode, AstraUiTone } from '../ui/types/astraUi.types';

export const ASTRA_MEMORY_SCHEMA_VERSION = 1;

export interface AstraMemoryExplicitPreferences {
  intensityMode?: AstraIntensityMode;
  inAppNotificationsMuted?: boolean;
  pinnedSurfaces?: AstraSurface[];
}

export interface AstraMemoryInferredPreferences {
  preferredSurface?: AstraSurface;
  recentlyHelpfulEventTypes?: AstraEventType[];
}

export interface AstraMemoryDismissalRecord {
  key: string;
  eventType: AstraEventType;
  severity: AstraEventSeverity;
  surface?: AstraSurface;
  count: number;
  lastDismissedAt: string;
  expiresAt: string;
}

export interface AstraMemoryCooldownRecord {
  key: string;
  channel: 'surface' | 'notification';
  lastTriggeredAt: string;
  expiresAt: string;
}

export interface AstraMemoryInboxItem {
  id: string;
  title: string;
  body: string;
  source: string;
  tone: AstraUiTone;
  displayMode: AstraUiDisplayMode;
  createdAt: string;
  expiresAt: string;
  read: boolean;
}

export interface AstraMemoryState {
  version: number;
  updatedAt: string;
  dismissals: AstraMemoryDismissalRecord[];
  cooldowns: AstraMemoryCooldownRecord[];
  inbox: AstraMemoryInboxItem[];
  preferences: {
    explicit: AstraMemoryExplicitPreferences;
    inferred: AstraMemoryInferredPreferences;
  };
}

export interface AstraMemoryStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface AstraMemoryStoragePayload {
  schemaVersion: number;
  savedAt: string;
  state: AstraMemoryState;
}
