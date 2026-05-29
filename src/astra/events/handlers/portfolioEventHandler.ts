import type { AstraPortfolioEvent } from '../astraEvents.types';

interface CreatePortfolioEventInput {
  id: string;
  title: string;
  message: string;
  severity: AstraPortfolioEvent['severity'];
  totalUsdValue?: string;
  dailyUsdChange?: string;
  drawdownPercent?: string;
  targetScreen?: string;
  dedupKey?: string;
  throttleMs?: number;
}

export function createPortfolioEvent(input: CreatePortfolioEventInput): AstraPortfolioEvent {
  return {
    id: input.id,
    type: 'portfolio',
    severity: input.severity,
    title: input.title,
    message: input.message,
    timestamp: new Date().toISOString(),
    source: 'astra.portfolio',
    dedupKey: input.dedupKey,
    throttleMs: input.throttleMs,
    targetScreen: input.targetScreen,
    payload: {
      totalUsdValue: input.totalUsdValue,
      dailyUsdChange: input.dailyUsdChange,
      drawdownPercent: input.drawdownPercent,
    },
  };
}
