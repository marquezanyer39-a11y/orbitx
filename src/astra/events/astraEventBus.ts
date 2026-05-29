import type {
  AstraEventListener,
  AstraEventMap,
  AstraEventPublishResult,
  AstraEventType,
} from './astraEvents.types';

interface AstraEventBusOptions {
  dedupWindowMs?: number;
  throttleByType?: Partial<Record<AstraEventType, number>>;
  now?: () => number;
}

export class AstraEventBus {
  private readonly dedupWindowMs: number;
  private readonly throttleByType: Partial<Record<AstraEventType, number>>;
  private readonly now: () => number;
  private readonly listeners = new Map<AstraEventType, Map<number, AstraEventListener<AstraEventType>>>();
  private readonly dedupTimestamps = new Map<string, number>();
  private readonly throttleTimestamps = new Map<AstraEventType, number>();
  private listenerIdSequence = 0;

  constructor(options: AstraEventBusOptions = {}) {
    this.dedupWindowMs = options.dedupWindowMs ?? 500;
    this.throttleByType = options.throttleByType ?? {};
    this.now = options.now ?? (() => Date.now());
  }

  publish<TType extends AstraEventType>(event: AstraEventMap[TType]): AstraEventPublishResult {
    this.cleanup();

    const currentTime = this.now();
    if (event.dedupKey) {
      const previousTimestamp = this.dedupTimestamps.get(event.dedupKey);
      if (previousTimestamp !== undefined && currentTime - previousTimestamp < this.dedupWindowMs) {
        return { published: false, reason: 'deduped' };
      }
      this.dedupTimestamps.set(event.dedupKey, currentTime);
    }

    const throttleMs = event.throttleMs ?? this.throttleByType[event.type] ?? 0;
    if (throttleMs > 0) {
      const previousPublish = this.throttleTimestamps.get(event.type);
      if (previousPublish !== undefined && currentTime - previousPublish < throttleMs) {
        return { published: false, reason: 'throttled' };
      }
      this.throttleTimestamps.set(event.type, currentTime);
    }

    const listeners = this.listeners.get(event.type);
    if (!listeners) {
      return { published: true };
    }

    listeners.forEach((listener) => {
      (listener as AstraEventListener<TType>)(event);
    });

    return { published: true };
  }

  subscribe<TType extends AstraEventType>(
    type: TType,
    listener: AstraEventListener<TType>,
  ): () => void {
    this.cleanup();
    const listenerId = this.listenerIdSequence++;
    const currentListeners = this.listeners.get(type) ?? new Map<number, AstraEventListener<AstraEventType>>();
    currentListeners.set(listenerId, listener as AstraEventListener<AstraEventType>);
    this.listeners.set(type, currentListeners);

    return () => {
      const activeListeners = this.listeners.get(type);
      if (!activeListeners) {
        return;
      }

      activeListeners.delete(listenerId);
      if (activeListeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  getListenerCount(type?: AstraEventType): number {
    if (type) {
      return this.listeners.get(type)?.size ?? 0;
    }

    let total = 0;
    this.listeners.forEach((listeners) => {
      total += listeners.size;
    });
    return total;
  }

  private cleanup(): void {
    const currentTime = this.now();
    this.dedupTimestamps.forEach((timestamp, key) => {
      if (currentTime - timestamp >= this.dedupWindowMs) {
        this.dedupTimestamps.delete(key);
      }
    });

    this.listeners.forEach((listeners, type) => {
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    });
  }
}

export const astraEventBus = new AstraEventBus();
