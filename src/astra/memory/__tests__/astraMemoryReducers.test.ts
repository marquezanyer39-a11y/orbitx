import { describe, expect, it } from 'vitest';

import { astraFlagsDefaults } from '../../config/astraFlags.defaults';
import { createMarketEvent } from '../../events/handlers/marketEventHandler';
import { createNotificationIntent } from '../../notifications/astraNotificationEngine';
import {
  createInitialAstraMemoryState,
  getDismissalCount,
  isCooldownActive,
  pruneExpiredMemory,
  resetAstraMemory,
  upsertCooldownRecord,
  upsertDismissalRecord,
} from '../astraMemoryReducers';
import {
  createCooldownRecord,
  createDismissalRecord,
  createInboxItemFromIntent,
} from '../astraMemoryMappers';

describe('astraMemoryReducers', () => {
  it('reducers de memoria son puros', () => {
    const state = createInitialAstraMemoryState(1_000);
    const event = createMarketEvent({
      id: 'memory-1',
      title: 'Mercado',
      message: 'BTC sube',
      severity: 'warning',
    });
    const record = createDismissalRecord({ event, now: 1_000 });
    const next = upsertDismissalRecord(state, record, 1_000);

    expect(state).not.toBe(next);
    expect(state.dismissals).toHaveLength(0);
    expect(next.dismissals).toHaveLength(1);
  });

  it('TTL elimina memoria expirada', () => {
    const state = {
      ...createInitialAstraMemoryState(1_000),
      dismissals: [
        {
          key: 'dismissed',
          eventType: 'market' as const,
          severity: 'info' as const,
          count: 1,
          lastDismissedAt: '1970-01-01T00:00:01.000Z',
          expiresAt: '1970-01-01T00:00:01.100Z',
        },
      ],
      cooldowns: [
        {
          key: 'cooldown',
          channel: 'notification' as const,
          lastTriggeredAt: '1970-01-01T00:00:01.000Z',
          expiresAt: '1970-01-01T00:00:01.100Z',
        },
      ],
    };

    const next = pruneExpiredMemory(state, 1_101);

    expect(next.dismissals).toHaveLength(0);
    expect(next.cooldowns).toHaveLength(0);
  });

  it('dismissal reduce exposicion futura al aumentar el contador', () => {
    const event = createMarketEvent({
      id: 'memory-2',
      title: 'Momentum',
      message: 'SOL acelera',
      severity: 'info',
    });
    const baseState = createInitialAstraMemoryState(2_000);
    const first = upsertDismissalRecord(
      baseState,
      createDismissalRecord({ event, now: 2_000, previousCount: 0 }),
      2_000,
    );
    const second = upsertDismissalRecord(
      first,
      createDismissalRecord({ event, now: 3_000, previousCount: getDismissalCount(first, 'market:memory-2:global') }),
      3_000,
    );

    expect(getDismissalCount(second, 'market:memory-2:global')).toBe(2);
  });

  it('cooldown bloquea repeticion', () => {
    const state = upsertCooldownRecord(
      createInitialAstraMemoryState(1_000),
      createCooldownRecord({ key: 'notification:btc', channel: 'notification', now: 1_000, ttlMs: 500 }),
      1_000,
    );

    expect(isCooldownActive(state, 'notification:btc', 1_200)).toBe(true);
    expect(isCooldownActive(state, 'notification:btc', 1_600)).toBe(false);
  });

  it('resetMemory limpia estado', () => {
    const reset = resetAstraMemory(5_000);

    expect(reset.dismissals).toHaveLength(0);
    expect(reset.cooldowns).toHaveLength(0);
    expect(reset.inbox).toHaveLength(0);
  });

  it('no se persisten campos sensibles', () => {
    const event = createMarketEvent({
      id: 'memory-3',
      title: 'Wallet 0x1234567890abcdef1234567890abcdef12345678',
      message: 'Balance 12500.55 observado en simulacion',
      severity: 'warning',
    });

    const intent = createNotificationIntent({
      event,
      relevance: { score: 72, displayMode: 'alert', reason: 'test' },
      flags: {
        ...astraFlagsDefaults,
        ASTRA_ENABLED: true,
        ASTRA_NOTIFICATIONS_ENABLED: true,
        ASTRA_MEMORY_ENABLED: true,
        ASTRA_MEMORY_LOCAL_ENABLED: true,
        ASTRA_MEMORY_DISMISSALS_ENABLED: true,
        ASTRA_MEMORY_INBOX_PERSISTENCE_ENABLED: true,
        ASTRA_NOTIFICATION_ENGINE_ENABLED: true,
        ASTRA_NOTIFICATION_QUEUE_ENABLED: true,
      },
    });

    const inboxItem = createInboxItemFromIntent(intent!, 4_000);

    expect(inboxItem.title).toContain('[redacted-address]');
    expect(inboxItem.body).toContain('[redacted-amount]');
  });
});
