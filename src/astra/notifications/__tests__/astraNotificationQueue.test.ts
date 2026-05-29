import { describe, expect, it } from 'vitest';

import { AstraNotificationQueue } from '../astraNotificationQueue';
import type { AstraNotificationIntent } from '../astraNotification.types';

function createIntent(id: string, key: string, createdAtMs: number): AstraNotificationIntent {
  return {
    id,
    key,
    title: 'Intent',
    body: 'Body',
    delivery: 'in_app',
    eventType: 'market',
    severity: 'warning',
    displayMode: 'alert',
    tone: 'warning',
    createdAt: new Date(createdAtMs).toISOString(),
    expiresAt: new Date(createdAtMs + 1_000).toISOString(),
    sourceEventId: id,
  };
}

describe('AstraNotificationQueue', () => {
  it('queue deduplica intents', () => {
    const queue = new AstraNotificationQueue({ now: () => 1_000, dailyCap: 8 });
    const first = queue.enqueue(createIntent('intent-1', 'same-key', 1_000));
    const second = queue.enqueue(createIntent('intent-2', 'same-key', 1_000));

    expect(first.enqueued).toBe(true);
    expect(second).toEqual({ enqueued: false, reason: 'duplicate' });
  });

  it('queue respeta daily cap', () => {
    const queue = new AstraNotificationQueue({ now: () => 1_000, dailyCap: 1 });
    const first = queue.enqueue(createIntent('intent-3', 'key-1', 1_000));
    const second = queue.enqueue(createIntent('intent-4', 'key-2', 1_000));

    expect(first.enqueued).toBe(true);
    expect(second).toEqual({ enqueued: false, reason: 'daily_cap' });
  });
});
