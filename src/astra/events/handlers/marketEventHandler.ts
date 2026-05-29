import type { AstraMarketEvent } from '../astraEvents.types';

interface CreateMarketEventInput {
  id: string;
  title: string;
  message: string;
  severity: AstraMarketEvent['severity'];
  pairSymbol?: string;
  direction?: 'bullish' | 'bearish' | 'sideways';
  changePercent?: string;
  targetScreen?: string;
  dedupKey?: string;
  throttleMs?: number;
}

export function createMarketEvent(input: CreateMarketEventInput): AstraMarketEvent {
  return {
    id: input.id,
    type: 'market',
    severity: input.severity,
    title: input.title,
    message: input.message,
    timestamp: new Date().toISOString(),
    source: 'astra.market',
    dedupKey: input.dedupKey,
    throttleMs: input.throttleMs,
    targetScreen: input.targetScreen,
    payload: {
      pairSymbol: input.pairSymbol,
      direction: input.direction,
      changePercent: input.changePercent,
    },
  };
}
