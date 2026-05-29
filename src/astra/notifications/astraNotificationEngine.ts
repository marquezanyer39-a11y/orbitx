import { astraConfigService, type AstraFeatureFlags } from '../config/astraFlags';
import type { AstraEvent } from '../events/astraEvents.types';
import type { AstraMemoryState } from '../memory/astraMemory.types';
import { isCooldownActive as isCooldownActiveInState } from '../memory/astraMemoryReducers';
import type { RelevanceResult } from '../relevance/relevanceEngine';
import { buildNotificationIntentKey, mapEventToNotificationIntent } from './astraNotificationMappers';
import type { AstraNotificationIntent } from './astraNotification.types';

export interface AstraNotificationEngineInput {
  event: AstraEvent;
  relevance: RelevanceResult;
  memoryState?: AstraMemoryState;
  appState?: 'foreground' | 'background';
  flags?: AstraFeatureFlags;
  now?: number;
}

export function shouldGenerateNotificationIntent(input: AstraNotificationEngineInput): boolean {
  const flags = input.flags ?? astraConfigService.getFlags();

  if (
    !flags.ASTRA_ENABLED ||
    !flags.ASTRA_NOTIFICATIONS_ENABLED ||
    !flags.ASTRA_NOTIFICATION_ENGINE_ENABLED ||
    !flags.ASTRA_NOTIFICATION_QUEUE_ENABLED
  ) {
    return false;
  }

  if (input.relevance.displayMode === 'silent') {
    return false;
  }

  if (
    flags.ASTRA_NOTIFICATION_COOLDOWN_ENABLED &&
    input.memoryState &&
    isCooldownActiveInState(input.memoryState, buildNotificationIntentKey(input.event), input.now ?? Date.now())
  ) {
    return false;
  }

  return true;
}

export function createNotificationIntent(
  input: AstraNotificationEngineInput,
): AstraNotificationIntent | null {
  if (!shouldGenerateNotificationIntent(input)) {
    return null;
  }

  return mapEventToNotificationIntent(input.event, input.relevance, input.now);
}
