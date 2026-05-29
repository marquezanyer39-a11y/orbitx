import type { AstraEventSeverity, AstraEventType } from '../events/astraEvents.types';
import type { AstraUiDisplayMode, AstraUiTone } from '../ui/types/astraUi.types';

export interface AstraNotificationIntent {
  id: string;
  key: string;
  title: string;
  body: string;
  delivery: 'in_app';
  eventType: AstraEventType;
  severity: AstraEventSeverity;
  displayMode: AstraUiDisplayMode;
  tone: AstraUiTone;
  createdAt: string;
  expiresAt: string;
  sourceEventId: string;
}

export interface AstraNotificationQueueState {
  intents: AstraNotificationIntent[];
  sentToday: {
    date: string;
    count: number;
  };
}

export interface AstraNotificationEnqueueResult {
  enqueued: boolean;
  reason?: 'disabled' | 'duplicate' | 'daily_cap' | 'expired';
}
