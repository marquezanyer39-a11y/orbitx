import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { createMarketEvent } from '../../events/handlers/marketEventHandler';
import { createInitialAstraMemoryState, upsertCooldownRecord } from '../../memory/astraMemoryReducers';
import { createCooldownRecord } from '../../memory/astraMemoryMappers';
import { createNotificationIntent } from '../astraNotificationEngine';

const baseFlags = {
  ...astraFlagsDefaults,
  ASTRA_ENABLED: true,
  ASTRA_NOTIFICATIONS_ENABLED: true,
  ASTRA_MEMORY_LOCAL_ENABLED: true,
  ASTRA_MEMORY_DISMISSALS_ENABLED: true,
  ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED: true,
  ASTRA_NOTIFICATION_ENGINE_ENABLED: true,
  ASTRA_NOTIFICATION_QUEUE_ENABLED: true,
  ASTRA_NOTIFICATION_COOLDOWN_ENABLED: true,
};

describe('astraNotificationEngine', () => {
  it('notification engine no genera intents con flags apagadas', () => {
    const event = createMarketEvent({
      id: 'notif-1',
      title: 'Momentum',
      message: 'BTC acelera',
      severity: 'warning',
    });

    const intent = createNotificationIntent({
      event,
      relevance: { score: 70, displayMode: 'alert', reason: 'test' },
      flags: {
        ...baseFlags,
        ASTRA_NOTIFICATION_ENGINE_ENABLED: false,
      },
    });

    expect(intent).toBeNull();
  });

  it('cooldown bloquea repeticion', () => {
    const event = createMarketEvent({
      id: 'notif-2',
      title: 'Riesgo',
      message: 'ETH acelera',
      severity: 'warning',
      dedupKey: 'eth-alert',
    });

    const memoryState = upsertCooldownRecord(
      createInitialAstraMemoryState(1_000),
      createCooldownRecord({ key: 'intent:market:eth-alert', channel: 'notification', now: 1_000, ttlMs: 500 }),
      1_000,
    );

    const intent = createNotificationIntent({
      event,
      relevance: { score: 74, displayMode: 'alert', reason: 'test' },
      flags: baseFlags,
      memoryState,
      now: 1_200,
    });

    expect(intent).toBeNull();
  });
});
