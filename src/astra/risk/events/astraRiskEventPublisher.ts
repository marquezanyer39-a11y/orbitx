import type { AstraFeatureFlags } from '../../config/astraFlags';
import { astraEventBus, type AstraEventBus } from '../../events/astraEventBus';
import { getAstraRiskFlags } from '../astraRiskFlags';
import type { AstraRiskEngineResult } from '../astraRisk.types';
import { mapRiskResultToAstraEvent } from './astraRiskEventMapper';
import type {
  AstraRiskEventSource,
  AstraRiskEventSurface,
  AstraRiskPublishResult,
} from './astraRiskEvents.types';

export interface PublishRiskScanEventOptions {
  eventBus?: AstraEventBus;
  surface: AstraRiskEventSurface;
  eventSource: AstraRiskEventSource;
  flags?: Partial<AstraFeatureFlags>;
}

export function publishRiskScanEvent(
  result: AstraRiskEngineResult,
  options: PublishRiskScanEventOptions,
): AstraRiskPublishResult {
  const flags = getAstraRiskFlags(options.flags);

  if (!flags.engineEnabled || !flags.readOnlyEnabled || !flags.eventPublishingEnabled || flags.realExecutionEnabled) {
    return {
      published: false,
      skipped: 'flags_disabled',
    };
  }

  const event = mapRiskResultToAstraEvent(result, {
    surface: options.surface,
    eventSource: options.eventSource,
  });

  try {
    const bus = options.eventBus ?? astraEventBus;
    const published = bus.publish(event);
    return {
      ...published,
      event,
    };
  } catch {
    return {
      published: false,
      skipped: 'publish_failed',
      event,
    };
  }
}
