import type { AstraEvent } from '../events/astraEvents.types';
import type { RelevanceResult } from '../relevance/relevanceEngine';
import { sanitizeAstraMemoryText, mapSeverityToNotificationTone } from '../memory/astraMemoryMappers';
import type { AstraNotificationIntent } from './astraNotification.types';

const NOTIFICATION_INTENT_TTL_MS = 1000 * 60 * 60 * 6;

export function buildNotificationIntentKey(event: AstraEvent): string {
  return `intent:${event.type}:${event.dedupKey ?? event.id}`;
}

export function mapEventToNotificationIntent(
  event: AstraEvent,
  relevance: RelevanceResult,
  now: number = Date.now(),
): AstraNotificationIntent {
  return {
    id: `intent-${event.id}`,
    key: buildNotificationIntentKey(event),
    title: sanitizeAstraMemoryText(event.title),
    body: sanitizeAstraMemoryText(event.message),
    delivery: 'in_app',
    eventType: event.type,
    severity: event.severity,
    displayMode: relevance.displayMode,
    tone: mapSeverityToNotificationTone(event.severity),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + NOTIFICATION_INTENT_TTL_MS).toISOString(),
    sourceEventId: event.id,
  };
}
