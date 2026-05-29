import type { AstraEvent, AstraEventSeverity, AstraEventType } from '../events/astraEvents.types';
import type { AstraNotificationIntent } from '../notifications/astraNotification.types';
import type { AstraSurface } from '../ui/containers/astraSurfaceMappers';
import type { AstraUiDisplayMode, AstraUiTone } from '../ui/types/astraUi.types';
import {
  ASTRA_MEMORY_COOLDOWN_TTL_MS,
  ASTRA_MEMORY_DEFAULT_TTL_MS,
  ASTRA_MEMORY_INBOX_TTL_MS,
} from './astraMemoryKeys';
import type {
  AstraMemoryCooldownRecord,
  AstraMemoryDismissalRecord,
  AstraMemoryInboxItem,
} from './astraMemory.types';

const ADDRESS_PATTERN = /0x[a-fA-F0-9]{8,40}/g;
const LARGE_AMOUNT_PATTERN = /\b\d{4,}(?:\.\d+)?\b/g;

export function sanitizeAstraMemoryText(value: string): string {
  return value
    .replace(ADDRESS_PATTERN, '[redacted-address]')
    .replace(LARGE_AMOUNT_PATTERN, '[redacted-amount]')
    .trim();
}

export function buildDismissalKey(event: AstraEvent, surface?: AstraSurface): string {
  return `${event.type}:${event.dedupKey ?? event.id}:${surface ?? event.targetScreen ?? 'global'}`;
}

export function createDismissalRecord(input: {
  event: AstraEvent;
  surface?: AstraSurface;
  now?: number;
  ttlMs?: number;
  previousCount?: number;
}): AstraMemoryDismissalRecord {
  const now = input.now ?? Date.now();
  return {
    key: buildDismissalKey(input.event, input.surface),
    eventType: input.event.type,
    severity: input.event.severity,
    surface: input.surface,
    count: (input.previousCount ?? 0) + 1,
    lastDismissedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (input.ttlMs ?? ASTRA_MEMORY_DEFAULT_TTL_MS)).toISOString(),
  };
}

export function createCooldownRecord(input: {
  key: string;
  channel: 'surface' | 'notification';
  now?: number;
  ttlMs?: number;
}): AstraMemoryCooldownRecord {
  const now = input.now ?? Date.now();
  return {
    key: input.key,
    channel: input.channel,
    lastTriggeredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (input.ttlMs ?? ASTRA_MEMORY_COOLDOWN_TTL_MS)).toISOString(),
  };
}

export function createInboxItemFromIntent(
  intent: AstraNotificationIntent,
  now: number = Date.now(),
): AstraMemoryInboxItem {
  return {
    id: intent.id,
    title: sanitizeAstraMemoryText(intent.title),
    body: sanitizeAstraMemoryText(intent.body),
    source: intent.eventType,
    tone: intent.tone,
    displayMode: intent.displayMode,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ASTRA_MEMORY_INBOX_TTL_MS).toISOString(),
    read: false,
  };
}

export function createInboxItemFromEvent(input: {
  id: string;
  title: string;
  body: string;
  eventType: AstraEventType;
  tone: AstraUiTone;
  displayMode: AstraUiDisplayMode;
  now?: number;
}): AstraMemoryInboxItem {
  const now = input.now ?? Date.now();
  return {
    id: input.id,
    title: sanitizeAstraMemoryText(input.title),
    body: sanitizeAstraMemoryText(input.body),
    source: input.eventType,
    tone: input.tone,
    displayMode: input.displayMode,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ASTRA_MEMORY_INBOX_TTL_MS).toISOString(),
    read: false,
  };
}

export function mapSeverityToNotificationTone(severity: AstraEventSeverity): AstraUiTone {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}
