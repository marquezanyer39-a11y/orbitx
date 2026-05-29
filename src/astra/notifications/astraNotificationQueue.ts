import { ASTRA_NOTIFICATION_DEFAULT_DAILY_CAP, getTodayKey, isExpired } from './astraNotificationRules';
import type {
  AstraNotificationEnqueueResult,
  AstraNotificationIntent,
  AstraNotificationQueueState,
} from './astraNotification.types';

interface AstraNotificationQueueOptions {
  now?: () => number;
  dailyCap?: number;
}

function createInitialQueueState(now: number): AstraNotificationQueueState {
  return {
    intents: [],
    sentToday: {
      date: getTodayKey(now),
      count: 0,
    },
  };
}

export class AstraNotificationQueue {
  private readonly now;
  private readonly dailyCap;
  private state: AstraNotificationQueueState;

  constructor(options: AstraNotificationQueueOptions = {}) {
    this.now = options.now ?? (() => Date.now());
    this.dailyCap = options.dailyCap ?? ASTRA_NOTIFICATION_DEFAULT_DAILY_CAP;
    this.state = createInitialQueueState(this.now());
  }

  enqueue(intent: AstraNotificationIntent): AstraNotificationEnqueueResult {
    this.cleanup();

    if (isExpired(intent.expiresAt, this.now())) {
      return { enqueued: false, reason: 'expired' };
    }

    if (this.state.intents.some((item) => item.key === intent.key)) {
      return { enqueued: false, reason: 'duplicate' };
    }

    const todayKey = getTodayKey(this.now());
    if (this.state.sentToday.date !== todayKey) {
      this.state.sentToday = { date: todayKey, count: 0 };
    }

    if (this.state.sentToday.count >= this.dailyCap) {
      return { enqueued: false, reason: 'daily_cap' };
    }

    this.state = {
      ...this.state,
      intents: [...this.state.intents, intent],
      sentToday: {
        date: this.state.sentToday.date,
        count: this.state.sentToday.count + 1,
      },
    };

    return { enqueued: true };
  }

  dequeue(): AstraNotificationIntent | null {
    this.cleanup();
    const [first, ...rest] = this.state.intents;
    if (!first) {
      return null;
    }

    this.state = {
      ...this.state,
      intents: rest,
    };

    return first;
  }

  cleanup(): void {
    const now = this.now();
    const todayKey = getTodayKey(now);
    this.state = {
      intents: this.state.intents.filter((intent) => !isExpired(intent.expiresAt, now)),
      sentToday:
        this.state.sentToday.date === todayKey
          ? this.state.sentToday
          : { date: todayKey, count: 0 },
    };
  }

  clear(): void {
    this.state = createInitialQueueState(this.now());
  }

  getState(): AstraNotificationQueueState {
    this.cleanup();
    return {
      intents: [...this.state.intents],
      sentToday: { ...this.state.sentToday },
    };
  }
}
